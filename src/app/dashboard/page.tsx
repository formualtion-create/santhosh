import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDiscoverPets, pawOfTheDay } from "@/lib/data";
import { logEvent } from "@/lib/events";
import { Nav, Footer, VerifiedTick } from "@/components/ui";
import { TrustLevelChip } from "@/components/TrustBadges";
import Map from "@/components/Map";
import NotificationOptIn from "@/components/NotificationOptIn";

const SPECIES_LABEL: Record<string, string> = { DOG: "Dog", CAT: "Cat", RABBIT: "Rabbit", BIRD: "Bird", OTHER: "Other" };
const AGE_LABEL: Record<string, string> = { PUPPY: "Under 1 yr", YOUNG: "1–3 yrs", ADULT: "4–7 yrs", SENIOR: "8+ yrs" };
const INTENT_LABEL: Record<string, string> = { PLAYDATE: "Playdates", FRIENDSHIP: "Friendship", BREEDING: "Family planning", ALL: "Open to all" };
const SORTS: { v: string; label: string }[] = [{ v: "score", label: "Best match" }, { v: "distance", label: "Nearest" }, { v: "newest", label: "Newest" }];

function energyLabel(e: string) { return e === "HIGH" ? "High energy" : e === "LOW" ? "Calm" : "Balanced"; }

function SwipeBtns({ petId, next }: { petId: string; next: string }) {
  return (
    <div className="row" style={{ gap: 8, padding: "0 18px 16px" }}>
      <form action="/api/swipe" method="post" style={{ flex: 1 }}>
        <input type="hidden" name="petId" value={petId} /><input type="hidden" name="action" value="PASS" /><input type="hidden" name="next" value={next} />
        <button className="btn btn-ghost btn-block btn-sm" type="submit" aria-label="Pass">Pass</button>
      </form>
      <form action="/api/swipe" method="post" style={{ flex: 1 }}>
        <input type="hidden" name="petId" value={petId} /><input type="hidden" name="action" value="LIKE" /><input type="hidden" name="next" value={next} />
        <button className="btn btn-primary btn-block btn-sm" type="submit" aria-label="Like">♥ Like</button>
      </form>
    </div>
  );
}

export default async function Dashboard(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerified) redirect("/verify-email");
  if (user.kycStatus !== "VERIFIED") redirect("/verify");

  const maxKmRaw = searchParams.maxKm ? Number(searchParams.maxKm) : 3000;
  const f = {
    species: searchParams.species || undefined,
    intent: searchParams.intent || undefined,
    energy: searchParams.energy || undefined,
    maxKm: maxKmRaw >= 3000 ? undefined : maxKmRaw,
    q: searchParams.q || undefined,
    sort: searchParams.sort || "score",
  };
  // Capture what members are actually searching/filtering for.
  if (f.q || f.species || f.intent || f.energy || f.maxKm) {
    logEvent("search", { userId: user.id, meta: { q: f.q, species: f.species, intent: f.intent, energy: f.energy, maxKm: f.maxKm, sort: f.sort } });
  }

  const [pets, potd] = await Promise.all([
    getDiscoverPets({ id: user.id, lat: user.lat, lng: user.lng }, f),
    pawOfTheDay({ id: user.id, lat: user.lat, lng: user.lng }),
  ]);
  const center: [number, number] = [user.lat ?? 12.9716, user.lng ?? 77.5946];
  const pins = pets.map((p) => ({ id: p.id, name: p.name, city: p.city, lat: p.lat, lng: p.lng, species: SPECIES_LABEL[p.species] || p.species, score: p.score }));

  // Build clean querystrings for filter chips / sort links (drops one-shot flash params).
  const NOISE = ["matched", "blocked", "reported", "welcome"];
  const cleanParams = () => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v && !NOISE.includes(k)) u.set(k, String(v));
    return u;
  };
  const urlWith = (key: string, val: string) => {
    const u = cleanParams();
    if (val) u.set(key, val); else u.delete(key);
    const s = u.toString();
    return "/dashboard" + (s ? "?" + s : "");
  };
  const urlWithout = (key: string) => urlWith(key, "");
  const nextUrl = urlWith("_", ""); // current filter state, for swipe returns

  // Active filters, as removable chips.
  const activeChips: { label: string; removeUrl: string }[] = [];
  if (f.q) activeChips.push({ label: `“${f.q}”`, removeUrl: urlWithout("q") });
  if (f.species) activeChips.push({ label: SPECIES_LABEL[f.species] || f.species, removeUrl: urlWithout("species") });
  if (f.intent) activeChips.push({ label: INTENT_LABEL[f.intent] || f.intent, removeUrl: urlWithout("intent") });
  if (f.energy) activeChips.push({ label: energyLabel(f.energy), removeUrl: urlWithout("energy") });
  if (f.maxKm) activeChips.push({ label: `Within ${f.maxKm} km`, removeUrl: urlWithout("maxKm") });

  return (
    <>
      <Nav user={user} active="dashboard" />
      <section className="section authed-hero" style={{ paddingTop: 28 }}>
        <div className="container">
          <NotificationOptIn />
          {searchParams.welcome && <div className="ok" style={{ marginBottom: 14 }}>🎉 You&apos;re verified, {user.ownerName.split(" ")[0]}! Welcome to the club.</div>}
          {searchParams.matched && <div className="ok" style={{ marginBottom: 14 }}>💚 It&apos;s a match! <Link href={`/chat/${searchParams.matched}`} className="text-acc" style={{ fontWeight: 800 }}>Say hello →</Link></div>}
          {searchParams.blocked && <div className="ok" style={{ marginBottom: 14 }}>Member blocked. You won&apos;t see each other again.</div>}
          {searchParams.reported && <div className="ok" style={{ marginBottom: 14 }}>Thanks — our safety team will review this report.</div>}

          <div className="spread" style={{ marginBottom: 22 }}>
            <div>
              <h1 className="h-sec">Discover companions</h1>
              <p className="muted">Verified pets near {user.city} 🐾</p>
            </div>
            <span className="badge-verified"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg> Verified member</span>
          </div>

          <div className="dash">
            <aside className="sticky">
              <form className="card" method="get" action="/dashboard">
                <h3 style={{ marginBottom: 14 }}>Filters</h3>
                <div className="field"><label htmlFor="q">Search</label><input id="q" name="q" defaultValue={f.q} placeholder="Name, breed or city" /></div>
                <div className="field"><label htmlFor="species">Species</label>
                  <select id="species" name="species" defaultValue={f.species || ""}><option value="">Any</option>{Object.entries(SPECIES_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                </div>
                <div className="field"><label htmlFor="intent">Looking for</label>
                  <select id="intent" name="intent" defaultValue={f.intent || ""}><option value="">Any</option><option value="PLAYDATE">Playdates</option><option value="FRIENDSHIP">Friendship</option><option value="BREEDING">Family planning</option></select>
                </div>
                <div className="field"><label htmlFor="energy">Energy</label>
                  <select id="energy" name="energy" defaultValue={f.energy || ""}><option value="">Any</option><option value="LOW">Calm</option><option value="MEDIUM">Balanced</option><option value="HIGH">High energy</option></select>
                </div>
                <input type="hidden" name="sort" value={f.sort} />
                <div className="field"><label htmlFor="maxKm">Max distance: {maxKmRaw >= 3000 ? "Any" : maxKmRaw + " km"}</label>
                  <input id="maxKm" name="maxKm" type="range" min={25} max={3000} step={25} defaultValue={maxKmRaw} style={{ minHeight: "auto", padding: 0 }} />
                </div>
                <button className="btn btn-primary btn-block" type="submit">Apply filters</button>
                <Link href="/dashboard" className="btn btn-ghost btn-block btn-sm" style={{ marginTop: 8 }}>Reset</Link>
              </form>
            </aside>

            <div>
              {potd && (
                <div className="card" style={{ marginBottom: 22, padding: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "180px 1fr" }}>
                  <div style={{ background: "var(--muted)" }}>
                    {potd.photoUrl ? <img src={potd.photoUrl} alt={potd.name} style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 160 }} /> : <div style={{ display: "grid", placeItems: "center", height: "100%", fontSize: 44 }}>🐾</div>}
                  </div>
                  <div style={{ padding: 20 }}>
                    <span className="chip honey">⭐ Paw of the Day</span>
                    <h3 style={{ margin: "8px 0 2px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>{potd.name} <VerifiedTick /> <TrustLevelChip user={potd.ownerVerify} pet={{ healthVerified: potd.healthVerified, microchipVerified: potd.microchipVerified }} /> <span className="chip green">{potd.score}% match</span></h3>
                    <p className="muted" style={{ fontSize: ".92rem" }}>{(potd.breed ? potd.breed + " · " : "") + AGE_LABEL[potd.ageBand]} · {potd.approxLocation ? "~" : ""}{potd.distanceKm} km away</p>
                    {potd.reasons && potd.reasons.length > 0 && <p style={{ fontSize: ".86rem", marginTop: 6, color: "var(--primary-600)", fontWeight: 600 }}>✨ {potd.reasons.slice(0, 2).join(" · ")}</p>}
                    <div className="row" style={{ marginTop: 12 }}>
                      <Link href={`/profile/${potd.id}`} className="btn btn-ghost btn-sm">View profile</Link>
                      <form action="/api/swipe" method="post"><input type="hidden" name="petId" value={potd.id} /><input type="hidden" name="action" value="LIKE" /><input type="hidden" name="next" value={nextUrl} /><button className="btn btn-primary btn-sm" type="submit">♥ Like</button></form>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 22 }}><Map center={center} radiusKm={f.maxKm || 50} pins={pins} /></div>

              <div className="resultbar">
                <span className="resultbar__count"><b>{pets.length}</b> {pets.length === 1 ? "companion" : "companions"} to meet</span>
                <nav className="sortseg" aria-label="Sort results">
                  {SORTS.map((s) => (
                    <Link key={s.v} href={urlWith("sort", s.v)} className={f.sort === s.v ? "on" : ""} aria-current={f.sort === s.v ? "true" : undefined}>{s.label}</Link>
                  ))}
                </nav>
              </div>

              {activeChips.length > 0 && (
                <div className="fchips">
                  <span className="fchips__label">Filters:</span>
                  {activeChips.map((c) => (
                    <Link key={c.label} href={c.removeUrl} className="fchip" aria-label={`Remove filter ${c.label}`}>
                      {c.label} <span className="fchip__x" aria-hidden>×</span>
                    </Link>
                  ))}
                  <Link href="/dashboard" className="fchip fchip--clear">Clear all</Link>
                </div>
              )}

              {pets.length === 0 ? (
                <div className="card center">
                  <div style={{ fontSize: 44, marginBottom: 8 }}>🐾</div>
                  <h3>You&apos;re all caught up</h3>
                  <p className="muted" style={{ marginTop: 6 }}>You&apos;ve seen everyone matching these filters. Widen your filters or distance, or check back soon.</p>
                  <Link href="/dashboard" className="btn btn-ghost" style={{ marginTop: 12 }}>Reset filters</Link>
                </div>
              ) : (
                <div className="grid g3 grid-stagger">
                  {pets.map((p) => (
                    <div key={p.id} className="pcard">
                      <Link href={`/profile/${p.id}`} aria-label={`View ${p.name}'s profile`}>
                        <div className="ph">
                          {p.photoUrl ? <img src={p.photoUrl} alt={p.name} className={p.photoBlurred ? "blurred" : ""} /> : <div style={{ display: "grid", placeItems: "center", height: "100%", fontSize: 48 }}>🐾</div>}
                          {p.photoBlurred && <span className="privlock" title="Photo unlocks when you match">🔒 Private</span>}
                          <span className="score">{p.score}% match</span>
                        </div>
                        <div className="pb">
                          <h3 style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>{p.name} <VerifiedTick /> <TrustLevelChip user={p.ownerVerify} pet={{ healthVerified: p.healthVerified, microchipVerified: p.microchipVerified }} /></h3>
                          <p className="pcard__meta">{(p.breed ? p.breed + " · " : "") + AGE_LABEL[p.ageBand]} · 📍 {p.approxLocation ? "~" : ""}{p.distanceKm} km</p>
                          {p.reasons && p.reasons.length > 0 && <p style={{ fontSize: ".82rem", marginTop: 6, color: "var(--primary-600)", fontWeight: 600 }}>✨ {p.reasons[0]}</p>}
                          <span className="pcard__intent">🎯 Looking for {INTENT_LABEL[p.intent] || "companionship"}</span>
                          <div className="row" style={{ marginTop: 10 }}>
                            <span className="chip acc">{SPECIES_LABEL[p.species]}</span>
                            {p.healthVerified ? <span className="chip green">🩺 Health-verified</span> : p.vaccinated && <span className="chip green">Vaccinated</span>}
                            <span className="chip honey">{energyLabel(p.energy)}</span>
                          </div>
                        </div>
                      </Link>
                      <SwipeBtns petId={p.id} next={nextUrl} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
