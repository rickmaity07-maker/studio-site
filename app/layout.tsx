import type { Metadata } from "next";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AppBanner } from "@/components/AppBanner";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { IntroProvider } from "@/components/motion/Intro";
import { IntroCurtain, introScript } from "@/components/motion/intro-shared";
import { site } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "rira.build | Websites you can actually click through",
    template: "%s | rira.build"
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "rira.build | Websites you can actually click through",
    description: site.description
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <IntroCurtain />
        {/* Film grain over everything: fixed, so it never repaints on scroll. */}
        <div aria-hidden className="grain" />
        <AuthProvider>
          <SmoothScroll />
          <IntroProvider>
            <AppBanner />
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </IntroProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
