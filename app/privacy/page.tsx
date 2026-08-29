import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — Rick.build"
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">Privacy notice</p>
      <h1 className="mt-2 font-display text-3xl">What happens to your information</h1>

      <div className="mt-8 grid gap-6 leading-relaxed text-text/85">
        <p>
          When you submit the project request form, I store the details you
          provide — name, email, phone number if given, business name, and
          your message — in a private database used only to reply to your
          request. Nothing is shared with third parties or used for
          marketing.
        </p>
        <p>
          That data is only readable by me, never by other visitors to this
          site, and it&apos;s kept only for as long as it takes to follow up
          on your request and, if we work together, deliver the project.
        </p>
        <p>
          You can ask to see, correct, or delete anything stored about you at
          any time — just email me directly and I&apos;ll take care of it.
        </p>
        <p className="text-sm text-muted">
          This page is a placeholder — replace the contact details and any
          project-specific wording before this site goes live for real
          clients.
        </p>
      </div>
    </section>
  );
}
