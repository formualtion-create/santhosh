import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav, Footer, VerifiedTick } from "@/components/ui";
import { JsonLd, orgJsonLd, websiteJsonLd, serviceJsonLd, faqJsonLd, CITIES, citySlug } from "@/lib/seo";
import { STORIES, TESTIMONIALS, type Testimonial } from "@/lib/stories";

const FAQS = [
  { q: "Is PawsPair available in my city?", a: "Yes — PawsPair connects verified pet parents across Bengaluru, Mumbai, Delhi, Pune, Hyderabad, Chennai and more, with new cities added regularly." },
  { q: "How do I find a companion for my dog or cat?", a: "Create a verified profile, set your intent to ‘family planning’, and PawScore matching shows health-checked, compatible pets near you. All family planning follows AWBI guidelines and the Prevention of Cruelty to Animals Act, 1960." },
  { q: "Is PawsPair safe?", a: "Every member completes identity verification before they can browse profiles. Conversations are encrypted, you can report or block anyone, and PawsPair is compliant with the Digital Personal Data Protection (DPDP) Act, 2023." },
  { q: "Is PawsPair free to use?", a: "Yes — the Sniff plan is free forever and includes a verified profile, daily matches and encrypted chat. Paid plans (Fetch and Pedigree) add unlimited matches and family-planning tools." },
  { q: "Can I find playdates and friends, not just family planning?", a: "Absolutely. Most members use PawsPair for safe playdates and lifelong friendships for their dogs and cats — choose your intent when you sign up." },
];

export default async function Home() {
  const user = await getCurrentUser();

  // Testimonials: real approved member submissions lead; curated ones fill the gap
  // so the marquee always looks full. As real stories grow, they take over.
  const approved = await prisma.storySubmission.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
  const realTestimonials: Testimonial[] = approved.map((s) => ({
    name: s.name, pet: s.petName, city: s.city || "", avatar: "", rating: s.rating,
    quote: s.story.length > 150 ? s.story.slice(0, 150).trim() + "…" : s.story,
  }));
  const testimonials = [...realTestimonials, ...TESTIMONIALS].slice(0, Math.max(6, realTestimonials.length));

  return (
    <>
      <JsonLd data={[orgJsonLd, websiteJsonLd, serviceJsonLd, faqJsonLd(FAQS)]} />
      <Nav user={user} />

      <section className="section hero-section">
        <span className="hero-blob b1" aria-hidden />
        <span className="hero-blob b2" aria-hidden />
        <span className="hero-blob b3" aria-hidden />
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 40, alignItems: "center" }}>
          <div className="hero-anim">
            <span className="eyebrow">★ Verified members only · DPDP-compliant</span>
            <h1 className="h-hero" style={{ marginBottom: 16 }}>
              Every pet deserves a <span className="text-grad">best friend</span>
            </h1>
            <p className="lead" style={{ marginBottom: 26, maxWidth: 560 }}>
              PawsPair is India&apos;s verified pet matchmaking club — for safe playdates, lifelong friendships and
              responsible family planning. Make a little profile for your dog or cat and find their person, their
              playmate, or their whole pack nearby. Because love has paws, and care has a heartbeat. 🐾
            </p>
            <div className="row">
              <Link href="/signup" className="btn btn-primary btn-lg">Create your profile</Link>
              <Link href="/login" className="btn btn-ghost btn-lg">Log in</Link>
            </div>
            <div className="row" style={{ marginTop: 24, gap: 18 }}>
              <span className="badge-verified"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg> ID verification</span>
              <span className="badge-verified"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg> Encrypted &amp; secure</span>
              <span className="badge-verified"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg> DPDP Act 2023</span>
            </div>
          </div>
          <div className="card hero-card">
            <h2 style={{ marginBottom: 14, fontSize: "1.3rem" }}>How PawsPair works</h2>
            {[
              ["1", "Create your profile", "Owner + pet details, location and a verification document."],
              ["2", "Get verified", "We confirm your identity and award the trusted blue tick."],
              ["3", "Discover & filter", "Browse verified pets near you on the map, filtered to your needs."],
              ["4", "Connect safely", "Encrypted, consent-first introductions with full data control."],
            ].map(([n, t, d]) => (
              <div key={n} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="tick" style={{ width: 30, height: 30, fontFamily: "var(--font-d)", fontWeight: 900, color: "#fff", fontSize: 14 }}>{n}</span>
                <div>
                  <b style={{ fontFamily: "var(--font-d)", color: "var(--fg)" }}>{t}</b>
                  <div className="muted" style={{ fontSize: ".9rem" }}>{d}</div>
                </div>
              </div>
            ))}
            <Link href="/signup" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
              Get started — it&apos;s free <VerifiedTick />
            </Link>
          </div>
        </div>
      </section>

      {/* Member photo strip — social proof + Gen-Z visual */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="spread" style={{ marginBottom: 14 }}>
            <h2 className="h-sec" style={{ fontSize: "1.5rem" }}>Loved by pet parents across India 🐾</h2>
            <span className="chip honey">1.2L+ verified members</span>
          </div>
          <div className="memberstrip">
            {["dog-simba", "cat-luna", "dog-rocky", "cat-misha", "dog-leo", "cat-nova"].map((p) => (
              <div className="m" key={p}><img src={`/pets/${p}.jpg`} alt="A verified PawsPair member" loading="lazy" /></div>
            ))}
          </div>
        </div>
      </section>

      {/* Happy Tails — heart-warming stories */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="center" style={{ marginBottom: 26 }}>
            <span className="eyebrow">Happy Tails 🐾</span>
            <h2 className="h-sec">Little stories, big hearts</h2>
            <p className="lead" style={{ maxWidth: 600, margin: "8px auto 0" }}>
              Heart-warming tales of pets who found their person, their playmate, or their whole pack on PawsPair.
            </p>
          </div>
          <div className="grid g3 grid-stagger">
            {STORIES.slice(0, 3).map((s) => (
              <Link key={s.slug} href={`/stories#${s.slug}`} className="storycard">
                <div className="storycard__img">
                  <img src={s.image} alt={s.pets} loading="lazy" />
                  <span className="storycard__tag">{s.emoji} {s.tag}</span>
                </div>
                <div className="storycard__body">
                  <h3>{s.headline}</h3>
                  <p className="muted">&ldquo;{s.quote}&rdquo;</p>
                  <span className="storycard__meta">{s.pets} · {s.city}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="center" style={{ marginTop: 22 }}>
            <Link href="/stories" className="btn btn-ghost btn-lg">Read all Happy Tails →</Link>
          </div>
        </div>
      </section>

      {/* Testimonials — auto-scrolling social proof */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="center" style={{ marginBottom: 22 }}>
            <span className="eyebrow">Loved by pawrents 💬</span>
            <h2 className="h-sec">What our members say</h2>
          </div>
        </div>
        <div className="tmarquee" aria-label="Member testimonials">
          <div className="tmarquee__track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <figure className="tcard" key={i} aria-hidden={i >= testimonials.length}>
                <div className="tcard__stars">{"★★★★★".slice(0, t.rating)}</div>
                <blockquote className="tcard__quote">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="tcard__who">
                  {t.avatar
                    ? <img src={t.avatar} alt="" loading="lazy" />
                    : <span className="tcard__avatar" aria-hidden>🐾</span>}
                  <div><b>{t.name}</b><span className="muted">{t.pet}{t.city ? ` · ${t.city}` : ""}</span></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", justifyContent: "space-between", background: "linear-gradient(135deg,#F3E8FF,#FCE7F3)" }}>
            <div>
              <h2 className="h-sec" style={{ fontSize: "1.4rem", marginBottom: 4 }}>Pet love, in your inbox 💌</h2>
              <p className="muted" style={{ fontSize: ".95rem" }}>Care tips, heart-warming stories &amp; weekly motivation for you and your companion.</p>
            </div>
            <a href="#" data-subscribe className="btn btn-primary btn-lg" style={{ whiteSpace: "nowrap" }}>Join the family</a>
          </div>
        </div>
      </section>

      {/* SEO content — keyword-rich, India-targeted */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <h2 className="h-sec" style={{ marginBottom: 12 }}>The trusted pet matchmaking &amp; companion community in India</h2>
          <p className="muted" style={{ marginBottom: 12 }}>
            Whether you&apos;re looking for a <strong>dog playdate</strong>, a feline friend, or a responsible, health-checked
            <strong> compatible companion match</strong>, PawsPair brings verified pet parents together safely. Set your pet&apos;s temperament,
            energy and intent, and our PawScore™ matching surfaces compatible dogs and cats nearby — sorted by best match or distance.
          </p>
          <p className="muted" style={{ marginBottom: 12 }}>
            Every member is identity-verified, so you can focus on the joy of the match instead of worrying about fakes. Ethical
            family-planning (litter) listings follow <strong>AWBI guidelines</strong> and the PCA Act, 1960, and your data is protected under the
            <strong> DPDP Act, 2023</strong>. Live in {CITIES.slice(0, 6).join(", ")} and beyond.
          </p>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            {CITIES.map((c) => <Link key={c} href={`/cities/${citySlug(c)}`} className="chip acc">{c}</Link>)}
          </div>
        </div>
      </section>

      {/* FAQ — visible + matches FAQPage schema */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 className="h-sec" style={{ marginBottom: 18 }}>Frequently asked questions</h2>
          <div className="grid-stagger" style={{ display: "grid", gap: 12 }}>
            {FAQS.map((f) => (
              <div key={f.q} className="card">
                <h3 style={{ fontSize: "1.05rem", marginBottom: 6 }}>{f.q}</h3>
                <p className="muted" style={{ fontSize: ".95rem" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
