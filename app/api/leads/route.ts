import { NextResponse } from "next/server";
import { validateLead } from "@/lib/lead-schema";
import { db } from "@/lib/server/db";
import { HttpError, readJson, route } from "@/lib/server/http";
import { notifyNewLead } from "@/lib/server/notify";
import { rateLimit } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** The project request form — used by the website and the Android app. */
export const POST = route(async (req: Request) => {
  const body = await readJson(req);

  // Honeypot: a hidden field real visitors never fill in. Pretend success.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const result = validateLead(body);
  if (!result.ok) throw new HttpError(400, result.error);

  await rateLimit(req, {
    bucket: "leads",
    max: 5,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from your connection — please try again later or email directly."
  });

  await db.lead.create({ data: { ...result.value, status: "new" } });

  await notifyNewLead(result.value);

  return NextResponse.json({ ok: true }, { status: 201 });
});
