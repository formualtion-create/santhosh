"use client";
import { Fragment, useEffect, useRef, useState, useCallback } from "react";

type Msg = { id: string; senderId: string; body: string; imageUrl?: string | null; flagged?: boolean; createdAt?: string };

function fmtTime(iso?: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
}
function dayKey(iso?: string) { return iso ? new Date(iso).toDateString() : ""; }
function dayLabel(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso), today = new Date(), y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}) });
}
const GROUP_GAP = 5 * 60 * 1000; // 5 min

export default function ChatThread({
  matchId, me, initial, otherName, otherAvatar,
}: {
  matchId: string; me: string; initial: Msg[]; otherName?: string; otherAvatar?: string | null;
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);
  useEffect(() => { scrollToEnd(); }, [messages, scrollToEnd]);

  // Live polling
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/messages/${matchId}`, { headers: { Accept: "application/json" } });
        if (!r.ok) return;
        const data = await r.json();
        if (alive && Array.isArray(data.messages)) setMessages(data.messages);
      } catch {}
    };
    const iv = setInterval(poll, 4000);
    const onVis = () => document.visibilityState === "visible" && poll();
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, [matchId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    const optimistic: Msg = { id: "tmp-" + Date.now(), senderId: me, body, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    setText("");
    try {
      const fd = new URLSearchParams({ matchId, body });
      const r = await fetch("/api/message", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }, body: fd });
      const data = await r.json().catch(() => null);
      setWarning(data?.warning || null);
      const fresh = await fetch(`/api/messages/${matchId}`, { headers: { Accept: "application/json" } }).then((x) => x.json()).catch(() => null);
      if (fresh?.messages) setMessages(fresh.messages);
      else if (data?.message) setMessages((m) => m.map((x) => (x.id === optimistic.id ? data.message : x)));
    } catch { /* keep optimistic; next poll reconciles */ }
    setSending(false);
  };

  return (
    <>
      <div ref={boxRef} className="chatbox">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty__ic" aria-hidden>👋</div>
            <b>You matched{otherName ? ` with ${otherName}` : ""}!</b>
            <p className="muted">Send the first message to break the ice.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const prev = messages[i - 1], next = messages[i + 1];
          const mine = msg.senderId === me;
          const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
          const gapPrev = prev?.createdAt && msg.createdAt ? new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() : Infinity;
          const startGroup = newDay || !prev || prev.senderId !== msg.senderId || gapPrev > GROUP_GAP;
          const gapNext = next?.createdAt && msg.createdAt ? new Date(next.createdAt).getTime() - new Date(msg.createdAt).getTime() : Infinity;
          const endGroup = !next || next.senderId !== msg.senderId || gapNext > GROUP_GAP || dayKey(next?.createdAt) !== dayKey(msg.createdAt);
          const pending = msg.id.startsWith("tmp-");
          return (
            <Fragment key={msg.id}>
              {newDay && <div className="chat-day"><span>{dayLabel(msg.createdAt)}</span></div>}
              <div className={"chat-row" + (mine ? " mine" : "")} style={{ marginTop: startGroup ? 10 : 2 }}>
                {!mine && (
                  <div className="chat-av" aria-hidden>
                    {endGroup ? (otherAvatar ? <img src={otherAvatar} alt="" /> : <span>🐾</span>) : null}
                  </div>
                )}
                <div className="chat-msg">
                  {msg.imageUrl ? (
                    <a href={msg.imageUrl} target="_blank" rel="noreferrer" className="chat-photo">
                      <img src={msg.imageUrl} alt="Shared photo" />
                    </a>
                  ) : (
                    <div className={"chat-bubble" + (mine ? " mine" : "")} style={pending ? { opacity: 0.65 } : undefined}>{msg.body}</div>
                  )}
                  {msg.flagged && <div className="chat-flag">⚠ Contact/payment info — keep it on PawsPair</div>}
                  {endGroup && <div className="chat-time">{pending ? "Sending…" : fmtTime(msg.createdAt)}</div>}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>

      {warning && <div className="chat-warn">🛡 {warning}</div>}

      <div className="chat-input">
        <form action="/api/chat/photo" method="post" encType="multipart/form-data" style={{ display: "flex" }}>
          <input type="hidden" name="matchId" value={matchId} />
          <label className="chat-photo-btn" title="Send a photo">
            📷
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => e.currentTarget.form?.requestSubmit()} />
          </label>
        </form>
        <form onSubmit={send} style={{ display: "flex", gap: 8, flex: 1 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" autoComplete="off" maxLength={1000} className="chat-field" />
          <button className="btn btn-primary" type="submit" disabled={sending || !text.trim()}>Send</button>
        </form>
      </div>
    </>
  );
}
