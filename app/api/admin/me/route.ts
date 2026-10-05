import { NextResponse } from "next/server";
import { HttpError, requireAdmin, route } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Lets the client know whether the visitor is signed in as an admin. */
export const GET = route(async () => {
  try {
    const admin = await requireAdmin();
    return NextResponse.json({ isAdmin: true, email: admin.email });
  } catch (err) {
    if (err instanceof HttpError && err.status === 401) {
      return NextResponse.json({ isAdmin: false, email: null });
    }
    throw err;
  }
});
