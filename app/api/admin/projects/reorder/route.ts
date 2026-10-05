import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { HttpError, readJson, requireAdmin, route } from "@/lib/server/http";
import { refreshPublicPages } from "@/lib/server/projects";

export const dynamic = "force-dynamic";

/** Body: { ids: string[] } — the full list of project ids in the new order. */
export const POST = route(async (req: Request) => {
  await requireAdmin();
  const { ids } = await readJson(req);
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
    throw new HttpError(400, "Expected a list of project ids.");
  }

  const existing = new Set((await db.project.findMany({ select: { id: true } })).map((p) => p.id));
  if (ids.length !== existing.size || !ids.every((id) => existing.has(id))) {
    throw new HttpError(409, "The project list changed. Reload and try again.");
  }

  await db.$transaction(ids.map((id, order) => db.project.update({ where: { id }, data: { order } })));

  refreshPublicPages();
  return NextResponse.json({ ok: true });
});
