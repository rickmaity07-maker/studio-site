import { NextResponse } from "next/server";
import { db, dbConfigured } from "./db";
import { readSession } from "./session";

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
 * Admin = a valid session cookie whose account still exists, so
 * deleting an Admin row revokes access immediately.
 */
export async function requireAdmin() {
  const session = await readSession();
  if (!session) throw new HttpError(401, "Sign in required.");
  const admin = await db.admin.findUnique({ where: { id: session.id }, select: { id: true, email: true } });
  if (!admin) throw new HttpError(401, "Your session has expired. Sign in again.");
  return admin;
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
