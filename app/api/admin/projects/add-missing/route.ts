import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { requireAdmin, route } from "@/lib/server/http";
import { refreshPublicPages } from "@/lib/server/projects";
import { addMissingStarterProjects } from "@/lib/server/seed";

export const dynamic = "force-dynamic";

/**
 * Adds the projects from data/projects.ts that aren't in the database yet
 * (same as `npm run db:add-starters`). Existing projects are left untouched.
 */
export const POST = route(async (req: Request) => {
  await requireAdmin();
  const { added } = await addMissingStarterProjects(db, new URL(req.url).origin);
  if (added.length) refreshPublicPages();
  return NextResponse.json({ ok: true, added });
});
