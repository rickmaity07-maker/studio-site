/**
 * npm run admin:create -- you@example.com [password]
 *
 * Creates an admin account, or resets the password of an existing one.
 * Leave out the password to have a strong one generated and printed.
 */
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/server/password";

const [emailArg, passwordArg] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Usage: npm run admin:create -- you@example.com [password]");
  process.exit(1);
}
if (passwordArg && passwordArg.length < 12) {
  console.error("Use a password of at least 12 characters.");
  process.exit(1);
}

const password = passwordArg || randomBytes(15).toString("base64url");
const db = new PrismaClient();

hashPassword(password)
  .then((passwordHash) =>
    db.admin.upsert({ where: { email }, create: { email, passwordHash }, update: { passwordHash } })
  )
  .then(() => {
    console.log(`Admin ready: ${email}`);
    if (!passwordArg) console.log(`Password:    ${password}`);
  })
  .finally(() => db.$disconnect());
