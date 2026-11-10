/**
 * The cost planner on /estimate: one-off price + an optional care plan,
 * added up over time. Uses only the approved prices in lib/pricing.ts.
 */
import type { CountryPrice } from "@/lib/pricing";

export const BUILDS = ["site", "shop"] as const;
export type Build = (typeof BUILDS)[number];

export const PLANS = ["none", "essential", "care", "growth"] as const;
export type Plan = (typeof PLANS)[number];

export const BUILD_LABEL: Record<Build, string> = { site: "Website", shop: "Website with online shop" };
export const PLAN_LABEL: Record<Plan, string> = {
  none: "No care plan",
  essential: "Essential care",
  care: "Care",
  growth: "Growth"
};

export type Range = [number, number];

export type Estimate = {
  oneOff: Range;
  monthly: number;
  firstYear: Range;
  threeYears: Range;
};

/** Monthly price of a plan in this country (0 for none). */
export function planPrice(c: CountryPrice, plan: Plan): number {
  const i = PLANS.indexOf(plan) - 1;
  return i < 0 ? 0 : c.care[i];
}

export function estimate(c: CountryPrice, build: Build, plan: Plan): Estimate {
  const oneOff: Range = build === "site" ? [c.site, c.site] : [c.shop[0], c.shop[1]];
  const monthly = planPrice(c, plan);
  const over = (months: number): Range => [oneOff[0] + monthly * months, oneOff[1] + monthly * months];
  return { oneOff, monthly, firstYear: over(12), threeYears: over(36) };
}

/** Middle of the local freelancer range for a normal site, when known. */
export function freelancerMiddle(c: CountryPrice): number | null {
  return c.market ? Math.round((c.market.free[0] + c.market.free[1]) / 2) : null;
}

export function isBuild(v: unknown): v is Build {
  return typeof v === "string" && (BUILDS as readonly string[]).includes(v);
}

export function isPlan(v: unknown): v is Plan {
  return typeof v === "string" && (PLANS as readonly string[]).includes(v);
}

/** "site-care" from the planner's request link -> readable text, or undefined. */
export function describePlan(param: string | undefined): string | undefined {
  if (!param) return undefined;
  const [build, plan] = param.split("-");
  if (!isBuild(build) || !isPlan(plan)) return undefined;
  return plan === "none" ? BUILD_LABEL[build] : `${BUILD_LABEL[build]} + ${PLAN_LABEL[plan]}`;
}
