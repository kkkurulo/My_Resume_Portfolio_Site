import { formatDateRange } from "../lib/format";
import type { FieldDef } from "../lib/fields";

/**
 * Describes every editable section of the site. The admin pages, forms and validation are all
 * generated from this, so adding a section means adding a table and one entry here.
 */

export type Row = Record<string, unknown> & { id: number; sortOrder: number; published: boolean };

export type Collection = {
  label: string;
  singular: string;
  intro: string;
  fields: FieldDef[];
  title: (row: Row) => string;
  subtitle: (row: Row) => string;
};

const published: FieldDef = {
  name: "published",
  label: "Show on the public site",
  type: "checkbox",
  help: "Untick to keep this as a hidden draft.",
};

const text = (value: unknown) => (typeof value === "string" ? value : "");
const dates = (row: Row) => formatDateRange(text(row.startDate) || null, text(row.endDate) || null);

export const profileFields: FieldDef[] = [
  { name: "name", label: "Full name", type: "text", required: true, maxLength: 80 },
  { name: "headline", label: "Headline", type: "text", required: true, maxLength: 80, placeholder: "Backend Developer (.NET)" },
  { name: "tagline", label: "Tagline", type: "textarea", maxLength: 200, help: "One sentence under your name. Also used in link previews." },
  { name: "about", label: "About", type: "textarea", maxLength: 4000, help: "Leave a blank line between paragraphs." },
  { name: "location", label: "Location", type: "text" },
  { name: "email", label: "Contact email", type: "email", help: "Shown publicly on the Email me button." },
  { name: "availableForWork", label: "Show “Open to work” badge", type: "checkbox" },
  { name: "photoUrl", label: "Photo", type: "image" },
  { name: "resumeUrl", label: "CV (PDF)", type: "pdf", help: "Your site’s /cv address always opens the latest version." },
];

export const collections = {
  experience: {
    label: "Experience",
    singular: "position",
    intro: "Jobs and roles, shown in the order below.",
    title: (row) => `${text(row.role)} · ${text(row.company)}`,
    subtitle: dates,
    fields: [
      { name: "role", label: "Role", type: "text", required: true },
      { name: "company", label: "Company", type: "text", required: true },
      { name: "companyUrl", label: "Company website", type: "url" },
      { name: "location", label: "Location", type: "text" },
      { name: "startDate", label: "Start date", type: "month", required: true, placeholder: "2024-01", help: "Format: YYYY-MM" },
      { name: "endDate", label: "End date", type: "month", placeholder: "2025-06", help: "Format: YYYY-MM. Leave blank for Present." },
      { name: "summary", label: "What you did", type: "textarea" },
      { name: "technologies", label: "Technologies", type: "tags", help: "Separate with commas." },
      published,
    ],
  },
  projects: {
    label: "Projects",
    singular: "project",
    intro: "Your work, shown in the order below. Three to six strong projects work best.",
    title: (row) => text(row.title),
    subtitle: (row) => text(row.technologies),
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true, maxLength: 1000, help: "The problem, what you did, and the result." },
      { name: "imageUrl", label: "Screenshot", type: "image" },
      { name: "liveUrl", label: "Live link", type: "url" },
      { name: "repoUrl", label: "Code link", type: "url" },
      { name: "technologies", label: "Technologies", type: "tags", help: "Separate with commas." },
      published,
    ],
  },
  skills: {
    label: "Skills",
    singular: "skill",
    intro: "Skills with the same category are grouped together. Categories appear in the order of their first skill.",
    title: (row) => text(row.name),
    subtitle: (row) => text(row.category),
    fields: [
      { name: "name", label: "Skill", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true, placeholder: "Databases", help: "Type the exact same name to group skills." },
      published,
    ],
  },
  education: {
    label: "Education",
    singular: "education entry",
    intro: "Degrees, courses and certificates, shown in the order below.",
    title: (row) => text(row.credential),
    subtitle: (row) => [text(row.institution), dates(row)].filter(Boolean).join(" · "),
    fields: [
      { name: "credential", label: "Degree or certificate", type: "text", required: true },
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "startDate", label: "Start date", type: "month", placeholder: "2023-09", help: "Format: YYYY-MM" },
      { name: "endDate", label: "End date", type: "month", placeholder: "2027-07", help: "Format: YYYY-MM" },
      { name: "summary", label: "Details", type: "textarea", maxLength: 1000 },
      published,
    ],
  },
  links: {
    label: "Links",
    singular: "link",
    intro: "Profiles shown under your name, such as GitHub or LinkedIn.",
    title: (row) => text(row.label),
    subtitle: (row) => text(row.url),
    fields: [
      { name: "label", label: "Label", type: "text", required: true, maxLength: 40, placeholder: "GitHub" },
      { name: "url", label: "Address", type: "url", required: true, placeholder: "https://github.com/your-name" },
      published,
    ],
  },
} satisfies Record<string, Collection>;

export type CollectionKey = keyof typeof collections;

export const collectionKeys = Object.keys(collections) as CollectionKey[];

export const isCollectionKey = (value: string): value is CollectionKey =>
  Object.prototype.hasOwnProperty.call(collections, value);
