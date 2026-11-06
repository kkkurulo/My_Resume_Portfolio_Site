import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { collections, isCollectionKey, type Collection } from "@/admin/collections";
import { EntityForm } from "@/components/admin/entity-form";
import { db } from "@/db";
import { education, experience, links, projects, skills } from "@/db/schema";
import { saveItem } from "../../actions";

const tables = { experience, projects, skills, education, links };

export default async function EditItemPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection: key, id: rawId } = await params;
  const id = Number(rawId);
  if (!isCollectionKey(key) || !Number.isInteger(id)) notFound();

  const config: Collection = collections[key];
  const table = tables[key] as unknown as typeof experience;
  const [row] = await db.select().from(table).where(eq(table.id, id));
  if (!row) notFound();

  return (
    <>
      <h1 className="mb-8 font-serif text-3xl text-ink">Edit {config.singular}</h1>
      <EntityForm
        fields={config.fields}
        initial={row}
        action={saveItem.bind(null, key, id)}
        submitLabel="Save changes"
        cancelHref={`/admin/${key}`}
      />
    </>
  );
}
