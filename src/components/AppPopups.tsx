"use client";
import { useEffect, useState, useCallback } from "react";
import { SLOGAN, dayThought } from "@/lib/thoughts";

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}

function PawMark() {
  return (
    <span className="modal-ico" aria-hidden>
      <svg viewBox="0 0 24 24" fill="#fff" width="34" height="34">
        <circle cx="6" cy="10" r="1.9" /><circle cx="18" cy="10" r="1.9" /><circle cx="9.5" cy="6.5" r="1.9" /><circle cx="14.5" cy="6.5" r="1.9" />
        <path d="M12 12.5c-2.6 0-4.7 1.8-4.7 4 0 1.9 2.1 2.5 4.7 2.5s4.7-.6 4.7-2.5c0-2.2-2.1-4-4.7-4z" />
      </svg>
    </span>
  );
}

export default function AppPopups({ userName }: { userName?: string | null }) {
  const [welcome, setWelcome] = useState(false);
  const [sub, setSub] = useState(false);

  // Welcome "thought of the day" — once per app open (session)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("pp_welcome_seen") !== "1") {
      const t = setTimeout(() => setWelcome(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  // Subscription modal opens from any [data-subscribe] element or a custom event
  const openSub = useCallback(() => setSub(true), []);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest("[data-subscribe]");
      if (el) { e.preventDefault(); openSub(); }
    };
    document.addEventListener("click", onClick);
    window.addEventListener("pp:subscribe", openSub as EventListener);
    return () => { document.removeEventListener("click", onClick); window.removeEventListener("pp:subscribe", openSub as EventListener); };
  }, [openSub]);

  const closeWelcome = () => { sessionStorage.setItem("pp_welcome_seen", "1"); setWelcome(false); };

  return (
    <>
      {welcome && (
        <Overlay onClose={closeWelcome}>
          <PawMark />
          <p className="modal-eyebrow">Thought of the day</p>
          <h2 className="modal-title">{userName ? `Good to see you, ${userName} 🐾` : "Welcome to PawsPair 🐾"}</h2>
          <p className="modal-slogan">“{SLOGAN}”</p>
          <p className="modal-thought">{dayThought()}</p>
          <div className="modal-actions">
            <button className="btn btn-primary btn-block" onClick={closeWelcome}>Spread some love today 💜</button>
            <button className="btn btn-ghost btn-block btn-sm" onClick={() => { closeWelcome(); openSub(); }}>Get weekly love &amp; care notes</button>
          </div>
        </Overlay>
      )}

      {sub && <SubscribeModal onClose={() => setSub(false)} />}
    </>
  );
}

function SubscribeModal({ onClose }: { onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json().catch(() => ({}));
      if (r.ok) setDone(true);
      else setErr(data.error || "Something went wrong. Please try again.");
    } catch { setErr("Network error. Please try again."); }
    setBusy(false);
  };

  return (
    <Overlay onClose={onClose}>
      {done ? (
        <>
          <PawMark />
          <h2 className="modal-title">You're in! 🎉</h2>
          <p className="modal-thought">Welcome to the PawsPair family. We&apos;ll send loving pet-care tips, heartwarming stories and a little motivation — straight to your inbox.</p>
          <button className="btn btn-primary btn-block" onClick={onClose} style={{ marginTop: 8 }}>Continue</button>
        </>
      ) : (
        <>
          <PawMark />
          <p className="modal-eyebrow">Join the family</p>
          <h2 className="modal-title">Pet love, in your inbox 💌</h2>
          <p className="modal-sub">Care tips, heart-warming stories and weekly motivation for you and your companion.</p>
          {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}
          <form onSubmit={submit}>
            <div className="fg2">
              <div className="field"><label htmlFor="s-name">Your name</label><input id="s-name" name="name" required placeholder="e.g. Ananya" /></div>
              <div className="field"><label htmlFor="s-mobile">Mobile</label><input id="s-mobile" name="mobile" type="tel" required placeholder="+91 XXXXX XXXXX" /></div>
            </div>
            <div className="field"><label htmlFor="s-email">Email</label><input id="s-email" name="email" type="email" required placeholder="you@example.com" /></div>
            <div className="fg2">
              <div className="field"><label htmlFor="s-species">Your pet</label>
                <select id="s-species" name="species" required defaultValue="Dog"><option>Dog</option><option>Cat</option><option>Rabbit</option><option>Bird</option><option>Other</option></select>
              </div>
              <div className="field"><label htmlFor="s-petName">Pet&apos;s name</label><input id="s-petName" name="petName" required placeholder="e.g. Simba" /></div>
            </div>
            <div className="field"><label htmlFor="s-petAge">Pet&apos;s age</label><input id="s-petAge" name="petAge" required placeholder="e.g. 2 years" /></div>
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>{busy ? "Joining…" : "Subscribe with love 💜"}</button>
            <p className="modal-fine">No spam, ever. Unsubscribe anytime. Your data is protected under the DPDP Act 2023.</p>
          </form>
        </>
      )}
    </Overlay>
  );
}
