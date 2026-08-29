# Rick.build — showcase site

A portfolio/agency site that showcases real client builds as **live, clickable
demos**, and collects project requests into Firebase.

## Run it locally

```bash
npm install
cp .env.local.example .env.local   # fill in your Firebase web config
npm run dev
```

Open http://localhost:3000.

## Adding a new project

Everything lives in one file: `data/projects.ts`. Copy an existing entry and
push a new object into the `projects` array — the grid, the category
filters, and the individual `/work/[slug]` page all read from it
automatically.

Leave `liveUrl` out until the site is hosted. The project card and detail
page will show an "In build" / "Demo coming soon" state. As soon as you add
the hosted URL, the detail page automatically switches into **Demo Mode**: a
real browser-chrome frame embedding the live site, with a desktop/mobile
toggle and a fallback "open in a new tab" link (some sites block being
embedded in an iframe — that link is the safety net).

## Firebase setup

1. Create a Firebase project → add a **Web app** → copy the config into
   `.env.local` (see `.env.local.example`).
2. Enable **Firestore** (production mode).
3. Add this security rule — leads can only be *created* by anyone, but only
   *read/updated* by people listed in the `admins` collection:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // add admins from the console only
    }
    match /leads/{leadId} {
      allow create: if request.resource.data.consent == true;
      allow read, update: if request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow delete: if false;
    }
  }
}
```

4. Leads show up live in `/admin` (or read them directly from Firestore →
   `leads` collection in the console).

## Auth & admin access setup

This site's `/admin` dashboard is gated by sign-in. There's no open
registration for "regular users" — anyone *can* create an account at
`/signup`, but that alone does not grant access to `/admin`. Access is a
separate, manual step:

1. **Enable sign-in providers** — Firebase console → Authentication → Sign-in
   method → enable **Google**, **Email/Password**, and **Phone**.
2. **Facebook login** needs a Facebook Developer app (developers.facebook.com):
   create an app, add "Facebook Login", and copy its App ID + App Secret into
   Firebase's Facebook provider settings. While the Facebook app is in
   "development" mode, only accounts you've added as testers can log in with
   it — going live for the public requires Meta's app review process. Budget
   time for that separately; it's not a code change.
3. **Authorized domains** — Authentication → Settings → Authorized domains:
   add `localhost` (for dev) and your production domain, or Google/Facebook
   sign-in popups will fail.
4. **Phone verification requires the Blaze (pay-as-you-go) plan.** Firebase's
   free Spark plan does not support Phone Auth. Blaze includes a small free
   SMS quota, then bills per message — check current pricing before turning
   this on for real users.
5. **Grant yourself admin access**: sign up once through `/signup` (this
   verifies your email and phone), then in the Firebase console go to
   Firestore → create a collection called `admins` → add a document whose
   **document ID is your user's UID** (find it in Authentication → Users).
   The document's contents don't matter — its existence is what grants
   access. Reload `/admin` and the dashboard unlocks.

To add a teammate later, repeat step 5 with their UID — there's no in-app
"invite" flow yet, it's a console step by design so account access stays
deliberate.

## Deploying

Push to GitHub and import the repo on Vercel — it's a standard Next.js 14
App Router project, no special build config needed. Add the same
`NEXT_PUBLIC_FIREBASE_*` environment variables in the Vercel project
settings.

## Before this goes live for real clients

- Replace the placeholder copy on `/privacy` with your real contact details.
- Swap in real screenshots/thumbnails once you have them, or keep the
  generated gradient cards — they update automatically from each project's
  `accent` color.
- Double-check each `liveUrl` allows being framed (most Vercel-hosted sites
  do by default; a site with a strict `Content-Security-Policy` or
  `X-Frame-Options: DENY` will refuse to embed — the "Open live site ↗"
  link still works in that case).
