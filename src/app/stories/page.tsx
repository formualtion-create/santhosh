import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav, Footer } from "@/components/ui";
import { STORIES } from "@/lib/stories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Happy Tails — heart-warming pet stories from PawsPair",
  description:
    "Real-feeling little stories of dogs and cats who found friendship, playdates, family and love on PawsPair — India's verified pet matchmaking club.",
  alternates: { canonical: "/stories" },
};

function stars(n: number) {
  const f = Math.max(0, Math.min(5, n));
  return "★★★★★".slice(0, f) + "☆☆☆☆☆".slice(0, 5 - f);
}

export default async function Stories(props: { searchParams: Promise<{ submitted?: string; error?: string }> }) {
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  const community = await prisma.storySubmission.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 12,
  });
  return (
    <>
      <Nav user={user} />
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container" style={{ maxWidth: 880 }}>
          <div className="center" style={{ marginBottom: 8 }}>
            <span className="eyebrow">Happy Tails 🐾</span>
            <h1 className="h-sec" style={{ margin: "10px 0 8px" }}>Little stories, big hearts</h1>
            <p className="lead" style={{ maxWidth: 620, margin: "0 auto" }}>
              Every match on PawsPair is a tiny love story waiting to happen. Here are a few of our favourites —
              grab a chai, give your pet a cuddle, and have a read. 💛
            </p>
          </div>

          <div style={{ display: "grid", gap: 26, marginTop: 30 }}>
            {STORIES.map((s, i) => (
              <article key={s.slug} id={s.slug} className="card story-full" style={{ scrollMarginTop: 90, padding: 0, overflow: "hidden" }}>
                <div className="story-full__grid" style={{ display: "grid", gridTemplateColumns: i % 2 ? "1fr 320px" : "320px 1fr" }}>
                  <div className="story-full__img" style={{ order: i % 2 ? 2 : 0, minHeight: 260, background: "var(--muted)" }}>
                    <img src={s.image} alt={s.pets} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: 28 }}>
                    <span className="chip honey">{s.emoji} {s.tag}</span>
                    <h2 style={{ fontFamily: "var(--font-d)", fontSize: "1.5rem", color: "var(--fg)", margin: "12px 0 6px" }}>{s.headline}</h2>
                    <p className="muted" style={{ fontSize: ".88rem", marginBottom: 12 }}>{s.pets} · {s.owners} · {s.city}</p>
                    <p style={{ lineHeight: 1.7, color: "var(--text)" }}>{s.story}</p>
                    <blockquote style={{ margin: "16px 0 0", paddingLeft: 16, borderLeft: "3px solid var(--primary)", fontStyle: "italic", color: "var(--primary-600)", fontWeight: 600 }}>
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {community.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div className="center" style={{ marginBottom: 20 }}>
                <span className="eyebrow">From our community 💛</span>
                <h2 className="h-sec" style={{ marginTop: 10 }}>Tails from real pet parents</h2>
              </div>
              <div className="grid g3">
                {community.map((c) => (
                  <div key={c.id} className="tcard" style={{ margin: 0 }}>
                    {c.featured && <span className="chip honey" style={{ alignSelf: "flex-start", marginBottom: 8 }}>⭐ Featured</span>}
                    <div className="tcard__stars">{stars(c.rating)}</div>
                    <blockquote className="tcard__quote">&ldquo;{c.story}&rdquo;</blockquote>
                    <figcaption className="tcard__who">
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--muted)", display: "grid", placeItems: "center" }}>🐾</div>
                      <div><b>{c.name}</b><span className="muted">{c.petName}{c.city ? ` · ${c.city}` : ""}</span></div>
                    </figcaption>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share your Happy Tail */}
          <div id="share" className="card" style={{ marginTop: 40, scrollMarginTop: 90 }}>
            <div className="center" style={{ marginBottom: 14 }}>
              <span className="eyebrow">Share your Happy Tail ✍️</span>
              <h2 className="h-sec" style={{ marginTop: 10 }}>Got a story to tell?</h2>
              <p className="muted" style={{ maxWidth: 560, margin: "6px auto 0" }}>
                Did your pet find a friend, a playmate or a family on PawsPair? We&apos;d love to hear it — share your tale
                and we may feature it here. (Reviewed by our team before it goes live.)
              </p>
            </div>
            {sp.submitted && <div className="ok">🐾 Thank you! Your Happy Tail has been submitted for review. You&apos;ve made our day.</div>}
            {sp.error && <div className="err">{sp.error}</div>}
            <form action="/api/stories/submit" method="post" style={{ maxWidth: 620, margin: "10px auto 0" }}>
              <div className="fg2">
                <div className="field"><label htmlFor="s-name">Your name *</label><input id="s-name" name="name" required defaultValue={user?.ownerName || ""} placeholder="e.g. Ananya R." /></div>
                <div className="field"><label htmlFor="s-email">Email (optional)</label><input id="s-email" name="email" type="email" defaultValue={user?.email || ""} placeholder="you@example.com" /></div>
                <div className="field"><label htmlFor="s-pet">Pet&apos;s name *</label><input id="s-pet" name="petName" required placeholder="e.g. Simba" /></div>
                <div className="field"><label htmlFor="s-species">Species</label><select id="s-species" name="species" defaultValue=""><option value="">Choose…</option><option>Dog</option><option>Cat</option><option>Rabbit</option><option>Bird</option><option>Other</option></select></div>
                <div className="field"><label htmlFor="s-city">City</label><input id="s-city" name="city" defaultValue={user?.city || ""} placeholder="e.g. Bengaluru" /></div>
                <div className="field"><label htmlFor="s-rating">Your rating</label><select id="s-rating" name="rating" defaultValue="5"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option></select></div>
              </div>
              <div className="field"><label htmlFor="s-story">Your story *</label><textarea id="s-story" name="story" rows={4} required minLength={15} maxLength={1200} placeholder="How did PawsPair help your pet? Tell us what happened…" /></div>
              <button className="btn btn-primary btn-lg btn-block" type="submit">Share my Happy Tail 🐾</button>
            </form>
          </div>

          <div className="card center" style={{ marginTop: 34, background: "linear-gradient(135deg,var(--secondary),var(--primary))", color: "#fff" }}>
            <h2 style={{ color: "#fff", marginBottom: 6 }}>Your pet&apos;s story starts here 🐾</h2>
            <p style={{ color: "#fff", opacity: .92, marginBottom: 16 }}>Join thousands of verified pet parents and find your companion&apos;s best friend.</p>
            <Link href="/signup" className="btn btn-lg" style={{ background: "#fff", color: "var(--primary-600)", fontWeight: 800 }}>Create your free profile</Link>
          </div>

          <p className="muted center" style={{ fontSize: ".8rem", marginTop: 18 }}>
            Happy Tails are illustrative stories that reflect real PawsPair journeys; names and details are creative.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
