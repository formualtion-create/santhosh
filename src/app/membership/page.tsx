import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Nav, Footer } from "@/components/ui";
import { razorpayEnabled } from "@/lib/razorpay";

const PLANS = [
  { id: "SNIFF", name: "Sniff", price: "Free", sub: "forever", emoji: "🐾", feats: ["1 verified pet profile", "15 introductions / day", "Daily Paw of the Day", "Encrypted conversations"] },
  { id: "FETCH", name: "Fetch", price: "₹499", sub: "/month", emoji: "⭐", popular: true, feats: ["Everything in Sniff", "Unlimited introductions", "See who liked you", "Advanced filters & boost", "Spotlights & travel mode"] },
  { id: "PEDIGREE", name: "Pedigree", price: "₹1,299", sub: "/month", emoji: "👑", feats: ["Everything in Fetch", "Up to 5 pet profiles", "Verified pro badge", "Concierge family-planning support", "Premier placement"] },
];

export default async function Membership(props: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Nav user={user} active="membership" />
      <section className="section authed-hero" style={{ paddingTop: 28 }}>
        <div className="container">
          <div className="center" style={{ marginBottom: 26 }}>
            <span className="eyebrow">Membership</span>
            <h1 className="h-sec">Start free. Upgrade when you&apos;re ready.</h1>
            <p className="lead">You&apos;re on the <b>{user.plan[0] + user.plan.slice(1).toLowerCase()}</b> plan{user.planRenewsAt ? `, renewing ${new Date(user.planRenewsAt).toLocaleDateString("en-IN")}` : ""}. Change or cancel anytime — no lock-in.</p>
          </div>

          {searchParams.ok && <div className="ok">✓ You&apos;re now on the {searchParams.ok[0] + searchParams.ok.slice(1).toLowerCase()} plan. (Simulated — no payment was taken.)</div>}
          {searchParams.error && <div className="err">{searchParams.error}</div>}

          <div className="grid g3 grid-stagger" style={{ alignItems: "stretch" }}>
            {PLANS.map((p) => {
              const current = user.plan === p.id;
              return (
                <div key={p.id} className={"card plan" + (p.popular ? " plan--pop" : "")}>
                  {p.popular && <span className="plan__ribbon">★ Most chosen</span>}
                  <h3 style={{ fontSize: "1.4rem" }}>{p.emoji} {p.name}</h3>
                  <div style={{ fontFamily: "var(--font-d)", fontWeight: 900, fontSize: "2.4rem", color: "var(--fg)", margin: "6px 0 12px" }}>
                    {p.price}<span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--muted-text)" }}>{p.sub}</span>
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, flex: 1, marginBottom: 16 }}>
                    {p.feats.map((ft) => (
                      <li key={ft} style={{ display: "flex", gap: 8, fontSize: ".94rem" }}>
                        <span className="tick" style={{ flexShrink: 0 }}><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg></span>{ft}
                      </li>
                    ))}
                  </ul>
                  {current ? (
                    <button className="btn btn-ghost btn-block" disabled>✓ Current plan</button>
                  ) : (
                    <form action="/api/subscribe" method="post">
                      <input type="hidden" name="plan" value={p.id} />
                      <button className={"btn btn-block " + (p.popular ? "btn-primary" : "btn-ghost")} type="submit">{p.id === "SNIFF" ? "Switch to Sniff" : `Choose ${p.name}`}</button>
                    </form>
                  )}
                  {p.id !== "SNIFF" && <p className="plan__reassure">GST invoice included · cancel anytime</p>}
                </div>
              );
            })}
          </div>

          <div className="card" style={{ marginTop: 26 }}>
            <h3 style={{ marginBottom: 10 }}>Billing &amp; compliance</h3>
            <ul style={{ listStyle: "disc", paddingLeft: 20, color: "var(--muted-text)", display: "grid", gap: 6, fontSize: ".92rem" }}>
              <li>All prices are in INR and <b>inclusive of GST</b> (18%) as applicable under Indian law. A GST invoice is issued for every paid transaction.</li>
              <li>Paid plans <b>auto-renew monthly</b>. As required by RBI e-mandate rules, you are notified 24 hours before each renewal and may cancel anytime from this page.</li>
              <li>Cancellation and refunds are governed by our <Link href="/legal/refund" className="text-acc" style={{ fontWeight: 700 }}>Cancellation &amp; Refund Policy</Link>, aligned with the Consumer Protection Act, 2019.</li>
              <li>Payments are processed by a PCI-DSS-compliant gateway (e.g. Razorpay). PawsPair never stores your card details.</li>
              {razorpayEnabled() ? (
                <li><b>Live payments enabled.</b> Choosing a paid plan opens secure Razorpay checkout; your plan activates once payment is confirmed.</li>
              ) : (
                <li><b>Demo mode.</b> No real payment is collected; selecting a plan only updates your demo account. Add Razorpay keys to enable live checkout.</li>
              )}
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
