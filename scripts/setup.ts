import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { hashPassword } from "../src/lib/auth/password";

const ENV_FILE = ".env.local";
const USERNAME = "admin";

if (existsSync(ENV_FILE)) {
  console.log(`${ENV_FILE} already exists, so nothing was changed.`);
  process.exit(0);
}

const password = randomBytes(18).toString("base64url");

writeFileSync(
  ENV_FILE,
  [
    `ADMIN_USERNAME=${USERNAME}`,
    `ADMIN_PASSWORD_HASH=${await hashPassword(password)}`,
    `SESSION_SECRET=${randomBytes(32).toString("hex")}`,
    "",
  ].join("\n"),
);

console.log(`Created ${ENV_FILE}. Local login, shown only once:`);
console.log(`  Username: ${USERNAME}`);
console.log(`  Password: ${password}`);
