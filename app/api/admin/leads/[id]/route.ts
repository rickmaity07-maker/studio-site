import { NextResponse } from "next/server";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/lead-schema";
import { db } from "@/lib/server/db";
import { HttpError, readJson, requireAdmin, route } from "@/lib/server/http";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

async function assertExists(id: string) {
  if (!(await db.lead.findUnique({ where: { id }, select: { id: true } }))) {
    throw new HttpError(404, "Request not found.");
  }
}

/** Update a lead's status and/or private notes. */
export const PATCH = route(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const body = await readJson(req);
  const update: { status?: LeadStatus; notes?: string } = {};

  if (body.status !== undefined) {
    if (!LEAD_STATUSES.includes(body.status as LeadStatus)) throw new HttpError(400, "Unknown status.");
    update.status = body.status as LeadStatus;
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") throw new HttpError(400, "Notes must be text.");
    update.notes = body.notes.slice(0, 5000);
  }
  if (!Object.keys(update).length) throw new HttpError(400, "Nothing to update.");

  await assertExists(params.id);
  await db.lead.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ ok: true });
});

/** Permanent delete — e.g. to honour a GDPR erasure request. */
export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  await assertExists(params.id);
  await db.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
