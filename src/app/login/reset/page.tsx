import Link from "next/link";
import { Nav, Footer } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export default async function Reset(props: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  const token = searchParams.token || "";
  return (
    <>
      <Nav user={user} />
      <section className="pageform">
        <div className="container narrow">
          <div className="center" style={{ marginBottom: 18 }}>
            <span className="eyebrow">Account recovery</span>
            <h1 className="h-sec">Choose a new password</h1>
          </div>
          {searchParams.error && <div className="err">{searchParams.error}</div>}
          {!token ? (
            <div className="card center">
              <p className="muted">This reset link is missing or invalid.</p>
              <Link href="/login/forgot" className="btn btn-primary" style={{ marginTop: 12 }}>Request a new link</Link>
            </div>
          ) : (
            <form action="/api/auth/reset" method="post" className="card">
              <input type="hidden" name="token" value={token} />
              <div className="field"><label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={8} required placeholder="At least 8 characters" autoComplete="new-password" /></div>
              <button className="btn btn-primary btn-block" type="submit">Set new password &amp; log in</button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
