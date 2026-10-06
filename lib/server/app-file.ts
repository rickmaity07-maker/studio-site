import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { androidApp } from "@/data/app";

/** Size and SHA-256 of the published APK, so visitors can verify the download. */
export async function getApkInfo() {
  try {
    const data = await readFile(path.join(process.cwd(), "public", androidApp.path));
    return {
      sizeMb: (data.byteLength / (1024 * 1024)).toFixed(1),
      sha256: createHash("sha256").update(data).digest("hex")
    };
  } catch {
    return null;
  }
}
