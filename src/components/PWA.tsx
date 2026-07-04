"use client";
import { useEffect, useState } from "react";

const isProd = process.env.NODE_ENV === "production";

export default function PWA() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Self-heal: a stale build chunk (after a rebuild/deploy) → reload once for the fresh manifest.
    const isChunkErr = (m?: string) => !!m && /ChunkLoadError|Loading chunk|module script failed|dynamically imported module/i.test(m);
    const heal = () => {
      if (sessionStorage.getItem("pp_chunk_reloaded") === "1") return;
      sessionStorage.setItem("pp_chunk_reloaded", "1");
      window.location.reload();
    };
    const onErr = (e: ErrorEvent) => { if (isChunkErr(e?.message) || isChunkErr((e?.error as any)?.name)) heal(); };
    const onRej = (e: PromiseRejectionEvent) => { const r: any = e?.reason; if (isChunkErr(r?.name) || isChunkErr(r?.message)) heal(); };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);

    if ("serviceWorker" in navigator) {
      if (isProd) {
        const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
        if (document.readyState === "complete") onLoad();
        else window.addEventListener("load", onLoad, { once: true });
      } else {
        // DEV: never run the SW — and remove any stale one so it can't serve outdated chunks.
        navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
        if (window.caches) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
      }
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      if (sessionStorage.getItem("pp_install_dismissed") !== "1") setShow(true);
    };
    const onInstalled = () => setShow(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!show) return null;

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch {}
    setShow(false);
    setDeferred(null);
  };
  const dismiss = () => { sessionStorage.setItem("pp_install_dismissed", "1"); setShow(false); };

  return (
    <div style={{
      position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 1000,
      maxWidth: 420, margin: "0 auto",
      background: "#fff", borderRadius: 18, boxShadow: "0 18px 44px rgba(40,36,79,.22)",
      padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
    }}>
      <img src="/icon-192.png" alt="" width={42} height={42} style={{ borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontFamily: '"Nunito",sans-serif', color: "#28244F", display: "block", fontSize: ".98rem" }}>Install PawsPair 🐾</b>
        <span style={{ color: "#6B6880", fontSize: ".82rem" }}>Add to your home screen — opens like an app.</span>
      </div>
      <button onClick={install} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Install</button>
      <button onClick={dismiss} aria-label="Dismiss" style={{ background: "none", border: "none", color: "#8aa399", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
    </div>
  );
}
