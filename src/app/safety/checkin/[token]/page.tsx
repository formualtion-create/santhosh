import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Nav, Footer } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CheckInPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const ci = await prisma.checkIn.findUnique({
    where: { token },
    include: { user: { select: { ownerName: true, city: true, pets: { take: 1, select: { name: true } } } } },
  });
  if (!ci) notFound();
  const viewer = await getCurrentUser();
  const who = ci.user.ownerName.split(" ")[0];
  const safe = ci.status === "SAFE";

  return (
    <>
      <Nav user={viewer} />
      <section className="pageform">
        <div className="container narrow" style={{ maxWidth: 560 }}>
          <div className="card center">
            <div style={{ width: 72, height: 72, margin: "0 auto 14px", borderRadius: 20, background: safe ? "var(--success)" : "linear-gradient(135deg,var(--secondary),var(--primary))", display: "grid", placeItems: "center", boxShadow: "var(--shadow-pop)", fontSize: 34 }}>
              {safe ? "✅" : "🛟"}
            </div>
            <span className={"chip " + (safe ? "green" : "honey")}>{safe ? "Checked in safe" : "Playdate in progress"}</span>
            <h1 className="h-sec" style={{ margin: "12px 0 6px" }}>{who}&apos;s safety check-in</h1>
            <p className="lead" style={{ marginBottom: 18 }}>
              {safe
                ? <>{who} has confirmed they&apos;re safe. 💚</>
                : <>{who} shared this playdate so a trusted contact can keep an eye out.</>}
            </p>

            <div className="card" style={{ textAlign: "left", background: "var(--muted)", marginBottom: 16 }}>
              <Row k="Meeting" v={ci.withName || "A PawsPair match"} />
              <Row k="Where" v={ci.place} />
              {ci.meetAt && <Row k="When" v={new Date(ci.meetAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} />}
              <Row k="City" v={ci.user.city} />
            </div>

            {!safe ? (
              <form action="/api/checkin" method="post">
                <input type="hidden" name="action" value="safe" />
                <input type="hidden" name="token" value={token} />
                <button className="btn btn-primary btn-block btn-lg" type="submit">✅ I&apos;m safe</button>
              </form>
            ) : (
              <Link href="/safety" className="btn btn-ghost btn-block">Read our safety tips</Link>
            )}
            <p className="muted" style={{ fontSize: ".8rem", marginTop: 12 }}>
              If something feels wrong and you can&apos;t reach {who}, contact local authorities. This link is private — only people {who} shared it with can see it.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
      <span className="muted" style={{ fontWeight: 700, fontSize: ".82rem", textTransform: "uppercase", letterSpacing: ".4px" }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}
