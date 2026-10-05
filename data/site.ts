/**
 * ─────────────────────────────────────────────────────────────
 *  SITE DETAILS
 *  One place for the business details used across the site:
 *  metadata, sitemap, footer, /impressum and /privacy.
 *
 *  German law (§ 5 DDG) requires a full name and a street
 *  address that can receive post in the Impressum — fill these
 *  in before the site goes live. Empty fields render as
 *  "[missing]" so they're impossible to overlook.
 * ─────────────────────────────────────────────────────────────
 */
export const site = {
  name: "Rick.build",
  /** Production URL, no trailing slash. Used for sitemap + social cards. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rickbuild.vercel.app",
  description:
    "A working showcase of real client websites: live, clickable demos, and a straight path to requesting your own.",
  owner: {
    fullName: "",
    street: "",
    postalCity: "",
    country: "Germany",
    email: "",
    phone: "",
    /** USt-IdNr. — leave empty if you don't have one (e.g. Kleinunternehmer). */
    vatId: ""
  }
};

export function field(value: string) {
  return value || "[missing]";
}
