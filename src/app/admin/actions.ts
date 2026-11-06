"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { collections, isCollectionKey, profileFields, type CollectionKey, type Row } from "@/admin/collections";
import { db } from "@/db";
import { education, experience, links, profile, projects, skills } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { isUploadField, parseFields, type FieldDef, type FormState, type FormValues } from "@/lib/fields";
import { deleteUpload, saveUpload, UploadError, type UploadKind } from "@/lib/storage";

const tables = { experience, projects, skills, education, links };

/**
 * Every list table has id, sortOrder and published. They differ in their other columns, so this
 * uses one table's type for all of them; forms have already validated the values for each table.
 */
function tableFor(key: CollectionKey) {
  return tables[key] as unknown as typeof experience;
}

function assertCollection(key: string): asserts key is CollectionKey {
  if (!isCollectionKey(key)) throw new Error(`Unknown collection: ${key}`);
}

function refreshSite(key?: CollectionKey) {
  revalidatePath("/", "layout");
  if (key) revalidatePath(`/admin/${key}`);
}

type UploadOutcome =
  | { ok: true; data: FormValues; replaced: string[]; added: string[] }
  | { ok: false; errors: Record<string, string> };

/** Applies new and removed files. `replaced` is only safe to delete after the database save. */
async function applyUploads(fields: FieldDef[], formData: FormData, current: Record<string, unknown> | undefined): Promise<UploadOutcome> {
  const data: FormValues = {};
  const errors: Record<string, string> = {};
  const replaced: string[] = [];
  const added: string[] = [];

  for (const field of fields.filter(isUploadField)) {
    const existing = typeof current?.[field.name] === "string" ? (current[field.name] as string) : null;
    const file = formData.get(`${field.name}__file`);

    if (file instanceof File && file.size > 0) {
      try {
        const url = await saveUpload(file, field.type as UploadKind);
        data[field.name] = url;
        added.push(url);
        if (existing) replaced.push(existing);
      } catch (error) {
        if (!(error instanceof UploadError)) throw error;
        errors[field.name] = error.message;
      }
    } else if (formData.get(`${field.name}__remove`) === "on") {
      data[field.name] = null;
      if (existing) replaced.push(existing);
    } else {
      data[field.name] = existing;
    }
  }

  if (Object.keys(errors).length > 0) {
    await Promise.all(added.map(deleteUpload));
    return { ok: false, errors };
  }
  return { ok: true, data, replaced, added };
}

const CHECK_FIELDS = "Please fix the highlighted fields.";

export async function saveProfile(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = parseFields(profileFields, formData);
  if (!parsed.ok) return { status: "error", message: CHECK_FIELDS, errors: parsed.errors, values: parsed.values };

  const [current] = await db.select().from(profile).where(eq(profile.id, 1));
  const uploads = await applyUploads(profileFields, formData, current);
  if (!uploads.ok) return { status: "error", message: CHECK_FIELDS, errors: uploads.errors, values: parsed.values };

  const values = { ...parsed.data, ...uploads.data } as Omit<typeof profile.$inferInsert, "id">;
  await db
    .insert(profile)
    .values({ ...values, id: 1 })
    .onConflictDoUpdate({ target: profile.id, set: values });

  await Promise.all(uploads.replaced.map(deleteUpload));
  refreshSite();
  return { status: "success", message: "Saved. Your site is updated.", values: parsed.values };
}

export async function saveItem(key: string, id: number | null, _previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  assertCollection(key);

  const { fields } = collections[key];
  const table = tableFor(key);

  const parsed = parseFields(fields, formData);
  if (!parsed.ok) return { status: "error", message: CHECK_FIELDS, errors: parsed.errors, values: parsed.values };

  const [current] = id === null ? [] : await db.select().from(table).where(eq(table.id, id));
  if (id !== null && !current) return { status: "error", message: "This entry no longer exists.", values: parsed.values };

  const uploads = await applyUploads(fields, formData, current);
  if (!uploads.ok) return { status: "error", message: CHECK_FIELDS, errors: uploads.errors, values: parsed.values };

  const values = { ...parsed.data, ...uploads.data } as unknown as typeof experience.$inferInsert;

  if (id === null) {
    // New entries go to the top of the list, where the newest job or project usually belongs.
    const [first] = await db.select({ sortOrder: table.sortOrder }).from(table).orderBy(asc(table.sortOrder)).limit(1);
    await db.insert(table).values({ ...values, sortOrder: (first?.sortOrder ?? 1) - 1 });
  } else {
    await db.update(table).set(values).where(eq(table.id, id));
  }

  await Promise.all(uploads.replaced.map(deleteUpload));
  refreshSite(key);
  redirect(`/admin/${key}`);
}

export async function deleteItem(key: string, id: number): Promise<void> {
  await requireAdmin();
  assertCollection(key);

  const table = tableFor(key);
  const [row] = await db.delete(table).where(eq(table.id, id)).returning();

  if (row) {
    const files = collections[key].fields
      .filter(isUploadField)
      .map((field) => (row as unknown as Row)[field.name])
      .filter((value): value is string => typeof value === "string");
    await Promise.all(files.map(deleteUpload));
  }
  refreshSite(key);
}

export async function moveItem(key: string, id: number, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  assertCollection(key);

  const table = tableFor(key);
  const rows = await db.select({ id: table.id }).from(table).orderBy(asc(table.sortOrder), asc(table.id));
  const from = rows.findIndex((row) => row.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= rows.length) return;

  [rows[from], rows[to]] = [rows[to], rows[from]];

  // Renumbering the whole list also repairs any duplicate positions.
  const updates = rows.map((row, index) => db.update(table).set({ sortOrder: index }).where(eq(table.id, row.id)));
  await db.batch(updates as [(typeof updates)[number], ...typeof updates]);
  refreshSite(key);
}

export async function togglePublished(key: string, id: number, published: boolean): Promise<void> {
  await requireAdmin();
  assertCollection(key);

  const table = tableFor(key);
  await db.update(table).set({ published }).where(eq(table.id, id));
  refreshSite(key);
}
