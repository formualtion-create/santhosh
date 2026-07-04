"use client";
import Link from "next/link";
import { useState } from "react";

type Props = { authed: boolean; isAdmin?: boolean; active?: string };

export default function NavMenu({ authed, isAdmin, active }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button className="nav-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <nav className={"nav-links" + (open ? " open" : "")} aria-label="Primary">
        {authed ? (
          <>
            <Link href="/dashboard" onClick={close} className={active === "dashboard" ? "active" : ""}>Discover</Link>
            <Link href="/matches" onClick={close} className={active === "matches" ? "active" : ""}>Matches</Link>
            <Link href="/services" onClick={close} className={active === "services" ? "active" : ""}>Services</Link>
            <Link href="/membership" onClick={close} className={active === "membership" ? "active" : ""}>Membership</Link>
            <Link href="/account" onClick={close} className={active === "account" ? "active" : ""}>My account</Link>
            {isAdmin && <Link href="/admin" onClick={close}>Admin</Link>}
            <form action="/api/auth/logout" method="post" style={{ display: "inline" }}>
              <button className="btn btn-sm btn-ghost" type="submit">Log out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" onClick={close}>Log in</Link>
            <Link href="/signup" onClick={close} className="btn btn-sm btn-primary">Request invitation</Link>
          </>
        )}
      </nav>
    </>
  );
}
