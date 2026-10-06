import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const admin = {
  email: () => process.env.E2E_ADMIN_EMAIL!,
  password: () => process.env.E2E_ADMIN_PASSWORD!
};

export const VALID_LEAD = {
  name: "Lena Hoffmann",
  email: "lena@cafe-hoffmann.test",
  phone: "+49 151 23456789",
  business: "Café Hoffmann",
  projectType: "New website",
  budget: "Not sure yet",
  timeline: "Within a month",
  message: "Online table bookings, please.",
  consent: true
};

/**
 * The server rate-limits by x-forwarded-for. API tests send their own
 * address so they never use up the browser tests' allowance.
 */
const octet = () => Math.floor(Math.random() * 254) + 1;
export const freshIp = () => `10.${octet()}.${octet()}.${octet()}`;

/** Signs the API context in as the e2e admin (cookie stays on the context). */
export async function apiLogin(request: APIRequestContext) {
  const res = await request.post("/api/auth/login", {
    data: { email: admin.email(), password: admin.password() },
    headers: { "x-forwarded-for": freshIp() }
  });
  expect(res.status()).toBe(200);
}

/** Signs a browser page in through the real login form. */
export async function uiLogin(page: Page) {
  // Each browser login comes from its own address, like separate visitors,
  // so the suite never trips the 10-per-15-minutes login limit.
  await page.context().setExtraHTTPHeaders({ "x-forwarded-for": freshIp() });
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(admin.email());
  await page.getByPlaceholder("Password").fill(admin.password());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /requests|inbox/i }).first()).toBeVisible();
}

/** Visitors who prefer reduced motion get every element in place immediately. */
export const reducedMotion = { reducedMotion: "reduce" as const };
