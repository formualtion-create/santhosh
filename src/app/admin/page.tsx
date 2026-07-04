import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav, Footer } from "@/components/ui";

export const dynamic = "force-dynamic";

function Act({ action, id, label, danger }: { action: string; id: string; label: string; danger?: boolean }) {
  return (
    <form action="/api/admin" method="post" style={{ display: "inline" }}>
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="id" value={id} />
      <button className={"btn btn-sm " + (danger ? "btn-danger" : "btn-ghost")} type="submit">{label}</button>
    </form>
  );
}

export default async function Admin(props: { searchParams: Promise<{ sent?: string; done?: string }> }) {
  const searchParams = await props.searchParams;
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (me.role !== "ADMIN") redirect("/dashboard");

  const [pending, reports, members, subscribers, subCount, stories, eventTotal, eventsByType, recentEvents] = await Promise.all([
    prisma.user.findMany({ where: { kycStatus: { in: ["IN_REVIEW", "PENDING"] } }, orderBy: { createdAt: "desc" } }),
    prisma.report.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, ownerName: true, email: true, kycStatus: true, bannedAt: true, role: true } }),
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 25 }),
    prisma.subscriber.count(),
    prisma.storySubmission.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 40 }),
    prisma.event.count(),
    prisma.event.groupBy({ by: ["type"], _count: { type: true } }),
    prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
  ]);
  const pendingStories = stories.filter((s) => s.status === "PENDING");
  const eventCounts = eventsByType.map((e) => ({ type: e.type, n: e._count.type })).sort((a, b) => b.n - a.n);

  return (
    <>
      <Nav user={me} />
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <h1 className="h-sec" style={{ marginBottom: 4 }}>Admin · Moderation</h1>
          <p className="muted" style={{ marginBottom: 18 }}>Approve verifications, action reports, manage members and engage your community.</p>

          {searchParams.sent !== undefined && <div className="ok" style={{ marginBottom: 18 }}>✓ Daily thought push sent to {searchParams.sent} member{searchParams.sent === "1" ? "" : "s"} with notifications enabled.</div>}

          <div className="card" style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ marginBottom: 2 }}>💜 Thought of the day</h3>
              <p className="muted" style={{ fontSize: ".9rem" }}>Push today&apos;s love &amp; care thought to all members who enabled notifications. (Schedule daily in production via <code>/api/cron/daily-thought</code>.)</p>
            </div>
            <form action="/api/admin" method="post"><input type="hidden" name="action" value="send-thought" /><button className="btn btn-primary btn-sm" type="submit">Send now</button></form>
          </div>

          <h3 style={{ marginBottom: 10 }}>Pending verification ({pending.length})</h3>
          <div className="card" style={{ marginBottom: 24 }}>
            {pending.length === 0 ? <p className="muted">Nothing awaiting review.</p> : pending.map((u) => (
              <div key={u.id} className="spread" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div><b style={{ fontFamily: "var(--font-d)" }}>{u.ownerName}</b> <span className="muted">· {u.email} · {u.kycDocRef}</span></div>
                <div className="row"><Act action="verify" id={u.id} label="Approve" /><Act action="reject" id={u.id} label="Reject" danger /></div>
              </div>
            ))}
          </div>

          <div className="spread" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Happy Tails — story submissions {pendingStories.length > 0 && <span className="chip honey">{pendingStories.length} new</span>}</h3>
          </div>
          <div className="card" style={{ marginBottom: 24 }}>
            {stories.length === 0 ? <p className="muted">No story submissions yet.</p> : stories.map((s) => (
              <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div className="spread" style={{ gap: 12, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <b style={{ fontFamily: "var(--font-d)" }}>{s.name}</b>{" "}
                    <span className="muted" style={{ fontSize: ".85rem" }}>· {s.petName}{s.city ? ` · ${s.city}` : ""} · {"★".repeat(s.rating)}</span>{" "}
                    <span className={"chip " + (s.status === "APPROVED" ? "green" : s.status === "REJECTED" ? "rose" : "honey")} style={{ marginLeft: 4 }}>{s.status}{s.featured ? " · ⭐" : ""}</span>
                    <p className="muted" style={{ fontSize: ".9rem", marginTop: 6 }}>{s.story}</p>
                  </div>
                  <div className="row" style={{ flexShrink: 0 }}>
                    {s.status !== "APPROVED" && <Act action="story-approve" id={s.id} label="Approve" />}
                    <Act action="story-feature" id={s.id} label={s.featured ? "Unfeature" : "Feature"} />
                    {s.status !== "REJECTED" && <Act action="story-reject" id={s.id} label="Reject" danger />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 10 }}>Open reports ({reports.length})</h3>
          <div className="card" style={{ marginBottom: 24 }}>
            {reports.length === 0 ? <p className="muted">No open reports.</p> : reports.map((r) => (
              <div key={r.id} className="spread" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div><span className="chip rose">{r.reason}</span> <span className="muted" style={{ fontSize: ".88rem" }}>{r.details || "—"} · target {r.targetUserId.slice(0, 8)}…</span></div>
                <div className="row"><Act action="ban" id={r.targetUserId} label="Ban member" danger /><Act action="report-action" id={r.id} label="Mark actioned" /><Act action="report-dismiss" id={r.id} label="Dismiss" /></div>
              </div>
            ))}
          </div>

          <h3 style={{ marginBottom: 10 }}>All members ({members.length})</h3>
          <div className="card">
            {members.map((u) => (
              <div key={u.id} className="spread" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <b style={{ fontFamily: "var(--font-d)" }}>{u.ownerName}</b>{" "}
                  <span className={"chip " + (u.kycStatus === "VERIFIED" ? "acc" : "honey")} style={{ marginLeft: 4 }}>{u.kycStatus}</span>
                  {u.role === "ADMIN" && <span className="chip" style={{ marginLeft: 4 }}>Admin</span>}
                  {u.bannedAt && <span className="chip rose" style={{ marginLeft: 4 }}>Banned</span>}
                </div>
                <div className="row">{u.bannedAt ? <Act action="unban" id={u.id} label="Unban" /> : <Act action="ban" id={u.id} label="Ban" danger />}</div>
              </div>
            ))}
          </div>

          <div className="spread" style={{ margin: "26px 0 10px" }}>
            <h3 style={{ margin: 0 }}>Activity &amp; data ({eventTotal.toLocaleString("en-IN")} events)</h3>
            {eventTotal > 0 && <a className="btn btn-ghost btn-sm" href="/api/admin/events">⬇ Export CSV</a>}
          </div>
          <div className="card" style={{ marginBottom: 24 }}>
            <p className="muted" style={{ fontSize: ".9rem", marginBottom: 12 }}>Everything members feed in — signups, logins, searches, swipes, matches, messages, reviews, submissions and more. Powers product insight; personal data is purged on account deletion (DPDP).</p>
            {eventCounts.length === 0 ? <p className="muted">No activity recorded yet.</p> : (
              <>
                <div className="row" style={{ gap: 8, marginBottom: 16 }}>
                  {eventCounts.map((c) => (
                    <span key={c.type} className="chip acc" style={{ fontSize: ".8rem" }}>{c.type.replace(/_/g, " ")} · <b>{c.n}</b></span>
                  ))}
                </div>
                <div style={{ fontSize: ".82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--muted-text)", marginBottom: 6 }}>Recent</div>
                {recentEvents.map((e) => (
                  <div key={e.id} className="spread" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: ".85rem" }}>
                    <div><span className="chip" style={{ background: "var(--muted)", fontSize: ".72rem" }}>{e.type.replace(/_/g, " ")}</span> {e.meta && <span className="muted" style={{ marginLeft: 6 }}>{e.meta.slice(0, 60)}</span>}</div>
                    <span className="muted">{new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="spread" style={{ margin: "26px 0 10px" }}>
            <h3 style={{ margin: 0 }}>Newsletter subscribers ({subCount})</h3>
            <a className="btn btn-ghost btn-sm" href="/api/admin/subscribers">⬇ Export CSV</a>
          </div>
          <div className="card">
            {subscribers.length === 0 ? <p className="muted">No subscribers yet.</p> : subscribers.map((s) => (
              <div key={s.id} className="spread" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <b style={{ fontFamily: "var(--font-d)" }}>{s.name}</b>{" "}
                  <span className="muted" style={{ fontSize: ".88rem" }}>· {s.email} · {s.mobile}</span>
                </div>
                <span className="chip acc">{s.petName} · {s.species} · {s.petAge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
