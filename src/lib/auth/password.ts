import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt) as (password: string, salt: Buffer, length: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

/** Stored as `scrypt:<salt>:<hash>` in hex. It has no `$`, which .env files would try to expand. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEY_LENGTH) return false;

  const actual = await derive(password, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  return timingSafeEqual(actual, expected);
}
