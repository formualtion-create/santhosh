"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Lightweight, privacy-first consent banner. Defaults to declining non-essential
// (analytics) — nothing extra loads until the member explicitly accepts.
export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("pp_cookie_choice")) setShow(true);
    } catch {}
  }, []);

  function choose(value: "all" | "essential") {
    try { localStorage.setItem("pp_cookie_choice", value); } catch {}
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="cookiebar" role="dialog" aria-label="Cookie preferences">
      <p className="cookiebar__text">
        🍪 We use essential cookies to run PawsPair, and optional analytics to improve it. You choose.{" "}
        <Link href="/legal/privacy" className="text-acc" style={{ fontWeight: 700 }}>Privacy Policy</Link>
      </p>
      <div className="cookiebar__btns">
        <button className="btn btn-ghost btn-sm" onClick={() => choose("essential")}>Essential only</button>
        <button className="btn btn-primary btn-sm" onClick={() => choose("all")}>Accept all</button>
      </div>
    </div>
  );
}
