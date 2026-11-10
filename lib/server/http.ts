import { NextResponse } from "next/server";
import { db, dbConfigured } from "./db";
import { passwordVersion, readSession } from "./session";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Wraps a route handler: HttpErrors become JSON error responses,
 * anything unexpected is logged and returned as a generic 500.
 */
export function route<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>
) {
  return async (...args: A) => {
    try {
      if (!dbConfigured) throw new HttpError(503, "The backend isn't configured yet.");
      return await handler(...args);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
  };
}

/**
 * Admin = a valid session cookie whose account still exists and whose
 * password hasn't changed since sign-in, so deleting an Admin row or
 * resetting the password revokes access immediately.
 */
export async function requireAdmin() {
  const session = await readSession();
  if (!session) throw new HttpError(401, "Sign in required.");
  const admin = await db.admin.findUnique({ where: { id: session.id }, select: { id: true, email: true, passwordHash: true } });
  // A changed password (or a session from before this check existed) signs you out.
  if (!admin || session.pv !== passwordVersion(admin.passwordHash)) {
    throw new HttpError(401, "Your session has expired. Sign in again.");
  }
  return { id: admin.id, email: admin.email };
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
  } catch {}
  throw new HttpError(400, "Invalid request body.");
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}
