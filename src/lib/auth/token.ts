import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "portfolio_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const ALGORITHM = "HS256";
const SUBJECT = "admin";

function secretKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 32 ? new TextEncoder().encode(secret) : null;
}

export async function signSessionToken(): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error("SESSION_SECRET must be set and at least 32 characters long.");

  return new SignJWT()
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(SUBJECT)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(key);
}

/** Any bad, expired or missing token, or a missing secret, simply counts as logged out. */
export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  const key = secretKey();
  if (!key || !token) return false;

  try {
    await jwtVerify(token, key, { algorithms: [ALGORITHM], subject: SUBJECT });
    return true;
  } catch {
    return false;
  }
}
