/**
 * Questions and answers for /faq. Entries marked `pricing` also appear on
 * /pricing. Answers repeat only what the pricing page and price guide say.
 */
import { VALID_UNTIL } from "@/lib/pricing";

export const FAQ_TOPICS = ["Getting started", "Price and payment", "Your site", "After launch"] as const;
export type FaqTopic = (typeof FAQ_TOPICS)[number];

export type Faq = { q: string; a: string; topic: FaqTopic; pricing?: boolean };

export const FAQ: Faq[] = [
  {
    topic: "Getting started",
    pricing: true,
    q: "I already have Instagram. Why do I need a website?",
    a: "Google shows websites first when people search for places to eat. A site gives them your menu, hours and location in one tap, works for people without Instagram, and sends them to your Instagram too."
  },
  {
    topic: "Getting started",
    q: "How do we start?",
    a: "Send a short request with your business name and what you need. I reply within one business day, ask a few questions, and make a free mock-up of your homepage."
  },
  {
    topic: "Getting started",
    q: "How fast is it?",
    a: "The free mock-up takes 2 to 3 days. Building usually takes 1 to 2 weeks for a website and 2 to 4 weeks for a shop, depending on how quickly the content and feedback come in."
  },
  {
    topic: "Getting started",
    q: "What do I need to send you?",
    a: "Your logo (or a photo of your sign), your menu or price list, 10 to 20 photos, opening hours, address and phone number, links to Instagram, booking and delivery pages, and the domain you want. For shops: the product list, prices and how you want to be paid."
  },
  {
    topic: "Getting started",
    q: "Can I see work you've done?",
    a: "Yes. Every project in the work section is a live site you can open and click through, on your phone or right on this site."
  },
  {
    topic: "Price and payment",
    pricing: true,
    q: "Do I have to pay every month?",
    a: "No. The website is a one-off price. Care plans are optional, for people who want hosting, backups and changes handled for them."
  },
  {
    topic: "Price and payment",
    q: "How does payment work?",
    a: "Nothing for the mock-up. A 30% deposit starts the build, and the remaining 70% is due when you approve the finished site, before it goes live on your domain."
  },
  {
    topic: "Price and payment",
    q: "Why are prices different in each country?",
    a: `Prices are set for each country, based on what websites cost locally. Choose your country on the pricing page to see yours. Prices are honoured for projects agreed by ${VALID_UNTIL}.`
  },
  {
    topic: "Price and payment",
    q: "What if I change my mind halfway?",
    a: "If you cancel after paying the deposit, you keep everything built so far. There's no lock-in."
  },
  {
    topic: "Price and payment",
    q: "What costs extra?",
    a: "Your domain name, paid once a year in your name. Features outside the written agreement are quoted separately before any work on them starts."
  },
  {
    topic: "Your site",
    pricing: true,
    q: "Can I change the menu and prices myself?",
    a: "Yes. Every site comes with an admin panel. You log in on your phone or laptop and edit text, prices and photos. No coding."
  },
  {
    topic: "Your site",
    pricing: true,
    q: "Who owns the website?",
    a: "You do. The domain is registered in your name, and after the final payment you get all logins and files."
  },
  {
    topic: "Your site",
    pricing: true,
    q: "What if I don't like the design?",
    a: "The first mock-up is free and comes with no obligation. During the build you get two rounds of changes, and you see every version on a preview link."
  },
  {
    topic: "Your site",
    pricing: true,
    q: "Can the site take orders or bookings?",
    a: "Yes. It can link to your existing booking and delivery services, or include an online shop with payments."
  },
  {
    topic: "Your site",
    pricing: true,
    q: "Can the site be in more than one language?",
    a: "Yes. Sites can switch between languages, for example English and your local language."
  },
  {
    topic: "Your site",
    q: "Will it work on phones?",
    a: "It's designed for phones first. Every site is tested on real phones before you see it."
  },
  {
    topic: "After launch",
    q: "What happens after the site goes live?",
    a: "You get the admin logins, a short video on how to edit, and the files. Anything that doesn't work as agreed is fixed free for 30 days."
  },
  {
    topic: "After launch",
    q: "What's in a care plan?",
    a: "Essential covers hosting, SSL, daily backups, updates and uptime monitoring. Care adds up to an hour of changes a month done for you. Growth adds up to three hours, your Google Business Profile and a monthly visitor report."
  },
  {
    topic: "After launch",
    q: "Can I cancel a care plan?",
    a: "Yes. Care plans are optional and can be cancelled. The site stays yours either way."
  },
  {
    topic: "After launch",
    q: "Is there an app?",
    a: "There's an Android app with the same live builds and the request form, for clients who'd rather browse on their phone."
  }
];
