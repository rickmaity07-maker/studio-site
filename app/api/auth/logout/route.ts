import { NextResponse } from "next/server";
import { endSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function POST() {
  endSession();
  return NextResponse.json({ ok: true });
}
