import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-3xl text-ink">Page not found</h1>
      <Link href="/" className="btn btn-primary">
        Go to the home page
      </Link>
    </main>
  );
}
