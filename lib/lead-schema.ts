/**
 * Lead shape + validation, shared by the request form (client) and
 * POST /api/leads (server) so both agree on what's allowed.
 */

export const PROJECT_TYPES = [
  "New website",
  "Redesign of an existing site",
  "Booking / appointment system",
  "Online store",
  "Something else"
];

export const BUDGETS = ["Under €1,000", "€1,000 - €3,000", "€3,000 - €7,000", "Not sure yet"];

export const TIMELINES = ["Whenever it's ready", "Within a month", "Within 2 weeks", "It's urgent"];

export const LEAD_STATUSES = ["new", "contacted", "won", "archived"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ["web", "android"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  business: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  projectRef: string;
  /** Where the request came from: the website or the Android app. */
  source: LeadSource;
  consent: boolean;
};

/** A lead as the admin API returns it (timestamps as ISO strings). */
export type Lead = LeadInput & {
  id: string;
  status: LeadStatus;
  notes: string;
  createdAt: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function validateLead(
  raw: Record<string, unknown>
): { ok: true; value: LeadInput } | { ok: false; error: string } {
  const value: LeadInput = {
    name: str(raw.name, 120),
    email: str(raw.email, 200),
    phone: str(raw.phone, 40),
    business: str(raw.business, 160),
    projectType: str(raw.projectType, 80),
    budget: str(raw.budget, 80),
    timeline: str(raw.timeline, 80),
    message: str(raw.message, 4000),
    projectRef: str(raw.projectRef, 120),
    source: LEAD_SOURCES.includes(raw.source as LeadSource) ? (raw.source as LeadSource) : "web",
    consent: raw.consent === true
  };

  if (!value.consent) return { ok: false, error: "Consent is required." };
  if (!value.name) return { ok: false, error: "Please add your name." };
  if (!EMAIL_RE.test(value.email)) return { ok: false, error: "That email address doesn't look right." };
  if (!value.business) return { ok: false, error: "Please add your business name." };
  if (!PROJECT_TYPES.includes(value.projectType)) return { ok: false, error: "Choose a project type." };
  if (!BUDGETS.includes(value.budget)) return { ok: false, error: "Choose a budget." };
  if (!TIMELINES.includes(value.timeline)) return { ok: false, error: "Choose a timeline." };

  return { ok: true, value };
}
