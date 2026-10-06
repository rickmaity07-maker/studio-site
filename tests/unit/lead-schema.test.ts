import { describe, expect, it } from "vitest";
import { BUDGETS, PROJECT_TYPES, TIMELINES, validateLead } from "@/lib/lead-schema";

const valid = {
  name: "Lena Hoffmann",
  email: "lena@cafe-hoffmann.de",
  phone: "+49 151 23456789",
  business: "Café Hoffmann",
  projectType: PROJECT_TYPES[0],
  budget: BUDGETS[1],
  timeline: TIMELINES[1],
  message: "Online bookings, please.",
  projectRef: "Bar-05",
  consent: true
};

describe("validateLead", () => {
  it("accepts a complete request and defaults the source to web", () => {
    const r = validateLead(valid);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.source).toBe("web");
  });

  it("keeps the android source when the app sends it", () => {
    const r = validateLead({ ...valid, source: "android" });
    expect(r.ok && r.value.source).toBe("android");
  });

  it("falls back to web for an unknown source", () => {
    const r = validateLead({ ...valid, source: "ios" });
    expect(r.ok && r.value.source).toBe("web");
  });

  it("requires explicit consent (true, not truthy)", () => {
    expect(validateLead({ ...valid, consent: false })).toEqual({ ok: false, error: "Consent is required." });
    expect(validateLead({ ...valid, consent: "yes" }).ok).toBe(false);
  });

  it.each([
    ["name", "", "Please add your name."],
    ["email", "not-an-email", "That email address doesn't look right."],
    ["business", "   ", "Please add your business name."],
    ["projectType", "A spaceship", "Choose a project type."],
    ["budget", "Infinite", "Choose a budget."],
    ["timeline", "Yesterday", "Choose a timeline."]
  ])("rejects a bad %s", (field, value, error) => {
    expect(validateLead({ ...valid, [field]: value })).toEqual({ ok: false, error });
  });

  it("trims whitespace and caps field lengths", () => {
    const r = validateLead({ ...valid, name: "  Lena  ", message: "x".repeat(5000) });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.name).toBe("Lena");
      expect(r.value.message).toHaveLength(4000);
    }
  });

  it("ignores non-string values instead of crashing", () => {
    const r = validateLead({ ...valid, phone: 12345, message: { evil: true } });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.phone).toBe("");
      expect(r.value.message).toBe("");
    }
  });

  it("uses plain hyphens in the budget options (no en or em dashes)", () => {
    for (const b of BUDGETS) expect(b).not.toMatch(/[–—]/);
  });
});
