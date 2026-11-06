import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { AnimatedBackground } from "@/components/site/animated-background";
import { SectionNav } from "@/components/site/section-nav";
import { getProfile, getSiteContent } from "@/db/queries";
import { formatDateRange, splitParagraphs, splitTags } from "@/lib/format";

// Saving in the admin panel refreshes this page immediately. The hour is only a safety net.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { name, headline, tagline } = await getProfile();
  const title = `${name} · ${headline}`;
  const description = tagline ?? headline;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile", url: "/" },
    twitter: { card: "summary_large_image", title, description },
  };
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8">
      <h2 id={`${id}-title`} className="mb-6 font-mono text-xs tracking-wider text-accent uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Tags({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label="Technologies" className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 transition-colors hover:text-accent hover:decoration-current">
      {children}
    </a>
  );
}

export default async function HomePage() {
  const { profile, experience, projects, skills, education, links } = await getSiteContent();
  const about = splitParagraphs(profile.about);

  const skillGroups = new Map<string, string[]>();
  for (const { category, name } of skills) {
    skillGroups.set(category, [...(skillGroups.get(category) ?? []), name]);
  }

  const sections = [
    { id: "about", label: "About", show: about.length > 0 },
    { id: "experience", label: "Experience", show: experience.length > 0 },
    { id: "projects", label: "Projects", show: projects.length > 0 },
    { id: "skills", label: "Skills", show: skills.length > 0 },
    { id: "education", label: "Education", show: education.length > 0 },
  ]
    .filter((section) => section.show)
    .map(({ id, label }) => ({ id, label }));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:flex lg:justify-between lg:gap-16 lg:px-12">
      <AnimatedBackground />
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>

      <header className="pt-14 pb-12 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[42%] lg:shrink-0 lg:flex-col lg:py-20">
        {profile.photoUrl && (
          <div className="relative mb-6 size-24 shrink-0 overflow-hidden rounded-full">
            <Image src={profile.photoUrl} alt="" fill sizes="96px" priority className="object-cover" />
          </div>
        )}
        <h1 className="font-serif text-4xl leading-tight font-semibold text-balance text-ink sm:text-5xl">{profile.name}</h1>
        <p className="mt-3 text-lg text-ink">{profile.headline}</p>
        {profile.tagline && <p className="mt-4 max-w-sm leading-relaxed text-muted">{profile.tagline}</p>}

        {(profile.location || profile.availableForWork) && (
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {profile.location && <span>{profile.location}</span>}
            {profile.availableForWork && (
              <span className="inline-flex items-center gap-2 text-accent">
                <span aria-hidden className="size-2 rounded-full bg-current" />
                Open to work
              </span>
            )}
          </p>
        )}

        {(profile.resumeUrl || profile.email) && (
          <div className="mt-7 flex flex-wrap gap-3">
            {profile.resumeUrl && (
              <a href="/cv" target="_blank" rel="noopener" className="btn btn-primary">
                View CV
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="btn btn-secondary">
                Email me
              </a>
            )}
          </div>
        )}

        <SectionNav sections={sections} />

        {links.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted lg:mt-auto">
            {links.map((link) => (
              <li key={link.id}>
                <OutLink href={link.url}>{link.label} ↗</OutLink>
              </li>
            ))}
          </ul>
        )}
      </header>

      <main id="content" className="space-y-20 pb-20 lg:flex-1 lg:py-20">
        {about.length > 0 && (
          <Section id="about" title="About">
            <div className="max-w-prose space-y-4 leading-relaxed text-ink">
              {about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Section>
        )}

        {experience.length > 0 && (
          <Section id="experience" title="Experience">
            <ol className="divide-y divide-line border-y border-line">
              {experience.map((job) => (
                <li key={job.id} className="py-6">
                  <p className="font-mono text-xs text-muted">{formatDateRange(job.startDate, job.endDate)}</p>
                  <h3 className="mt-2 text-lg font-medium text-ink">
                    {job.role} ·{" "}
                    {job.companyUrl ? <OutLink href={job.companyUrl}>{job.company} ↗</OutLink> : job.company}
                  </h3>
                  {job.location && <p className="text-sm text-muted">{job.location}</p>}
                  {job.summary && <p className="mt-3 max-w-prose leading-relaxed text-muted">{job.summary}</p>}
                  <Tags items={splitTags(job.technologies)} />
                </li>
              ))}
            </ol>
          </Section>
        )}

        {projects.length > 0 && (
          <Section id="projects" title="Projects">
            <ul className="divide-y divide-line border-y border-line">
              {projects.map((project) => (
                <li key={project.id} className="py-6">
                  {project.imageUrl && (
                    <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded border border-line bg-surface">
                      <Image
                        src={project.imageUrl}
                        alt={`Screenshot of ${project.title}`}
                        fill
                        sizes="(min-width: 1024px) 560px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-medium text-ink">{project.title}</h3>
                  <p className="mt-2 max-w-prose leading-relaxed text-muted">{project.summary}</p>
                  <Tags items={splitTags(project.technologies)} />
                  {(project.liveUrl || project.repoUrl) && (
                    <p className="mt-3 flex gap-5 text-sm text-ink">
                      {project.liveUrl && <OutLink href={project.liveUrl}>Live ↗</OutLink>}
                      {project.repoUrl && <OutLink href={project.repoUrl}>Code ↗</OutLink>}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {skills.length > 0 && (
          <Section id="skills" title="Skills">
            <dl className="space-y-5">
              {[...skillGroups].map(([category, names]) => (
                <div key={category}>
                  <dt className="text-sm font-medium text-ink">{category}</dt>
                  <dd className="mt-1 leading-relaxed text-muted">{names.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {education.length > 0 && (
          <Section id="education" title="Education">
            <ul className="space-y-6">
              {education.map((entry) => (
                <li key={entry.id}>
                  <p className="font-mono text-xs text-muted">{formatDateRange(entry.startDate, entry.endDate)}</p>
                  <h3 className="mt-2 text-lg font-medium text-ink">{entry.credential}</h3>
                  <p className="text-muted">{entry.institution}</p>
                  {entry.summary && <p className="mt-2 max-w-prose leading-relaxed text-muted">{entry.summary}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </main>
    </div>
  );
}
