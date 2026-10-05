import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/data/site";

/*
  Outgoing email through a Gmail account with 2-Step Verification and an
  App Password (myaccount.google.com/apppasswords). SMTP_HOST switches to any
  other mail server with the same user and password.

  Nothing is sent until GMAIL_USER and GMAIL_APP_PASSWORD are set.
*/
let transporter: Transporter | null = null;

export const mailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

export function mailer(): Transporter {
  const auth = { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD };
  transporter ??= process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_PORT === "465",
        auth
      })
    : nodemailer.createTransport({ service: "gmail", auth });
  return transporter;
}

export const fromAddress = () => `${process.env.GMAIL_FROM_NAME || site.name} <${process.env.GMAIL_USER}>`;

/** Where new-request alerts go. Defaults to the sending account itself. */
export const ownerAddress = () => process.env.LEAD_NOTIFY_EMAIL || process.env.GMAIL_USER || "";

export const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/* ---------- Layout ----------
   The site's look (ink background, mint accent, mono labels) in email-safe
   markup: tables, inline styles and bgcolor attributes so Gmail, Outlook and
   Apple Mail all render it the same. */

const C = {
  ink: "#0B0D12",
  surface: "#141821",
  surface2: "#1B202B",
  line: "#262B38",
  text: "#ECEEF3",
  muted: "#8991A3",
  live: "#4CE8B0"
};
const SANS = "'Inter',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const DISPLAY = "'Space Grotesk','Inter',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'IBM Plex Mono',Menlo,Consolas,'Courier New',monospace";

export const eyebrow = (text: string, color = C.muted) =>
  `<div style="font-family:${MONO};font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:${color};">${text}</div>`;

export const heading = (text: string) =>
  `<h1 style="margin:10px 0 0;font-family:${DISPLAY};font-size:26px;line-height:1.2;font-weight:600;color:${C.text};">${text}</h1>`;

export const paragraph = (html: string, color = C.muted) =>
  `<p style="margin:14px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:${color};">${html}</p>`;

export function button(label: string, href: string, primary = true) {
  const bg = primary ? C.live : C.surface;
  const fg = primary ? C.ink : C.text;
  const border = primary ? C.live : C.line;
  return `<a href="${href}" style="display:inline-block;margin:6px 8px 0 0;padding:12px 22px;border-radius:999px;background:${bg};border:1px solid ${border};font-family:${MONO};font-size:12px;letter-spacing:1.2px;text-transform:uppercase;text-decoration:none;color:${fg};">${label}</a>`;
}

/** Label / value rows, like the inbox's detail grid. Values must already be escaped. */
export function details(rows: [string, string][]) {
  const body = rows
    .map(
      ([label, value], i) => `<tr>
        <td style="padding:11px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.muted};white-space:nowrap;vertical-align:top;width:1%;">${label}</td>
        <td style="padding:11px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-family:${SANS};font-size:14px;line-height:1.5;color:${C.text};">${value}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.surface2}" style="margin-top:22px;border:1px solid ${C.line};border-radius:12px;background:${C.surface2};border-collapse:separate;">${body}</table>`;
}

/** A quoted block for free text (the visitor's message). Value must already be escaped. */
export const quote = (html: string) =>
  `<div style="margin-top:16px;padding:16px 18px;border-left:2px solid ${C.live};background:${C.surface2};border-radius:0 12px 12px 0;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.text};white-space:pre-line;">${html}</div>`;

/** Numbered steps, styled like the request page's "01 / 02 / 03" list. */
export const steps = (items: string[]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:18px;">${items
    .map(
      (item, i) => `<tr>
        <td style="padding:6px 14px 6px 0;font-family:${MONO};font-size:13px;color:${C.live};vertical-align:top;">${String(i + 1).padStart(2, "0")}</td>
        <td style="padding:6px 0;font-family:${SANS};font-size:14px;line-height:1.55;color:${C.muted};">${item}</td>
      </tr>`
    )
    .join("")}</table>`;

export const link = (label: string, href: string) =>
  `<a href="${href}" style="color:${C.text};text-decoration:underline;">${label}</a>`;

/** The full email: brand header, one card of content, quiet footer. */
export function layout({ preview, body, footer }: { preview: string; body: string; footer: string }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${site.name}</title>
</head>
<body style="margin:0;padding:0;background:${C.ink};" bgcolor="${C.ink}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.ink};">${preview}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.ink}" style="background:${C.ink};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <tr><td style="padding:0 4px 20px;">
        <a href="${site.url}" style="text-decoration:none;font-family:${DISPLAY};font-size:18px;font-weight:600;color:${C.text};"><span style="color:${C.live};">&#9670;</span>&nbsp;Rick<span style="color:${C.muted};">.build</span></a>
      </td></tr>
      <tr><td bgcolor="${C.surface}" style="background:${C.surface};border:1px solid ${C.line};border-radius:16px;padding:32px 28px;">
        ${body}
      </td></tr>
      <tr><td style="padding:20px 4px 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.muted};">
        ${footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
