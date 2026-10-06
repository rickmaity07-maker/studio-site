import { NextResponse } from "next/server";
import { listReleases } from "@/lib/server/app-releases";
import { requireAdmin, route } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Every app version, newest first (without the file bytes). */
export const GET = route(async () => {
  await requireAdmin();
  return NextResponse.json({ releases: await listReleases() });
});
