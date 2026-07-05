"use client";

import { useEffect, useState } from "react";

const BANNER_KEY = "pp_beta_banner_v1";
const WELCOME_KEY = "pp_beta_welcome_v1";

// Beta-phase chrome: a dismissible top banner (everyone) + a one-time welcome
// modal for signed-in testers. Both persist their dismissal in localStorage.
export default function BetaNotice({ signedIn, firstName }: { signedIn: boolean; firstName?: string | null }) {
  const [banner, setBanner] = useState(false);
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    // Don't cover the OTP / verification screens with the welcome modal — wait
    // until the tester is actually inside the app.
    const authPath = typeof window !== "undefined" && /^\/(login|signup|verify)/.test(window.location.pathname);
    try {
      if (localStorage.getItem(BANNER_KEY) !== "1") setBanner(true);
      if (signedIn && !authPath && localStorage.getItem(WELCOME_KEY) !== "1") setWelcome(true);
    } catch { /* storage blocked — show nothing rather than break */ }
  }, [signedIn]);

  function closeBanner() {
    try { localStorage.setItem(BANNER_KEY, "1"); } catch {}
    setBanner(false);
  }
  function closeWelcome() {
    try { localStorage.setItem(WELCOME_KEY, "1"); } catch {}
    setWelcome(false);
  }
  function openFeedback() {
    closeWelcome();
    window.dispatchEvent(new Event("pp:feedback"));
  }

  return (
    <>
      {banner && (
        <div className="beta-banner" role="status">
          <span className="beta-banner__txt">
            <b>🧪 You're in the PawsPair beta.</b> Early access — some features (payments, ID checks) are simulated, and things may change.
            {" "}<button type="button" className="beta-banner__link" data-feedback>Share feedback</button>.
          </span>
          <button type="button" className="beta-banner__x" onClick={closeBanner} aria-label="Dismiss beta notice">×</button>
        </div>
      )}

      {welcome && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeWelcome(); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Welcome to the beta" style={{ textAlign: "left" }}>
            <button className="modal-x" onClick={closeWelcome} aria-label="Close">×</button>
            <div style={{ textAlign: "center" }}>
              <div className="modal-ico" aria-hidden>🐾</div>
              <span className="modal-eyebrow">Welcome to the beta</span>
              <h3 className="modal-title" style={{ marginBottom: 6 }}>
                {firstName ? `Hi ${firstName} — thanks for testing PawsPair!` : "Thanks for testing PawsPair!"}
              </h3>
            </div>
            <p className="modal-sub" style={{ marginBottom: 14 }}>
              You're one of our first testers. Here's how to make the most of it:
            </p>
            <ul className="beta-welcome__list">
              <li><b>Try the core loop:</b> complete your profile, verify, discover pets, like &amp; match, then chat.</li>
              <li><b>Some things are simulated:</b> payments take no real money and ID/phone checks approve instantly during beta — they're clearly marked.</li>
              <li><b>Tell us everything:</b> tap the <b>Feedback</b> button (bottom-right) anytime — bugs, confusion, ideas, or things you love.</li>
            </ul>
            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button className="btn btn-primary btn-block" onClick={closeWelcome}>Start exploring 🐾</button>
              <button className="btn btn-ghost btn-block btn-sm" onClick={openFeedback}>Send feedback</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
