import { NextResponse } from "next/server";
import { validateProject } from "@/lib/project-schema";
import { db } from "@/lib/server/db";
import { HttpError, readJson, requireAdmin, route } from "@/lib/server/http";
import { refreshPublicPages, toRow, toStoredProject } from "@/lib/server/projects";

export const dynamic = "force-dynamic";

/** All projects, including hidden ones, in display order. */
export const GET = route(async () => {
  await requireAdmin();
  const rows = await db.project.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ projects: rows.map(toStoredProject) });
});

export const POST = route(async (req: Request) => {
  await requireAdmin();

  const result = validateProject(await readJson(req));
  if (!result.ok) throw new HttpError(400, result.error);
  if (await db.project.findUnique({ where: { slug: result.value.slug }, select: { id: true } })) {
    throw new HttpError(409, `Another project already uses the slug "${result.value.slug}".`);
  }

  // New projects go to the end of the list.
  const last = await db.project.aggregate({ _max: { order: true } });
  const order = (last._max.order ?? -1) + 1;

  const project = await db.project.create({ data: { ...toRow(result.value), order } });

  refreshPublicPages();
  return NextResponse.json({ id: project.id }, { status: 201 });
});
