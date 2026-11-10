import { expect, test, type Page } from "@playwright/test";
import { reducedMotion } from "./helpers";

test.use(reducedMotion);

const price = (page: Page, name: string) => page.getByTestId(`price-${name}`);

test.describe("pricing page", () => {
  test("?country= picks the prices; the picker switches and writes a #code link", async ({ page }) => {
    await page.goto("/pricing?country=de");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Websites for restaurants, bars and cafés.");
    await expect(page.getByLabel("Your country")).toHaveValue("de");
    await expect(price(page, "Free mock-up")).toHaveText("Free");
    await expect(price(page, "Website")).toHaveText("€1,300");
    await expect(price(page, "Website with online shop")).toHaveText("€1,850 - €2,800");
    await expect(page.getByTestId("care-Essential")).toHaveText("€30");
    await expect(page.getByTestId("care-Care")).toHaveText("€65");
    await expect(page.getByTestId("care-Growth")).toHaveText("€120");
    await expect(page.getByTestId("validity")).toHaveText("Prices for Germany, valid for projects agreed by 31 March 2027.");

    await page.getByLabel("Your country").selectOption("pl");
    await expect(price(page, "Website")).toHaveText("2,600 zł");
    await expect(page).toHaveURL(/\/pricing#pl$/);
    await expect(page.getByTestId("validity")).toContainText("Poland");
  });

  test("a #code deep link wins over the default", async ({ page }) => {
    await page.goto("/pricing#ke");
    await expect(page.getByLabel("Your country")).toHaveValue("ke");
    await expect(price(page, "Website")).toHaveText("KSh 50,000");
  });

  test("defaults to the browser's country", async ({ browser }) => {
    const ctx = await browser.newContext({ locale: "en-GB", reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/pricing");
    await expect(page.getByLabel("Your country")).toHaveValue("gb");
    await expect(price(page, "Website")).toHaveText("£1,400");
    await ctx.close();
  });

  test("to-scale comparison only where there is market research", async ({ page }) => {
    await page.goto("/pricing?country=us");
    const chart = page.getByTestId("compare");
    await expect(chart).toContainText("Local freelancers");
    await expect(chart).toContainText("Agencies");
    await expect(chart).toContainText("US$1,500 - US$6,000");

    await page.goto("/pricing?country=sn");
    await expect(page.getByTestId("compare")).toHaveCount(0);
    await expect(page.getByTestId("compare-none")).toBeVisible();
    await expect(price(page, "Website")).toHaveText("180 000 FCFA");
  });

  test("all sections from the approved guide are on the page", async ({ page }) => {
    await page.goto("/pricing?country=de");
    for (const heading of [
      "How the price compares.",
      "What you get here that you often don't elsewhere.",
      "Monthly care plans.",
      "How it works and when you pay.",
      "A fair deal for both sides.",
      "What I need from you.",
      "Questions people ask."
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(page.getByRole("table")).toContainText("Free design mock-up before you pay");
    await expect(page.getByText("30% deposit to start the build")).toBeVisible();
    await expect(page.getByText("Remaining 70% on approval")).toBeVisible();
    await expect(page.getByText("Most chosen")).toBeVisible();
  });

  test("the mock-up call to action carries the country into the request form", async ({ page }) => {
    await page.goto("/pricing?country=es");
    await page.getByRole("link", { name: "Request a free mock-up" }).first().click();
    await expect(page).toHaveURL(/\/request\?mockup=es$/);
    await expect(page.getByText("Free mock-up (prices for Spain)")).toBeVisible();
  });

  test("linked from the nav and the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner").getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
    await expect(page.locator("#pricing").getByRole("link", { name: "See prices" })).toHaveAttribute("href", "/pricing");
  });

  test("fits a phone screen without sideways scrolling", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    for (const cc of ["de", "au", "sn"]) {
      await page.goto(`/pricing?country=${cc}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, cc).toBeLessThanOrEqual(0);
    }
    await ctx.close();
  });
});
