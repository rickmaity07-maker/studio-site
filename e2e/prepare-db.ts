import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { importStarterProjects } from "../lib/server/seed";
import { hashPassword } from "../lib/server/password";

/*
  Runs before the e2e test server is built (see playwright.config.ts), so
  every page is built from a fresh, known database:
  reset studio_site_test, import the 13 starter projects, create the e2e admin.

  Only ever touches a database named studio_site_test. The owner approved
  resetting that test database before each run (Prisma requires this consent
  for --force-reset when run by an AI agent).
*/
const url = process.env.DATABASE_URL ?? "";
const direct = process.env.DATABASE_URL_UNPOOLED ?? "";

if (!/\/studio_site_test\?/.test(url) || !/\/studio_site_test\?/.test(direct)) {
  console.error("[e2e] Refusing to reset: DATABASE_URL is not the studio_site_test database.");
  process.exit(1);
}

execSync("npx prisma db push --force-reset --skip-generate --accept-data-loss", {
  stdio: "inherit",
  env: { ...process.env, PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "yes" }
});

(async () => {
  const db = new PrismaClient({ datasources: { db: { url: direct } } });
  try {
    const { imported } = await importStarterProjects(db);
    await db.admin.create({
      data: {
        email: process.env.E2E_ADMIN_EMAIL!,
        passwordHash: await hashPassword(process.env.E2E_ADMIN_PASSWORD!)
      }
    });
    // A published app version for /download and /api/app/version. The bytes
    // start like a zip (an APK is one); the e2e suite only checks headers + checksum.
    const apk = Buffer.concat([Buffer.from("PK\x03\x04"), Buffer.from("e2e test apk ".repeat(2000))]);
    await db.appRelease.create({
      data: {
        versionCode: 1,
        versionName: "1.0.0",
        data: new Uint8Array(apk),
        sha256: createHash("sha256").update(apk).digest("hex"),
        sizeBytes: apk.byteLength,
        notes: "First release for the test run."
      }
    });
    console.log(`[e2e] test database reset: ${imported} projects, 1 admin, 1 app release`);
  } finally {
    await db.$disconnect();
  }
})();
