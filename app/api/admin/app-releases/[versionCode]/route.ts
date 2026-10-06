import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { HttpError, readJson, requireAdmin, route } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Ctx = { params: { versionCode: string } };

async function find(raw: string) {
  const versionCode = Number(raw);
  const release = Number.isInteger(versionCode)
    ? await db.appRelease.findUnique({ where: { versionCode }, select: { id: true } })
    : null;
  if (!release) throw new HttpError(404, "No such version.");
  return versionCode;
}

/** Publish / unpublish a version, or mark it mandatory. */
export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const versionCode = await find(params.versionCode);
  const body = await readJson(req);
  const data: { published?: boolean; mandatory?: boolean } = {};
  if (typeof body.published === "boolean") data.published = body.published;
  if (typeof body.mandatory === "boolean") data.mandatory = body.mandatory;
  if (!Object.keys(data).length) throw new HttpError(400, "Nothing to update.");
  await db.appRelease.update({ where: { versionCode }, data });
  return NextResponse.json({ ok: true });
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const versionCode = await find(params.versionCode);
  await db.appRelease.delete({ where: { versionCode } });
  return NextResponse.json({ ok: true });
});
