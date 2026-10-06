export const CATEGORIES = [
  "Hospitality",
  "Beauty & Booking",
  "E-commerce",
  "Product"
] as const;

export type ProjectCategory = (typeof CATEGORIES)[number];

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
  /**
   * False when the live site refuses to be framed (X-Frame-Options /
   * CSP frame-ancestors). The detail page then shows the screenshot
   * with an "open live site" link instead of an embedded demo.
   */
  embeddable?: boolean;
  /** Project's own brand color, used as a subtle accent on its card */
  accent: string;
  featured?: boolean;
  /**
   * Screenshot. Uploads from the admin portal live in Postgres and are
   * served from /api/images/:id; starter screenshots are static files.
   */
  image?: { url: string; id?: string };
  /** Phone-sized screenshot (390px viewport), shown beside the desktop one. */
  mobileImage?: { url: string; id?: string };
};

/**
 * ─────────────────────────────────────────────────────────────
 *  STARTER PROJECTS
 *  Projects are managed in the admin portal (/admin/projects)
 *  and stored in Postgres. This list is only:
 *   - what `npm run db:seed` (or "Import starter projects" in
 *     the admin portal) copies into an empty database, and
 *   - the fallback when DATABASE_URL isn't set (e.g. local dev
 *     without a database).
 * ─────────────────────────────────────────────────────────────
 */
export const projects: Project[] = [
  {
    slug: "paulaner-route-66",
    name: "Paulaner Meets Route 66",
    tagline: "Bar & owner portal, Schweinfurt",
    category: "Hospitality",
    year: "2026",
    stack: ["Next.js", "Neon Postgres", "GSAP", "Stripe", "Vercel Blob"],
    description:
      "A German/English bar site where every text, tap and drink on the menu comes from the database. The owners run bookings, opening hours, the drinks menu and staff roles from their own portal; guests get accounts to see and cancel their table reservations.",
    liveUrl: "https://paulaner-teal.vercel.app",
    embeddable: false,
    accent: "#C4253C",
    featured: true,
    image: { url: "/screens/paulaner-route-66.jpg" },
    mobileImage: { url: "/screens-mobile/paulaner-route-66.jpg" }
  },
  {
    slug: "bar-05",
    name: "Bar-05",
    tagline: "Cocktail bar am Kornmarkt, Schweinfurt",
    category: "Hospitality",
    year: "2026",
    stack: ["Next.js", "Neon Postgres", "GSAP", "Lenis"],
    description:
      "A late-night bar site that opens on a sunset sinking below the waterline, then gets down to business: the drinks card, table reservations, guest accounts and an owner portal on Postgres. Its login and booking system later became the base for Paulaner Meets Route 66.",
    liveUrl: "https://the-bar-project.vercel.app",
    embeddable: false,
    accent: "#FF6B35",
    featured: true,
    image: { url: "/screens/bar-05.jpg" },
    mobileImage: { url: "/screens-mobile/bar-05.jpg" }
  },
  {
    slug: "rebo-salon",
    name: "Rebo Salon",
    tagline: "Barbershop booking & CRM, production",
    category: "Beauty & Booking",
    year: "2025",
    stack: ["Next.js", "Firebase", "Twilio", "Nodemailer"],
    description:
      "A production booking platform that doubles as the salon's CRM: a live walk-in wait-time banner, service-to-stylist filtering, a waitlist with one-click SMS and email alerts, and a staff dashboard with per-stylist calendars, revenue KPIs and stock control.",
    liveUrl: "https://rebo-salon.vercel.app",
    embeddable: false,
    accent: "#E0B12E",
    featured: true,
    image: { url: "/screens/rebo-salon.jpg" },
    mobileImage: { url: "/screens-mobile/rebo-salon.jpg" }
  },
  {
    slug: "karmel",
    name: "Karmel Café & Restaurant",
    tagline: "Somali & African cuisine",
    category: "Hospitality",
    year: "2026",
    stack: ["Next.js", "Prisma", "PostgreSQL", "Auth.js", "Resend"],
    description:
      "A restaurant site with real accounts behind it: guests register with email and phone verification, reserve tables online, and the owners manage every reservation from an admin dashboard. Rate-limited and GDPR-ready from day one.",
    liveUrl: "https://african-restaurant-lyart.vercel.app",
    embeddable: false,
    accent: "#F5A524",
    featured: true,
    image: { url: "/screens/karmel.jpg" },
    mobileImage: { url: "/screens-mobile/karmel.jpg" }
  },
  {
    slug: "atlantic-lounge",
    name: "Atlantic Lounge",
    tagline: "Luxury lounge bar",
    category: "Hospitality",
    year: "2026",
    stack: ["Next.js", "Three.js", "React Three Fiber", "Framer Motion"],
    description:
      "A full-screen 3D entrance scroll-dollies guests into the room before the site settles into a gold-on-black lounge experience. Built to match a logo, not the other way around.",
    liveUrl: "https://atlantic-bar.vercel.app",
    embeddable: false,
    accent: "#D4AF37",
    featured: true,
    image: { url: "/screens/atlantic-lounge.jpg" },
    mobileImage: { url: "/screens-mobile/atlantic-lounge.jpg" }
  },
  {
    slug: "al-madina",
    name: "Al-Madina",
    tagline: "Turkish & Mediterranean grocery, Schweinfurt",
    category: "E-commerce",
    year: "2026",
    stack: ["Next.js", "Prisma", "Tailwind"],
    description:
      "An online storefront for a family-run market: product search and category filters, a basket drawer, customer accounts, and orders for cash-on-delivery or in-store pickup, in German and English.",
    liveUrl: "https://al-madina-delta.vercel.app",
    embeddable: false,
    accent: "#A12E3D",
    image: { url: "/screens/al-madina.jpg" },
    mobileImage: { url: "/screens-mobile/al-madina.jpg" }
  },
  {
    slug: "mainbar",
    name: "Mainbar",
    tagline: "Café & bar, Schweinfurt",
    category: "Hospitality",
    year: "2026",
    stack: ["Next.js", "Firebase", "Upstash", "Framer Motion"],
    description:
      "A grey and dirty-lilac café site with a hand-tuned hero, a menu-extras system, and German legal pages baked in from day one.",
    liveUrl: "https://mainbar-website.vercel.app",
    embeddable: true,
    accent: "#B9A6C9",
    image: { url: "/screens/mainbar.jpg" },
    mobileImage: { url: "/screens-mobile/mainbar.jpg" }
  },
  {
    slug: "dhurdur",
    name: "Dhurdur",
    tagline: "Barbershop booking, Schweinfurt",
    category: "Beauty & Booking",
    year: "2026",
    stack: ["Next.js", "Firebase", "Twilio"],
    description:
      "Rebo Salon's booking engine, re-cut for a different chair: the same hardened Firestore rules and SMS confirmations under a black-and-gold identity of its own.",
    liveUrl: "https://avdar-orpin.vercel.app",
    embeddable: false,
    accent: "#C9A45C",
    image: { url: "/screens/dhurdur.jpg" },
    mobileImage: { url: "/screens-mobile/dhurdur.jpg" }
  },
  {
    slug: "hungry-chicken",
    name: "Hungry Chicken",
    tagline: "Dual-brand restaurant",
    category: "Hospitality",
    year: "2025",
    stack: ["Next.js", "Auth.js", "Prisma", "Vercel Blob"],
    description:
      "One codebase, two restaurants: a brand-toggling context switches the entire site's identity and copy, in German or English, without a redeploy.",
    liveUrl: "https://hungry-chiken.vercel.app",
    embeddable: true,
    accent: "#D9482B",
    image: { url: "/screens/hungry-chicken.jpg" },
    mobileImage: { url: "/screens-mobile/hungry-chicken.jpg" }
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
    liveUrl: "https://lijopapad.vercel.app",
    embeddable: true,
    accent: "#C6742E",
    image: { url: "/screens/lijo-papad.jpg" },
    mobileImage: { url: "/screens-mobile/lijo-papad.jpg" }
  },
  {
    slug: "tajmahal",
    name: "Tajmahal",
    tagline: "Restaurant, DE/EN",
    category: "Hospitality",
    year: "2025",
    stack: ["Next.js", "NextAuth", "i18n"],
    description:
      "A restaurant site that switches theme and language without reloading, built for a room that seats German and English-speaking guests in the same evening.",
    liveUrl: "https://taj-mahal-schweinfurt.vercel.app",
    embeddable: true,
    accent: "#9C3D3D",
    image: { url: "/screens/tajmahal.jpg" },
    mobileImage: { url: "/screens-mobile/tajmahal.jpg" }
  },
  {
    slug: "aura-nail-studio",
    name: "Aura Nail Studio",
    tagline: "Nail salon, concept",
    category: "Beauty & Booking",
    year: "2025",
    stack: ["Next.js", "Tailwind"],
    description:
      "A glassmorphism concept build for a nail studio, with a mock storefront so the owner could click through a real booking flow before committing to a backend.",
    liveUrl: "https://nail-salon-liard.vercel.app",
    embeddable: true,
    accent: "#D6A84F",
    image: { url: "/screens/aura-nail-studio.jpg" },
    mobileImage: { url: "/screens-mobile/aura-nail-studio.jpg" }
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
  }
];
