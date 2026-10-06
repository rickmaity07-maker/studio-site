import { describe, expect, it } from "vitest";
import { imageUrl, slugify, validateProject } from "@/lib/project-schema";
import { projects } from "@/data/projects";

const valid = {
  slug: "cafe-hoffmann",
  name: "Café Hoffmann",
  tagline: "Café, Würzburg",
  category: "Hospitality",
  year: "2026",
  stack: ["Next.js", "Postgres"],
  description: "A café site with online bookings.",
  liveUrl: "https://cafe-hoffmann.vercel.app",
  embeddable: false,
  accent: "#4CE8B0",
  featured: true,
  published: true
};

describe("slugify", () => {
  it.each([
    ["Karmel Café & Restaurant", "karmel-cafe-restaurant"],
    ["  Bar-05  ", "bar-05"],
    ["Paulaner Meets Route 66", "paulaner-meets-route-66"],
    ["Über Grill", "uber-grill"]
  ])("%s -> %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("caps slugs at 60 characters", () => {
    expect(slugify("a".repeat(100))).toHaveLength(60);
  });
});

describe("validateProject", () => {
  it("accepts a complete project and keeps embeddable=false", () => {
    const r = validateProject(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.embeddable).toBe(false);
      expect(r.value.liveUrl).toBe(valid.liveUrl);
    }
  });

  it("defaults embeddable to true when not sent", () => {
    const { embeddable, ...rest } = valid;
    const r = validateProject(rest);
    expect(r.ok && r.value.embeddable).toBe(true);
  });

  it.each([
    ["name", "", "Name is required."],
    ["slug", "Bad Slug!", "Slug can only use lowercase letters, numbers and dashes."],
    ["tagline", "", "Tagline is required."],
    ["category", "Aerospace", "Choose a category."],
    ["year", "26", "Year must be four digits."],
    ["description", "", "Description is required."],
    ["accent", "mint", "Accent must be a hex color like #D4AF37."],
    ["liveUrl", "http://insecure.example", "Live URL must start with https://"],
    ["liveUrl", "not a url", "Live URL isn't a valid URL."]
  ])("rejects a bad %s", (field, value, error) => {
    expect(validateProject({ ...valid, [field]: value })).toEqual({ ok: false, error });
  });

  it("only accepts screenshots uploaded through the admin portal", () => {
    expect(validateProject({ ...valid, image: { id: "../../etc/passwd" } }).ok).toBe(false);
    const id = "clxyz0123456789abcdefghij";
    const r = validateProject({ ...valid, image: { id, url: "https://evil.example/x.png" } });
    expect(r.ok).toBe(true);
    // The URL is always rebuilt from the id, never taken from the client.
    if (r.ok) expect(r.value.image).toEqual({ id, url: imageUrl(id) });
  });

  it("keeps at most 12 stack entries", () => {
    const r = validateProject({ ...valid, stack: Array.from({ length: 20 }, (_, i) => `Tool ${i}`) });
    expect(r.ok && r.value.stack).toHaveLength(12);
  });
});

describe("starter projects (data/projects.ts)", () => {
  it("are all valid as admin input", () => {
    for (const p of projects) {
      const r = validateProject({ ...p, published: true });
      expect(r.ok, `${p.slug}: ${!r.ok && r.error}`).toBe(true);
    }
  });

  it("have unique slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("contain no em or en dashes in visible copy", () => {
    for (const p of projects) {
      expect(`${p.name} ${p.tagline} ${p.description}`).not.toMatch(/[–—]/);
    }
  });
});
