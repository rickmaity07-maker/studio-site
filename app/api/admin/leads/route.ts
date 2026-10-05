import { NextResponse } from "next/server";
import type { Lead, LeadSource, LeadStatus } from "@/lib/lead-schema";
import { db } from "@/lib/server/db";
import { requireAdmin, route } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  await requireAdmin();
  const rows = await db.lead.findMany({ orderBy: { createdAt: "desc" } });

  const leads: Lead[] = rows.map(({ consentAt, createdAt, status, source, ...lead }) => ({
    ...lead,
    source: source as LeadSource,
    status: status as LeadStatus,
    createdAt: createdAt.toISOString()
  }));

  return NextResponse.json({ leads });
});
