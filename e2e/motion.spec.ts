import { expect, test } from "@playwright/test";

// Full motion: the experience most visitors get.
test.use({ reducedMotion: "no-preference" });

test("first visit plays the intro once, then reveals the hero", async ({ page }) => {
  // Record the intro state at first paint, before any timing can race it.
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      (window as unknown as { __introAtStart: string | undefined }).__introAtStart = document.documentElement.dataset.intro;
      (window as unknown as { __curtainShown: boolean }).__curtainShown =
        getComputedStyle(document.querySelector(".intro-curtain")!).display !== "none";
    });
  });
  await page.goto("/");
  // The curtain was decided before first paint and covered the page.
  expect(await page.evaluate(() => (window as unknown as { __introAtStart?: string }).__introAtStart)).toBe("play");
  expect(await page.evaluate(() => (window as unknown as { __curtainShown?: boolean }).__curtainShown)).toBe(true);

  // It lifts and is removed; the headline words settle into place.
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.+/, { timeout: 8000 });
  const firstWord = page.locator("h1 [data-word]").first();
  await expect.poll(() => firstWord.evaluate((el) => getComputedStyle(el).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);

  // Later page loads in the same session skip it (the init script only records).
  await page.goto("/work");
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.+/);
  await expect(page.locator(".intro-curtain")).toBeHidden();
});

test("reduced motion skips the intro entirely", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator(".intro-curtain")).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await ctx.close();
});

test("smooth scrolling is on, and live demos stay clickable", async ({ page }) => {
  await page.goto("/work/mainbar");
  await expect(page.locator("html")).toHaveClass(/lenis/);
  // Lenis' stock CSS would set pointer-events:none on iframes; ours must not.
  const pe = await page.locator("iframe").evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(pe).not.toBe("none");
});

test("the showreel pans sideways as the page scrolls", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.+/, { timeout: 8000 });
  const reel = page.getByRole("region", { name: "Live builds" });
  const track = reel.locator("div.flex.gap-5").first();
  const top = await reel.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const height = await reel.evaluate((el) => el.getBoundingClientRect().height);
  const x = () => track.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);

  await page.evaluate((y) => window.scrollTo(0, y), top + 20);
  await page.waitForTimeout(600);
  const start = await x();
  await page.evaluate((y) => window.scrollTo(0, y), top + (height - 900) * 0.6);
  await page.waitForTimeout(900);
  expect(await x()).toBeLessThan(start - 300);
});

test("scroll reveals end fully visible (nothing stuck hidden)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", /.+/, { timeout: 8000 });
  // Walk the page with the wheel, as a visitor would.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.mouse.move(700, 450);
  for (let y = 0; y < total; y += 700) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1800);
  // Every wipe-revealed screenshot opened fully.
  const clips = await page.locator('a[aria-label$="case study"]').evaluateAll((els) =>
    els.map((a) => getComputedStyle(a.parentElement!.parentElement!).clipPath)
  );
  expect(clips.length).toBe(3);
  for (const c of clips) expect(c).toMatch(/^inset\(0(%|px)?/);
  // Every split headline settled.
  const unsettled = await page.locator("h2 [data-word]").evaluateAll((els) =>
    els.filter((el) => {
      const t = getComputedStyle(el).transform;
      return t !== "none" && new DOMMatrix(t).m42 !== 0;
    }).length
  );
  expect(unsettled).toBe(0);
});
