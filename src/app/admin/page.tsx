import { eq } from "drizzle-orm";
import { profileFields } from "@/admin/collections";
import { EntityForm } from "@/components/admin/entity-form";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { saveProfile } from "./actions";

export default async function ProfilePage() {
  const [row] = await db.select().from(profile).where(eq(profile.id, 1));

  return (
    <>
      <h1 className="font-serif text-3xl text-ink">Profile</h1>
      <p className="mt-2 mb-8 text-sm text-muted">Your name, introduction, photo and CV.</p>
      <EntityForm fields={profileFields} initial={row ?? {}} action={saveProfile} submitLabel="Save profile" />
    </>
  );
}
