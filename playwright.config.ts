import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

/*
  End-to-end suite: builds the site, runs it against the isolated
  `studio_site_test` database and walks through every feature in a real
  browser. Run with `npm run test:e2e`. See e2e/README.md.
*/
for (const file of [".env.test.local", ".env.local"]) {
  // Earlier files win: loadEnvFile never overwrites a variable that is already set.
  if (existsSync(file)) process.loadEnvFile(file);
}

export const PORT = 3010;

// Shared by the test server, global setup and the specs (workers inherit the runner's env).
process.env.E2E_ADMIN_EMAIL ??= "e2e-admin@rickbuild.test";
process.env.E2E_ADMIN_PASSWORD ??= randomBytes(18).toString("base64url");
process.env.E2E_SESSION_SECRET ??= randomBytes(32).toString("base64url");

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  // The specs share one database and build on each other's state.
  workers: 1,
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 }
  },
  webServer: {
    // Reset + seed the test database first, so pages are built from it.
    command: `npx tsx e2e/prepare-db.ts && npx next build && npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/api/projects`,
    timeout: 6 * 60 * 1000,
    reuseExistingServer: false,
    stdout: "pipe",
    env: {
      // Separate build folder, so a running `next dev` is never disturbed.
      NEXT_DIST_DIR: ".next-test",
      // The test database, never the live one (global-setup refuses if they match).
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "",
      DATABASE_URL_UNPOOLED: process.env.TEST_DATABASE_URL_UNPOOLED ?? "",
      SESSION_SECRET: process.env.E2E_SESSION_SECRET!,
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      // No real emails from test runs.
      GMAIL_USER: "",
      GMAIL_APP_PASSWORD: "",
      LEAD_NOTIFY_EMAIL: "",
      E2E_ADMIN_EMAIL: process.env.E2E_ADMIN_EMAIL!,
      E2E_ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD!
    }
  }
});
