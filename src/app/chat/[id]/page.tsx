import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMatchThread } from "@/lib/data";
import { Nav, Footer } from "@/components/ui";
import ChatThread from "@/components/ChatThread";

export const dynamic = "force-dynamic";

export default async function Chat(props: { params: Promise<{ id: string }>; searchParams: Promise<{ checkin?: string; error?: string }> }) {
  const params = await props.params;
  const sp = await props.searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.kycStatus !== "VERIFIED") redirect("/verify");

  const thread = await getMatchThread(params.id, user.id);
  if (!thread) notFound();
  const otherName = thread.other?.pets[0]?.name || thread.other?.ownerName || "Member";

  return (
    <>
      <Nav user={user} active="matches" />
      <section className="section authed-hero" style={{ paddingTop: 24 }}>
        <div className="container narrow" style={{ maxWidth: 640 }}>
          <Link href="/matches" className="muted" style={{ fontWeight: 700 }}>← All matches</Link>
          <div className="card" style={{ marginTop: 14, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden", background: "var(--muted)" }}>
                {thread.other?.pets[0]?.photoUrl ? <img src={thread.other.pets[0].photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "grid", placeItems: "center", height: "100%" }}>🐾</div>}
              </div>
              <b style={{ fontFamily: "var(--font-d)", color: "var(--fg)" }}>{otherName}</b>
              <span className="chip acc" style={{ marginLeft: "auto" }}>Encrypted</span>
            </div>

            <ChatThread
              matchId={thread.match.id}
              me={user.id}
              otherName={otherName}
              otherAvatar={thread.other?.pets[0]?.photoUrl || null}
              initial={thread.messages.map((m) => ({ id: m.id, senderId: m.senderId, body: m.body, imageUrl: (m as { imageUrl?: string | null }).imageUrl, flagged: (m as { flagged?: boolean }).flagged, createdAt: (m as { createdAt?: Date }).createdAt?.toISOString() }))}
            />
          </div>

          {sp.checkin ? (
            <div className="card" style={{ marginTop: 12, borderLeft: "4px solid var(--success)" }}>
              <h3 style={{ marginBottom: 6 }}>🛟 Safety check-in created</h3>
              <p className="muted" style={{ fontSize: ".9rem", marginBottom: 10 }}>Share this private link with a friend or family member so they can look out for you:</p>
              <input readOnly value={`/safety/checkin/${sp.checkin}`}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)", background: "var(--muted)", fontSize: ".85rem" }} />
              <Link href={`/safety/checkin/${sp.checkin}`} className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>Open check-in →</Link>
            </div>
          ) : (
            <details className="card" style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--fg)" }}>🛟 Plan a safe playdate</summary>
              <p className="muted" style={{ fontSize: ".88rem", margin: "10px 0" }}>Create a check-in you can share with a trusted contact. They&apos;ll see where &amp; when you&apos;re meeting and can confirm you&apos;re safe.</p>
              <form action="/api/checkin" method="post" style={{ display: "grid", gap: 8 }}>
                <input type="hidden" name="next" value={`/chat/${thread.match.id}`} />
                <input type="hidden" name="withName" value={otherName} />
                <input name="place" required placeholder="Where are you meeting? e.g. Cubbon Park" style={{ padding: "10px 12px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)" }} />
                <input name="meetAt" type="datetime-local" style={{ padding: "10px 12px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)" }} />
                <button className="btn btn-primary btn-sm" type="submit">Create check-in link</button>
              </form>
            </details>
          )}
          <div className="card" style={{ marginTop: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", borderLeft: "4px solid var(--primary)" }}>
            <span aria-hidden style={{ fontSize: "1.2rem" }}>🛡</span>
            <p className="muted" style={{ fontSize: ".84rem", margin: 0 }}>
              <b style={{ color: "var(--fg)" }}>Stay safe:</b> keep chats &amp; payments on PawsPair, meet first in a public place, and never pay an advance for a pet you haven&apos;t met. You can report or block from their profile. <Link href="/safety" className="text-acc" style={{ fontWeight: 700 }}>Safety tips →</Link>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
