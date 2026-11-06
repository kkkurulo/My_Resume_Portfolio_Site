/** Decorative backdrop. The look and motion live in globals.css, so this ships no JavaScript. */
export function AnimatedBackground() {
  return (
    <div aria-hidden className="bg-scene">
      <div className="bg-blob bg-blob-a" />
      <div className="bg-blob bg-blob-b" />
      <div className="bg-blob bg-blob-c" />
      <div className="bg-dots" />
    </div>
  );
}
