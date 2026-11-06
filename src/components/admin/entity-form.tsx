"use client";

import Link from "next/link";
import { useActionState } from "react";
import { isUploadField, type FieldDef, type FieldValue, type FormState } from "@/lib/fields";

type Props = {
  fields: FieldDef[];
  initial: Record<string, unknown>;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  cancelHref?: string;
};

const initialState: FormState = { status: "idle" };

export function EntityForm({ fields, initial, action, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-6" noValidate>
      {fields.map((field) => {
        // React resets a form after each submit, so what was typed comes back through `values`.
        const value = (state.values?.[field.name] ?? initial[field.name] ?? null) as FieldValue;
        return <Field key={field.name} field={field} value={value} current={initial[field.name]} error={state.errors?.[field.name]} />;
      })}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="btn btn-secondary">
            Cancel
          </Link>
        )}
        <p role="status" className={`text-sm ${state.status === "error" ? "text-danger" : "text-muted"}`}>
          {state.message}
        </p>
      </div>
    </form>
  );
}

function Field({ field, value, current, error }: { field: FieldDef; value: FieldValue; current: unknown; error?: string }) {
  const hintId = `${field.name}-hint`;
  const describedBy = field.help || error ? hintId : undefined;

  const hint = (field.help || error) && (
    <p id={hintId} className={`mt-1.5 text-sm ${error ? "text-danger" : "text-muted"}`}>
      {error ?? field.help}
    </p>
  );

  if (field.type === "checkbox") {
    return (
      <div>
        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            name={field.name}
            defaultChecked={value === true}
            aria-describedby={describedBy}
            className="size-4 accent-[var(--accent)]"
          />
          {field.label}
        </label>
        {hint}
      </div>
    );
  }

  if (isUploadField(field)) {
    const existing = typeof current === "string" ? current : null;
    return (
      <div>
        <label htmlFor={field.name} className="field-label">
          {field.label}
        </label>
        {existing && (
          <div className="mb-2 flex flex-wrap items-center gap-4 text-sm">
            <a href={existing} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4">
              View current file ↗
            </a>
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" name={`${field.name}__remove`} className="size-4 accent-[var(--accent)]" />
              Remove
            </label>
          </div>
        )}
        <input
          id={field.name}
          type="file"
          name={`${field.name}__file`}
          accept={field.type === "pdf" ? "application/pdf" : "image/png,image/jpeg,image/webp"}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className="block w-full text-sm text-muted file:mr-3 file:cursor-pointer file:rounded file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-sm file:text-ink"
        />
        <p className="mt-1.5 text-xs text-muted">Up to 4 MB.</p>
        {hint}
      </div>
    );
  }

  const shared = {
    id: field.name,
    name: field.name,
    defaultValue: typeof value === "string" ? value : "",
    placeholder: field.placeholder,
    required: field.required,
    "aria-describedby": describedBy,
    "aria-invalid": Boolean(error),
    className: "field-input",
  };

  return (
    <div>
      <label htmlFor={field.name} className="field-label">
        {field.label}
        {field.required && <span className="text-muted"> (required)</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea {...shared} rows={field.name === "about" ? 10 : 4} />
      ) : (
        <input {...shared} type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"} inputMode={field.type === "month" ? "numeric" : undefined} />
      )}
      {hint}
    </div>
  );
}
