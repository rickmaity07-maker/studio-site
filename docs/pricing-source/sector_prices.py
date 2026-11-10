"""Sector prices, decided by Rick on 2026-11-10 to stay below every competitor.

Germany (EUR), one-off:
  Salons and barbers           400 - 600
  Restaurants (also takeaway,
    bakeries, local services)  700 - 1,000
  Bars and cafes               800 - 900
  Online shops (e-commerce)    1,200 - 1,500

Other countries scale exactly like the original price list did: by the ratio of
that country's original "normal site" price in pricing.py to Germany's EUR 700
(so the UK, at GBP 600, gets 600/700 of each number), rounded with pricing._nice.
Where market research exists, the factor is capped so the top of the restaurant
range stays 10% under the local freelancer middle (this lowers Egypt, Nigeria and
South Africa; everywhere else was already below it).

Updates data/pricing.json in place: adds `sectors`, sets `site` to the restaurant
"from" price and `shop` to the e-commerce range. Care plans and market data stay.

Run from the repo root:  python docs/pricing-source/sector_prices.py
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pricing import PRICES, EUROPE, EUR_LOW, USD_AF, _nice  # noqa: E402

BASE = 700  # Germany's original normal-site price, the scaling reference
SECTORS_EUR = {"beauty": (400, 600), "food": (700, 1000), "bar": (800, 900), "shop": (1200, 1500)}

path = os.path.join(HERE, "..", "..", "data", "pricing.json")
data = json.load(open(path, encoding="utf-8"))

for code, c in data.items():
    cc = code.upper()
    original = (PRICES.get(cc) or (EUR_LOW if cc in EUROPE else USD_AF))[1]
    k = original / BASE
    # Rick's rule: cheaper than local competitors. Where there is market research,
    # keep the top of the restaurant range 10% under the local freelancer middle.
    m = c.get("market")
    if m:
        middle = (m["free"][0] + m["free"][1]) / 2
        k = min(k, 0.9 * middle / SECTORS_EUR["food"][1])
    sectors = {key: [_nice(lo * k), _nice(hi * k)] for key, (lo, hi) in SECTORS_EUR.items()}
    c["sectors"] = sectors
    c["site"] = sectors["food"][0]
    c["shop"] = sectors["shop"]

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, sort_keys=True, indent=0)
    f.write("\n")

for code in ("de", "gb", "us", "pl", "in", "ke", "sn"):
    print(code, data[code]["fmt"], data[code]["sectors"])
print("countries:", len(data))
