/**
 * ─────────────────────────────────────────────────────────────
 *  SITE DETAILS
 *  One place for the business details used across the site:
 *  metadata, sitemap, footer, /impressum and /privacy.
 *
 *  rira.build is run by a company registered in India. The legal
 *  notice and privacy notice need its registered details: fill
 *  these in before relying on those pages. Empty fields render as
 *  "[missing]" so they're impossible to overlook.
 * ─────────────────────────────────────────────────────────────
 */
export const site = {
  name: "rira.build",
  /** Production URL, no trailing slash. Used for sitemap + social cards. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rickbuild.vercel.app",
  description:
    "A working showcase of real client websites: live, clickable demos, and a straight path to requesting your own.",
  owner: {
    /** Registered company name, e.g. "Example Technologies Private Limited". */
    companyName: "",
    /** Legal form as registered with the Ministry of Corporate Affairs. */
    legalForm: "Private limited company, registered in India",
    /** Corporate Identification Number (21 characters). */
    cin: "",
    /** GST registration number, if registered for GST. Leave empty otherwise. */
    gstin: "",
    /** Director who represents the company (and is responsible for content). */
    director: "",
    street: "",
    /** City, state and PIN code, e.g. "Kolkata, West Bengal 700001". */
    postalCity: "",
    country: "India",
    email: "",
    phone: ""
  }
};

export function field(value: string) {
  return value || "[missing]";
}
