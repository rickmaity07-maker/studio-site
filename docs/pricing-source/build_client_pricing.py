"""Build client_pricing.html: a client-facing price guide with a country picker.
Prices come from pricing.py (quote()), market numbers from the 2026 research in price_comparison.md.
Run from the leads folder:  python scripts/build_client_pricing.py"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pricing import quote, PRICES, EUROPE, VENUES, SHOPS, OTHER, PORTFOLIO

# Researched local market, in local currency (2026 price guides)
MARKET = {
    "DE": {"free": (800, 3000), "agency": (2000, 8000), "diy": "€7 - €36 per month", "care": "€5 - €50 per month hosting, maintenance extra"},
    "GB": {"free": (1500, 3000), "agency": (2500, 10000), "diy": "£240 - £360 per year", "care": "£50 - £200 per month"},
    "US": {"free": (1500, 6000), "agency": (3000, 10000), "diy": "US$290 - $370 per year", "care": "US$30 - $300 per month"},
    "CA": {"free": (1200, 3500), "agency": (3000, 10000), "care": "CA$5 - $15 per month hosting, maintenance extra"},
    "AU": {"free": (1500, 2500), "agency": (5000, 15000), "care": "A$50+ per month"},
    "ES": {"free": (300, 1500), "agency": (1500, 2000)},
    "PL": {"free": (1500, 5500)},
    "IN": {"free": (20000, 30000), "agency": (50000, 200000)},
    "ZA": {"free": (3000, 16000), "care": "R499 - R799 per month"},
    "NG": {"free": (50000, 600000), "agency": (250000, 600000), "care": "₦80,000 - ₦200,000 per year"},
    "EG": {"free": (5000, 21000)},
    "KE": {"free": (30000, 100000), "care": "KSh 80 - 250 per month hosting"},
}


def small(n):
    step = 5 if n < 100 else 10 if n < 1000 else 50 if n < 10000 else 500 if n < 100000 else 5000
    return int(max(step, round(n / step) * step))


def main():
    names = {}
    for l in open("geo/countryInfo.txt", encoding="utf-8"):
        if l and not l.startswith("#"):
            p = l.split("\t")
            names[p[0]] = p[4]
    wanted = {l.rsplit(", ", 1)[-1].strip() for l in open("queries_world.txt", encoding="utf-8") if l.strip()}
    wanted |= {"India", "Germany", "United States", "United Kingdom", "Australia", "Canada"}
    data = {}
    for cc, n in names.items():
        if n not in wanted:
            continue
        fmt, b, lo, hi = quote(cc)
        data[cc.lower()] = {"name": n, "fmt": fmt, "site": b, "shop": [lo, hi],
                            "care": [small(b * .025), small(b * .05), small(b * .09)],
                            "market": MARKET.get(cc)}
    tpl = open(os.path.join(os.path.dirname(__file__), "client_pricing_template.html"), encoding="utf-8").read()
    work = {"venues": VENUES, "shops": SHOPS, "other": OTHER, "portfolio": PORTFOLIO}
    html = tpl.replace("/*DATA*/null", json.dumps(data, ensure_ascii=False)) \
              .replace("/*WORK*/null", json.dumps(work, ensure_ascii=False))
    open("client_pricing.html", "w", encoding="utf-8").write(html)
    print(f"wrote client_pricing.html: {len(data)} countries")


if __name__ == "__main__":
    main()
