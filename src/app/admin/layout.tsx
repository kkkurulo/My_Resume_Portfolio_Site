import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { collectionKeys, collections } from "@/admin/collections";
import { requireAdmin } from "@/lib/auth/session";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const navLink = "rounded px-2.5 py-1.5 text-sm whitespace-nowrap text-muted hover:bg-line/50 hover:text-ink";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto min-h-dvh max-w-5xl gap-10 px-4 py-6 md:flex md:px-6 md:py-10">
      <aside className="mb-6 shrink-0 md:mb-0 md:w-44">
        <p className="mb-3 px-2.5 font-serif text-xl text-ink">Admin</p>
        <nav aria-label="Admin sections" className="flex flex-wrap gap-0.5 md:flex-col">
          <Link href="/admin" className={navLink}>
            Profile
          </Link>
          {collectionKeys.map((key) => (
            <Link key={key} href={`/admin/${key}`} className={navLink}>
              {collections[key].label}
            </Link>
          ))}
        </nav>
        <div className="mt-3 flex flex-wrap gap-0.5 border-t border-line pt-3 md:flex-col">
          <a href="/" target="_blank" rel="noreferrer" className={navLink}>
            View site ↗
          </a>
          <form action={logout}>
            <button type="submit" className={`${navLink} w-full cursor-pointer text-left`}>
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
