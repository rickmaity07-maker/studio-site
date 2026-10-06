import { expect, test } from "@playwright/test";
import { reducedMotion } from "./helpers";

// Functional checks run with reduced motion so nothing waits on animations;
// "motion.spec.ts" covers the animated experience.
test.use(reducedMotion);

test.describe("home page", () => {
  test("hero: headline, calls to action and the project deck", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Websites you can actually click through.");
    await expect(page.getByRole("link", { name: "See the work" }).first()).toHaveAttribute("href", "/work");
    await expect(page.locator("main").getByRole("link", { name: "Start a project" }).first()).toHaveAttribute("href", "/request");

    // Deck tabs jump straight to a project; the front card links to it.
    const tabs = page.getByRole("tablist", { name: "Featured projects" }).getByRole("tab");
    await expect(tabs).toHaveCount(5);
    await page.getByRole("tab", { name: "Rebo Salon" }).click();
    await expect(page.getByRole("tab", { name: "Rebo Salon" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('a[href="/work/rebo-salon"][tabindex="0"]')).toBeVisible();
  });

  test("showreel lists every live build with a link to each", async ({ page }) => {
    await page.goto("/");
    const reel = page.getByRole("region", { name: "Live builds" });
    await expect(reel.getByRole("heading", { name: "12 builds you can open right now." })).toBeVisible();
    for (const slug of ["paulaner-route-66", "bar-05", "karmel", "al-madina", "aura-nail-studio"]) {
      await expect(reel.locator(`a[href="/work/${slug}"]`)).toHaveCount(1);
    }
    await expect(reel.getByRole("link", { name: "Every build" })).toHaveAttribute("href", "/work");
  });

  test("index lists all 13 projects, including the one still in build", async ({ page }) => {
    await page.goto("/");
    const index = page.locator("section").filter({ has: page.getByRole("heading", { name: "Every build, one line each." }) });
    const rows = index.getByRole("listitem");
    await expect(rows).toHaveCount(13);
    await expect(index.locator('a[href="/work/vespre"]')).toContainText("In build");
  });

  test("capabilities: live count and the working DE/EN switch", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("client sites live and clickable")).toBeVisible();
    await expect(page.locator("a", { hasText: "client sites live" }).locator(".sr-only")).toHaveText("12");

    const preview = page.locator('[aria-live="polite"]').filter({ hasText: /reservieren|Book a table/ });
    await expect(preview).toContainText("Tisch reservieren");
    await page.getByRole("radio", { name: "en" }).click();
    await expect(page.getByRole("radio", { name: "en" })).toHaveAttribute("aria-checked", "true");
    await expect(preview).toContainText("Book a table");
    await expect(preview).toContainText("Open today until 11 pm");
    await page.getByRole("radio", { name: "de" }).click();
    await expect(preview).toContainText("Heute geöffnet bis 23 Uhr");
  });

  test("process shows the four stages and the closing call to action", async ({ page }) => {
    await page.goto("/");
    const process = page.locator("#process");
    for (const stage of ["Discover", "Design", "Build", "Launch"]) {
      await expect(process.getByRole("heading", { name: stage })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "Have a business that needs a site?" })).toBeVisible();
  });
});

test.describe("navigation", () => {
  test("desktop nav marks the current page and links to process", async ({ page }) => {
    await page.goto("/work");
    const nav = page.getByRole("banner");
    await expect(nav.getByRole("link", { name: "Work" })).toHaveClass(/text-text/);
    await nav.getByRole("link", { name: "Process" }).click();
    await expect(page).toHaveURL(/\/#process$/);
    await expect(page.locator("#process")).toBeInViewport();
  });

  test("mobile menu opens, navigates and closes", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(menu).toBeHidden();
    // Nothing on the page is wider than the phone.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await ctx.close();
  });

  test("footer links work", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    await expect(footer.getByRole("link", { name: "Impressum" })).toHaveAttribute("href", "/impressum");
  });
});

test.describe("work page", () => {
  test("filters by industry with live counts", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Every build, live and clickable.");
    const cards = page.locator("main ul > li");
    await expect(cards).toHaveCount(13);

    await page.getByRole("tab", { name: /Beauty & Booking 3/ }).click();
    await expect(cards).toHaveCount(3);
    await expect(page.locator('a[href="/work/rebo-salon"]')).toBeVisible();
    await expect(page.locator('a[href="/work/bar-05"]')).toHaveCount(0);

    await page.getByRole("tab", { name: /E-commerce 3/ }).click();
    await expect(cards).toHaveCount(3);
    await page.getByRole("tab", { name: /All 13/ }).click();
    await expect(cards).toHaveCount(13);
  });

  test("a card opens its project page", async ({ page }) => {
    await page.goto("/work");
    await page.locator('a[href="/work/karmel"]').click();
    await expect(page).toHaveURL(/\/work\/karmel$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Karmel Café & Restaurant");
  });
});

test.describe("project pages", () => {
  test("site that blocks framing: screenshot plus open-in-new-tab", async ({ page }) => {
    await page.goto("/work/bar-05");
    await expect(page.getByText("Hospitality", { exact: true })).toBeVisible();
    await expect(page.getByText("2026", { exact: true })).toBeVisible();
    const open = page.getByRole("link", { name: /Open live site/ });
    await expect(open).toHaveAttribute("href", "https://the-bar-project.vercel.app");
    await expect(open).toHaveAttribute("target", "_blank");
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("embeddable site: live iframe with desktop/mobile toggle", async ({ page }) => {
    await page.goto("/work/mainbar");
    const frame = page.locator("iframe");
    await expect(frame).toHaveAttribute("src", "https://mainbar-website.vercel.app");
    await page.getByRole("button", { name: "Mobile" }).click();
    await expect(frame).toHaveAttribute("width", "390");
    await page.getByRole("button", { name: "Desktop" }).click();
    await expect(frame).toHaveAttribute("width", "100%");
  });

  test("project still in build shows the coming-soon state", async ({ page }) => {
    await page.goto("/work/vespre");
    await expect(page.getByText("Demo coming soon")).toBeVisible();
    await expect(page.getByText("In build").first()).toBeVisible();
  });

  test("request-this-style carries the reference into the form", async ({ page }) => {
    await page.goto("/work/bar-05");
    await page.getByRole("link", { name: "Request this style" }).click();
    await expect(page).toHaveURL(/\/request\?ref=bar-05$/);
    await expect(page.getByText("Referencing:")).toContainText("Bar-05");
  });

  test("next-project panel links onward", async ({ page }) => {
    await page.goto("/work/paulaner-route-66");
    await page.getByRole("link", { name: /Next project/ }).click();
    await expect(page).toHaveURL(/\/work\/bar-05$/);
  });

  test("unknown project shows the 404 page", async ({ page }) => {
    const res = await page.goto("/work/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Nothing to click through here" })).toBeVisible();
  });
});

test.describe("static pages and metadata", () => {
  test("legal pages render", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Neon Inc.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "The Android app" })).toBeVisible();
    await page.goto("/impressum");
    await expect(page.getByRole("heading", { name: "Impressum" })).toBeVisible();
  });

  test("sitemap, robots, manifest, icon and social image", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/work/bar-05");
    expect(sitemap).toContain("/request");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/admin/);
    expect(robots).toMatch(/Disallow: \/api/);
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.name).toBe("Rick.build");
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");
    expect((await request.get("/icon.svg")).status()).toBe(200);
  });

  test("visible copy has no em or en dashes", async ({ page }) => {
    for (const path of ["/", "/work", "/work/al-madina", "/request", "/privacy"]) {
      await page.goto(path);
      const text = await page.locator("main").innerText();
      expect(text, path).not.toMatch(/[–—]/);
    }
  });
});

test.describe("public API", () => {
  test("GET /api/projects returns published projects and form options", async ({ request }) => {
    const res = await request.get("/api/projects");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.projects).toHaveLength(13);
    expect(body.projects[0]).toMatchObject({ slug: "paulaner-route-66", embeddable: false });
    expect(body.projects[0].image.url).toMatch(/^\/api\/images\/[a-z0-9]+$/);
    expect(body.leadOptions.budgets).toContain("€1,000 - €3,000");
  });

  test("screenshots are served with long-lived caching", async ({ request }) => {
    const { projects } = await (await request.get("/api/projects")).json();
    const res = await request.get(projects[0].image.url);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/jpeg");
    expect(res.headers()["cache-control"]).toContain("immutable");
    expect((await request.get("/api/images/doesnotexist000000000000")).status()).toBe(404);
  });
});

test.describe("health", () => {
  // Hydration mismatches, runtime errors, failed requests: none allowed, in either motion mode.
  for (const motionMode of ["reduce", "no-preference"] as const) {
    test(`no browser errors on any page (${motionMode} motion)`, async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: motionMode, viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(`${page.url()}: ${m.text()}`);
      });
      for (const path of ["/", "/work", "/work/bar-05", "/work/vespre", "/request", "/app", "/privacy", "/impressum", "/login"]) {
        await page.goto(path, { waitUntil: "load" });
        await page.waitForTimeout(700);
      }
      expect(errors).toEqual([]);
      await ctx.close();
    });
  }
});
