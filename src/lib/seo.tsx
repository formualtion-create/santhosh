import type { Metadata } from "next";

// Set NEXT_PUBLIC_SITE_URL to your real domain in production.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://pawspair.in").replace(/\/$/, "");
export const SITE_NAME = "PawsPair";

export const CITIES = ["Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"];

export const citySlug = (c: string) => c.toLowerCase().replace(/\s+/g, "-");
export const cityFromSlug = (slug: string) => CITIES.find((c) => citySlug(c) === slug.toLowerCase());

// Private, login-gated areas — keep out of the index.
export const noindex: Metadata = { robots: { index: false, follow: false } };

export const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og.jpg`,
  description:
    "India's verified, DPDP-compliant pet matchmaking platform for safe playdates, friendships and family planning matches.",
  areaServed: "IN",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "hello@pawspair.in",
    areaServed: "IN",
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/dashboard?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Pet matchmaking and family planning network",
  provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  areaServed: CITIES.map((c) => ({ "@type": "City", name: c })),
  audience: { "@type": "Audience", audienceType: "Pet parents in India" },
  description:
    "Find verified dogs and cats near you for playdates, friendships and KCI-aware, health-checked family planning — with identity verification and encrypted chat.",
};

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function JsonLd({ data }: { data: object | object[] }) {
  // Escape "<" so a value containing "</script>" can't break out of the tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
