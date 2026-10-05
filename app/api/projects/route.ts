import { NextResponse } from "next/server";
import { getProjects } from "@/lib/server/projects";
import { BUDGETS, PROJECT_TYPES, TIMELINES } from "@/lib/lead-schema";

// getProjects() is already cached (and invalidated on admin edits),
// so rendering per request keeps this in sync at no real cost.
export const dynamic = "force-dynamic";

/**
 * Public, read-only feed for the Android app: published projects in
 * display order, plus the request-form options so the app's form always
 * matches what POST /api/leads accepts.
 */
export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({
    projects,
    leadOptions: { projectTypes: PROJECT_TYPES, budgets: BUDGETS, timelines: TIMELINES }
  });
}
