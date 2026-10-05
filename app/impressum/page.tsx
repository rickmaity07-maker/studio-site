import type { Metadata } from "next";
import { site, field } from "@/data/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Legal notice (Angaben gemäß § 5 DDG)."
};

export default function ImpressumPage() {
  const o = site.owner;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">Legal notice</p>
      <h1 className="mt-2 font-display text-3xl">Impressum</h1>

      <div className="mt-8 grid gap-8 leading-relaxed text-text/85">
        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            Angaben gemäß § 5 DDG
          </h2>
          <p className="mt-2">
            {field(o.fullName)}
            <br />
            {field(o.street)}
            <br />
            {field(o.postalCity)}
            <br />
            {o.country}
          </p>
        </div>

        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            Kontakt
          </h2>
          <p className="mt-2">
            E-Mail:{" "}
            {o.email ? (
              <a href={`mailto:${o.email}`} className="underline underline-offset-2 hover:text-live">
                {o.email}
              </a>
            ) : (
              field(o.email)
            )}
            {o.phone && (
              <>
                <br />
                Telefon: {o.phone}
              </>
            )}
          </p>
        </div>

        {o.vatId && (
          <div>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              Umsatzsteuer-ID
            </h2>
            <p className="mt-2">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: {o.vatId}
            </p>
          </div>
        )}

        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="mt-2">
            {field(o.fullName)}, Anschrift wie oben.
          </p>
        </div>

        <div>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            Verbraucherstreitbeilegung
          </h2>
          <p className="mt-2">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </div>
    </section>
  );
}
