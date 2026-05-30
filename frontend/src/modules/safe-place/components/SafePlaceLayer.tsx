import { CircleMarker, Popup } from "react-leaflet";
import type { SafePlace } from "../types/safe-place.types";

interface SafePlaceLayerProps {
  places: SafePlace[];
}

export function SafePlaceLayer({ places }: SafePlaceLayerProps) {
  return (
    <>
      {places.map((p) => {
        const pct = p.capacity > 0 ? Math.min(100, (p.currentCount / p.capacity) * 100) : 0;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={9}
            pathOptions={{
              color: "#16A34A",
              fillColor: "#22C55E",
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{p.name}</p>
                <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
                  {p.currentCount} / {p.capacity} capacity
                </p>
                <div style={{ background: "#E5E7EB", borderRadius: 4, height: 6 }}>
                  <div style={{ background: pct >= 100 ? "#EF4444" : pct >= 75 ? "#F97316" : "#22C55E", width: `${pct}%`, height: 6, borderRadius: 4 }} />
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
