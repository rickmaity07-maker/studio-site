export type ProjectCategory =
  | "Hospitality"
  | "Beauty & Booking"
  | "E-commerce"
  | "Product";

export type Project = {
  /** URL-safe id, used for /work/[slug] */
  slug: string;
  name: string;
  tagline: string;
  category: ProjectCategory;
  year: string;
  stack: string[];
  /** 2-4 sentence case study copy */
  description: string;
  /**
   * The hosted URL of the actual client site.
   * Leave empty until the project is live — the card and detail
   * page automatically fall back to a "demo coming soon" state.
   * As soon as you add a URL here, the project page switches into
   * Demo Mode: a real browser-chrome frame embedding the live site.
   */
  liveUrl?: string;
  /** Project's own brand color, used as a subtle accent on its card */
  accent: string;
  featured?: boolean;
};

/**
 * ─────────────────────────────────────────────────────────────
 *  ADD A NEW PROJECT
 *  Copy the object shape below and push it into this array.
 *  That's the only step — the grid, the filters, and the demo
 *  page all read from here automatically.
 *
 *  {
 *    slug: "project-slug",
 *    name: "Project Name",
 *    tagline: "One line describing who it's for",
 *    category: "Hospitality",
 *    year: "2026",
 *    stack: ["Next.js", "Firebase"],
 *    description: "Short case study paragraph.",
 *    liveUrl: "https://client-site.vercel.app", // omit until it's live
 *    accent: "#D4AF37",
 *  }
 * ─────────────────────────────────────────────────────────────
 */
export const projects: Project[] = [
  {
    slug: "atlantic-lounge",
    name: "Atlantic Lounge",
    tagline: "Luxury lounge bar, Munich",
    category: "Hospitality",
    year: "2026",
    stack: ["Next.js", "Tailwind", "Framer Motion"],
    description:
      "A full-screen 3D entrance scroll-dollies guests into the room before the site settles into a gold-on-black lounge experience. Built to match a logo, not the other way around.",
    accent: "#D4AF37",
    featured: true
  },
  {
    slug: "mainbar",
    name: "Mainbar",
    tagline: "Café & bar, Schweinfurt",
    category: "Hospitality",
    year: "2026",
    stack: ["Next.js", "Firebase", "Framer Motion"],
    description:
      "A grey and dirty-lilac café site with a hand-tuned hero, a menu-extras system, and German legal pages baked in from day one.",
    accent: "#B9A6C9",
    featured: true
  },
  {
    slug: "rebo-salon",
    name: "Rebo Salon",
    tagline: "Salon booking, production",
    category: "Beauty & Booking",
    year: "2025",
    stack: ["Next.js", "Firebase", "Twilio", "DeepL"],
    description:
      "A production booking system: SMS confirmations, per-date slot availability, and a login flow hardened against race conditions. Runs a full Firestore security audit on every release.",
    accent: "#E8B4B8",
    featured: true
  },
  {
    slug: "avdar",
    name: "Avdar",
    tagline: "Barbershop booking",
    category: "Beauty & Booking",
    year: "2025",
    stack: ["Next.js", "Firebase", "Twilio"],
    description:
      "Rebo Salon's booking engine, re-cut for a barbershop: same hardened Firestore rules, a new visual identity built for a different chair entirely."
    ,
    accent: "#3F4A3D"
  },
  {
    slug: "vespre",
    name: "Vespre",
    tagline: "Luxury perfume, e-commerce",
    category: "E-commerce",
    year: "2026",
    stack: ["Next.js", "Tailwind"],
    description:
      "A perfume storefront built around restraint: long negative space, a slow scroll pace, and product photography given room to breathe.",
    accent: "#7A6A53"
  },
  {
    slug: "lijo-papad",
    name: "LIJO Papad",
    tagline: "Family business, full-stack",
    category: "E-commerce",
    year: "2025",
    stack: ["React", "Firebase", "Supabase", "Razorpay", "Cloudinary"],
    description:
      "A complete storefront for a family papad business: customer auth, an admin portal, wholesale inquiry forms, and live inventory pulled straight from Firestore.",
    accent: "#C6742E",
    featured: true
  },
  {
    slug: "tajmahal",
    name: "Tajmahal",
    tagline: "Restaurant, DE/EN",
    category: "Hospitality",
    year: "2025",
    stack: ["Next.js", "NextAuth", "i18n"],
    description:
      "A restaurant site that switches theme and language without reloading — built for a room that seats German and English-speaking guests in the same evening.",
    accent: "#9C3D3D"
  },
  {
    slug: "hungry-chicken",
    name: "Hungry Chicken",
    tagline: "Dual-brand restaurant",
    category: "Hospitality",
    year: "2025",
    stack: ["Next.js", "React Context"],
    description:
      "One codebase, two restaurants: a brand-toggling context switches the entire site's identity and copy, in German or English, without a redeploy.",
    accent: "#D9482B"
  },
  {
    slug: "the-nail-lab",
    name: "The Nail Lab",
    tagline: "Nail salon, concept",
    category: "Beauty & Booking",
    year: "2025",
    stack: ["Next.js", "Tailwind"],
    description:
      "A glassmorphism concept build for a nail studio, with a mock storefront so the owner could click through a real booking flow before committing to Firebase.",
    accent: "#E88FB0"
  }
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getCategories(): ProjectCategory[] {
  return Array.from(new Set(projects.map((p) => p.category)));
}
