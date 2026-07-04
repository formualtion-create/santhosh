import { redirect } from "next/navigation";
import { getSessionUserId, getPendingLoginUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Nav, Footer } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function VerifyEmail(
  props: { searchParams: Promise<{ error?: string; sent?: string; demo?: string; new?: string; login?: string }> }
) {
  const searchParams = await props.searchParams;
  const pendingUid = await getPendingLoginUserId();
  const sessionUid = await getSessionUserId();
  const uid = pendingUid || sessionUid;
  if (!uid) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: uid }, include: { pets: true } });
  if (!user) redirect("/login");

  // A fully-authenticated, already-verified member with no pending 2FA is done here.
  if (sessionUid && !pendingUid && user.emailVerified) {
    redirect(user.kycStatus === "VERIFIED" ? "/dashboard" : "/verify");
  }

  const isLogin = !!pendingUid || searchParams.login === "1";

  return (
    <>
      {/* During a pending login there is no session, so render the signed-out nav. */}
      <Nav user={pendingUid ? null : user} />
      <section className="pageform">
        <div className="container narrow">
          <div className="card center">
            <div style={{ width: 72, height: 72, margin: "0 auto 14px", borderRadius: 20, background: "linear-gradient(135deg,var(--secondary),var(--primary))", display: "grid", placeItems: "center", boxShadow: "var(--shadow-pop)" }}>
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff" strokeWidth={2}>
                {isLogin
                  ? <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>
                  : <><path d="M4 4h16v12H5.2L4 17.2z" /><path d="M22 6l-10 7L2 6" /></>}
              </svg>
            </div>
            <span className="eyebrow">{isLogin ? "Two-step verification" : "Email verification"}</span>
            <h1 className="h-sec" style={{ margin: "10px 0 6px" }}>
              {isLogin ? "Enter your login code" : "Enter your verification code"}
            </h1>
            <p className="lead" style={{ marginBottom: 16 }}>
              {isLogin
                ? <>For your security, we emailed a 6-digit code to <b>{user.email}</b>. Enter it to finish signing in.</>
                : <>We sent a 6-digit code to <b>{user.email}</b>. Enter it below to confirm your email.</>}
            </p>

            {searchParams.error && <div className="err">{searchParams.error}</div>}
            {searchParams.sent && <div className="ok">A new code has been sent.</div>}
            {searchParams.demo && (
              <div className="ok" style={{ textAlign: "left" }}>
                <b>Demo mode</b> (email not configured yet): your code is{" "}
                <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.1rem", letterSpacing: 2 }}>{searchParams.demo}</span>
              </div>
            )}

            <form action="/api/auth/verify-email" method="post">
              <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoFocus autoComplete="one-time-code"
                placeholder="••••••"
                style={{ width: "100%", textAlign: "center", letterSpacing: "12px", fontSize: "1.6rem", fontFamily: "monospace", padding: "14px", borderRadius: "var(--r-sm)", border: "2px solid var(--border)", background: "var(--bg)", marginBottom: 14 }} />
              <button className="btn btn-primary btn-block btn-lg" type="submit">{isLogin ? "Verify & sign in" : "Verify email"}</button>
            </form>
            <form action="/api/auth/resend-otp" method="post" style={{ marginTop: 12 }}>
              <button className="btn btn-ghost btn-block btn-sm" type="submit">Resend code</button>
            </form>
            <p className="muted" style={{ fontSize: ".82rem", marginTop: 12 }}>Code expires in 10 minutes. Check your spam folder too.</p>
            {isLogin && (
              <p className="muted" style={{ fontSize: ".82rem", marginTop: 6 }}>
                Not you? <a href="/login" className="text-acc" style={{ fontWeight: 700 }}>Back to login</a>
              </p>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
