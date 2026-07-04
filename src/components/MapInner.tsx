"use client";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const meIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#6366F1;border:3px solid #fff;box-shadow:0 0 0 4px rgba(99,102,241,.3)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export type Pin = { id: string; name: string; city: string; lat: number; lng: number; species: string; score: number };

export default function MapInner({
  center,
  radiusKm,
  pins,
}: {
  center: [number, number];
  radiusKm: number;
  pins: Pin[];
}) {
  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="leaflet-container">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={meIcon}>
        <Popup>You are here</Popup>
      </Marker>
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={{ color: "#6366F1", fillColor: "#6366F1", fillOpacity: 0.07, weight: 1.5 }}
      />
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
          <Popup>
            <strong>{p.name}</strong>
            <br />
            {p.species} · {p.city}
            <br />
            <span style={{ color: "#16A34A", fontWeight: 700 }}>{p.score}% PawScore</span>
            <br />
            <Link href={`/profile/${p.id}`}>View profile →</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
