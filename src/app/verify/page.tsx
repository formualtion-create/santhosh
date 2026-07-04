import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Nav, Footer } from "@/components/ui";
import { getBadges, trustLevel, trustScore, TRUST_LEVEL_STYLE } from "@/lib/trust";
import { isBeta } from "@/lib/beta";

export const dynamic = "force-dynamic";

export default async function Verify(props: { searchParams: Promise<{ done?: string; error?: string }> }) {
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerified) redirect("/verify-email");

  const pet = user.pets[0];
  const badges = getBadges(user, pet);
  const earned = badges.filter((b) => b.earned).length;
  const level = trustLevel(user, pet);
  const pct = trustScore(user, pet);
  const idDone = user.kycStatus === "VERIFIED";

  return (
    <>
      <Nav user={user} active="account" />
      <section className="section authed-hero" style={{ paddingTop: 28 }}>
        <div className="container narrow" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Trust &amp; safety</span>
          <h1 className="h-sec" style={{ margin: "10px 0 6px" }}>Verification Center</h1>
          <p className="lead" style={{ marginBottom: 18 }}>
            Earn trust badges to stand out and keep everyone safe. Your documents stay private — others
            only ever see the badge, never the document.
          </p>

          {isBeta() && (
            <div className="beta-note" style={{ marginBottom: 16 }}>
              <span>🧪 <b>Beta:</b> verification is <b>simulated</b> for now — each badge approves instantly so you can explore. Real ID, phone &amp; health checks switch on before public launch.</span>
            </div>
          )}
          {sp.done && <div className="ok">✓ {sp.done}.</div>}
          {sp.error && <div className="err">{sp.error}</div>}

          <div className="card" style={{ marginBottom: 18 }}>
            <div className="spread">
              <div>
                <div className="muted" style={{ fontSize: ".78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px" }}>Your trust level</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--fg)", marginTop: 2 }}>
                  🛡 {level} <span className="muted" style={{ fontSize: ".9rem", fontWeight: 600 }}>· {TRUST_LEVEL_STYLE[level].blurb}</span>
                </div>
              </div>
              <span className={"chip " + TRUST_LEVEL_STYLE[level].chip} style={{ fontSize: "1rem" }}>{earned}/{badges.length} badges</span>
            </div>
            <div className="tprog" style={{ marginTop: 14 }}><span style={{ width: pct + "%" }} /></div>
            {!idDone && <p className="muted" style={{ fontSize: ".88rem", marginTop: 12 }}>🔑 Verify your <b>Government ID</b> to unlock browsing &amp; matches.</p>}
          </div>

          {idDone && (
            <Link href="/dashboard" className="btn btn-primary btn-block btn-lg" style={{ marginBottom: 18 }}>
              Continue to discover →
            </Link>
          )}

          <div className="grid-stagger" style={{ display: "grid", gap: 12 }}>
            {badges.map((b) => (
              <div key={b.key} className="card vstep">
                <div className="vstep-ic" aria-hidden>{b.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: "var(--fg)", display: "flex", alignItems: "center", gap: 8 }}>
                    {b.label}
                    <span className="chip" style={{ fontSize: ".7rem", padding: "2px 8px", background: "var(--muted)" }}>{b.group === "pet" ? "Pet" : "Owner"}</span>
                  </div>
                  <p className="muted" style={{ fontSize: ".9rem", marginTop: 2 }}>{b.earned ? b.desc : b.how}</p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {b.earned ? (
                    <span className="chip green">Verified ✓</span>
                  ) : (
                    <BadgeAction stepKey={b.key} hasPet={!!pet} />
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="muted" style={{ fontSize: ".82rem", marginTop: 16 }}>
            This is a demo: each step is simulated instantly. In production these are real checks —
            SMS OTP for phone, DigiLocker for ID, a liveness selfie, and a vet-document review for health.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}

function BadgeAction({ stepKey, hasPet }: { stepKey: string; hasPet: boolean }) {
  // ID uses the dedicated KYC route; the rest use /api/trust.
  if (stepKey === "id") {
    return (
      <form action="/api/verify" method="post">
        <button className="btn btn-primary btn-sm" type="submit">Verify ID</button>
      </form>
    );
  }
  if (stepKey === "social") {
    return (
      <form action="/api/trust" method="post" style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="hidden" name="step" value="social" />
        <input name="socialUrl" required placeholder="https://instagram.com/…" style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)", fontSize: ".85rem", width: 160 }} />
        <button className="btn btn-primary btn-sm" type="submit">Link</button>
      </form>
    );
  }
  if (stepKey === "microchip") {
    return (
      <form action="/api/trust" method="post" style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="hidden" name="step" value="microchip" />
        <input name="microchipLast4" inputMode="numeric" maxLength={4} required placeholder="Last 4" style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)", fontSize: ".85rem", width: 80 }} />
        <button className="btn btn-primary btn-sm" type="submit" disabled={!hasPet}>Add</button>
      </form>
    );
  }
  return (
    <form action="/api/trust" method="post">
      <input type="hidden" name="step" value={stepKey} />
      <button className="btn btn-primary btn-sm" type="submit" disabled={(stepKey === "health") && !hasPet}>Verify</button>
    </form>
  );
}
