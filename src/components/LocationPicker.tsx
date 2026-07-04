"use client";
import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

const CITY: Record<string, [number, number]> = {
  Bengaluru: [12.9716, 77.5946], Mumbai: [19.076, 72.8777], Delhi: [28.6139, 77.209],
  Chennai: [13.0827, 80.2707], Hyderabad: [17.385, 78.4867], Pune: [18.5204, 73.8567],
  Kolkata: [22.5726, 88.3639], Ahmedabad: [23.0225, 72.5714],
};

const PickerMap = dynamic(() => import("./PickerMap"), {
  ssr: false,
  loading: () => <div className="mapwrap" style={{ height: 260, display: "grid", placeItems: "center", color: "var(--muted-text)" }}>Loading map…</div>,
});

export default function LocationPicker() {
  const [city, setCity] = useState("Bengaluru");
  const [pos, setPos] = useState<[number, number]>(CITY["Bengaluru"]);

  const onCity = (c: string) => {
    setCity(c);
    if (CITY[c]) setPos(CITY[c]);
  };

  const useGPS = useCallback(() => {
    if (!navigator.geolocation) return alert("Geolocation is not available in this browser.");
    navigator.geolocation.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => alert("Could not get your location. Please pick it on the map."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const center = useMemo(() => pos, [pos]);

  return (
    <div className="field">
      <label>Your location *</label>
      <div className="row" style={{ marginBottom: 10 }}>
        <select value={city} onChange={(e) => onCity(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
          {Object.keys(CITY).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="Other">Other (drop a pin)</option>
        </select>
        <button type="button" className="btn btn-sm btn-ghost" onClick={useGPS}>📍 Use my location</button>
      </div>
      <PickerMap center={center} pos={pos} onChange={setPos} />
      <p className="hint">Click the map or drag the pin to set your exact location. Used only to find nearby companions.</p>
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="lat" value={pos[0]} />
      <input type="hidden" name="lng" value={pos[1]} />
    </div>
  );
}
