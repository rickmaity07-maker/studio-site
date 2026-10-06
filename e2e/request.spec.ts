import { expect, test } from "@playwright/test";
import { VALID_LEAD, apiLogin, freshIp, reducedMotion } from "./helpers";

test.use(reducedMotion);

test.describe("project request form", () => {
  test("can't be sent without consent; sends and confirms with it", async ({ page, request }) => {
    await page.goto("/request");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tell me about your business.");

    await page.getByLabel("Your name").fill("Jonas Weber");
    await page.getByLabel("Email").fill("jonas@weber-bistro.test");
    await page.getByLabel("Phone (optional)").fill("+49 9721 123456");
    await page.getByLabel("Business name").fill("Weber Bistro");
    await page.getByLabel("Project type").selectOption("Online store");
    await page.getByLabel("Budget").selectOption("€1,000 - €3,000");
    await page.getByLabel("Timeline").selectOption("Within 2 weeks");
    await page.getByLabel("Anything else? (optional)").fill("A shop for our sauces.");

    const send = page.getByRole("button", { name: "Send request" });
    await expect(send).toBeDisabled();
    await page.getByRole("checkbox").check();
    await expect(send).toBeEnabled();
    await send.click();

    await expect(page.getByText("Request sent")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Got it, thank you." })).toBeVisible();

    // It really reached the inbox, with every field and the web source.
    await apiLogin(request);
    const { leads } = await (await request.get("/api/admin/leads")).json();
    const lead = leads.find((l: { email: string }) => l.email === "jonas@weber-bistro.test");
    expect(lead).toMatchObject({
      name: "Jonas Weber",
      phone: "+49 9721 123456",
      business: "Weber Bistro",
      projectType: "Online store",
      budget: "€1,000 - €3,000",
      timeline: "Within 2 weeks",
      message: "A shop for our sauces.",
      source: "web",
      status: "new"
    });
  });

  test("browser validation stops a missing required field", async ({ page }) => {
    await page.goto("/request");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Send request" }).click();
    // Native validation keeps us on the form; nothing was sent.
    await expect(page.getByText("Request sent")).toHaveCount(0);
    expect(await page.getByLabel("Your name").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
  });

  test("a project reference from ?ref= is shown; unknown refs are ignored", async ({ page }) => {
    await page.goto("/request?ref=atlantic-lounge");
    await expect(page.getByText("Referencing:")).toContainText("Atlantic Lounge");
    // An unknown ref is ignored rather than shown.
    await page.goto("/request?ref=nope");
    await expect(page.getByText("Referencing:")).toHaveCount(0);
  });
});

test.describe("POST /api/leads", () => {
  test("rejects invalid input with a readable message", async ({ request }) => {
    const res = await request.post("/api/leads", {
      data: { ...VALID_LEAD, email: "nope" },
      headers: { "x-forwarded-for": freshIp() }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("That email address doesn't look right.");
  });

  test("rejects a body that isn't a JSON object", async ({ request }) => {
    const res = await request.post("/api/leads", {
      data: "[1,2,3]",
      headers: { "content-type": "application/json", "x-forwarded-for": freshIp() }
    });
    expect(res.status()).toBe(400);
  });

  test("the honeypot pretends success but stores nothing", async ({ request }) => {
    const res = await request.post("/api/leads", {
      data: { ...VALID_LEAD, email: "bot@spam.test", website: "http://spam.example" },
      headers: { "x-forwarded-for": freshIp() }
    });
    expect(res.status()).toBe(200);
    await apiLogin(request);
    const { leads } = await (await request.get("/api/admin/leads")).json();
    expect(leads.some((l: { email: string }) => l.email === "bot@spam.test")).toBe(false);
  });

  test("requests from the Android app are tagged as such", async ({ request }) => {
    const res = await request.post("/api/leads", {
      data: { ...VALID_LEAD, email: "app-user@example.test", source: "android" },
      headers: { "x-forwarded-for": freshIp() }
    });
    expect(res.status()).toBe(201);
    await apiLogin(request);
    const { leads } = await (await request.get("/api/admin/leads")).json();
    expect(leads.find((l: { email: string }) => l.email === "app-user@example.test").source).toBe("android");
  });

  test("rate-limits to 5 requests per hour per address", async ({ request }) => {
    const ip = freshIp();
    for (let i = 0; i < 5; i++) {
      const ok = await request.post("/api/leads", {
        data: { ...VALID_LEAD, email: `burst${i}@example.test` },
        headers: { "x-forwarded-for": ip }
      });
      expect(ok.status(), `request ${i + 1}`).toBe(201);
    }
    const blocked = await request.post("/api/leads", {
      data: { ...VALID_LEAD, email: "burst5@example.test" },
      headers: { "x-forwarded-for": ip }
    });
    expect(blocked.status()).toBe(429);
    expect((await blocked.json()).error).toMatch(/Too many requests/);
    // Another address is unaffected.
    const other = await request.post("/api/leads", {
      data: { ...VALID_LEAD, email: "other@example.test" },
      headers: { "x-forwarded-for": freshIp() }
    });
    expect(other.status()).toBe(201);
  });
});
