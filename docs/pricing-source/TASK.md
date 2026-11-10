# Task: add pricing to the Rick.build site, then finish the site

Owner: Rick (studio site, live at https://studio-site-five-rust.vercel.app). Next.js app, see README.md.

## 1. Add a Pricing section/page built from `client_pricing.html` (approved by Rick, keep the wording)
Source files in this folder:
- `client_pricing.html` - the approved client price guide. Its `const DATA = {...}` holds prices for 115 countries
  (site price, shop range, 3 care plan prices, researched local market ranges). Reuse that data (e.g. `data/pricing.json`).
- `price_comparison.md` - research and sources. `pricing.py` / `build_client_pricing.py` - how the numbers were made.
Include, matching the site's existing design system (do NOT copy the standalone page's styling):
- Country picker (default by browser locale / ?country= or #code deep link), local prices: free mock-up, website, website + shop
- Price comparison vs local freelancers/agencies (to-scale chart, only where market data exists)
- "What you get here that you often don't elsewhere" comparison table
- Monthly care plans (Essential / Care / Growth)
- How it works and when you pay (30% deposit, build on preview link, 70% on approval before go-live; shops 30/40/30)
- "A fair deal for both sides", "What I need from you", FAQ
Link it from the main navigation and the home page, with a clear call to action (request a free mock-up).

## 2. Finish the site
- Audit what is unfinished: placeholder text, broken links, empty sections, TODOs, missing pages, mobile layout, SEO meta.
- Make sure the portfolio lists these live sites:
  Bar-05 https://the-bar-project.vercel.app, Paulaner Meets Route 66 https://paulaner-teal.vercel.app,
  Karmel https://karmel.vercel.app, Taj Mahal https://taj-mahal-schweinfurt.vercel.app,
  Kosem Food House https://k-sem-d-ner.vercel.app, Hungry Chicken https://hungry-chiken.vercel.app,
  Horseed Afro Shop https://horseed-afro-shop.vercel.app, Dalab Fresh https://dalab-fresh.vercel.app,
  Cask & Ember https://tobaco-store.vercel.app, Kern Watches https://kern-watches-1u5u.vercel.app,
  Lijo Papad https://lijopapad.vercel.app, Aura Nail Studio https://nail-salon-liard.vercel.app,
  Iron Rose Tattoo https://tattoo-parlor-two.vercel.app, AjwanTel https://ajwantel-ui.vercel.app
- Run the existing tests (vitest, playwright) and the build; fix failures. Add tests for the pricing page.

## Rules
- Follow ~/.claude/CLAUDE.md (graphify first, design skills: redesign-existing-projects for changes).
- Work on a new branch `pricing-page`. Commit, but do NOT push or deploy until Rick says so.
- Do not touch ~/Desktop/Projects/leads (a scraper is running there).
