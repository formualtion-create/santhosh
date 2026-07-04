import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMatches } from "@/lib/data";
import { Nav, Footer } from "@/components/ui";

export const dynamic = "force-dynamic";

// Compact relative time for the last-message stamp (locale-aware fallback for older).
function relTime(d?: Date | null): string {
  if (!d) return "";
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 604800) return Math.floor(s / 86400) + "d";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const SPECIES: Record<string, string> = { DOG: "Dog", CAT: "Cat", RABBIT: "Rabbit", BIRD: "Bird", OTHER: "Pet" };

export default async function Matches() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.kycStatus !== "VERIFIED") redirect("/verify");
  const matches = await getMatches(user.id);

  const awaiting = matches.filter((m) => m.lastMessage && m.lastMessage.senderId !== user.id).length;

  return (
    <>
      <Nav user={user} active="matches" />
      <section className="section authed-hero" style={{ paddingTop: 28 }}>
        <div className="container narrow" style={{ maxWidth: 680 }}>
          <div className="spread" style={{ marginBottom: 6, alignItems: "flex-end" }}>
            <h1 className="h-sec" style={{ margin: 0 }}>Your matches</h1>
            {awaiting > 0 && <span className="chip acc" aria-label={`${awaiting} awaiting your reply`}>💬 {awaiting} awaiting you</span>}
          </div>
          <p className="muted" style={{ marginBottom: 20 }}>
            {matches.length} mutual {matches.length === 1 ? "connection" : "connections"}. Say hello 🐾
          </p>

          {matches.length === 0 ? (
            <div className="card center" style={{ padding: "40px 26px" }}>
              <div style={{ fontSize: 52, marginBottom: 10 }}>🐾</div>
              <h3 style={{ fontSize: "1.25rem" }}>No matches yet</h3>
              <p className="muted" style={{ marginTop: 8, maxWidth: 380, marginInline: "auto" }}>
                When you and another verified member like each other, your conversation opens up right here. Start by discovering companions near you.
              </p>
              <Link href="/dashboard" className="btn btn-primary btn-lg" style={{ marginTop: 18 }}>Discover companions →</Link>
            </div>
          ) : (
            <ul className="matchlist grid-stagger" aria-label="Your matches">
              {matches.map((m) => {
                const name = m.other.pets[0]?.name || m.other.ownerName;
                const species = m.other.pets[0]?.species ? SPECIES[m.other.pets[0].species] || "Pet" : "Pet";
                const lm = m.lastMessage;
                const mine = !!lm && lm.senderId === user.id;
                const theirTurn = !!lm && !mine;
                const preview = lm ? (lm.imageUrl ? "📷 Photo" : lm.body) : null;
                return (
                  <li key={m.matchId}>
                    <Link href={`/chat/${m.matchId}`} className="matchrow" aria-label={`Open chat with ${name}`}>
                      <div className={"matchrow__av" + (!lm ? " is-new" : "")}>
                        {m.other.pets[0]?.photoUrl
                          ? <img src={m.other.pets[0].photoUrl} alt="" loading="lazy" />
                          : <span aria-hidden>🐾</span>}
                      </div>
                      <div className="matchrow__body">
                        <div className="matchrow__top">
                          <b className="matchrow__name">{name}</b>
                          <span className="matchrow__vf" title="Verified member">✓</span>
                          <span className="matchrow__sp">{species}</span>
                          <span className="matchrow__time">{lm ? relTime(lm.createdAt) : ""}</span>
                        </div>
                        <div className="matchrow__preview">
                          {!lm ? (
                            <span className="chip honey" style={{ fontSize: ".76rem" }}>✨ New match — say hello</span>
                          ) : (
                            <span className={theirTurn ? "matchrow__unread" : "muted"}>
                              {mine ? "You: " : ""}{preview}
                            </span>
                          )}
                        </div>
                      </div>
                      {theirTurn && <span className="matchrow__dot" aria-hidden title="Their turn — reply" />}
                      <span className="matchrow__go" aria-hidden>→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
