"""Per-country prices, portfolio links and proposal emails.

Base: Germany = EUR 700 for a normal site (like Bar-05 / Karmel), EUR 1,000-1,500 for an online shop.
Other countries are scaled to local price levels and rounded to friendly local amounts.

Run:  python scripts/pricing.py   -> writes email_drafts_by_country.md
"""
import os

# Live sites (checked 2026-11-07, all return 200)
PORTFOLIO = "https://studio-site-five-rust.vercel.app"
VENUES = [("Bar-05, cocktail bar", "https://the-bar-project.vercel.app"),
          ("Paulaner Meets Route 66, bar", "https://paulaner-teal.vercel.app"),
          ("Karmel, restaurant", "https://karmel.vercel.app"),
          ("Taj Mahal, Indian restaurant", "https://taj-mahal-schweinfurt.vercel.app"),
          ("Kosem Food House, restaurant", "https://k-sem-d-ner.vercel.app"),
          ("Hungry Chicken, fast food", "https://hungry-chiken.vercel.app")]
SHOPS = [("Horseed Afro Shop", "https://horseed-afro-shop.vercel.app"),
         ("Dalab Fresh, grocery", "https://dalab-fresh.vercel.app"),
         ("Cask & Ember, spirits & tobacco", "https://tobaco-store.vercel.app"),
         ("Kern Watches", "https://kern-watches-1u5u.vercel.app"),
         ("Lijo Papad", "https://lijopapad.vercel.app")]
OTHER = [("Aura Nail Studio", "https://nail-salon-liard.vercel.app"),
         ("Iron Rose Tattoo Co.", "https://tattoo-parlor-two.vercel.app"),
         ("AjwanTel, phone repair", "https://ajwantel-ui.vercel.app")]

# (currency format, normal site, shop from, shop to)
EUR_HIGH = ("€{}", 700, 1000, 1500)
EUR_MID = ("€{}", 550, 800, 1200)
EUR_LOW = ("€{}", 450, 650, 1000)
EUR_EAST = ("€{}", 300, 450, 700)
XOF = ("{} FCFA", 150000, 230000, 350000)   # West & Central African CFA franc
USD_AF = ("US${}", 250, 400, 600)           # other African countries

PRICES = {
    # Western / Northern Europe
    "DE": EUR_HIGH, "AT": EUR_HIGH, "NL": EUR_HIGH, "BE": EUR_HIGH, "LU": ("€{}", 800, 1200, 1800),
    "FR": EUR_HIGH, "IE": EUR_HIGH, "FI": EUR_HIGH, "MC": ("€{}", 900, 1300, 1900),
    "AD": EUR_HIGH, "SM": EUR_MID, "VA": EUR_MID, "AX": EUR_HIGH, "RE": EUR_MID, "YT": EUR_LOW,
    "CH": ("CHF {}", 900, 1300, 1900), "LI": ("CHF {}", 900, 1300, 1900),
    "GB": ("£{}", 600, 850, 1300), "IM": ("£{}", 600, 850, 1300), "JE": ("£{}", 600, 850, 1300),
    "GG": ("£{}", 600, 850, 1300), "GI": ("£{}", 600, 850, 1300), "SH": ("£{}", 450, 650, 1000),
    "DK": ("{} kr.", 5200, 7500, 11000), "FO": ("{} kr.", 5200, 7500, 11000),
    "SE": ("{} kr", 8000, 11500, 17000), "NO": ("{} kr", 8500, 12000, 18000),
    "SJ": ("{} kr", 8500, 12000, 18000), "IS": ("{} kr.", 110000, 160000, 240000),
    # Southern Europe
    "ES": EUR_MID, "IT": EUR_MID, "PT": EUR_MID, "GR": EUR_MID, "CY": EUR_MID, "MT": EUR_MID,
    # Central / Eastern Europe
    "SI": EUR_LOW, "EE": EUR_LOW, "LV": EUR_LOW, "LT": EUR_LOW, "SK": EUR_LOW, "HR": EUR_LOW,
    "BG": ("€{}", 350, 500, 800), "CZ": ("{} Kč", 11000, 16000, 24000),
    "PL": ("{} zł", 1800, 2600, 4000), "HU": ("{} Ft", 160000, 230000, 350000),
    "RO": ("{} lei", 2000, 2900, 4400),
    "RS": EUR_EAST, "BA": EUR_EAST, "AL": EUR_EAST, "MK": EUR_EAST, "ME": EUR_EAST, "XK": EUR_EAST,
    "MD": EUR_EAST, "UA": EUR_EAST, "BY": EUR_EAST, "RU": EUR_EAST,
    # North America, Australia, India
    "US": ("US${}", 800, 1100, 1700), "CA": ("CA${}", 1000, 1400, 2200),
    "AU": ("A${}", 1100, 1500, 2400), "IN": ("₹{}", 15000, 25000, 40000),
    # Africa - local currency where it is the usual way to quote
    "ZA": ("R{}", 7500, 11000, 17000), "NA": ("N${}", 6500, 9500, 15000), "BW": ("P{}", 4500, 6500, 10000),
    "NG": ("₦{}", 250000, 400000, 650000), "GH": ("GH₵{}", 3500, 5000, 8000),
    "KE": ("KSh {}", 35000, 50000, 80000), "UG": ("USh {}", 900000, 1400000, 2200000),
    "TZ": ("TSh {}", 650000, 1000000, 1600000), "RW": ("RWF {}", 330000, 500000, 800000),
    "EG": ("EGP {}", 12000, 18000, 28000), "MA": ("{} MAD", 3000, 4500, 7000),
    "TN": ("{} TND", 800, 1200, 1800), "DZ": ("€{}", 250, 400, 600), "MU": ("Rs {}", 15000, 22000, 34000),
    "SC": ("€{}", 450, 650, 1000), "CV": ("€{}", 300, 450, 700),
    **{c: XOF for c in ("SN", "CI", "BF", "ML", "TG", "BJ", "NE", "GW",
                        "CM", "GA", "CG", "TD", "CF", "GQ")},
}

# Researched local freelancer range for a normal site (see price_comparison.md).
# Quote = average of the first estimate above and the middle of this range.
MARKET = {"DE": (800, 3000), "GB": (1500, 3000), "US": (1500, 6000), "CA": (1200, 3500),
          "AU": (1500, 2500), "ES": (300, 1500), "PL": (1500, 5500), "IN": (20000, 30000),
          "ZA": (3000, 16000), "NG": (50000, 600000), "EG": (5000, 21000), "KE": (30000, 100000)}


def _factor(cc):
    lo, hi = MARKET[cc]
    return ((PRICES[cc][1] + (lo + hi) / 2) / 2) / PRICES[cc][1]


# Countries not researched follow their closest researched neighbour
LIKE = {**{c: "DE" for c in ("AT", "NL", "BE", "LU", "FR", "IE", "FI", "MC", "AD", "AX", "CH", "LI",
                             "DK", "FO", "SE", "NO", "SJ", "IS")},
        **{c: "GB" for c in ("IM", "JE", "GG", "GI", "SH")},
        **{c: "ES" for c in ("IT", "PT", "GR", "CY", "MT", "SM", "VA", "RE", "YT")}}
AFRICA_F = sum(_factor(c) for c in ("NG", "ZA", "EG", "KE")) / 4


def _nice(n):
    step = 50 if n < 2000 else 100 if n < 10000 else 500 if n < 50000 else 5000 if n < 500000 else 10000
    return int(round(n / step) * step)


def quote(cc):
    fmt, b, lo, hi = PRICES.get(cc) or (EUR_LOW if cc in EUROPE else USD_AF)
    if cc in MARKET:
        f = _factor(cc)
    elif cc in LIKE:
        f = _factor(LIKE[cc])
    elif cc in EUROPE:
        f = _factor("PL")
    else:
        f = AFRICA_F
    return fmt, _nice(b * f), _nice(lo * f), _nice(hi * f)


FRENCH = {"FR", "BE", "LU", "MC", "CH", "RE", "YT", "SN", "CI", "BF", "ML", "TG", "BJ", "NE", "GN",
          "CM", "GA", "CG", "CD", "TD", "CF", "DZ", "TN", "MA", "MG", "DJ", "KM", "BI", "MR"}
GERMAN = {"DE", "AT", "LI"}
EUROPE = {"AL", "AD", "AT", "AX", "BA", "BE", "BG", "BY", "CH", "CY", "CZ", "DE", "DK", "EE", "ES",
          "FI", "FO", "FR", "GB", "GG", "GI", "GR", "HR", "HU", "IE", "IM", "IS", "IT", "JE", "LI",
          "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL", "NO", "PL", "PT", "RO", "RS", "RU",
          "SE", "SI", "SJ", "SK", "SM", "UA", "VA", "XK"}


def price(cc):
    fmt, basic, lo, hi = quote(cc)
    money = lambda n: fmt.format(f"{n:,}".replace(",", " " if fmt.endswith("FCFA") else ","))
    return money(basic), money(lo), money(hi)


def links(kind=""):
    shopish = any(w in kind.lower() for w in ("shop", "store", "grocery", "market", "boutique"))
    first = SHOPS if shopish else VENUES
    return [first[:4], (SHOPS if not shopish else VENUES)[:2]]


def email(cc, name="{business}", hi_name="", city="{city}", kind="restaurant"):
    basic, lo, hi = price(cc)
    main, extra = links(kind)
    if cc in GERMAN:
        hi_line = f"Hallo {hi_name}," if hi_name else f"Hallo {name}-Team,"
        lst = "\n".join(f"- {t}: {u}" for t, u in main + extra)
        return (f"Eine Website für {name}?", f"""{hi_line}

ich bin bei Google Maps auf {name} in {city} gestoßen und habe gesehen, dass ihr noch keine eigene Website habt. Ich baue Websites für Restaurants, Bars und Cafés:

- Individuelles Design, passend zu eurem Laden und seiner Atmosphäre, keine Vorlage
- Eigenes Admin-Portal: Speisekarte, Preise, Fotos und Events selbst ändern, ohne Entwickler
- Optimiert für Handy und Google, mit Links zu Instagram, Reservierung und Lieferdiensten

Ein paar meiner Projekte, alle live:
{lst}
Mehr: {PORTFOLIO}

Preise:
- Website wie oben: {basic} einmalig
- Website mit Online-Shop: {lo} bis {hi}, je nach Umfang

Gern schicke ich euch kostenlos einen Entwurf, wie eine Seite für {name} aussehen könnte. Habt ihr kurz Zeit für ein Gespräch?

Viele Grüße
Rick

Falls ihr keine weiteren Nachrichten wünscht, antwortet einfach mit „Nein danke“.""")
    if cc in FRENCH and cc not in ("BE", "CH", "LU"):
        hi_line = f"Bonjour {hi_name}," if hi_name else f"Bonjour l'équipe {name},"
        lst = "\n".join(f"- {t} : {u}" for t, u in main + extra)
        return (f"Un site web pour {name} ?", f"""{hi_line}

J'ai découvert {name} à {city} sur Google Maps et j'ai remarqué que vous n'avez pas encore de site web. Je crée des sites pour les restaurants, bars et cafés :

- Un design sur mesure, inspiré de votre établissement et de son ambiance, pas un modèle
- Votre propre espace d'administration pour modifier menu, prix, photos et événements vous-même
- Adapté aux téléphones et à Google, avec liens vers Instagram, réservations et livraison

Quelques-uns de mes sites, tous en ligne :
{lst}
Plus : {PORTFOLIO}

Tarifs :
- Site comme ci-dessus : {basic}, paiement unique
- Site avec boutique en ligne : de {lo} à {hi} selon le projet

Je peux vous envoyer gratuitement une maquette de ce que pourrait être le site de {name}. Seriez-vous disponible pour en parler ?

Cordialement,
Rick

Si vous ne souhaitez plus recevoir de messages, répondez simplement « non merci ».""")
    hi_line = f"Hi {hi_name}," if hi_name else f"Hi {name} team,"
    lst = "\n".join(f"- {t}: {u}" for t, u in main + extra)
    return (f"A website for {name}?", f"""{hi_line}

I came across {name} in {city} on Google Maps and noticed you don't have a website yet. I build websites for restaurants, bars and cafes:

- A custom design made around your place and its vibe, not a template
- Your own admin portal, so you can update your menu, prices, photos and events yourself
- Works great on phones, shows up on Google, and links to your Instagram, bookings and delivery pages

Some of my sites, all live:
{lst}
More: {PORTFOLIO}

Pricing:
- Website like the ones above: {basic}, one-off
- Website with an online shop: {lo} to {hi}, depending on size

I'd be happy to send a free mock-up of what a site for {name} could look like. Would you be open to a quick chat?

Best,
Rick

If you'd rather not hear from me, just reply "no thanks" and I won't contact you again.""")


def main():
    names = {}
    for l in open("geo/countryInfo.txt", encoding="utf-8"):
        if l and not l.startswith("#"):
            p = l.split("\t")
            names[p[0]] = p[4]
    wanted = {l.rsplit(", ", 1)[-1].strip() for l in open("queries_world.txt", encoding="utf-8") if l.strip()}
    wanted |= {"India", "Germany", "United States", "United Kingdom", "Australia", "Canada"}
    codes = sorted((c for c, n in names.items() if n in wanted), key=lambda c: names[c])
    out = ["# Proposal emails by country\n",
           "Prices = average of the first estimate (scaled from Germany EUR 700 / EUR 1,000-1,500) and the local market rate (see price_comparison.md). "
           "German for DE/AT/LI, French for French-speaking Africa and France, English elsewhere. "
           "{business} and {city} are filled in per lead by draft_emails.py.\n"]
    out.append("| Country | Normal site | Online shop | Language |\n|---|---|---|---|")
    for c in codes:
        b, lo, hi = price(c)
        lang = "German" if c in GERMAN else "French" if c in FRENCH and c not in ("BE", "CH", "LU") else "English"
        out.append(f"| {names[c]} | {b} | {lo} - {hi} | {lang} |")
    for c in codes:
        s, body = email(c)
        out.append(f"\n---\n\n## {names[c]} ({c})\n\n**Subject:** {s}\n\n```\n{body}\n```")
    open("email_drafts_by_country.md", "w", encoding="utf-8").write("\n".join(out) + "\n")
    print(f"wrote email_drafts_by_country.md: {len(codes)} countries")


if __name__ == "__main__":
    main()
