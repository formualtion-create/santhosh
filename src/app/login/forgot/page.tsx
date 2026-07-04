import Link from "next/link";
import { Nav, Footer } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export default async function Forgot(
  props: { searchParams: Promise<{ sent?: string; demo?: string; error?: string }> }
) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  return (
    <>
      <Nav user={user} />
      <section className="pageform">
        <div className="container narrow">
          <div className="center" style={{ marginBottom: 18 }}>
            <span className="eyebrow">Account recovery</span>
            <h1 className="h-sec">Reset your password</h1>
          </div>
          {searchParams.error && <div className="err">{searchParams.error}</div>}
          {searchParams.sent ? (
            <div className="card">
              <div className="ok">If an account exists for that email, a reset link has been sent.</div>
              {searchParams.demo && (
                <p className="muted" style={{ fontSize: ".9rem" }}>
                  Demo (no email is actually sent): <Link className="text-acc" style={{ fontWeight: 700 }} href={searchParams.demo}>open your reset link →</Link>
                </p>
              )}
              <Link href="/login" className="btn btn-ghost btn-block" style={{ marginTop: 12 }}>Back to log in</Link>
            </div>
          ) : (
            <form action="/api/auth/forgot" method="post" className="card">
              <div className="field"><label htmlFor="email">Your email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
              <button className="btn btn-primary btn-block" type="submit">Send reset link</button>
              <p className="center muted" style={{ marginTop: 12, fontSize: ".9rem" }}>
                <Link href="/login" className="text-acc" style={{ fontWeight: 700 }}>Back to log in</Link>
              </p>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
