import Link from "next/link";
import NavMenu from "./NavMenu";
import { isBeta } from "@/lib/beta";

export function Logo() {
  // Modern inline SVG mark — a paw whose main pad is a heart, set in a brand
  // gradient tile. Crisp at any size and theme-aware (no raster logo.png).
  return (
    <svg className="lg" viewBox="0 0 48 48" width={42} height={42} role="img" aria-label="PawsPair" focusable="false">
      <defs>
        <linearGradient id="pp-logo-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D5EF6" />
          <stop offset="0.55" stopColor="#A855F7" />
          <stop offset="1" stopColor="#E0457B" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="13" fill="url(#pp-logo-g)" />
      <g fill="#fff" fillOpacity="0.97">
        <ellipse cx="13" cy="19" rx="3" ry="4.1" transform="rotate(-20 13 19)" />
        <ellipse cx="20" cy="13.5" rx="3.3" ry="4.4" />
        <ellipse cx="28" cy="13.5" rx="3.3" ry="4.4" />
        <ellipse cx="35" cy="19" rx="3" ry="4.1" transform="rotate(20 35 19)" />
        <path d="M24 39C17 33.5 15 30 15 27C15 24.5 16.8 23 19 23C21 23 22.8 24.2 24 26C25.2 24.2 27 23 29 23C31.2 23 33 24.5 33 27C33 30 31 33.5 24 39Z" />
      </g>
    </svg>
  );
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
          {isBeta() && <span className="beta-tag" title="PawsPair is in beta">BETA</span>}
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
