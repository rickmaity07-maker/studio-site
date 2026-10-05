import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { HttpError, readJson, route } from "@/lib/server/http";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { rateLimit } from "@/lib/server/rate-limit";
import { startSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

// Compared against when the email is unknown, so both cases take the same time.
const dummyHash = hashPassword("not-a-real-password");

export const POST = route(async (req: Request) => {
  await rateLimit(req, {
    bucket: "login",
    max: 10,
    windowMs: 15 * 60 * 1000,
    message: "Too many sign-in attempts. Wait 15 minutes and try again."
  });

  const body = await readJson(req);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) throw new HttpError(400, "Enter your email and password.");

  const admin = await db.admin.findUnique({ where: { email } });
  const ok = await verifyPassword(password, admin?.passwordHash ?? (await dummyHash));
  if (!admin || !ok) throw new HttpError(401, "That email or password doesn't match.");

  await startSession(admin);
  return NextResponse.json({ ok: true });
});
