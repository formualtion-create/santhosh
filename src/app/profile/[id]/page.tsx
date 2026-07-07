import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPet, getMatchId, getReputation, getReviews } from "@/lib/data";
import { distanceKm } from "@/lib/geo";
import { compatibility, type PetAttrs } from "@/lib/match";
import { Nav, Footer, VerifiedTick } from "@/components/ui";
import { BadgeRow, TrustLevelChip } from "@/components/TrustBadges";
import Map from "@/components/Map";

const SPECIES_LABEL: Record<string, string> = { DOG: "Dog", CAT: "Cat", RABBIT: "Rabbit", BIRD: "Bird", OTHER: "Other" };
const AGE_LABEL: Record<string, string> = { PUPPY: "Under 1 yr", YOUNG: "1–3 yrs", ADULT: "4–7 yrs", SENIOR: "8+ yrs" };
const INTENT_LABEL: Record<string, string> = { PLAYDATE: "Playdates", FRIENDSHIP: "Friendship", BREEDING: "Family planning", ALL: "Open to all" };

export default async function Profile(
  props: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.kycStatus !== "VERIFIED") redirect("/verify");

  const pet = await getPet(params.id);
  if (!pet || pet.user.kycStatus !== "VERIFIED") notFound();
  const ownerId = pet.user.id;
  const self = ownerId === user.id;
  const matchId = self ? null : await getMatchId(user.id, ownerId);

  const matched = self ? true : !!matchId;
  const photoBlurred = !self && !matched && pet.user.photoPrivacy === "MATCHED";
  const approx = !!pet.user.hideExactLocation && !self;

  const rawDist = distanceKm(user.lat ?? 12.97, user.lng ?? 77.59, pet.lat, pet.lng);
  const dist = approx ? Math.max(5, Math.round(rawDist / 5) * 5) : Math.round(rawDist);

  const myPet = user.pets[0];
  const petPet = { healthVerified: pet.healthVerified, microchipVerified: pet.microchipVerified };
  const comp = !self && myPet
    ? compatibility(myPet as PetAttrs, { species: pet.species, energy: pet.energy, size: pet.size, ageBand: pet.ageBand, intent: pet.intent, gender: pet.gender, vaccinated: pet.vaccinated, neutered: pet.neutered, interests: pet.interests, healthVerified: pet.healthVerified }, rawDist)
    : null;

  const [rep, reviews] = await Promise.all([getReputation(ownerId), getReviews(ownerId)]);
  const canReview = !self && matched;

  return (
    <>
      <Nav user={user} active="dashboard" />
      <section className="section authed-hero" style={{ paddingTop: 24 }}>
        <div className="container">
          <Link href="/dashboard" className="muted" style={{ fontWeight: 700 }}>← Back to discover</Link>
          {searchParams.matched && <div className="ok" style={{ marginTop: 14 }}>💚 It&apos;s a match! <Link href={`/chat/${searchParams.matched}`} className="text-acc" style={{ fontWeight: 800 }}>Start chatting →</Link></div>}
          {searchParams.reported && <div className="ok" style={{ marginTop: 14 }}>Thanks — our safety team will review this report.</div>}
          {searchParams.liked && <div className="ok" style={{ marginTop: 14 }}>♥ Liked! If they like {pet.name} back, you&apos;ll match.</div>}
          <div className="dash" style={{ gridTemplateColumns: "1.1fr .9fr", marginTop: 16, alignItems: "stretch" }}>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="pf-hero">
                {pet.photoUrl ? <img src={pet.photoUrl} alt={`${pet.name}, a ${SPECIES_LABEL[pet.species].toLowerCase()}`} className={photoBlurred ? "blurred" : ""} /> : <div className="pf-hero__ph">🐾</div>}
                <div className="pf-hero__scrim" aria-hidden />
                {photoBlurred && <span className="privlock" style={{ top: 14, left: 14, zIndex: 2 }}>🔒 Photo unlocks when you match</span>}
                {comp && <div className="pf-hero__score" title={`${comp.score}% compatibility`}><b>{comp.score}%</b><span>match</span></div>}
                <div className="pf-hero__cap">
                  <h1>{pet.name} <VerifiedTick /> <TrustLevelChip user={pet.user} pet={petPet} /></h1>
                  <p>{(pet.breed ? pet.breed + " · " : "") + SPECIES_LABEL[pet.species]} · {AGE_LABEL[pet.ageBand]} · {pet.city} · {approx ? "~" : ""}{dist} km away</p>
                </div>
              </div>
              <div className="pf-body">
                {comp && comp.reasons.length > 0 && (
                  <div className="pf-section">
                    <div className="pf-why">
                      <div className="pf-section__label">✨ Why you match</div>
                      <div className="row">{comp.reasons.map((r) => <span key={r} className="chip">{r}</span>)}</div>
                    </div>
                  </div>
                )}

                <div className="pf-section">
                  <div className="pf-section__label">Quick facts</div>
                  <div className="pf-stats">
                    <Stat k="Species" v={SPECIES_LABEL[pet.species]} />
                    <Stat k="Age" v={AGE_LABEL[pet.ageBand]} />
                    <Stat k="Energy" v={pet.energy === "HIGH" ? "High energy" : pet.energy === "LOW" ? "Calm" : "Balanced"} />
                    <Stat k="Looking for" v={INTENT_LABEL[pet.intent]} />
                    {pet.size && <Stat k="Size" v={pet.size[0] + pet.size.slice(1).toLowerCase()} />}
                    <Stat k="Gender" v={pet.gender === "MALE" ? "Male" : "Female"} />
                  </div>
                </div>

                <div className="pf-section">
                  <div className="pf-section__label">About {pet.name}</div>
                  {pet.bio ? <p>{pet.bio}</p> : <p className="muted">No bio yet.</p>}
                  {pet.favActivity && <p style={{ marginTop: 12, fontWeight: 600, color: "var(--fg)" }}>⭐ Favourite thing: {pet.favActivity}</p>}
                  {pet.temperament && <p className="muted" style={{ marginTop: 10, fontSize: ".92rem" }}>Temperament: {pet.temperament}</p>}
                </div>

                {pet.interests && (
                  <div className="pf-section">
                    <div className="pf-section__label">Their vibe</div>
                    <div className="row">
                      {pet.interests.split(",").map((t) => t.trim()).filter(Boolean).map((t) => <span key={t} className="chip honey">{t}</span>)}
                    </div>
                  </div>
                )}

                <div className="pf-section">
                  <div className="pf-section__label">Health &amp; safety</div>
                  <div className="pf-health">
                    <span className={"pf-health__item" + (pet.vaccinated ? " on" : "")}>💉 {pet.vaccinated ? "Vaccinated" : "Vaccination unconfirmed"}</span>
                    {pet.healthVerified && <span className="pf-health__item on">🩺 Vet health-verified</span>}
                    {pet.neutered && <span className="pf-health__item on">✂️ Neutered</span>}
                    {pet.microchipVerified && <span className="pf-health__item on">🆔 Microchip verified</span>}
                  </div>
                </div>

                <div className="pf-section">
                  <div className="pf-section__label">Verified badges</div>
                  <BadgeRow user={pet.user} pet={petPet} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
              <div className="card pf-connect">
                <h3 style={{ marginBottom: 10 }}>{matched ? "You're connected 🐾" : "Connect safely"}</h3>
                <p className="muted" style={{ fontSize: ".92rem", marginBottom: 14 }}>
                  {matched
                    ? `You and ${pet.name}'s family matched. Say hello — your chat is private and encrypted.`
                    : <>Parent-first &amp; consent-based — liking opens an encrypted chat only once {pet.name}&rsquo;s family likes you back.</>}
                </p>
                {self ? (
                  <p className="muted">This is your own profile.</p>
                ) : (
                  <>
                    {matched ? (
                      <Link href={`/chat/${matchId}`} className="btn btn-primary btn-block">💬 Message {pet.name}</Link>
                    ) : (
                      <form action="/api/swipe" method="post">
                        <input type="hidden" name="petId" value={pet.id} /><input type="hidden" name="action" value="LIKE" />
                        <input type="hidden" name="next" value={`/profile/${pet.id}?liked=1`} />
                        <button className="btn btn-primary btn-block" type="submit">♥ Like {pet.name}</button>
                      </form>
                    )}
                    <details style={{ marginTop: 12 }}>
                      <summary className="muted" style={{ cursor: "pointer", fontSize: ".9rem" }}>Report or block</summary>
                      <form action="/api/report" method="post" style={{ marginTop: 10 }}>
                        <input type="hidden" name="targetUserId" value={ownerId} /><input type="hidden" name="next" value={`/profile/${pet.id}`} />
                        <select name="reason" className="" style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)", marginBottom: 8 }}>
                          <option>Fake or suspicious profile</option><option>Harassment or abuse</option><option>Animal welfare concern</option><option>Spam or scam</option><option>Other</option>
                        </select>
                        <button className="btn btn-ghost btn-block btn-sm" type="submit">Submit report</button>
                      </form>
                      <form action="/api/block" method="post" style={{ marginTop: 8 }}>
                        <input type="hidden" name="targetUserId" value={ownerId} />
                        <button className="btn btn-danger btn-block btn-sm" type="submit">Block this member</button>
                      </form>
                    </details>
                  </>
                )}
              </div>
              <div>
                {(() => {
                  const jit = (v: number, s: number) => { let h = s; for (let i = 0; i < pet.id.length; i++) h = (h * 31 + pet.id.charCodeAt(i)) >>> 0; return v + (((h % 300) - 150) / 10000); };
                  const mLat = approx ? jit(pet.lat, 1) : pet.lat;
                  const mLng = approx ? jit(pet.lng, 7) : pet.lng;
                  return <Map center={[mLat, mLng]} radiusKm={approx ? 6 : Math.max(2, Math.min(dist, 25))} pins={[{ id: pet.id, name: pet.name, city: pet.city, lat: mLat, lng: mLng, species: SPECIES_LABEL[pet.species], score: 0 }]} />;
                })()}
                {approx && <p className="muted center" style={{ fontSize: ".8rem", marginTop: 6 }}>📍 Approximate area — exact location hidden by this member.</p>}
              </div>

              <div className="card">
                <div className="spread">
                  <h3>Reviews</h3>
                  {rep.count > 0 && <span className="chip honey">{stars(Math.round(rep.avg))} {rep.avg} · {rep.count}</span>}
                </div>
                {searchParams.reviewed && <div className="ok" style={{ marginTop: 10 }}>✓ Thanks for your review!</div>}
                {reviews.length === 0 ? (
                  <p className="muted" style={{ fontSize: ".9rem", marginTop: 8 }}>No reviews yet. Matches can leave the first one after a playdate.</p>
                ) : (
                  <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                    {reviews.map((r) => (
                      <div key={r.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <b style={{ fontSize: ".9rem" }}>{r.author.ownerName.split(" ")[0]}{r.author.pets[0] ? ` & ${r.author.pets[0].name}` : ""}</b>
                          <span style={{ color: "var(--honey)" }}>{stars(r.rating)}</span>
                        </div>
                        {r.comment && <p className="muted" style={{ fontSize: ".88rem", marginTop: 4 }}>{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {canReview && (
                  <form action="/api/review" method="post" style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                    <input type="hidden" name="subjectId" value={ownerId} />
                    <input type="hidden" name="next" value={`/profile/${pet.id}`} />
                    <label className="muted" style={{ fontSize: ".82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px" }}>Leave a review</label>
                    <select name="rating" required defaultValue="5" style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)", margin: "8px 0" }}>
                      <option value="5">★★★★★ Excellent</option>
                      <option value="4">★★★★ Great</option>
                      <option value="3">★★★ Good</option>
                      <option value="2">★★ Okay</option>
                      <option value="1">★ Poor</option>
                    </select>
                    <textarea name="comment" rows={2} maxLength={600} placeholder="How was the playdate?" style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)", marginBottom: 8 }} />
                    <button className="btn btn-primary btn-block btn-sm" type="submit">Submit review</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="pf-stat">
      <div className="pf-stat__k">{k}</div>
      <div className="pf-stat__v">{v}</div>
    </div>
  );
}

function stars(n: number) {
  const full = Math.max(0, Math.min(5, n));
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}
