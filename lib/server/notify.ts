import type { LeadInput } from "@/lib/lead-schema";
import { site } from "@/data/site";

/**
 * Emails a new-lead alert through Resend (https://resend.com).
 * Silently skipped when RESEND_API_KEY / LEAD_NOTIFY_EMAIL aren't set.
 * Never throws — a failed email must not lose the lead.
 */
export async function notifyNewLead(lead: LeadInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  // onboarding@resend.dev works without a verified domain, but can
  // only deliver to the email address you signed up to Resend with.
  const from = process.env.LEAD_FROM_EMAIL || "Rick.build <onboarding@resend.dev>";

  const lines = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    `Business: ${lead.business}`,
    `Type: ${lead.projectType}`,
    `Budget: ${lead.budget}`,
    `Timeline: ${lead.timeline}`,
    lead.projectRef ? `Referenced project: ${lead.projectRef}` : null,
    lead.source === "android" ? "Sent from: Android app" : null,
    "",
    lead.message || "(no message)",
    "",
    `Open the inbox: ${site.url}/admin`
  ].filter((l) => l !== null);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: lead.email,
        subject: `New project request — ${lead.business}`,
        text: lines.join("\n")
      })
    });
    if (!res.ok) console.error("Lead email failed:", res.status, await res.text());
  } catch (err) {
    console.error("Lead email failed:", err);
  }
}
