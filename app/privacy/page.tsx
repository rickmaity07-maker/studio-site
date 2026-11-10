import type { Metadata } from "next";
import Link from "next/link";
import { site, field } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How rira.build handles the information you send: what is stored, where, for how long, which providers are involved, and your rights under the GDPR and India's DPDP Act."
};

export default function PrivacyPage() {
  const o = site.owner;

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">Privacy notice</p>
      <h1 className="mt-2 font-display text-3xl">What happens to your information</h1>

      <div className="mt-8 grid gap-8 leading-relaxed text-text/85">
        <Block title="Who is responsible">
          <p>
            {field(o.companyName)}, {field(o.street)}, {field(o.postalCity)}, {o.country},{" "}
            {field(o.email)}, a company registered in India. Full details are in the{" "}
            <Link href="/impressum" className="underline underline-offset-2 hover:text-live">
              Impressum
            </Link>
            .
          </p>
          <p>
            Because the site offers services to people in the EU, the EU General Data Protection Regulation
            (GDPR) applies alongside India&apos;s Digital Personal Data Protection Act, 2023. Where they differ,
            you get whichever protection is stronger.
          </p>
        </Block>

        <Block title="The project request form">
          <p>
            When you submit the form, I store what you enter (name, email,
            phone number if given, business name, project type, budget,
            timeline and your message) so I can reply to your request. The
            legal basis is your consent and steps taken at your request before
            a contract (Art. 6(1)(a) and (b) GDPR). You can withdraw consent at
            any time.
          </p>
          <p>
            The data is only readable by me. It&apos;s kept for as long as it
            takes to follow up on your request and, if we work together,
            deliver the project and meet statutory retention duties. It is
            never sold or used for advertising.
          </p>
        </Block>

        <Block title="Service providers">
          <p>
            Requests are stored in a Postgres database run by Neon Inc. on
            servers in Frankfurt, Germany. Neon processes the data on my
            behalf under a data processing agreement; as a US company it is
            bound by standard contractual clauses for any access from outside
            the EU.
          </p>
          <p>
            When a request comes in, a copy is emailed to me, and a
            confirmation of what you sent is emailed to you. Both are sent
            through Google Gmail (Google Ireland Ltd.); Google is certified
            under the EU-US Data Privacy Framework.
          </p>
          <p>
            To block spam, the form keeps a one-way hash of your IP address
            and a count of recent submissions, deleted automatically
            shortly after one hour (Art. 6(1)(f) GDPR). The IP address itself
            isn&apos;t stored.
          </p>
          <p>
            The site is hosted on Vercel Inc. When you visit it, Vercel
            processes technical data such as your IP address and browser type
            to deliver the pages and keep them secure (Art. 6(1)(f) GDPR).
            Vercel is certified under the EU-US Data Privacy Framework.
          </p>
          <p>
            Fonts are served from this site itself. No requests are made to
            Google Fonts. There are no analytics or tracking cookies.
          </p>
        </Block>

        <Block title="Access from India">
          <p>
            The data stays on the servers named above, in the EU. The company reads and answers requests from
            India, which counts as a transfer outside the EU. India has no EU adequacy decision, so this access
            relies on your request (Art. 49(1)(b) GDPR, steps you asked for before a contract) and, once we work
            together, on the contract itself. Access is limited to people who need it to handle your request.
          </p>
        </Block>

        <Block title="The Android app">
          <p>
            The rira.build Android app shows the same projects as this site.
            It has no accounts, no analytics and no advertising IDs. A project
            request sent from the app is handled exactly like one from the
            form above, and live demos opened in the app load straight from
            each client&apos;s own server. When it opens, the app asks this site
            whether a newer version exists; that check sends only the app&apos;s
            version number.
          </p>
        </Block>

        <Block title="Project demos">
          <p>
            Project pages can embed live client websites. Those sites are
            loaded from their own servers and have their own privacy notices.
          </p>
        </Block>

        <Block title="Your rights">
          <p>
            You can ask for access to, correction, deletion or restriction of
            your data, object to its processing, and request a portable copy
            (Art. 15-21 GDPR; sections 11-14 of the DPDP Act). Just email us. You also have the right to
            complain to the data protection authority where you live or work. In India, that&apos;s the Data
            Protection Board of India.
          </p>
        </Block>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3">
      <h2 className="font-display text-lg text-text">{title}</h2>
      {children}
    </div>
  );
}
