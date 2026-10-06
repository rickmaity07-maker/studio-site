import { createHash } from "node:crypto";
import { expect, test } from "@playwright/test";
import { reducedMotion } from "./helpers";

test.use(reducedMotion);

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36";

test.describe("app banner", () => {
  test("announces the app, links to /app, and stays dismissed", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("region", { name: "Android app" });
    await expect(banner).toBeVisible();
    await expect(banner.getByRole("link", { name: "See the app" })).toHaveAttribute("href", "/app");

    await banner.getByRole("button", { name: "Dismiss the app banner" }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await expect(page.getByRole("region", { name: "Android app" })).toHaveCount(0);
  });

  test("says Download on Android phones", async ({ browser }) => {
    const ctx = await browser.newContext({ userAgent: ANDROID_UA, viewport: { width: 412, height: 915 }, isMobile: true, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Android app" }).getByRole("link", { name: "Download" })).toBeVisible();
    await ctx.close();
  });

  test("is never shown on iPhone", async ({ browser }) => {
    const ctx = await browser.newContext({ userAgent: IPHONE_UA, viewport: { width: 390, height: 844 }, isMobile: true, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "Android app" })).toHaveCount(0);
    await ctx.close();
  });

  test("stays out of the app page and the admin area", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "Android app" })).toHaveCount(0);
    await page.goto("/admin");
    await expect(page.getByRole("region", { name: "Android app" })).toHaveCount(0);
  });
});

test.describe("/app page", () => {
  test("shows the download, version, requirements and install steps", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Rick.build, on your phone.");
    const download = page.getByRole("link", { name: "Download the app" });
    await expect(download).toHaveAttribute("href", "/downloads/rick-build.apk");
    await expect(page.getByText("Version 1.0.0", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Android 8.0 or newer")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Installing takes a minute." })).toBeVisible();
    await expect(page.getByText("Internet only")).toBeVisible();
    for (const alt of ["The work list with industry filters", "The project request form"]) {
      await expect(page.getByRole("img", { name: alt }).first()).toBeVisible();
    }
  });

  test("the published checksum matches the file that is served", async ({ page, request }) => {
    await page.goto("/app");
    const shown = (await page.locator("code").first().innerText()).trim();
    expect(shown).toMatch(/^[0-9a-f]{64}$/);

    const res = await request.get("/downloads/rick-build.apk");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/vnd.android.package-archive");
    expect(res.headers()["content-disposition"]).toBe("attachment");
    const body = await res.body();
    expect(body.subarray(0, 2).toString()).toBe("PK"); // an APK is a zip
    expect(createHash("sha256").update(body).digest("hex")).toBe(shown);
  });

  test("clicking download saves the APK", async ({ page }) => {
    await page.goto("/app");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Download the app" }).click()
    ]);
    expect(download.suggestedFilename()).toBe("rick-build.apk");
  });

  test("is linked from the footer and listed in the sitemap", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Android app" })).toHaveAttribute("href", "/app");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("/app");
  });
});
