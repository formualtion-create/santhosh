import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav, Footer } from "@/components/ui";
import { BadgeRow, TrustLevelChip } from "@/components/TrustBadges";
import { earnedBadges, getBadges } from "@/lib/trust";
import DeleteAccount from "@/components/DeleteAccount";
import LocationPicker from "@/components/LocationPicker";

export const dynamic = "force-dynamic";

export default async function Account(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const pet = user.pets[0];

  const blocks = await prisma.block.findMany({ where: { blockerId: user.id } });
  const blockedUsers = blocks.length
    ? await prisma.user.findMany({ where: { id: { in: blocks.map((b) => b.blockedId) } }, select: { id: true, ownerName: true } })
    : [];

  return (
    <>
      <Nav user={user} active="account" />
      <section className="section authed-hero" style={{ paddingTop: 28 }}>
        <div className="container narrow" style={{ maxWidth: 720 }}>
          <h1 className="h-sec" style={{ marginBottom: 18 }}>My account</h1>

          {searchParams.photo && <div className="ok">✓ Pet photo updated.</div>}
          {searchParams.location && <div className="ok">✓ Location updated. Nearby matches will refresh.</div>}
          {searchParams.unblocked && <div className="ok">✓ Member unblocked.</div>}
          {searchParams.privacy && <div className="ok">✓ Privacy settings saved.</div>}
          {searchParams.notif && <div className="ok">✓ Notification settings saved.</div>}
          {searchParams.error && <div className="err">{searchParams.error}</div>}

          <div className="card" style={{ marginBottom: 18 }}>
            <div className="spread">
              <h3>Profile</h3>
              <span className={"chip " + (user.kycStatus === "VERIFIED" ? "acc" : "honey")}>
                {user.kycStatus === "VERIFIED" ? "✓ Verified" : "Verification " + user.kycStatus.toLowerCase().replace("_", " ")}
              </span>
            </div>
            <div className="grid g2" style={{ marginTop: 14, gap: 12 }}>
              <Field k="Name" v={user.ownerName} /><Field k="Email" v={user.email} />
              <Field k="Phone" v={user.phone} /><Field k="City" v={user.city} />
              <Field k="ID on file" v={user.kycDocRef || "—"} /><Field k="Plan" v={user.plan[0] + user.plan.slice(1).toLowerCase()} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <h3 style={{ marginBottom: 6 }}>Location</h3>
            <p className="muted" style={{ fontSize: ".92rem", marginBottom: 14 }}>Moved, or set the wrong spot at signup? Update your city and exact location — we use it to find nearby companions and show distances.</p>
            <form action="/api/account/location" method="post">
              <LocationPicker
                initialCity={user.city}
                initialPos={user.lat != null && user.lng != null ? [user.lat, user.lng] : undefined}
              />
              <button className="btn btn-primary btn-sm" type="submit" style={{ marginTop: 6 }}>Save location</button>
            </form>
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <div className="spread">
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>Verification &amp; trust <TrustLevelChip user={user} pet={pet} /></h3>
              <span className="muted" style={{ fontWeight: 700, fontSize: ".85rem" }}>{earnedBadges(user, pet).length}/{getBadges(user, pet).length} badges</span>
            </div>
            <p className="muted" style={{ fontSize: ".92rem", margin: "8px 0 12px" }}>The more you verify, the more matches trust you. Documents stay private — others only see the badge.</p>
            <BadgeRow user={user} pet={pet} showAll />
            <Link href="/verify" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>Open Verification Center →</Link>
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <h3 style={{ marginBottom: 6 }}>Privacy controls</h3>
            <p className="muted" style={{ fontSize: ".92rem", marginBottom: 14 }}>Decide what other members can see before you match.</p>
            <form action="/api/account/privacy" method="post">
              <label className="check" style={{ alignItems: "flex-start" }}>
                <input type="checkbox" name="photoPrivacy" value="MATCHED" defaultChecked={user.photoPrivacy === "MATCHED"} />
                <span><b>Blur my pet&apos;s photo until we match.</b><br /><span className="muted" style={{ fontSize: ".88rem" }}>Your photo shows clearly only after a mutual match.</span></span>
              </label>
              <label className="check" style={{ alignItems: "flex-start", marginTop: 6 }}>
                <input type="checkbox" name="hideExactLocation" defaultChecked={user.hideExactLocation} />
                <span><b>Hide my exact location.</b><br /><span className="muted" style={{ fontSize: ".88rem" }}>Show only my city and an approximate distance on the map.</span></span>
              </label>
              <button className="btn btn-primary btn-sm" type="submit" style={{ marginTop: 12 }}>Save privacy settings</button>
            </form>
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <h3 style={{ marginBottom: 6 }}>Notifications</h3>
            <p className="muted" style={{ fontSize: ".92rem", marginBottom: 14 }}>Choose which push notifications you&apos;d like to receive.</p>
            <form action="/api/account/notifications" method="post">
              <label className="check"><input type="checkbox" name="notifyMatches" defaultChecked={user.notifyMatches} /> New matches</label>
              <label className="check"><input type="checkbox" name="notifyMessages" defaultChecked={user.notifyMessages} /> New messages</label>
              <label className="check"><input type="checkbox" name="notifyTips" defaultChecked={user.notifyTips} /> Daily care tips &amp; thoughts</label>
              <button className="btn btn-primary btn-sm" type="submit" style={{ marginTop: 10 }}>Save notification settings</button>
            </form>
          </div>

          {pet && (
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 12 }}>{pet.name}&apos;s photo</h3>
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: 110, height: 110, borderRadius: 18, overflow: "hidden", background: "var(--muted)", flexShrink: 0 }}>
                  {pet.photoUrl ? <img src={pet.photoUrl} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "grid", placeItems: "center", height: "100%", fontSize: 40 }}>🐾</div>}
                </div>
                <form action="/api/pet/photo" method="post" encType="multipart/form-data" style={{ flex: 1, minWidth: 220 }}>
                  <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required style={{ marginBottom: 10, width: "100%" }} />
                  <p className="hint" style={{ marginBottom: 10 }}>JPG, PNG or WebP · up to 5 MB.</p>
                  <button className="btn btn-primary btn-sm" type="submit">Upload photo</button>
                </form>
              </div>
            </div>
          )}

          {blockedUsers.length > 0 && (
            <div className="card" style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 10 }}>Blocked members</h3>
              {blockedUsers.map((b) => (
                <div key={b.id} className="spread" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{b.ownerName}</span>
                  <form action="/api/unblock" method="post"><input type="hidden" name="blockedId" value={b.id} /><button className="btn btn-ghost btn-sm" type="submit">Unblock</button></form>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ marginBottom: 18 }}>
            <h3 style={{ marginBottom: 8 }}>Your privacy rights (DPDP Act 2023)</h3>
            <p className="muted" style={{ fontSize: ".92rem", marginBottom: 14 }}>Access a copy of your data, or permanently erase your account at any time.</p>
            <div className="row">
              <a className="btn btn-ghost btn-sm" href="/api/account/export">⬇ Export my data</a>
              <Link className="btn btn-ghost btn-sm" href="/legal/privacy">Privacy policy</Link>
              <Link className="btn btn-ghost btn-sm" href="/legal/grievance">Grievance officer</Link>
            </div>
          </div>

          <div className="card danger-zone">
            <h3 style={{ marginBottom: 6, color: "var(--danger)" }}>Delete account</h3>
            <p className="muted" style={{ fontSize: ".92rem", marginBottom: 14 }}>This permanently erases your account, pet profile, matches and messages. This cannot be undone.</p>
            <DeleteAccount />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: ".78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>{k}</div>
      <div style={{ fontWeight: 600 }}>{v}</div>
    </div>
  );
}
