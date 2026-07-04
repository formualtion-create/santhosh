"use client";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const pin = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

function ClickCapture({ onChange }: { onChange: (p: [number, number]) => void }) {
  useMapEvents({ click(e) { onChange([e.latlng.lat, e.latlng.lng]); } });
  return null;
}

export default function PickerMap({
  center, pos, onChange,
}: { center: [number, number]; pos: [number, number]; onChange: (p: [number, number]) => void }) {
  return (
    <div className="mapwrap" style={{ height: 260 }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="leaflet-container">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        <ClickCapture onChange={onChange} />
        <Marker
          position={pos}
          icon={pin}
          draggable
          eventHandlers={{ dragend: (e) => { const m = e.target as L.Marker; const ll = m.getLatLng(); onChange([ll.lat, ll.lng]); } }}
        />
      </MapContainer>
    </div>
  );
}
