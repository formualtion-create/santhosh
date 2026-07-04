"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function DeclarationAccept({
  authed,
  acceptedAt: initialAcceptedAt,
}: {
  authed: boolean;
  acceptedAt: string | null;
}) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [acceptedAt, setAcceptedAt] = useState<string | null>(initialAcceptedAt);
  const [guestAck, setGuestAck] = useState(false);

  // Remember a guest's acknowledgement locally so the gate stays satisfied
  // until they create an account (where the binding checkbox applies).
  useEffect(() => {
    if (!authed && !acceptedAt) {
      try {
        if (localStorage.getItem("pp_declaration_ack") === "1") setGuestAck(true);
      } catch {}
    }
  }, [authed, acceptedAt]);

  async function accept() {
    setError("");
    if (!checked) {
      setError("Please tick the box to confirm before accepting.");
      return;
    }
    // Guests: store locally and point them to sign-up.
    if (!authed) {
      try {
        localStorage.setItem("pp_declaration_ack", "1");
      } catch {}
      setGuestAck(true);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/account/accept-declaration", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
      } else {
        setAcceptedAt(data.acceptedAt);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Already on record for this member.
  if (acceptedAt) {
    return (
      <div className="decl-gate decl-gate--done" role="status">
        <span className="decl-gate__tick" aria-hidden>✓</span>
        <div>
          <b>You have accepted this Declaration.</b>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: ".9rem" }}>
            Recorded on {formatDate(acceptedAt)}.
          </p>
        </div>
      </div>
    );
  }

  // Guest acknowledged locally.
  if (guestAck) {
    return (
      <div className="decl-gate decl-gate--done" role="status">
        <span className="decl-gate__tick" aria-hidden>✓</span>
        <div>
          <b>Thank you — your acknowledgement is noted.</b>
          <p className="muted" style={{ margin: "4px 0 0", fontSize: ".9rem" }}>
            Your acceptance becomes binding when you{" "}
            <Link href="/signup" className="text-acc" style={{ fontWeight: 700 }}>create your account</Link>,
            where it is confirmed and timestamped to your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="decl-gate" id="accept">
      <label className="check" style={{ marginBottom: 12 }}>
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        I have read and understood this Declaration in full, and I accept it freely. I declare that all
        information I provide to PawsPair is true and correct.
      </label>
      {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}
      <button
        type="button"
        className="btn btn-primary btn-lg"
        onClick={accept}
        disabled={busy || !checked}
      >
        {busy ? "Recording…" : authed ? "I accept the Declaration" : "I accept & continue"}
      </button>
      {!authed && (
        <p className="muted" style={{ marginTop: 10, fontSize: ".85rem" }}>
          Already a member? <Link href="/login" className="text-acc" style={{ fontWeight: 700 }}>Log in</Link>{" "}
          to record your acceptance against your account.
        </p>
      )}
    </div>
  );
}
