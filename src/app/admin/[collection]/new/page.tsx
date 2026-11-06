import { notFound } from "next/navigation";
import { collections, isCollectionKey, type Collection } from "@/admin/collections";
import { EntityForm } from "@/components/admin/entity-form";
import { saveItem } from "../../actions";

export default async function NewItemPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: key } = await params;
  if (!isCollectionKey(key)) notFound();

  const config: Collection = collections[key];

  return (
    <>
      <h1 className="mb-8 font-serif text-3xl text-ink">Add {config.singular}</h1>
      <EntityForm
        fields={config.fields}
        initial={{ published: true }}
        action={saveItem.bind(null, key, null)}
        submitLabel={`Add ${config.singular}`}
        cancelHref={`/admin/${key}`}
      />
    </>
  );
}
