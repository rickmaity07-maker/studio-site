import { NextResponse } from "next/server";
import { latestRelease } from "@/lib/server/app-releases";

export const dynamic = "force-dynamic";

/**
 * rickbuild.vercel.app/download: the one link to share. Always the newest
 * published app version; falls back to the app page if none is out yet.
 */
export async function GET(req: Request) {
  const latest = await latestRelease();
  const target = new URL(latest ? latest.url : "/app", req.url);
  return NextResponse.redirect(target, { status: 307, headers: { "Cache-Control": "no-store" } });
}
