# Rick.build — showcase site + Android app

A portfolio/agency site that showcases real client builds as **live, clickable
demos** and collects project requests, plus a native Android app (`android/`)
that shows the same projects and sends requests to the same backend.

Stack: Next.js 14 · Neon Postgres (Frankfurt) · Prisma 6 · Vercel · Gmail (nodemailer).

## Run it locally

```bash
npm install
vercel link                  # once, pick the studio-site project
vercel env pull .env.local   # DATABASE_URL, SESSION_SECRET, …
npm run dev
```

Open http://localhost:3000. Without `DATABASE_URL` the site still runs and
shows the starter projects from `data/projects.ts`; the admin area and the
request form need the database.

## Database

| Command | What it does |
|---|---|
| `npm run db:push` | Creates/updates the tables from `prisma/schema.prisma` |
| `npm run db:seed` | Copies `data/projects.ts` (with the screenshots in `public/screens/`) into an empty database |
| `npm run admin:create -- you@example.com` | Creates an admin (or resets their password) and prints a generated password |
| `npm run db:studio` | Browse the data in Prisma Studio |

The Neon database is connected to the Vercel project through the Vercel ↔
Neon integration, which sets `DATABASE_URL` (pooled) and
`DATABASE_URL_UNPOOLED` (direct, used by `db:push`) automatically.

Tables: `Project`, `Image` (screenshots, served from `/api/images/:id`),
`Lead`, `RateLimit` (hashed IPs, swept automatically) and `Admin`.

## Managing projects

Projects are managed at **/admin/projects** (sign in at `/login`): add, edit,
reorder, hide (draft) and delete them, and upload a screenshot for each.
Changes show up on the public site — and in the app — immediately, no redeploy.

- Leave **Live URL** empty until a site is hosted: the card shows "In build".
- With a Live URL, the detail page embeds the live site in a browser frame.
  Many sites (correctly) forbid being framed via `X-Frame-Options` /
  `frame-ancestors`; untick **Embed live demo** for those and the page shows
  the screenshot with an "Open live site" button instead. Check a site with
  `curl -sI https://… | grep -i -E "x-frame|content-security"`.
- In the Android app every live demo works, framed or not — it opens the site
  in a full-screen WebView.

## API

| Route | Who | What |
|---|---|---|
| `GET /api/projects` | public | Published projects + request-form options (used by the app) |
| `POST /api/leads` | public | Request form (site + app). Validates, honeypot, 5/hour per IP, emails you |
| `GET /api/images/:id` | public | Project screenshots (cached forever) |
| `POST /api/auth/login` · `/logout` | public | Admin sign-in (10 tries / 15 min per IP) |
| `GET /api/admin/me` | session | Whether the visitor is signed in as admin |
| `GET /api/admin/leads`, `PATCH/DELETE /api/admin/leads/:id` | admin | Inbox |
| `GET/POST /api/admin/projects`, `GET/PUT/DELETE /api/admin/projects/:id` | admin | Projects |
| `POST /api/admin/projects/reorder` · `/import` · `/api/admin/upload` | admin | Order, starter import, screenshots (≤ 4 MB) |

Admin sessions are a signed JWT in an httpOnly, SameSite=Lax cookie
(`SESSION_SECRET`). Every admin route re-checks that the account still exists,
so deleting an `Admin` row revokes access immediately.

## Environment variables

See `.env.local.example`. On Vercel: `DATABASE_URL` and
`DATABASE_URL_UNPOOLED` (from the Neon integration), `SESSION_SECRET`,
`NEXT_PUBLIC_SITE_URL`, and for email `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `GMAIL_FROM_NAME`,
`LEAD_NOTIFY_EMAIL`. Each new request emails you an alert (reply goes straight to the sender) and sends the sender a confirmation; both templates live in `lib/server/notify.ts`, styled by `lib/server/email.ts`.

## Deploying

`vercel --prod`. The production deployment is aliased to
**https://rickbuild.vercel.app** — the team URL
(`studio-site-…-projects.vercel.app`) sits behind Vercel's login, so share the
alias, and keep `NEXT_PUBLIC_SITE_URL` and the app's `siteUrl` pointing at it.

## Android app (`android/`)

Kotlin + Jetpack Compose, same toolchain as the Paulaner app (AGP 9.4.1,
Kotlin 2.4.20). Screens: the work list with category filters, project
details, full-screen live demos, and the request form (requests are tagged
"via app" in the inbox).

```bash
cd android
./gradlew assembleDebug                                    # app/build/outputs/apk/debug/
./gradlew installDebug -PsiteUrl=http://10.0.2.2:3000      # against `npm run dev` on the emulator
./gradlew assembleRelease -PversionCode=2 -PversionName=1.0.1
```

The release key lives **outside the repo** in `~/.android-rick-build/`
(`release.jks` + `keystore.properties`). Back that folder up somewhere safe:
every future update must be signed with the same key, or Android (and Google
Play) will refuse to install it over the old version.

## Tests

| Command | What |
|---|---|
| `npm test` | Website unit tests (Vitest): validation, passwords, email templates |
| `npm run test:e2e` | Website end-to-end suite (Playwright) against an isolated test database; see `e2e/README.md` |
| `cd android && ./gradlew testDebugUnitTest` | App unit tests: API client, models, navigation and sending logic |
| `cd android && ./gradlew connectedDebugAndroidTest` | App UI tests on a running emulator, against an on-device fake of the website |

## The Android app: download link and releases

Works like the Paulaner app. The link to share is **https://rickbuild.vercel.app/download**,
which always serves the newest published version.

```bash
npm run app:release -- --notes "New: home tab, phone screenshots"   # build, verify, publish
npm run app:release -- --notes "..." --mandatory                    # installed apps must update
npm run app:release -- --dry-run                                    # build and check only
```

The script picks the next build number, builds the signed APK with the key in
`~/.android-rick-build`, and stores it in Postgres with its SHA-256. Installed
apps check `/api/app/version` whenever they open, download the new version,
verify the checksum and install it (on Redmi/Xiaomi phones through Android's
standard install screen if MIUI blocks the silent route). Admin > App lists the
versions: hide one, mark it mandatory, or copy the download link.

Links to `rickbuild.vercel.app/work/...` open in the app when it's installed
(Android App Links, verified via `/.well-known/assetlinks.json`, which carries
the release key's fingerprint).

## Before this goes live for real clients

- Fill in your details in `data/site.ts` — full name, street address, email
  (and VAT ID if you have one). `/impressum` and `/privacy` read from it, and
  any empty field shows as **[missing]** until you do. An Impressum with a
  postal address is legally required for a German business site.
- Have the privacy notice checked if your setup differs (e.g. you add
  analytics, or host somewhere other than Vercel/Neon).
