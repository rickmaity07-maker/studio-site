import { beforeAll, describe, expect, it } from "vitest";
import type { LeadInput } from "@/lib/lead-schema";
import { confirmation, ownerAlert } from "@/lib/server/notify";
import { escape } from "@/lib/server/email";

const lead: LeadInput = {
  name: "Lena <script>alert(1)</script> Hoffmann",
  email: "lena@cafe-hoffmann.de",
  phone: "+49 151 2345-6789",
  business: "Café & Bar \"Hoffmann\"",
  projectType: "New website",
  budget: "€1,000 - €3,000",
  timeline: "Within a month",
  message: "Line one\n<b>bold?</b>",
  projectRef: "Bar-05",
  source: "android",
  consent: true
};

// The sender/owner addresses come from the Gmail settings in production.
beforeAll(() => {
  process.env.GMAIL_USER = "owner@example.com";
  process.env.LEAD_NOTIFY_EMAIL = "owner@example.com";
});

describe("escape", () => {
  it("neutralises every HTML-significant character", () => {
    expect(escape(`<a href="x">'&'</a>`)).not.toMatch(/[<>"']/);
  });
});

describe("owner alert email", () => {
  const mail = () => ownerAlert(lead);

  it("replies straight to the person who asked", () => {
    expect(mail().replyTo).toContain("lena@cafe-hoffmann.de");
  });

  it("names the business and project type in the subject", () => {
    expect(mail().subject).toBe(`New request: ${lead.business} (New website)`);
  });

  it("says when the request came from the Android app", () => {
    expect(mail().html).toContain("via the Android app");
    expect(mail().text).toContain("via the Android app");
  });

  it("never injects visitor input as raw HTML", () => {
    expect(mail().html).not.toContain("<script>");
    expect(mail().html).not.toContain("<b>bold?</b>");
    expect(mail().html).toContain("&#60;script&#62;");
  });

  it("links the inbox and a one-click reply", () => {
    expect(mail().html).toContain("/admin");
    expect(mail().html).toContain("mailto:lena%40cafe-hoffmann.de");
  });

  it("strips formatting from the tel: link", () => {
    expect(mail().html).toContain('href="tel:+4915123456789"');
  });
});

describe("confirmation email", () => {
  const mail = () => confirmation(lead);

  it("goes to the visitor and replies to the owner", () => {
    expect(mail().to).toContain("lena@cafe-hoffmann.de");
    expect(mail().replyTo).toBe("owner@example.com");
  });

  it("greets by first name and lists the next steps", () => {
    expect(mail().text).toContain("Got it, thank you, Lena.");
    expect(mail().html).toContain("What happens next");
  });

  it("escapes the visitor's message", () => {
    expect(mail().html).not.toContain("<b>bold?</b>");
  });
});

describe("email copy", () => {
  it("contains no em or en dashes", () => {
    for (const m of [ownerAlert(lead), confirmation(lead)]) {
      expect(`${m.subject}\n${m.text}`).not.toMatch(/[–—]/);
    }
  });
});
