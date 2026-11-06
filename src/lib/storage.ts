import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type UploadKind = "image" | "pdf";

export class UploadError extends Error {}

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

/**
 * Identifies a file by its first bytes, because the browser-supplied name and type can be faked.
 * SVG is left out on purpose: it can carry scripts.
 */
function detectType(bytes: Buffer): { ext: string; contentType: string; kind: UploadKind } | null {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("latin1");

  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: "png", contentType: "image/png", kind: "image" };
  }
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return { ext: "jpg", contentType: "image/jpeg", kind: "image" };
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { ext: "webp", contentType: "image/webp", kind: "image" };
  }
  if (ascii(0, 5) === "%PDF-") {
    return { ext: "pdf", contentType: "application/pdf", kind: "pdf" };
  }
  return null;
}

/** Saves an upload and returns its public URL. */
export async function saveUpload(file: File, kind: UploadKind): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("File must be 4 MB or smaller.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = detectType(bytes);
  if (!type || type.kind !== kind) {
    throw new UploadError(kind === "pdf" ? "Please upload a PDF file." : "Please upload a PNG, JPG or WebP image.");
  }

  const name = `${randomUUID()}.${type.ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${name}`, bytes, {
      access: "public",
      contentType: type.contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new UploadError("Uploads need Vercel Blob. Connect a Blob store to this project, then redeploy.");
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, name), bytes);
  return `/uploads/${name}`;
}

/** Best-effort cleanup: a leftover file is harmless, so failures never block a save. */
export async function deleteUpload(url: string): Promise<void> {
  try {
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(LOCAL_DIR, path.basename(url)));
    } else if (new URL(url).hostname.endsWith(BLOB_HOST_SUFFIX)) {
      await del(url);
    }
  } catch (error) {
    console.warn(`Could not delete upload ${url}`, error);
  }
}
