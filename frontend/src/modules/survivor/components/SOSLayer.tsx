import { CircleMarker, Popup } from "react-leaflet";
import type { SosRequest } from "../types/survivor.types";

interface SOSLayerProps {
  sosRequests: SosRequest[];
}

export function SOSLayer({ sosRequests }: SOSLayerProps) {
  const active = sosRequests.filter((s) => s.status !== "completed");

  return (
    <>
      {active.map((s) => {
        const lat = s.lastKnownLat ?? s.lat;
        const lng = s.lastKnownLng ?? s.lng;
        return (
          <CircleMarker
            key={s.id}
            center={[lat, lng]}
            radius={10}
            pathOptions={{ color: "#B91C1C", fillColor: "#EF4444", fillOpacity: 0.85, weight: 2.5 }}
          >
            <Popup>
              <div style={{ minWidth: 150 }}>
                <p style={{ fontWeight: 700, fontSize: 13 }}>{s.survivorName}</p>
                {s.phone && <p style={{ fontSize: 11, color: "#6B7280" }}>{s.phone}</p>}
                {s.notes && <p style={{ fontSize: 11, color: "#4B5563", marginTop: 4, fontStyle: "italic" }}>"{s.notes}"</p>}
                <span style={{
                  display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 600,
                  padding: "2px 8px", borderRadius: 12,
                  background: s.status === "pending" ? "#FEE2E2" : "#FFEDD5",
                  color: s.status === "pending" ? "#DC2626" : "#EA580C",
                  textTransform: "capitalize",
                }}>
                  {s.status}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
