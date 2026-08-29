"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Bundlers break Leaflet's default marker icon URLs (they resolve relative to the JS chunk,
// not the page) — point them at the CDN copies that ship with the leaflet package version.
const riderIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Must only ever be loaded via `next/dynamic(..., { ssr: false })` — Leaflet touches
 * `window` at import time and will crash server rendering.
 */
export function LiveTrackingMap({
  latitude,
  longitude,
  riderName,
}: {
  latitude: number;
  longitude: number;
  riderName: string;
}) {
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full rounded-lg border border-border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={riderIcon}>
        <Popup>{riderName} is on the way</Popup>
      </Marker>
    </MapContainer>
  );
}

export default LiveTrackingMap;
