"use server";

import { timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { clearLoginAttempts, registerLoginAttempt, WINDOW_MINUTES } from "@/lib/auth/rate-limit";
import { endSession, startSession } from "@/lib/auth/session";

export type LoginState = { error?: string };

const MAX_PASSWORD_LENGTH = 200;

function sameText(a: string, b: string): boolean {
  const left = Buffer.from(a.toLowerCase());
  const right = Buffer.from(b.toLowerCase());
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.SESSION_SECRET;
  if (!adminUsername || !passwordHash || !secret || secret.length < 32) {
    return { error: "Login isn't configured yet. Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH and SESSION_SECRET." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!(await registerLoginAttempt(ip))) {
    return { error: `Too many attempts. Try again in ${WINDOW_MINUTES} minutes.` };
  }

  const username = formData.get("username");
  const password = formData.get("password");
  const valid =
    typeof username === "string" &&
    typeof password === "string" &&
    password.length <= MAX_PASSWORD_LENGTH &&
    // The password is always checked, so a wrong username takes as long to reject as a wrong password.
    (await verifyPassword(password, passwordHash)) &&
    sameText(username.trim(), adminUsername);

  if (!valid) return { error: "Incorrect username or password." };

  await clearLoginAttempts(ip);
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}
