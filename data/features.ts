/**
 * Everything a site can include, grouped by how it's priced. Only claims
 * made elsewhere on the site (pricing page, price guide, live projects)
 * belong here; "seenIn" links each feature to builds that already have it.
 */
export type Tier = "included" | "shop" | "extra" | "care";

export const TIERS: Record<Tier, { label: string; note: string }> = {
  included: { label: "Included", note: "In every website, at the one-off price." },
  shop: { label: "With a shop", note: "In the website with online shop." },
  extra: { label: "On request", note: "Built before; quoted with your project." },
  care: { label: "Care plans", note: "Optional monthly plans after launch." }
};

export type Feature = {
  id: string;
  name: string;
  body: string;
  tier: Tier;
  /** Sector slugs (data/sectors.ts) this matters most for; empty = everyone. */
  sectors: string[];
  /** Live projects that already have it. */
  seenIn: string[];
};

const FOOD = ["restaurants", "cafes-and-bars", "takeaway", "bakeries-and-sweets"];

export const FEATURES: Feature[] = [
  {
    id: "mockup",
    name: "Free mock-up first",
    body: "A design of your homepage within 2 to 3 days. If you don't like it, we stop there and you owe nothing.",
    tier: "included",
    sectors: [],
    seenIn: []
  },
  {
    id: "design",
    name: "Design made around your business",
    body: "Layout, colours and type built around your place and your customers, not a theme picked from a list.",
    tier: "included",
    sectors: [],
    seenIn: ["atlantic-lounge", "vespre", "iron-rose-tattoo"]
  },
  {
    id: "admin",
    name: "Your own admin panel",
    body: "Log in on your phone or laptop and change text, prices and photos yourself. No coding, no waiting.",
    tier: "included",
    sectors: [],
    seenIn: ["paulaner-route-66", "karmel", "lijo-papad"]
  },
  {
    id: "menu",
    name: "Menu or price list",
    body: "Your dishes, drinks or services with prices, laid out to read on a phone without zooming.",
    tier: "included",
    sectors: [...FOOD, "beauty", "local-services"],
    seenIn: ["tajmahal", "bar-05", "kosem-food-house", "lale-tatlicisi"]
  },
  {
    id: "photos",
    name: "Photo gallery",
    body: "Your food, your room, your work. Big, fast-loading photos that you can swap from the admin panel.",
    tier: "included",
    sectors: [],
    seenIn: ["kosem-food-house", "iron-rose-tattoo"]
  },
  {
    id: "hours",
    name: "Opening hours, address and map",
    body: "Everything people need to find you, one tap from the front page, with directions straight into their maps app.",
    tier: "included",
    sectors: [],
    seenIn: ["lale-tatlicisi", "horseed-afro-shop", "yetenbi"]
  },
  {
    id: "links",
    name: "Booking and delivery links",
    body: "Buttons for the booking and delivery services you already use, placed where people look for them.",
    tier: "included",
    sectors: [...FOOD, "beauty"],
    seenIn: []
  },
  {
    id: "social",
    name: "Instagram and WhatsApp buttons",
    body: "One tap to message you or see your latest posts.",
    tier: "included",
    sectors: [],
    seenIn: []
  },
  {
    id: "phones",
    name: "Built for phones, fast loading",
    body: "Designed for the phone first, then scaled up. Pages stay fast on a slow mobile connection.",
    tier: "included",
    sectors: [],
    seenIn: []
  },
  {
    id: "google",
    name: "Google basics",
    body: "Page titles and descriptions, your map and a link to your Google Business Profile, set up from the start.",
    tier: "included",
    sectors: [],
    seenIn: []
  },
  {
    id: "domain",
    name: "Your domain, in your name",
    body: "The domain is registered to you from day one. After the final payment you get every login and file.",
    tier: "included",
    sectors: [],
    seenIn: []
  },
  {
    id: "fixes",
    name: "30 days of free fixes",
    body: "Anything that doesn't work as agreed is fixed free for 30 days after launch.",
    tier: "included",
    sectors: [],
    seenIn: []
  },
  {
    id: "shop",
    name: "Online shop with payments",
    body: "Product pages, a basket and checkout with payments that work in your country.",
    tier: "shop",
    sectors: ["shops", "bakeries-and-sweets"],
    seenIn: ["horseed-afro-shop", "ajwantel", "lijo-papad"]
  },
  {
    id: "orders",
    name: "Delivery and pickup orders",
    body: "Customers order online and choose delivery or pickup. You see every order in the admin panel.",
    tier: "shop",
    sectors: ["shops", "takeaway"],
    seenIn: ["dalab-fresh", "horseed-afro-shop", "al-madina"]
  },
  {
    id: "catalogue",
    name: "Product catalogue you manage",
    body: "Add products, change prices and mark things sold out yourself.",
    tier: "shop",
    sectors: ["shops"],
    seenIn: ["al-madina", "cask-and-ember", "lijo-papad"]
  },
  {
    id: "languages",
    name: "Several languages",
    body: "Visitors switch between languages on one site: German and English, or three at once with Somali, Amharic or Turkish.",
    tier: "extra",
    sectors: [],
    seenIn: ["tajmahal", "yetenbi", "dalab-fresh", "lale-tatlicisi"]
  },
  {
    id: "booking",
    name: "Appointment booking and customer list",
    body: "People pick a service and a free slot online. You get the booking, their details and a customer history.",
    tier: "extra",
    sectors: ["beauty"],
    seenIn: ["rebo-salon", "dhurdur", "iron-rose-tattoo"]
  },
  {
    id: "portal",
    name: "Owner portal",
    body: "A private area for you and your staff to manage events, specials and content in one place.",
    tier: "extra",
    sectors: ["cafes-and-bars", "restaurants"],
    seenIn: ["paulaner-route-66", "bar-05"]
  },
  {
    id: "brands",
    name: "Two brands, one site",
    body: "Run more than one concept from the same kitchen or shop, each with its own look and menu.",
    tier: "extra",
    sectors: ["restaurants", "takeaway"],
    seenIn: ["hungry-chicken"]
  },
  {
    id: "requests",
    name: "Quote and emergency requests",
    body: "A request form and a call button on every page, with your service area and emergency line always in reach.",
    tier: "extra",
    sectors: ["local-services"],
    seenIn: ["hauswacht", "ajwantel"]
  },
  {
    id: "reservations",
    name: "Table reservations and guest accounts",
    body: "Guests reserve a table online and can see or cancel it later. You manage every reservation from your dashboard.",
    tier: "extra",
    sectors: ["restaurants", "cafes-and-bars"],
    seenIn: ["karmel", "yetenbi", "paulaner-route-66", "bar-05"]
  },
  {
    id: "waitlist",
    name: "Waitlist and SMS alerts",
    body: "A live wait-time banner for walk-ins, and a waitlist that texts or emails people when a slot opens.",
    tier: "extra",
    sectors: ["beauty"],
    seenIn: ["rebo-salon", "dhurdur"]
  },
  {
    id: "open-now",
    name: "Open-now badge",
    body: "The header shows whether you're open right now, worked out from your opening hours.",
    tier: "extra",
    sectors: ["shops", "bakeries-and-sweets", "takeaway"],
    seenIn: ["horseed-afro-shop", "lale-tatlicisi"]
  },
  {
    id: "offers",
    name: "Weekly offers and shopping lists",
    body: "Weekly offers by aisle, and a basket that takes a whole pasted shopping list at once.",
    tier: "extra",
    sectors: ["shops"],
    seenIn: ["dalab-fresh"]
  },
  {
    id: "age-check",
    name: "Age check at the door",
    body: "Visitors confirm their age before they see alcohol, tobacco or vapes.",
    tier: "extra",
    sectors: ["shops"],
    seenIn: ["cask-and-ember"]
  },
  {
    id: "wholesale",
    name: "Wholesale and trade enquiries",
    body: "A separate form for shops, caterers and bulk buyers, so trade orders don't get lost in the inbox.",
    tier: "extra",
    sectors: ["shops", "bakeries-and-sweets"],
    seenIn: ["lijo-papad"]
  },
  {
    id: "buyback",
    name: "Repair quotes and buy-back",
    body: "Customers get a repair quote or sell you their old device online, for every branch you run.",
    tier: "extra",
    sectors: ["local-services"],
    seenIn: ["ajwantel"]
  },
  {
    id: "motion",
    name: "Signature motion",
    body: "A cinematic entrance or scroll scene that makes the site memorable, used where it fits the brand.",
    tier: "extra",
    sectors: ["cafes-and-bars", "beauty", "shops"],
    seenIn: ["atlantic-lounge", "bar-05", "iron-rose-tattoo"]
  },
  {
    id: "hosting",
    name: "Hosting, SSL and daily backups",
    body: "Your site kept online, secure and backed up every day, with security updates and uptime monitoring.",
    tier: "care",
    sectors: [],
    seenIn: []
  },
  {
    id: "changes",
    name: "Changes done for you",
    body: "Send a message and the change is made: new dishes, seasonal menus, event updates.",
    tier: "care",
    sectors: [],
    seenIn: []
  },
  {
    id: "gbp",
    name: "Google Business Profile kept up to date",
    body: "Hours, photos and posts on your Google listing kept in line with your site.",
    tier: "care",
    sectors: [],
    seenIn: []
  },
  {
    id: "report",
    name: "Monthly visitor and search report",
    body: "How many people found you, how they searched and what they clicked, in plain words once a month.",
    tier: "care",
    sectors: [],
    seenIn: []
  }
];

/** Features worth showing for a sector: its own first, then the ones for everyone. */
export function featuresForSector(slug: string): Feature[] {
  const own = FEATURES.filter((f) => f.sectors.includes(slug));
  const all = FEATURES.filter((f) => f.sectors.length === 0 && f.tier !== "care");
  return [...own, ...all];
}
