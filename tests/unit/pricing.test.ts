import { describe, expect, it } from "vitest";
import {
  COUNTRY_CODES,
  PRICES,
  compareRows,
  countryFromLocales,
  isCountry,
  money,
  parseAcceptLanguage,
  pickCountry,
  range
} from "@/lib/pricing";

describe("price data", () => {
  it("has all 115 countries from the approved guide, sorted by name", () => {
    expect(COUNTRY_CODES).toHaveLength(115);
    const names = COUNTRY_CODES.map((c) => PRICES[c].name);
    expect([...names].sort((a, b) => a.localeCompare(b, "en"))).toEqual(names);
  });

  it("every country has a site price, a shop range above it and rising care plans", () => {
    for (const code of COUNTRY_CODES) {
      const c = PRICES[code];
      expect(c.fmt, code).toContain("{}");
      expect(c.site, code).toBeGreaterThan(0);
      expect(c.shop[0], code).toBeGreaterThan(c.site);
      expect(c.shop[1], code).toBeGreaterThan(c.shop[0]);
      expect(c.care[0], code).toBeLessThan(c.care[1]);
      expect(c.care[1], code).toBeLessThan(c.care[2]);
    }
  });

  it("matches the approved guide for Germany and the US", () => {
    expect(PRICES.de).toMatchObject({ site: 1300, shop: [1850, 2800], care: [30, 65, 120] });
    expect(PRICES.us).toMatchObject({ site: 2300, shop: [3100, 4800] });
  });

  it("has market research for exactly the 12 researched countries", () => {
    const researched = COUNTRY_CODES.filter((c) => PRICES[c].market).sort();
    expect(researched).toEqual(["au", "ca", "de", "eg", "es", "gb", "in", "ke", "ng", "pl", "us", "za"]);
  });
});

describe("money and range", () => {
  it("formats prefix and suffix currencies", () => {
    expect(money(PRICES.de, 1300)).toBe("€1,300");
    expect(money(PRICES.pl, 2600)).toBe("2,600 zł");
    expect(money(PRICES.in, 20000)).toBe("₹20,000");
  });

  it("uses spaces as thousands separators for CFA francs", () => {
    expect(money(PRICES.sn, 180000)).toBe("180 000 FCFA");
  });

  it("joins ranges with a plain hyphen (the site avoids en dashes)", () => {
    expect(range(PRICES.de, 1850, 2800)).toBe("€1,850 - €2,800");
  });
});

describe("choosing the first country", () => {
  it("parses Accept-Language by quality", () => {
    expect(parseAcceptLanguage("en;q=0.5, de-AT, fr;q=0.8")).toEqual(["de-AT", "fr", "en"]);
    expect(parseAcceptLanguage(null)).toEqual([]);
  });

  it("prefers a locale's region, then a language's main country", () => {
    expect(countryFromLocales(["de-AT", "de"])).toBe("at");
    expect(countryFromLocales(["pl"])).toBe("pl");
    expect(countryFromLocales(["en"])).toBeUndefined();
    expect(countryFromLocales(["xx-ZZ"])).toBeUndefined();
  });

  it("?country= beats geo, geo beats language, Germany is the fallback", () => {
    expect(pickCountry({ query: "KE", ipCountry: "US", acceptLanguage: "de-DE" })).toBe("ke");
    expect(pickCountry({ query: "nope", ipCountry: "US", acceptLanguage: "de-DE" })).toBe("us");
    expect(pickCountry({ ipCountry: "AQ", acceptLanguage: "en-GB" })).toBe("gb");
    expect(pickCountry({})).toBe("de");
  });

  it("rejects inherited object keys as country codes", () => {
    expect(isCountry("constructor")).toBe(false);
    expect(isCountry("__proto__")).toBe(false);
  });
});

describe("comparison chart", () => {
  it("is to scale, with agencies only where researched", () => {
    const de = compareRows(PRICES.de)!;
    expect(de.rows.map((r) => r.label)).toEqual(["Rick.build", "Local freelancers", "Agencies"]);
    expect(de.max).toBeCloseTo(8000 * 1.05);
    expect(de.belowMiddle).toBe(true);

    const pl = compareRows(PRICES.pl)!;
    expect(pl.rows).toHaveLength(2);
  });

  it("is skipped for countries without research", () => {
    expect(compareRows(PRICES.sn)).toBeNull();
  });
});
