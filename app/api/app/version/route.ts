import { NextResponse } from "next/server";
import { updateInfo } from "@/lib/server/app-releases";
import { route } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/**
 * GET /api/app/version?current=<versionCode>
 * Installed apps ask this on start: is there a newer version, and must I update?
 */
export const GET = route(async (req: Request) => {
  const current = Number(new URL(req.url).searchParams.get("current") ?? 0);
  const info = await updateInfo(Number.isFinite(current) && current > 0 ? Math.floor(current) : 0);
  return NextResponse.json(info, { headers: { "Cache-Control": "no-store" } });
});
