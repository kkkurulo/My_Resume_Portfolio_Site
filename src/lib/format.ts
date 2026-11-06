const monthFormat = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });

function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return monthFormat.format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return end ? formatMonth(end) : "";
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "Present"}`;
}

export const splitTags = (value: string | null): string[] => (value ? value.split(", ").filter(Boolean) : []);

export const splitParagraphs = (value: string | null): string[] =>
  value
    ? value
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];
