# End-to-end tests

`npm run test:e2e` builds the site and walks through every feature in a
real browser (Playwright, Chromium):

| Spec | Covers |
|---|---|
| `public.spec.ts` | Home (hero deck, showreel, index, DE/EN toggle, process), nav + mobile menu, work filters, project pages (embedded / screenshot / in-build), 404, legal pages, sitemap/robots/manifest/OG image, `/api/projects`, screenshots, no em dashes, **no browser errors in either motion mode** |
| `request.spec.ts` | Request form (consent gate, native validation, `?ref=`), lead stored with every field, honeypot, server validation, Android source tag, 5-per-hour rate limit |
| `admin.spec.ts` | Every admin API route refuses anonymous callers, forged cookies, login errors + login rate limit, inbox (search, status, notes, filters, delete, CSV export), projects (validation, screenshot upload, publish/hide, edit, embed toggle, reorder, delete), upload type checks, sign out |
| `motion.spec.ts` | First-visit intro (decided before first paint, once per session), reduced motion skips it, Lenis on without blocking demo iframes, showreel pans, every reveal finishes |
| `app.spec.ts` | App banner (links, dismiss persists, "Download" on Android, hidden on iPhone, absent on /app and /admin), `/app` page, APK headers and checksum, download |

## How it stays safe

- It runs against its own database, `studio_site_test`, in the same Neon
  project (`.env.test.local`: `TEST_DATABASE_URL`, `TEST_DATABASE_URL_UNPOOLED`).
  `global-setup.ts` refuses to start if those point at the live database.
- `prepare-db.ts` resets that test database before every run (schema, the 13
  starter projects, a throwaway admin with a random password), then the site
  is built from it into `.next-test`, so a running `next dev` is untouched.
- Email is switched off for the test server; nothing is sent.
- API tests send their own `x-forwarded-for`, so rate limits never interfere
  with each other.

Unit tests (validation, passwords, email templates) are separate:
`npm test` (Vitest, `tests/unit`). `npm run test:all` runs both.
