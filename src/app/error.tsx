"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-3xl text-ink">Something went wrong</h1>
      <p className="text-muted">The page couldn&apos;t load. Please try again in a moment.</p>
      <button type="button" onClick={reset} className="btn btn-primary">
        Try again
      </button>
    </main>
  );
}
