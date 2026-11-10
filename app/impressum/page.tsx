import type { Metadata } from "next";
import { site, field } from "@/data/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Legal notice for rira.build: the company behind the site, its registration details and how to reach it."
};

export default function ImpressumPage() {
  const o = site.owner;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">Legal notice</p>
      <h1 className="mt-2 font-display text-3xl">Impressum</h1>

      <div className="mt-8 grid gap-8 leading-relaxed text-text/85">
        <Block title="Provider (Anbieter)">
          <p>
            {field(o.companyName)}
            <br />
            {o.legalForm}
            <br />
            {field(o.street)}
            <br />
            {field(o.postalCity)}
            <br />
            {o.country}
          </p>
        </Block>

        <Block title="Represented by (Vertreten durch)">
          <p>{field(o.director)}, Director</p>
        </Block>

        <Block title="Contact (Kontakt)">
          <p>
            Email:{" "}
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
                Phone: {o.phone}
              </>
            )}
          </p>
        </Block>

        <Block title="Registration (Registereintrag)">
          <p>
            Registered with the Registrar of Companies, Ministry of Corporate Affairs, India.
            <br />
            Corporate Identification Number (CIN): {field(o.cin)}
            {o.gstin && (
              <>
                <br />
                GSTIN: {o.gstin}
              </>
            )}
          </p>
        </Block>

        <Block title="Responsible for content (Verantwortlich für den Inhalt)">
          <p>{field(o.director)}, address as above.</p>
        </Block>

        <Block title="Consumer dispute resolution (Verbraucherstreitbeilegung)">
          <p>
            We are not willing or obliged to take part in dispute resolution proceedings before a consumer
            arbitration board.
          </p>
        </Block>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
