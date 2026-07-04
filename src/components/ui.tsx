import Link from "next/link";
import NavMenu from "./NavMenu";

export function Logo() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="lg" src="/logo.png" alt="" aria-hidden width={40} height={40} />;
}

export function VerifiedTick() {
  return (
    <span className="tick" title="Verified">
      <svg viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

type NavUser = { ownerName: string; kycStatus: string; role?: string } | null;

export function Nav({ user, active }: { user: NavUser; active?: string }) {
  return (
    <header className="nav">
      <div className="container nav-in">
        <Link className="brand" href={user ? "/dashboard" : "/"}>
          <Logo />
          Paws<b>Pair</b>
        </Link>
        <NavMenu authed={!!user} isAdmin={user?.role === "ADMIN"} active={active} />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container cols">
        <div style={{ maxWidth: 320 }}>
          <div className="brand" style={{ color: "#fff" }}>
            <Logo /> Paws<b style={{ color: "var(--secondary)" }}>Pair</b>
          </div>
          <p style={{ color: "#a9c9bb", fontSize: ".9rem", marginTop: 10 }}>
            India&apos;s verified, DPDP-compliant pet matchmaking club. Safe, curated, joyful connections.
          </p>
        </div>
        <div>
          <h4 style={{ color: "#fff", fontSize: ".95rem", marginBottom: 10 }}>Legal</h4>
          <div style={{ display: "grid", gap: 8, fontSize: ".9rem" }}>
            <Link href="/legal/terms">Terms &amp; Conditions</Link>
            <Link href="/legal/community">Community Guidelines</Link>
            <Link href="/legal/declaration">Declaration &amp; Acceptance</Link>
            <Link href="/legal/privacy">Privacy Policy (DPDP)</Link>
            <Link href="/legal/refund">Cancellation &amp; Refunds</Link>
            <Link href="/legal/grievance">Grievance Redressal</Link>
          </div>
        </div>
        <div>
          <h4 style={{ color: "#fff", fontSize: ".95rem", marginBottom: 10 }}>Product</h4>
          <div style={{ display: "grid", gap: 8, fontSize: ".9rem" }}>
            <Link href="/signup">Create profile</Link>
            <Link href="/stories">Happy Tails 🐾</Link>
            <Link href="/services">Pet services</Link>
            <Link href="/membership">Membership</Link>
            <Link href="/safety">Safety Center 🛡</Link>
            <a href="#" data-subscribe>Pet-care newsletter 💌</a>
            <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
      <div className="container" style={{ marginTop: 28, fontSize: ".82rem", color: "#a9c9bb" }}>
        © {new Date().getFullYear()} PawsPair Technologies Pvt. Ltd. Crafted with 🐾 in India.
      </div>
    </footer>
  );
}
