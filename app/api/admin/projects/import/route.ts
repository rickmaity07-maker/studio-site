import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { HttpError, requireAdmin, route } from "@/lib/server/http";
import { refreshPublicPages } from "@/lib/server/projects";
import { importStarterProjects } from "@/lib/server/seed";

export const dynamic = "force-dynamic";

/** Copies data/projects.ts into an empty database (same as `npm run db:seed`). */
export const POST = route(async () => {
  await requireAdmin();
  const { imported } = await importStarterProjects(db);
  if (!imported) throw new HttpError(409, "There are already projects in the database.");
  refreshPublicPages();
  return NextResponse.json({ ok: true, count: imported });
});
