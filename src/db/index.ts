import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";

// A local file would silently vanish between Vercel deployments, so fail loudly instead.
if (process.env.VERCEL && url.startsWith("file:")) {
  throw new Error("TURSO_DATABASE_URL must be set on Vercel.");
}

export const databaseUrl = url;
export const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });
export const db = drizzle(client, { schema });
