import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Admin sessions: a signed JWT in an httpOnly cookie. SameSite=Lax
 * keeps other sites from sending it with POST/PUT/DELETE requests.
 */
export const SESSION_COOKIE = "admin_session";
const MAX_AGE_S = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters (see README).");
  }
  return new TextEncoder().encode(value);
}

export async function startSession(admin: { id: string; email: string }) {
  const token = await new SignJWT({ email: admin.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(secret());

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S
  });
}

export function endSession() {
  cookies().delete(SESSION_COOKIE);
}

/** The signed-in admin's id and email, or null. Doesn't hit the database. */
export async function readSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
