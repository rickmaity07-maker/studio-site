import { NextResponse } from "next/server";
import { validateProject } from "@/lib/project-schema";
import { db } from "@/lib/server/db";
import { HttpError, readJson, requireAdmin, route } from "@/lib/server/http";
import { refreshPublicPages, toRow, toStoredProject } from "@/lib/server/projects";
import { deleteOrphanImages } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

async function load(id: string) {
  const row = await db.project.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, "Project not found.");
  return row;
}

export const GET = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  return NextResponse.json({ project: toStoredProject(await load(params.id)) });
});

export const PUT = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  await load(params.id);

  const result = validateProject(await readJson(req));
  if (!result.ok) throw new HttpError(400, result.error);
  const clash = await db.project.findUnique({ where: { slug: result.value.slug }, select: { id: true } });
  if (clash && clash.id !== params.id) {
    throw new HttpError(409, `Another project already uses the slug "${result.value.slug}".`);
  }
  for (const imageId of [result.value.image?.id, result.value.mobileImage?.id]) {
    if (imageId && !(await db.image.findUnique({ where: { id: imageId }, select: { id: true } }))) {
      throw new HttpError(400, "That screenshot no longer exists. Upload it again.");
    }
  }

  await db.project.update({ where: { id: params.id }, data: toRow(result.value) });
  await deleteOrphanImages();

  refreshPublicPages();
  return NextResponse.json({ ok: true });
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const row = await load(params.id);
  await db.project.delete({ where: { id: row.id } });
  for (const id of [row.imageId, row.mobileImageId]) {
    if (id) await db.image.delete({ where: { id } }).catch(() => {});
  }
  refreshPublicPages();
  return NextResponse.json({ ok: true });
});
