import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Nav, Footer } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your PawsPair account to discover verified pet matches, view your matches and chat.",
  alternates: { canonical: "/login" },
};

export default async function Login(props: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <>
      <Nav user={null} />
      <section className="pageform">
        <div className="container narrow">
          <div className="center" style={{ marginBottom: 20 }}>
            <span className="eyebrow">Welcome back</span>
            <h1 className="h-sec">Log in to PawsPair</h1>
          </div>
          {searchParams.error && <div className="err">{searchParams.error}</div>}
          <form action="/api/auth/login" method="post" className="card">
            <input type="hidden" name="next" value={searchParams.next || "/dashboard"} />
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
            <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">Log in</button>
            <p className="center muted" style={{ marginTop: 12, fontSize: ".9rem" }}>
              New here? <Link href="/signup" className="text-acc" style={{ fontWeight: 700 }}>Create a profile</Link>
            </p>
          </form>
          <p className="center muted" style={{ marginTop: 14, fontSize: ".85rem" }}>
            Tip: seeded demo login — <b>ananya@example.com</b> / <b>password123</b>
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
