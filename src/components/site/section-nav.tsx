"use client";

import { useEffect, useState } from "react";

type Section = { id: string; label: string };

/** In-page navigation that highlights the section currently being read. */
export function SectionNav({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      // Only the band across the upper-middle of the screen counts as "being read".
      { rootMargin: "-25% 0px -70% 0px" },
    );
    for (const { id } of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Page sections" className="mt-12 hidden lg:block">
      <ul className="space-y-1">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "true" : undefined}
              className={`group flex items-center gap-3 py-1 font-mono text-xs tracking-wider uppercase transition-colors ${
                active === id ? "text-accent" : "text-muted hover:text-ink"
              }`}
            >
              <span
                aria-hidden
                className={`h-px bg-current transition-all motion-reduce:transition-none ${active === id ? "w-12" : "w-6 group-hover:w-9"}`}
              />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
