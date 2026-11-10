/**
 * The kinds of business the studio builds for. Each one gets a landing page
 * at /for/[slug] with its matching projects and features, so outreach can
 * link straight to the page that fits.
 */
import type { PriceKey } from "@/lib/pricing";

export type Sector = {
  slug: string;
  /** Which price group in data/pricing.json this kind of business pays. */
  price: PriceKey;
  name: string;
  /** Short label for chips and menus. */
  short: string;
  /** Two-line page heading. */
  lines: [string, string];
  intro: string;
  /** What a site has to get right for this kind of business. */
  needs: string[];
  /** Portfolio projects that fit (by slug), best first. */
  projects: string[];
};

export const SECTORS: Sector[] = [
  {
    slug: "restaurants",
    price: "food",
    name: "Restaurants",
    short: "Restaurants",
    lines: ["Websites for", "restaurants."],
    intro:
      "Most people decide where to eat on their phone, in under a minute. Your site should answer the three questions they have: what's on the menu, when are you open, and how do I get a table.",
    needs: [
      "The menu with prices, readable on a phone without zooming",
      "Opening hours, address and a map one tap away",
      "Table booking and delivery links where people expect them",
      "Photos that show the food and the room as they are",
      "A menu you can change yourself when prices or dishes change"
    ],
    projects: ["tajmahal", "karmel", "yetenbi", "hungry-chicken", "kosem-food-house"]
  },
  {
    slug: "cafes-and-bars",
    price: "bar",
    name: "Cafés, bars and lounges",
    short: "Cafés & bars",
    lines: ["Websites for", "cafés and bars."],
    intro:
      "A bar or café sells a mood as much as a drink. The site should feel like walking in, then make it easy to see the drinks, the events and when you're open.",
    needs: [
      "A look that matches the room, not a stock template",
      "Drinks and food menus you can update for each season",
      "Events, live music and happy hours on the front page",
      "Reservations for groups and private bookings",
      "Instagram and WhatsApp a tap away"
    ],
    projects: ["bar-05", "paulaner-route-66", "atlantic-lounge", "mainbar", "yetenbi"]
  },
  {
    slug: "takeaway",
    price: "food",
    name: "Takeaway and fast food",
    short: "Takeaway",
    lines: ["Websites for", "takeaway and fast food."],
    intro:
      "Hungry people don't browse. A takeaway site has to load fast, show the menu straight away and get people to their order in as few taps as possible.",
    needs: [
      "The full menu on the first screen, with prices",
      "Order buttons for your delivery apps, or your own online orders",
      "Phone number and opening hours always visible",
      "Fast on a slow mobile connection",
      "Specials and deals you can swap yourself"
    ],
    projects: ["kosem-food-house", "hungry-chicken"]
  },
  {
    slug: "bakeries-and-sweets",
    price: "food",
    name: "Bakeries and sweet shops",
    short: "Bakeries & sweets",
    lines: ["Websites for bakeries", "and sweet shops."],
    intro:
      "Bakeries and sweet shops live on photos and on regulars. The site should make people hungry, tell your story and make ordering for an event simple.",
    needs: [
      "Big, honest photos of what's on the counter",
      "Your story: the family, the recipe, the years",
      "Orders for cakes, trays and events",
      "Opening hours and seasonal specials",
      "An online shop for the things you can send"
    ],
    projects: ["lale-tatlicisi", "lijo-papad"]
  },
  {
    slug: "shops",
    price: "shop",
    name: "Shops and grocers",
    short: "Shops",
    lines: ["Websites and online", "shops for local stores."],
    intro:
      "From a corner grocer to a watch brand: show what you sell, let people order for pickup or delivery, and keep the product list up to date without calling a developer.",
    needs: [
      "Product lists with prices you manage yourself",
      "Online orders with delivery or pickup",
      "Payments that work in your country",
      "Opening hours and directions for walk-ins",
      "Product pages that show up on Google"
    ],
    projects: ["dalab-fresh", "horseed-afro-shop", "al-madina", "cask-and-ember", "kern-watches", "vespre", "lijo-papad"]
  },
  {
    slug: "beauty",
    price: "beauty",
    name: "Barbers, salons and studios",
    short: "Beauty & barbers",
    lines: ["Websites for barbers,", "salons and studios."],
    intro:
      "Appointment businesses fill their week from their phone. The site should show your work, your prices and your free slots, and let people book without calling.",
    needs: [
      "Online booking with your real opening times",
      "A price list for every service",
      "A gallery of your work",
      "Reminders and a customer list, if you want them",
      "Reviews and Instagram front and centre"
    ],
    projects: ["rebo-salon", "dhurdur", "iron-rose-tattoo", "aura-nail-studio"]
  },
  {
    slug: "local-services",
    price: "food",
    name: "Local services and repairs",
    short: "Local services",
    lines: ["Websites for local", "services and repairs."],
    intro:
      "When something breaks, people search, call the first trustworthy result and move on. Your site needs to look trustworthy at a glance and get them to call or send a request.",
    needs: [
      "Services and prices explained in plain words",
      "A call button and request form on every page",
      "The area you cover, on a map",
      "Emergency or same-day options, clearly marked",
      "Pages for each service so Google can find them"
    ],
    projects: ["hauswacht", "ajwantel"]
  }
];

export function getSector(slug: string | undefined): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}
