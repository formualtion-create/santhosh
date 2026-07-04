import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import PWA from "@/components/PWA";
import AppPopups from "@/components/AppPopups";
import CookieConsent from "@/components/CookieConsent";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PawsPair — Verified Pet Matchmaking in India | Playdates, Friends & Family Planning",
    template: "%s · PawsPair",
  },
  description:
    "India's verified, DPDP-compliant pet matchmaking app. Find safe dog & cat playdates, friendships and health-checked, family planning matches near you — with ID verification, maps and encrypted chat.",
  keywords: [
    "pet matchmaking India", "companion for your dog", "find a companion for my dog", "pet family planning",
    "pet family planning India", "pet dating app India", "dog playdate app", "cat matchmaking",
    "verified pet parents", "pet community India", "KCI registered dogs", "dog socialisation",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: SITE_URL,
    title: "PawsPair — India's Verified Pet Matchmaking",
    description:
      "Safe playdates, lifelong friends and family planning matches for your dog or cat — verified members only.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "PawsPair — verified pet matchmaking in India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PawsPair — India's Verified Pet Matchmaking",
    description: "Verified playdates, friends & family planning matches for your dog or cat.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "Pets",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "PawsPair", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6366F1",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const firstName = user?.ownerName?.split(" ")[0] || null;
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <body>
        {children}
        <PWA />
        <AppPopups userName={firstName} />
        <CookieConsent />
      </body>
    </html>
  );
}
