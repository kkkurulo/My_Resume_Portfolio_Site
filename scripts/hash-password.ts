import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/lib/auth/password";

// Usage: `npm run admin:password` to generate a strong password,
// or `npm run admin:password -- "your password"` to hash one you chose.
const chosen = process.argv[2];
const password = chosen ?? randomBytes(18).toString("base64url");

if (!chosen) console.log(`Password (save it in a password manager):\n  ${password}\n`);
console.log(`ADMIN_PASSWORD_HASH value:\n  ${await hashPassword(password)}`);
