import { expect, test } from "@playwright/test";
import { apiLogin, reducedMotion } from "./helpers";

test.use(reducedMotion);

test.describe("work search", () => {
  test("finds projects by name, industry or stack, and clears", async ({ page }) => {
    await page.goto("/work");
    const cards = page.locator("main ul > li");
    const search = page.getByRole("searchbox", { name: "Search projects" });

    await search.fill("postgres");
    await expect(cards).toHaveCount(3); // Paulaner, Bar-05, Karmel
    await search.fill("barbershop");
    await expect(page.locator('a[href="/work/rebo-salon"]')).toBeVisible();
    await search.fill("zzzz");
    await expect(cards).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText("Nothing matches");
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(cards).toHaveCount(13);
  });

  test("combines with the industry filter, and / focuses the box", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("tab", { name: /Beauty & Booking/ }).click();
    await page.keyboard.press("/");
    await expect(page.getByRole("searchbox", { name: "Search projects" })).toBeFocused();
    await page.keyboard.type("firebase");
    await expect(page.locator("main ul > li")).toHaveCount(2); // Rebo, Dhurdur
  });
});

test.describe("phone screenshots", () => {
  test("project pages switch between desktop and phone", async ({ page }) => {
    await page.goto("/work/bar-05");
    await expect(page.getByRole("img", { name: "Screenshot of Bar-05" })).toBeVisible();
    await page.getByRole("button", { name: "Mobile" }).click();
    await expect(page.getByRole("img", { name: "Bar-05 on a phone" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Desktop" }).click();
    await expect(page.getByRole("img", { name: "Screenshot of Bar-05" })).toBeVisible();
  });

  test("project cards show a phone preview, and the feed includes it", async ({ page, request }) => {
    await page.goto("/work");
    const card = page.locator('a[href="/work/karmel"]');
    await expect(card.locator("img")).toHaveCount(2);
    const { projects } = await (await request.get("/api/projects")).json();
    const karmel = projects.find((p: { slug: string }) => p.slug === "karmel");
    expect(karmel.mobileImage.url).toMatch(/^\/api\/images\//);
  });
});

test.describe("sharing", () => {
  test("copies the project link where there is no share sheet", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/work/karmel");
    await page.evaluate(() => {
      // Desktop browsers without the Web Share API fall back to copying.
      (navigator as unknown as { share?: unknown }).share = undefined;
    });
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/work\/karmel$/);
  });
});

test.describe("admin: app releases", () => {
  test("lists releases, hides and republishes, and /download follows", async ({ page, request }) => {
    await apiLogin(request);
    const list = await (await request.get("/api/admin/app-releases")).json();
    expect(list.releases[0]).toMatchObject({ versionCode: 1, published: true });

    // Hidden: nothing to download, so /download falls back to the app page.
    expect((await request.patch("/api/admin/app-releases/1", { data: { published: false } })).status()).toBe(200);
    const fallback = await request.get("/download", { maxRedirects: 0 });
    expect(fallback.headers()["location"]).toMatch(/\/app$/);
    expect((await request.get("/api/app/download/1")).status()).toBe(404);

    expect((await request.patch("/api/admin/app-releases/1", { data: { published: true } })).status()).toBe(200);
    const back = await request.get("/download", { maxRedirects: 0 });
    expect(back.headers()["location"]).toMatch(/\/api\/app\/download\/1$/);

    // The admin page shows it, with the download link to share.
    await page.context().addCookies((await request.storageState()).cookies);
    await page.goto("/admin/app");
    await expect(page.getByRole("heading", { name: "Releases" })).toBeVisible();
    await expect(page.getByText("Currently serves 1.0.0 (build 1).")).toBeVisible();
  });

  test("release routes refuse anonymous callers", async ({ playwright, baseURL }) => {
    const anon = await playwright.request.newContext({ baseURL });
    expect((await anon.get("/api/admin/app-releases")).status()).toBe(401);
    expect((await anon.patch("/api/admin/app-releases/1", { data: { published: false } })).status()).toBe(401);
    expect((await anon.delete("/api/admin/app-releases/1")).status()).toBe(401);
    await anon.dispose();
  });
});
