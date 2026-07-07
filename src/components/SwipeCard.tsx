"use client";
import { useRef, useState, useCallback, type ReactNode, type PointerEvent } from "react";

const THRESHOLD = 90; // px past which a release commits the swipe
const START = 8; // px of horizontal travel before we treat it as a drag (not a tap)

/**
 * Wraps a discovery card so members can swipe it left (Pass) or right (Like) with
 * a touch/mouse drag — the gesture testers expected. It reuses the existing
 * /api/swipe form endpoint (so matching logic is unchanged) and keeps the
 * Pass/Like buttons as an always-available, keyboard-accessible fallback.
 */
export default function SwipeCard({
  petId,
  next,
  children,
}: {
  petId: string;
  next: string;
  children: ReactNode;
}) {
  const likeForm = useRef<HTMLFormElement>(null);
  const passForm = useRef<HTMLFormElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);

  const [dx, setDx] = useState(0);
  const [exiting, setExiting] = useState<null | "like" | "pass">(null);
  const [animate, setAnimate] = useState(false);

  const commit = useCallback((dir: "like" | "pass") => {
    setAnimate(true);
    setExiting(dir);
    // Let the fling animation play, then submit the matching form (full navigation).
    window.setTimeout(() => {
      (dir === "like" ? likeForm : passForm).current?.requestSubmit();
    }, 240);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (exiting) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dragging.current = false;
    moved.current = false;
    setAnimate(false);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (exiting) return;
    const ddx = e.clientX - startX.current;
    const ddy = e.clientY - startY.current;
    if (!dragging.current) {
      // Only capture as a horizontal swipe once it clearly beats vertical scroll.
      if (Math.abs(ddx) > START && Math.abs(ddx) > Math.abs(ddy)) {
        dragging.current = true;
        moved.current = true;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
      } else {
        return;
      }
    }
    e.preventDefault();
    setDx(ddx);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (exiting) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    if (dragging.current && Math.abs(dx) > THRESHOLD) {
      commit(dx > 0 ? "like" : "pass");
    } else {
      setAnimate(true);
      setDx(0); // snap back
    }
    dragging.current = false;
  };

  // Suppress the click that follows a drag so we don't also open the profile link.
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };

  const rot = Math.max(-12, Math.min(12, dx / 12));
  const transform = exiting
    ? `translateX(${exiting === "like" ? 140 : -140}%) rotate(${exiting === "like" ? 18 : -18}deg)`
    : `translateX(${dx}px) rotate(${rot}deg)`;
  const likeOpacity = Math.max(0, Math.min(1, dx / THRESHOLD));
  const passOpacity = Math.max(0, Math.min(1, -dx / THRESHOLD));

  return (
    <div
      className="swipecard pcard"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      style={{
        touchAction: "pan-y",
        transform,
        transition: animate ? "transform .28s cubic-bezier(.22,1,.36,1)" : "none",
        opacity: exiting ? 0 : 1,
        cursor: dragging.current ? "grabbing" : undefined,
        position: "relative",
      }}
    >
      <span className="swipe-stamp swipe-stamp--like" aria-hidden style={{ opacity: likeOpacity }}>LIKE</span>
      <span className="swipe-stamp swipe-stamp--pass" aria-hidden style={{ opacity: passOpacity }}>NOPE</span>
      {children}
      <div className="row" style={{ gap: 8, padding: "0 18px 16px" }}>
        <form ref={passForm} action="/api/swipe" method="post" style={{ flex: 1 }}>
          <input type="hidden" name="petId" value={petId} /><input type="hidden" name="action" value="PASS" /><input type="hidden" name="next" value={next} />
          <button className="btn btn-ghost btn-block btn-sm" type="submit" aria-label="Pass">Pass</button>
        </form>
        <form ref={likeForm} action="/api/swipe" method="post" style={{ flex: 1 }}>
          <input type="hidden" name="petId" value={petId} /><input type="hidden" name="action" value="LIKE" /><input type="hidden" name="next" value={next} />
          <button className="btn btn-primary btn-block btn-sm" type="submit" aria-label="Like">♥ Like</button>
        </form>
      </div>
    </div>
  );
}
