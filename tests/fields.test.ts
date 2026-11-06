import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFields, type FieldDef } from "../src/lib/fields";

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

const single = (field: FieldDef, value: string) => parseFields([field], form({ [field.name]: value }));
const url: FieldDef = { name: "url", label: "URL", type: "url" };

test("requires required fields and stores blank optional ones as null", () => {
  const fields: FieldDef[] = [
    { name: "a", label: "A", type: "text", required: true },
    { name: "b", label: "B", type: "text" },
  ];
  const missing = parseFields(fields, form({ a: "   ", b: "" }));
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.errors.a, "A is required.");

  const filled = parseFields(fields, form({ a: " hi ", b: "" }));
  assert.deepEqual(filled.ok && filled.data, { a: "hi", b: null });
});

test("allows web addresses and blocks script and other schemes", () => {
  assert.equal(single(url, "https://example.com").ok, true);
  assert.equal(single(url, "http://example.com").ok, true);
  for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,x", "example.com"]) {
    assert.equal(single(url, bad).ok, false, bad);
  }
});

test("validates email and month formats", () => {
  const email: FieldDef = { name: "email", label: "Email", type: "email" };
  const month: FieldDef = { name: "month", label: "Month", type: "month" };
  assert.equal(single(email, "me@example.com").ok, true);
  assert.equal(single(email, "not-an-email").ok, false);
  assert.equal(single(month, "2024-12").ok, true);
  assert.equal(single(month, "2024-13").ok, false);
  assert.equal(single(month, "Dec 2024").ok, false);
});

test("enforces length limits", () => {
  const short: FieldDef = { name: "t", label: "T", type: "text", maxLength: 3 };
  assert.equal(single(short, "abc").ok, true);
  assert.equal(single(short, "abcd").ok, false);
});

test("reads checkboxes and tidies tags", () => {
  const fields: FieldDef[] = [
    { name: "on", label: "On", type: "checkbox" },
    { name: "off", label: "Off", type: "checkbox" },
    { name: "tags", label: "Tags", type: "tags" },
  ];
  const result = parseFields(fields, form({ on: "on", tags: " a,b ,, c " }));
  assert.deepEqual(result.ok && result.data, { on: true, off: false, tags: "a, b, c" });
});

test("rejects an end date before the start date", () => {
  const fields: FieldDef[] = [
    { name: "startDate", label: "Start", type: "month" },
    { name: "endDate", label: "End", type: "month" },
  ];
  const bad = parseFields(fields, form({ startDate: "2024-05", endDate: "2024-04" }));
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.ok(bad.errors.endDate);
  assert.equal(parseFields(fields, form({ startDate: "2024-05", endDate: "2024-05" })).ok, true);
  assert.equal(parseFields(fields, form({ startDate: "2024-05", endDate: "" })).ok, true);
});

test("keeps what was typed when validation fails, so the form can show it again", () => {
  const result = single(url, "not a url");
  assert.equal(result.values.url, "not a url");
});
