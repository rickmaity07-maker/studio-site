import { db, dbConfigured } from "./db";

/** A published app version, without its file bytes. */
export type AppReleaseInfo = {
  versionCode: number;
  versionName: string;
  sha256: string;
  sizeBytes: number;
  notes: string;
  mandatory: boolean;
  published: boolean;
  createdAt: string;
  /** Where the APK is served from (this site). */
  url: string;
};

const SELECT = {
  versionCode: true,
  versionName: true,
  sha256: true,
  sizeBytes: true,
  notes: true,
  mandatory: true,
  published: true,
  createdAt: true
} as const;

const toInfo = (r: Omit<AppReleaseInfo, "url" | "createdAt"> & { createdAt: Date }): AppReleaseInfo => ({
  ...r,
  createdAt: r.createdAt.toISOString(),
  url: `/api/app/download/${r.versionCode}`
});

export async function listReleases(): Promise<AppReleaseInfo[]> {
  if (!dbConfigured) return [];
  const rows = await db.appRelease.findMany({ select: SELECT, orderBy: { versionCode: "desc" }, take: 50 });
  return rows.map(toInfo);
}

/** The newest published version, or null if none has been released yet. */
export async function latestRelease(): Promise<AppReleaseInfo | null> {
  if (!dbConfigured) return null;
  try {
    const row = await db.appRelease.findFirst({
      where: { published: true },
      select: SELECT,
      orderBy: { versionCode: "desc" }
    });
    return row ? toInfo(row) : null;
  } catch (err) {
    console.error("Couldn't load the latest app release:", err);
    return null;
  }
}

/**
 * What an installed app on `current` should do (same contract as the
 * Paulaner app): the newest published version if it's newer, and whether
 * it must update first (it is below a newer mandatory version).
 */
export async function updateInfo(current: number) {
  const published = (await listReleases()).filter((r) => r.published);
  const latest = published[0] ?? null;
  const minSupportedVersionCode = published
    .filter((r) => r.mandatory)
    .reduce((min, r) => Math.max(min, r.versionCode), 0);
  return {
    latest: latest && latest.versionCode > current ? latest : null,
    minSupportedVersionCode,
    mustUpdate: latest !== null && current < minSupportedVersionCode
  };
}
