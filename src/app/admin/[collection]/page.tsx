import { asc } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collections, isCollectionKey, type Collection, type Row } from "@/admin/collections";
import { DeleteButton } from "@/components/admin/delete-button";
import { db } from "@/db";
import { education, experience, links, projects, skills } from "@/db/schema";
import { deleteItem, moveItem, togglePublished } from "../actions";

const tables = { experience, projects, skills, education, links };

const rowButton = "cursor-pointer rounded px-2 py-1 text-sm text-muted hover:bg-line/50 hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent";

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: key } = await params;
  if (!isCollectionKey(key)) notFound();

  const config: Collection = collections[key];
  const table = tables[key] as unknown as typeof experience;
  const rows = (await db.select().from(table).orderBy(asc(table.sortOrder), asc(table.id))) as unknown as Row[];

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">{config.label}</h1>
          <p className="mt-2 text-sm text-muted">{config.intro}</p>
        </div>
        <Link href={`/admin/${key}/new`} className="btn btn-primary shrink-0">
          Add
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 rounded border border-dashed border-line p-8 text-center text-sm text-muted">
          Nothing here yet. This section stays hidden on your site until you add a {config.singular}.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {rows.map((row, index) => (
            <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-0 flex-1 basis-56">
                <p className="truncate text-ink">
                  {config.title(row)}
                  {!row.published && <span className="ml-2 rounded bg-line/70 px-1.5 py-0.5 text-xs text-muted">Draft</span>}
                </p>
                <p className="truncate text-sm text-muted">{config.subtitle(row)}</p>
              </div>
              <div className="flex items-center">
                <form action={moveItem.bind(null, key, row.id, "up")}>
                  <button type="submit" disabled={index === 0} aria-label={`Move ${config.title(row)} up`} className={rowButton}>
                    ↑
                  </button>
                </form>
                <form action={moveItem.bind(null, key, row.id, "down")}>
                  <button type="submit" disabled={index === rows.length - 1} aria-label={`Move ${config.title(row)} down`} className={rowButton}>
                    ↓
                  </button>
                </form>
                <form action={togglePublished.bind(null, key, row.id, !row.published)}>
                  <button type="submit" className={rowButton}>
                    {row.published ? "Hide" : "Show"}
                  </button>
                </form>
                <Link href={`/admin/${key}/${row.id}`} className={rowButton}>
                  Edit
                </Link>
                <DeleteButton action={deleteItem.bind(null, key, row.id)} name={config.title(row)} className={rowButton} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
