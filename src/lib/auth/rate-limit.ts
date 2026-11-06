import "server-only";
import { eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";

const MAX_ATTEMPTS = 5;
export const WINDOW_MINUTES = 15;

/** Counts this attempt and returns false once the caller is over the limit. */
export async function registerLoginAttempt(key: string): Promise<boolean> {
  const now = Date.now();
  await db.delete(loginAttempts).where(lt(loginAttempts.windowStartedAt, now - WINDOW_MINUTES * 60_000));

  const [row] = await db
    .insert(loginAttempts)
    .values({ key, count: 1, windowStartedAt: now })
    .onConflictDoUpdate({ target: loginAttempts.key, set: { count: sql`${loginAttempts.count} + 1` } })
    .returning({ count: loginAttempts.count });

  return row.count <= MAX_ATTEMPTS;
}

export async function clearLoginAttempts(key: string): Promise<void> {
  await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
}
