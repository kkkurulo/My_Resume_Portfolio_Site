import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSessionToken } from "./token";

export async function isLoggedIn(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Must be the first line of every admin server action. The proxy only guards /admin pages,
 * but a server action can be called by a POST to any route.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isLoggedIn())) redirect("/login");
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
