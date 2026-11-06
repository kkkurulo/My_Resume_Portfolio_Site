import { z } from "zod";

export type FieldType = "text" | "textarea" | "url" | "email" | "month" | "tags" | "checkbox" | "image" | "pdf";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  maxLength?: number;
};

export type FieldValue = string | boolean | null;
export type FormValues = Record<string, FieldValue>;

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
  values?: FormValues;
};

export const isUploadField = (field: FieldDef) => field.type === "image" || field.type === "pdf";

const DEFAULT_MAX_LENGTH: Record<FieldType, number> = {
  text: 120,
  textarea: 2000,
  url: 500,
  email: 254,
  month: 7,
  tags: 500,
  checkbox: 0,
  image: 0,
  pdf: 0,
};

/** Only web addresses are allowed, which also keeps `javascript:` links out of the public page. */
function isWebUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function schemaFor(field: FieldDef) {
  const max = field.maxLength ?? DEFAULT_MAX_LENGTH[field.type];
  const text = z.string().max(max, `${field.label} must be ${max} characters or fewer.`);

  switch (field.type) {
    case "url":
      return text.refine(isWebUrl, "Enter a full address starting with https://");
    case "email":
      return text.pipe(z.email("Enter a valid email address."));
    case "month":
      return text.regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Enter a date as YYYY-MM.");
    default:
      return text;
  }
}

const normalizeTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(", ");

export type ParseResult =
  | { ok: true; data: FormValues; values: FormValues }
  | { ok: false; errors: Record<string, string>; values: FormValues };

/** Validates a submitted form. Upload fields are skipped and handled separately. */
export function parseFields(fields: FieldDef[], formData: FormData): ParseResult {
  const data: FormValues = {};
  const values: FormValues = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (isUploadField(field)) continue;

    if (field.type === "checkbox") {
      data[field.name] = values[field.name] = formData.get(field.name) === "on";
      continue;
    }

    const raw = formData.get(field.name);
    let text = typeof raw === "string" ? raw.trim() : "";
    if (field.type === "tags") text = normalizeTags(text);
    values[field.name] = text;

    if (!text) {
      if (field.required) errors[field.name] = `${field.label} is required.`;
      data[field.name] = null;
      continue;
    }

    const result = schemaFor(field).safeParse(text);
    if (result.success) data[field.name] = text;
    else errors[field.name] = result.error.issues[0].message;
  }

  // YYYY-MM strings sort chronologically, so a plain comparison is enough.
  const { startDate, endDate } = data;
  if (typeof startDate === "string" && typeof endDate === "string" && endDate < startDate) {
    errors.endDate = "End date can't be before the start date.";
  }

  return Object.keys(errors).length ? { ok: false, errors, values } : { ok: true, data, values };
}
