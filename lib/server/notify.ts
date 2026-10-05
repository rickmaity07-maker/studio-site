import type { LeadInput } from "@/lib/lead-schema";
import { site } from "@/data/site";
import {
  button,
  details,
  escape,
  eyebrow,
  fromAddress,
  heading,
  layout,
  link,
  mailConfigured,
  mailer,
  ownerAddress,
  paragraph,
  quote,
  steps
} from "./email";

/**
 * Two emails per new project request, sent through Gmail (see ./email.ts):
 *   - an alert to you, with every detail and one-click reply, and
 *   - a confirmation to the person who sent it.
 * Skipped when Gmail isn't configured. Never throws — a failed email
 * must not lose the lead, which is already saved in the database.
 */
export async function notifyNewLead(lead: LeadInput) {
  if (!mailConfigured()) return;

  const results = await Promise.allSettled([
    mailer().sendMail(ownerAlert(lead)),
    mailer().sendMail(confirmation(lead))
  ]);
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(i ? "Confirmation email failed:" : "Lead alert failed:", r.reason);
  });
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
const viaLabel = (lead: LeadInput) => (lead.source === "android" ? "via the Android app" : "via the website");

export function ownerAlert(lead: LeadInput) {
  const e = {
    name: escape(lead.name),
    first: escape(firstName(lead.name)),
    email: escape(lead.email),
    phone: escape(lead.phone),
    business: escape(lead.business),
    message: escape(lead.message)
  };
  const replyHref = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(
    `Re: your project request (${lead.business})`
  )}`;

  const rows: [string, string][] = [
    ["Email", link(e.email, `mailto:${encodeURIComponent(lead.email)}`)],
    ["Phone", lead.phone ? link(e.phone, `tel:${lead.phone.replace(/[^\d+]/g, "")}`) : "Not given"],
    ["Project", escape(lead.projectType)],
    ["Budget", escape(lead.budget)],
    ["Timeline", escape(lead.timeline)]
  ];
  if (lead.projectRef) rows.push(["Referenced", escape(lead.projectRef)]);

  const html = layout({
    preview: `${lead.name} · ${lead.projectType} · ${lead.budget}`,
    body: `
      ${eyebrow(`New project request · ${viaLabel(lead)}`, "#4CE8B0")}
      ${heading(`${e.name} <span style="color:#8991A3;font-weight:500;">· ${e.business}</span>`)}
      ${details(rows)}
      ${lead.message ? quote(e.message) : paragraph("No message, just the details above.")}
      <div style="margin-top:24px;">
        ${button(`Reply to ${e.first}`, replyHref)}
        ${button("Open inbox", `${site.url}/admin`, false)}
      </div>`,
    footer: `Saved to your inbox at ${link(`${site.url.replace(/^https?:\/\//, "")}/admin`, `${site.url}/admin`)}. Replying to this email goes straight to ${e.first}.`
  });

  const text = [
    `New project request ${viaLabel(lead)}`,
    "",
    `${lead.name} · ${lead.business}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "not given"}`,
    `Project: ${lead.projectType}`,
    `Budget: ${lead.budget}`,
    `Timeline: ${lead.timeline}`,
    lead.projectRef ? `Referenced: ${lead.projectRef}` : null,
    "",
    lead.message || "(no message)",
    "",
    `Inbox: ${site.url}/admin`
  ]
    .filter((l) => l !== null)
    .join("\n");

  return {
    from: fromAddress(),
    to: ownerAddress(),
    replyTo: `${lead.name} <${lead.email}>`,
    subject: `New request: ${lead.business} (${lead.projectType})`,
    html,
    text
  };
}

export function confirmation(lead: LeadInput) {
  const first = escape(firstName(lead.name));
  const rows: [string, string][] = [
    ["Business", escape(lead.business)],
    ["Project", escape(lead.projectType)],
    ["Budget", escape(lead.budget)],
    ["Timeline", escape(lead.timeline)]
  ];
  if (lead.projectRef) rows.push(["Style of", escape(lead.projectRef)]);

  // Same three promises as the request page.
  const next = [
    "I'll follow up with questions or a short call.",
    `You'll see a working demo, like the ones in ${link("the work section", `${site.url}/work`)}, before anything is final.`,
    "Nothing goes live for your customers until you approve it."
  ];

  const html = layout({
    preview: "Thanks! I read every request myself and reply within one business day.",
    body: `
      ${eyebrow("Request received", "#4CE8B0")}
      ${heading(`Got it, thank you, ${first}.`)}
      ${paragraph("I read every request myself and reply within one business day, usually sooner. Here's what you sent:")}
      ${details(rows)}
      ${lead.message ? quote(escape(lead.message)) : ""}
      <div style="margin-top:26px;">${eyebrow("What happens next")}</div>
      ${steps(next)}
      <div style="margin-top:24px;">${button("See the work", `${site.url}/work`)}</div>`,
    footer: `You're getting this because you sent a project request on ${link(site.name, site.url)}. Just reply to this email if anything changes. ${link("Privacy notice", `${site.url}/privacy`)}`
  });

  const text = [
    `Got it, thank you, ${firstName(lead.name)}.`,
    "",
    "I read every request myself and reply within one business day, usually sooner.",
    "",
    `Business: ${lead.business}`,
    `Project: ${lead.projectType}`,
    `Budget: ${lead.budget}`,
    `Timeline: ${lead.timeline}`,
    lead.projectRef ? `Style of: ${lead.projectRef}` : null,
    lead.message ? `\n${lead.message}` : null,
    "",
    "What happens next:",
    "01  I'll follow up with questions or a short call.",
    "02  You'll see a working demo before anything is final.",
    "03  Nothing goes live for your customers until you approve it.",
    "",
    `${site.name}: ${site.url}`
  ]
    .filter((l) => l !== null)
    .join("\n");

  return {
    from: fromAddress(),
    to: `${lead.name} <${lead.email}>`,
    replyTo: ownerAddress(),
    subject: "Got your request | Rick.build",
    html,
    text
  };
}
