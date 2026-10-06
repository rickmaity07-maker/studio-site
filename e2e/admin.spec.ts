import path from "node:path";
import { expect, test } from "@playwright/test";
import { VALID_LEAD, admin, apiLogin, freshIp, reducedMotion, uiLogin } from "./helpers";

test.use(reducedMotion);

test.describe("access control", () => {
  test("the admin area asks visitors to sign in", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Sign in required" })).toBeVisible();
    await page.goto("/admin/projects");
    await expect(page.getByRole("heading", { name: "Sign in required" })).toBeVisible();
  });

  test("every admin API route refuses an anonymous caller", async ({ request }) => {
    const calls: [string, string][] = [
      ["GET", "/api/admin/leads"],
      ["PATCH", "/api/admin/leads/x"],
      ["DELETE", "/api/admin/leads/x"],
      ["GET", "/api/admin/projects"],
      ["POST", "/api/admin/projects"],
      ["GET", "/api/admin/projects/x"],
      ["PUT", "/api/admin/projects/x"],
      ["DELETE", "/api/admin/projects/x"],
      ["POST", "/api/admin/projects/reorder"],
      ["POST", "/api/admin/projects/import"],
      ["POST", "/api/admin/upload"]
    ];
    for (const [method, url] of calls) {
      const res = await request.fetch(url, { method, data: {} });
      expect(res.status(), `${method} ${url}`).toBe(401);
    }
    expect(await (await request.get("/api/admin/me")).json()).toEqual({ isAdmin: false, email: null });
  });

  test("a forged session cookie is rejected", async ({ request }) => {
    const res = await request.get("/api/admin/leads", {
      headers: { cookie: "admin_session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.forged" }
    });
    expect(res.status()).toBe(401);
  });

  test("wrong password shows an error, right one signs in", async ({ page }) => {
    await page.context().setExtraHTTPHeaders({ "x-forwarded-for": freshIp() });
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(admin.email());
    await page.getByPlaceholder("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("That email or password doesn't match.")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByPlaceholder("Password").fill(admin.password());
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    // The nav now offers the admin link.
    await expect(page.getByRole("banner").getByRole("link", { name: "Admin" })).toBeVisible();
  });

  test("login is rate-limited per address", async ({ request }) => {
    const ip = freshIp();
    for (let i = 0; i < 10; i++) {
      const res = await request.post("/api/auth/login", {
        data: { email: admin.email(), password: `wrong-${i}` },
        headers: { "x-forwarded-for": ip }
      });
      expect(res.status()).toBe(401);
    }
    const blocked = await request.post("/api/auth/login", {
      data: { email: admin.email(), password: admin.password() },
      headers: { "x-forwarded-for": ip }
    });
    expect(blocked.status()).toBe(429);
  });
});

test.describe("inbox", () => {
  test("shows requests, updates status and notes, deletes", async ({ page, request }) => {
    // A request to work with, sent the way the app sends one.
    const created = await request.post("/api/leads", {
      data: { ...VALID_LEAD, name: "Mira Schulz", email: "mira@schulz-salon.test", business: "Salon Schulz", source: "android" },
      headers: { "x-forwarded-for": freshIp() }
    });
    expect(created.status()).toBe(201);

    await uiLogin(page);
    // The inbox opens on "new" requests; show everything for this walkthrough.
    await page.getByRole("button", { name: /^all \d+$/ }).click();
    const row = page.locator("div").filter({ has: page.getByRole("button", { name: /Mira Schulz/ }) }).last();
    await expect(row).toContainText("via app");

    // Search narrows the list.
    await page.getByPlaceholder(/Search name/).fill("schulz-salon");
    await expect(page.getByRole("button", { name: /Mira Schulz/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Lena Hoffmann/ })).toHaveCount(0);
    await page.getByPlaceholder(/Search name/).fill("");

    await page.getByRole("button", { name: /Mira Schulz/ }).click();
    await expect(row.getByRole("link", { name: "mira@schulz-salon.test" })).toHaveAttribute("href", "mailto:mira@schulz-salon.test");
    await row.getByRole("button", { name: "contacted", exact: true }).click();
    await row.getByLabel("Private notes").fill("Called Tuesday, quote sent.");
    await row.getByRole("button", { name: "Save notes" }).click();
    await expect(row.getByRole("button", { name: "Save notes" })).toBeDisabled();

    // Survives a reload: it was saved on the server.
    await page.reload();
    await page.getByRole("button", { name: /^all \d+$/ }).click();
    await page.getByRole("button", { name: /Mira Schulz/ }).click();
    const again = page.locator("div").filter({ has: page.getByRole("button", { name: /Mira Schulz/ }) }).last();
    await expect(again.getByLabel("Private notes")).toHaveValue("Called Tuesday, quote sent.");
    await expect(page.getByRole("button", { name: /Mira Schulz/ })).toContainText("contacted");

    // Status filter.
    await page.getByRole("button", { name: /^contacted \d+$/ }).click();
    await expect(page.getByRole("button", { name: /Mira Schulz/ })).toBeVisible();
    await page.getByRole("button", { name: /^all \d+$/ }).click();

    // Delete (GDPR erasure) after confirming.
    page.once("dialog", (d) => d.accept());
    await again.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("button", { name: /Mira Schulz/ })).toHaveCount(0);
  });

  test("CSV export downloads the visible requests", async ({ page, request }) => {
    const created = await request.post("/api/leads", {
      data: { ...VALID_LEAD, name: "Tom Krause", email: "tom@krause-baeckerei.test", business: "Bäckerei Krause" },
      headers: { "x-forwarded-for": freshIp() }
    });
    expect(created.status()).toBe(201);

    await uiLogin(page);
    await page.getByRole("button", { name: /^all \d+$/ }).click();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export CSV" }).click()
    ]);
    expect(download.suggestedFilename()).toMatch(/^requests-\d{4}-\d{2}-\d{2}\.csv$/);
    const csv = await (await import("node:fs/promises")).readFile(await download.path(), "utf8");
    expect(csv).toMatch(/^\uFEFF?createdAt,status,name,email/);
    expect(csv).toContain("Bäckerei Krause");
  });
});

test.describe("projects", () => {
  test.describe.configure({ mode: "serial" });

  // Never leave test projects behind, even if a step above fails.
  test.afterAll(async ({ request }) => {
    await apiLogin(request);
    const { projects } = await (await request.get("/api/admin/projects")).json();
    for (const p of projects as { id: string; slug: string }[]) {
      if (p.slug.startsWith("e2e-")) await request.delete(`/api/admin/projects/${p.id}`);
    }
  });

  test("lists all projects; import refuses a non-empty database", async ({ page }) => {
    await uiLogin(page);
    await page.goto("/admin/projects");
    await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(13);
    const res = await page.request.post("/api/admin/projects/import");
    expect(res.status()).toBe(409);
  });

  test("server validation errors are shown in the form", async ({ page }) => {
    await uiLogin(page);
    await page.goto("/admin/projects/new");
    await page.getByLabel("Name").fill("Bar-05");
    // Slug collides with an existing project.
    await page.getByLabel("Tagline").fill("Duplicate");
    await page.getByLabel("Case study").fill("Should not save.");
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page.getByText(/already uses the slug "bar-05"/)).toBeVisible();
  });

  test("create a project with a screenshot, publish it, edit it, reorder it, delete it", async ({ page }) => {
    await uiLogin(page);
    await page.goto("/admin/projects/new");

    await page.getByLabel("Name").fill("E2E Kaffeehaus");
    await expect(page.getByLabel("URL slug")).toHaveValue("e2e-kaffeehaus");
    await page.getByLabel("Tagline").fill("Coffee house, Bamberg");
    await page.getByLabel("Category").selectOption("Hospitality");
    await page.locator("#accent").fill("#8B5E3C");
    await page.getByLabel("Tech stack").fill("Next.js, Postgres");
    await page.getByLabel("Live URL").fill("https://example.com");
    await page.getByLabel("Case study").fill("A test project created by the end-to-end suite.");

    // Screenshot upload goes to Postgres and previews immediately.
    await page.locator('input[type="file"]').first().setInputFiles(path.join(process.cwd(), "public/screens/bar-05.jpg"));
    await expect(page.getByRole("button", { name: "Replace" })).toBeVisible();
    // And the phone-width capture.
    await page.getByLabel("Phone screenshot file").setInputFiles(path.join(process.cwd(), "public/screens-mobile/bar-05.jpg"));
    await expect(page.getByRole("button", { name: "Replace" })).toHaveCount(2);

    // Leave it hidden at first.
    await expect(page.getByLabel("Visible on the site")).not.toBeChecked();
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/admin\/projects$/);

    const row = page.locator("li").filter({ hasText: "E2E Kaffeehaus" });
    await expect(row).toBeVisible();
    await expect(row.getByRole("button", { name: "Hidden" })).toBeVisible();

    // Hidden projects are not public.
    expect((await page.request.get("/work/e2e-kaffeehaus")).status()).toBe(404);

    // Publish from the list.
    await row.getByRole("button", { name: "Hidden" }).click();
    await expect(row.getByRole("button", { name: "Visible" })).toBeVisible();
    await page.goto("/work");
    await expect(page.locator('a[href="/work/e2e-kaffeehaus"]')).toBeVisible();
    await page.goto("/work/e2e-kaffeehaus");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("E2E Kaffeehaus");
    await expect(page.locator("iframe")).toHaveAttribute("src", "https://example.com");

    // Edit: new tagline, and mark it as blocking frames.
    await page.goto("/admin/projects");
    await page.locator("li").filter({ hasText: "E2E Kaffeehaus" }).getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Tagline").fill("Coffee house and roastery, Bamberg");
    await page.getByLabel("Embed live demo").uncheck();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/admin\/projects$/);
    await page.goto("/work/e2e-kaffeehaus");
    await expect(page.getByText("Coffee house and roastery, Bamberg")).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Open live site/ })).toBeVisible();
    // The uploaded phone screenshot is offered on the public page.
    await page.getByRole("button", { name: "Mobile" }).click();
    await expect(page.getByRole("img", { name: "E2E Kaffeehaus on a phone" })).toBeVisible();

    // Reorder: new projects go last; move it up one place and check the saved order.
    await page.goto("/admin/projects");
    const order = async () =>
      ((await (await page.request.get("/api/admin/projects")).json()).projects as { slug: string }[]).map((p) => p.slug);
    expect((await order()).at(-1)).toBe("e2e-kaffeehaus");
    await page.getByRole("button", { name: "Move E2E Kaffeehaus up" }).click();
    await expect.poll(async () => (await order()).at(-2)).toBe("e2e-kaffeehaus");

    // Delete after confirming; gone from the public site too.
    page.once("dialog", (d) => d.accept());
    await page.locator("li").filter({ hasText: "E2E Kaffeehaus" }).getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("li").filter({ hasText: "E2E Kaffeehaus" })).toHaveCount(0);
    expect((await page.request.get("/work/e2e-kaffeehaus")).status()).toBe(404);
  });

  test("uploads reject non-images", async ({ page }) => {
    await uiLogin(page);
    const res = await page.request.post("/api/admin/upload", {
      multipart: { file: { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") } }
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/PNG, JPG, WebP or AVIF/);
  });
});

test.describe("sign out", () => {
  test("ends the session", async ({ page }) => {
    await uiLogin(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("heading", { name: "Sign in required" })).toBeVisible();
    expect((await page.request.get("/api/admin/leads")).status()).toBe(401);
  });
});
