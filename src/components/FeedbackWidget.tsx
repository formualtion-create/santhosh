"use client";

import { useEffect, useState } from "react";

const CATS = [
  { v: "bug", label: "🐞 Something broke" },
  { v: "confusing", label: "😕 Confusing" },
  { v: "idea", label: "💡 Idea / request" },
  { v: "praise", label: "💜 I liked something" },
  { v: "other", label: "💬 Other" },
];

// Floating beta-feedback button + modal. Posts to /api/feedback (no external
// service). Opens from the FAB or any [data-feedback] element / 'pp:feedback' event.
export default function FeedbackWidget({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("bug");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const openFromEl = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.("[data-feedback]")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const openEvt = () => setOpen(true);
    document.addEventListener("click", openFromEl);
    window.addEventListener("pp:feedback", openEvt);
    return () => {
      document.removeEventListener("click", openFromEl);
      window.removeEventListener("pp:feedback", openEvt);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    // reset after the close animation so a reopened form is fresh
    setTimeout(() => { setDone(false); setErr(null); setMessage(""); setRating(0); }, 250);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 3) { setErr("Please add a little more detail."); return; }
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          rating: rating || undefined,
          message: message.trim(),
          email: email.trim() || undefined,
          url: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || "Couldn't send — please try again."); setBusy(false); return; }
      setDone(true);
    } catch {
      setErr("Network error — please try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <button className="fab" onClick={() => setOpen(true)} aria-label="Send beta feedback">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5v-9Z" fill="currentColor"/>
        </svg>
        <span>Feedback</span>
      </button>

      {open && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Send feedback" style={{ textAlign: "left" }}>
            <button className="modal-x" onClick={close} aria-label="Close">×</button>

            {done ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div className="modal-ico" aria-hidden>💜</div>
                <h3 className="modal-title">Thank you!</h3>
                <p className="modal-sub">Your feedback goes straight to the team. It genuinely shapes what we build next.</p>
                <button className="btn btn-primary btn-block" onClick={close}>Done</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <span className="modal-eyebrow">Beta feedback</span>
                <h3 className="modal-title" style={{ marginBottom: 4 }}>Tell us what you think</h3>
                <p className="modal-sub" style={{ marginBottom: 16 }}>Bugs, confusion, ideas, or love — all of it helps.</p>

                <div className="field">
                  <label>How&apos;s your experience so far? <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
                  <div className="fb-stars" role="radiogroup" aria-label="Rate your experience">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={"fb-star" + (n <= rating ? " on" : "")}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        aria-pressed={n === rating}
                        onClick={() => setRating(n === rating ? 0 : n)}
                      >★</button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="fb-cat">What kind of feedback?</label>
                  <select id="fb-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATS.map((c) => <option key={c.v} value={c.v}>{c.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="fb-msg">Your feedback</label>
                  <textarea id="fb-msg" value={message} onChange={(e) => setMessage(e.target.value)}
                    rows={4} required placeholder="What happened, or what would make this better?"
                    style={{ resize: "vertical", minHeight: 90 }} />
                </div>
                {!signedIn && (
                  <div className="field">
                    <label htmlFor="fb-email">Email <span className="muted" style={{ fontWeight: 400 }}>(optional — if you'd like a reply)</span></label>
                    <input id="fb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                )}

                {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

                <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
                  {busy ? "Sending…" : "Send feedback"}
                </button>
                <p className="modal-fine" style={{ marginTop: 10 }}>We attach the page you're on to help us reproduce issues. Nothing else.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
