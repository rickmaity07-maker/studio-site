/*
  Publishes a new version of the Android app (same flow as the Paulaner app).
  Installed apps see it the next time they open and offer to update;
  rickbuild.vercel.app/download starts serving it immediately.

    npm run app:release -- --notes "New: home tab, phone screenshots"
    npm run app:release -- --notes "…" --name 1.2.0 --mandatory
    npm run app:release -- --dry-run          build and check only, publish nothing

  Builds the signed release APK (android/, key from ~/.android-rick-build),
  then stores it in the database with its SHA-256. Reads DATABASE_URL from
  .env.local; add --env-file=.env.test.local to publish to the test database.
*/
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const fail = (message: string): never => {
  console.error(`✘ ${message}`);
  process.exit(1);
};

// Vercel functions can return at most 4.5 MB; leave headroom for the download route.
const MAX_BYTES = 4 * 1024 * 1024;

const root = path.resolve(__dirname, "..");
const android = path.join(root, "android");

if (!process.env.DATABASE_URL) fail("DATABASE_URL is missing (run through `npm run app:release`).");
if (!existsSync(path.join(os.homedir(), ".android-rick-build", "keystore.properties"))) {
  fail("Release key not found in ~/.android-rick-build. Without it, installed apps can't update.");
}
const notes = option("notes") ?? "";
if (!notes && !flag("dry-run")) fail('Describe what changed: --notes "…"');

(async () => {
  const db = new PrismaClient();
  try {
    // Next build number; the name bumps its last part unless given.
    const last = await db.appRelease.findFirst({ orderBy: { versionCode: "desc" }, select: { versionCode: true, versionName: true } });
    const versionCode = (last?.versionCode ?? 0) + 1;
    const versionName = option("name") ?? (last ? last.versionName.replace(/(\d+)$/, (n) => String(Number(n) + 1)) : "1.0.0");
    if (!/^\d+\.\d+\.\d+$/.test(versionName)) fail(`Version name must look like 1.2.0, got ${versionName}`);
    console.log(`→ Building ${versionName} (build ${versionCode}) …`);

    // Full path: Windows may not run programs from the current folder.
    const gradlew = path.join(android, process.platform === "win32" ? "gradlew.bat" : "gradlew");
    execSync(`"${gradlew}" assembleRelease -PversionCode=${versionCode} -PversionName=${versionName} --console=plain -q`, {
      cwd: android,
      stdio: "inherit"
    });

    const apk = path.join(android, "app", "build", "outputs", "apk", "release", "app-release.apk");
    const size = statSync(apk).size;
    if (size > MAX_BYTES) fail(`The APK is ${(size / 1048576).toFixed(1)} MB; the download route can serve at most 4 MB.`);
    const data = readFileSync(apk);
    const sha256 = createHash("sha256").update(data).digest("hex");
    console.log(`✔ Built ${(size / 1048576).toFixed(1)} MB, SHA-256 ${sha256}`);

    if (flag("dry-run")) {
      console.log("Dry run: nothing published.");
      return;
    }

    await db.appRelease.create({
      data: {
        versionCode,
        versionName,
        data: new Uint8Array(data),
        sha256,
        sizeBytes: size,
        notes,
        mandatory: flag("mandatory"),
        published: !flag("unpublished")
      }
    });
    console.log(`✔ Published ${versionName} (build ${versionCode})${flag("mandatory") ? " as a mandatory update" : ""}`);
    console.log("  Download link: /download");
  } finally {
    await db.$disconnect();
  }
})();
