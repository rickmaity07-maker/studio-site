import { describe, expect, it } from "vitest";
import { PRICES } from "@/lib/pricing";
import { describePlan, estimate, freelancerMiddle, planPrice } from "@/lib/estimate";
import { FEATURES } from "@/data/features";
import { SECTORS, getSector } from "@/data/sectors";
import { projects } from "@/data/projects";

const de = PRICES.de;

describe("cost planner", () => {
  it("a website with no care plan costs the one-off price, forever", () => {
    const e = estimate(de, "site", "none");
    expect(e.oneOff).toEqual([de.site, de.site]);
    expect(e.monthly).toBe(0);
    expect(e.firstYear).toEqual([de.site, de.site]);
    expect(e.threeYears).toEqual([de.site, de.site]);
  });

  it("adds 12 and 36 months of the chosen plan", () => {
    const e = estimate(de, "site", "care");
    expect(e.monthly).toBe(de.care[1]);
    expect(e.firstYear[0]).toBe(de.site + de.care[1] * 12);
    expect(e.threeYears[0]).toBe(de.site + de.care[1] * 36);
  });

  it("a shop keeps its price range", () => {
    const e = estimate(de, "shop", "growth");
    expect(e.oneOff).toEqual(de.shop);
    expect(e.firstYear).toEqual([de.shop[0] + de.care[2] * 12, de.shop[1] + de.care[2] * 12]);
  });

  it("plan prices follow Essential, Care, Growth", () => {
    expect([planPrice(de, "essential"), planPrice(de, "care"), planPrice(de, "growth")]).toEqual(de.care);
  });

  it("freelancer middle exists only with market research", () => {
    expect(freelancerMiddle(de)).toBe(Math.round((de.market!.free[0] + de.market!.free[1]) / 2));
    const noMarket = Object.values(PRICES).find((c) => !c.market);
    if (noMarket) expect(freelancerMiddle(noMarket)).toBeNull();
  });

  it("describes only valid plan links", () => {
    expect(describePlan("site-none")).toBe("Website");
    expect(describePlan("shop-care")).toBe("Website with online shop + Care");
    expect(describePlan("site-gold")).toBeUndefined();
    expect(describePlan("<script>-care")).toBeUndefined();
    expect(describePlan(undefined)).toBeUndefined();
  });
});

describe("sectors and features", () => {
  const slugs = new Set(projects.map((p) => p.slug));

  it("every sector project and feature example is a real project", () => {
    for (const s of SECTORS) for (const p of s.projects) expect(slugs, `${s.slug}: ${p}`).toContain(p);
    for (const f of FEATURES) for (const p of f.seenIn) expect(slugs, `${f.id}: ${p}`).toContain(p);
  });

  it("every feature points at real sectors and has a unique id", () => {
    const sectorSlugs = SECTORS.map((s) => s.slug);
    for (const f of FEATURES) for (const s of f.sectors) expect(sectorSlugs).toContain(s);
    expect(new Set(FEATURES.map((f) => f.id)).size).toBe(FEATURES.length);
  });

  it("every project is in at least one sector", () => {
    for (const p of projects) expect(SECTORS.some((s) => s.projects.includes(p.slug)), p.slug).toBe(true);
  });

  it("looks sectors up by slug only", () => {
    expect(getSector("restaurants")?.name).toBe("Restaurants");
    expect(getSector("nope")).toBeUndefined();
    expect(getSector(undefined)).toBeUndefined();
  });
});
