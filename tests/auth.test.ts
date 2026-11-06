import assert from "node:assert/strict";
import { test } from "node:test";
import { SignJWT } from "jose";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { isValidSessionToken, signSessionToken } from "../src/lib/auth/token";

const SECRET = "a".repeat(32);

test("accepts the right password and rejects a wrong one", async () => {
  const stored = await hashPassword("correct horse");
  assert.equal(await verifyPassword("correct horse", stored), true);
  assert.equal(await verifyPassword("wrong horse", stored), false);
});

test("rejects a malformed stored hash instead of throwing", async () => {
  assert.equal(await verifyPassword("anything", ""), false);
  assert.equal(await verifyPassword("anything", "scrypt:abcd:ef"), false);
  assert.equal(await verifyPassword("anything", "plaintext"), false);
});

test("a stored hash has no characters that .env files would expand", async () => {
  assert.doesNotMatch(await hashPassword("x"), /\$/);
});

test("accepts a token it signed", async () => {
  process.env.SESSION_SECRET = SECRET;
  assert.equal(await isValidSessionToken(await signSessionToken()), true);
});

test("rejects missing, garbage and differently signed tokens", async () => {
  process.env.SESSION_SECRET = SECRET;
  const token = await signSessionToken();
  assert.equal(await isValidSessionToken(undefined), false);
  assert.equal(await isValidSessionToken("garbage"), false);

  process.env.SESSION_SECRET = "b".repeat(32);
  assert.equal(await isValidSessionToken(token), false);
});

test("rejects expired tokens and tokens for another subject", async () => {
  process.env.SESSION_SECRET = SECRET;
  const key = new TextEncoder().encode(SECRET);
  const expired = await new SignJWT().setProtectedHeader({ alg: "HS256" }).setSubject("admin").setExpirationTime("-1s").sign(key);
  const otherSubject = await new SignJWT().setProtectedHeader({ alg: "HS256" }).setSubject("guest").setExpirationTime("1h").sign(key);
  assert.equal(await isValidSessionToken(expired), false);
  assert.equal(await isValidSessionToken(otherSubject), false);
});

test("treats a missing or short secret as logged out, and refuses to sign with it", async () => {
  process.env.SESSION_SECRET = "short";
  assert.equal(await isValidSessionToken("anything"), false);
  await assert.rejects(signSessionToken());
});
