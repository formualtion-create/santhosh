"use client";
import { useEffect, useState } from "react";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlB64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function subscribe() {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID!),
    });
  }
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub),
  });
}

export default function NotificationOptIn() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !VAPID) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      subscribe().catch(() => {}); // keep subscription fresh, silently
      return;
    }
    if (Notification.permission === "default" && sessionStorage.getItem("pp_notif_dismissed") !== "1") {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const enable = async () => {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") await subscribe();
    } catch {}
    setBusy(false);
    setShow(false);
  };
  const dismiss = () => { sessionStorage.setItem("pp_notif_dismissed", "1"); setShow(false); };

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, padding: "14px 18px", background: "linear-gradient(135deg,#F3E8FF,#FCE7F3)" }}>
      <span style={{ fontSize: 26 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontFamily: '"Nunito",sans-serif', color: "var(--fg)" }}>Never miss a match</b>
        <div className="muted" style={{ fontSize: ".88rem" }}>Get notified instantly about new matches and messages.</div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={enable} disabled={busy}>{busy ? "Enabling…" : "Enable alerts"}</button>
      <button onClick={dismiss} aria-label="Dismiss" style={{ background: "none", border: "none", color: "var(--muted-text)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
    </div>
  );
}
