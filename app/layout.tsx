import type { Metadata } from "next";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { IntroProvider } from "@/components/motion/Intro";
import { IntroCurtain, introScript } from "@/components/motion/intro-shared";
import { site } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Rick.build | Websites you can actually click through",
    template: "%s | Rick.build"
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Rick.build | Websites you can actually click through",
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
        <AuthProvider>
          <SmoothScroll />
          <IntroProvider>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </IntroProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
