"use client";
import dynamic from "next/dynamic";
import type { Pin } from "./MapInner";

const Inner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="mapwrap" style={{ display: "grid", placeItems: "center", color: "var(--muted-text)" }}>
      Loading map…
    </div>
  ),
});

export default function Map(props: { center: [number, number]; radiusKm: number; pins: Pin[] }) {
  return (
    <div className="mapwrap">
      <Inner {...props} />
    </div>
  );
}
