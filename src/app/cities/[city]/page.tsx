import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav, Footer } from "@/components/ui";
import { CITIES, citySlug, cityFromSlug, SITE_URL, JsonLd, faqJsonLd } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: citySlug(c) }));
}

export async function generateMetadata(props: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const params = await props.params;
  const city = cityFromSlug(params.city);
  if (!city) return {};
  return {
    title: `Pet Matchmaking in ${city} — Dog & Cat Playdates Near You`,
    description: `Find verified dogs and cats in ${city} for safe playdates, friendships and family-planning matches. Identity-verified members, maps, filters and encrypted chat. Join PawsPair free.`,
    alternates: { canonical: `/cities/${citySlug(city)}` },
    openGraph: { title: `Pet Matchmaking in ${city} — PawsPair`, url: `${SITE_URL}/cities/${citySlug(city)}`, images: ["/og.jpg"] },
  };
}

const cityFaqs = (city: string) => [
  { q: `Is PawsPair available in ${city}?`, a: `Yes — PawsPair has verified pet parents across ${city}. Create a free profile, get verified, and discover compatible dogs and cats near you on the map.` },
  { q: `How do I find dog playdates in ${city}?`, a: `Sign up, set your pet's intent to 'Playdates', and PawScore matching shows verified, nearby dogs in ${city} sorted by distance and compatibility.` },
  { q: `Is it safe to meet pets in ${city}?`, a: `Every member is identity-verified, chats are encrypted, and you can report or block anyone. PawsPair suggests safe, public meeting spots and is DPDP Act 2023 compliant.` },
];

export default async function CityPage(props: { params: Promise<{ city: string }> }) {
  const params = await props.params;
  const city = cityFromSlug(params.city);
  if (!city) notFound();
  const user = await getCurrentUser();

  const verified = await prisma.pet.count({ where: { city, user: { kycStatus: "VERIFIED", bannedAt: null } } });
  const faqs = cityFaqs(city);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Pet matchmaking in ${city}`, item: `${SITE_URL}/cities/${citySlug(city)}` },
    ],
  };

  return (
    <>
      <JsonLd data={[breadcrumb, faqJsonLd(faqs)]} />
      <Nav user={user} />

      <section className="section">
        <div className="container" style={{ maxWidth: 880 }}>
          <span className="eyebrow">📍 {city}, India</span>
          <h1 className="h-hero" style={{ margin: "12px 0 14px" }}>
            Pet matchmaking in <span className="text-grad">{city}</span>
          </h1>
          <p className="lead" style={{ marginBottom: 18 }}>
            Find verified dogs and cats near you in {city} for safe playdates, lifelong friendships and family-planning
            matches. Identity-verified members only, with maps, smart filters and encrypted chat.
          </p>
          <div className="row" style={{ gap: 12, marginBottom: 22 }}>
            <Link href="/signup" className="btn btn-primary btn-lg">Find matches in {city}</Link>
            <Link href="/login" className="btn btn-ghost btn-lg">Log in</Link>
          </div>
          {verified > 0 && <span className="chip honey">{verified}+ verified {verified === 1 ? "pet" : "pets"} in {city}</span>}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <h2 className="h-sec" style={{ fontSize: "1.5rem", marginBottom: 12 }}>Why pet parents in {city} choose PawsPair</h2>
          <div className="grid g3">
            {[
              ["🛡️", "Verified members", `Every pet parent in ${city} is identity-verified, so every match is genuine.`],
              ["📍", "Nearby on the map", `See compatible dogs and cats across ${city} on an interactive map, filtered by distance.`],
              ["💬", "Safe & private", "Encrypted chat, report & block, and DPDP-compliant data protection."],
            ].map(([e, t, d]) => (
              <div key={t} className="card">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{e}</div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>{t}</h3>
                <p className="muted" style={{ fontSize: ".92rem" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 className="h-sec" style={{ fontSize: "1.5rem", marginBottom: 16 }}>Pet matchmaking in {city} — FAQs</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {faqs.map((f) => (
              <div key={f.q} className="card">
                <h3 style={{ fontSize: "1.02rem", marginBottom: 6 }}>{f.q}</h3>
                <p className="muted" style={{ fontSize: ".95rem" }}>{f.a}</p>
              </div>
            ))}
          </div>
          <h3 style={{ marginTop: 28, marginBottom: 10, fontSize: "1.05rem" }}>PawsPair in other cities</h3>
          <div className="row" style={{ gap: 8 }}>
            {CITIES.filter((c) => c !== city).map((c) => (
              <Link key={c} href={`/cities/${citySlug(c)}`} className="chip acc">{c}</Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
