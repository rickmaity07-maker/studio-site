import { db } from "@/lib/server/db";
import { HttpError, route } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/**
 * Serves one published APK. A given version never changes, so it caches
 * forever; /download always points at the newest one.
 */
export const GET = route(async (_req: Request, { params }: { params: { versionCode: string } }) => {
  const versionCode = Number(params.versionCode);
  if (!Number.isInteger(versionCode) || versionCode < 1) throw new HttpError(404, "No such version.");
  const release = await db.appRelease.findUnique({ where: { versionCode } });
  if (!release || !release.published) throw new HttpError(404, "No such version.");

  return new Response(release.data, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": `attachment; filename="rick-build-${release.versionName}.apk"`,
      "Content-Length": String(release.sizeBytes),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
});
