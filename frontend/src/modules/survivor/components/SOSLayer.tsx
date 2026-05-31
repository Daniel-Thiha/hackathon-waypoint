import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { SosRequest } from "../types/survivor.types";

interface SOSLayerProps {
  sosRequests: SosRequest[];
}

// Assigned SOS uses orange tint so admins can distinguish rescue progress at a glance
function createSosIcon(status: "pending" | "assigned") {
  const color = status === "pending" ? "#DC2626" : "#EA580C";
  return L.divIcon({
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -46],
    html: `
      <style>
        @keyframes sos-pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.55)}60%{box-shadow:0 0 0 9px rgba(220,38,38,0)}}
        .sos-ring{animation:sos-pulse 2s ease-in-out infinite}
      </style>
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div class="sos-ring" style="
          width:32px;height:32px;border-radius:50%;
          background:${color};border:2.5px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,.35);
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:8px;font-weight:900;
          font-family:system-ui,-apple-system,sans-serif;letter-spacing:.5px;
        ">SOS</div>
        <div style="
          width:0;height:0;margin-top:-2px;
          border-left:7px solid transparent;
          border-right:7px solid transparent;
          border-top:10px solid ${color};
        "></div>
      </div>`,
  });
}

const PENDING_ICON = createSosIcon("pending");
const ASSIGNED_ICON = createSosIcon("assigned");

export function SOSLayer({ sosRequests }: SOSLayerProps) {
  const active = sosRequests.filter((s) => s.status !== "completed");

  return (
    <>
      {active.map((s) => {
        const lat = s.lastKnownLat ?? s.lat;
        const lng = s.lastKnownLng ?? s.lng;
        const icon = s.status === "assigned" ? ASSIGNED_ICON : PENDING_ICON;
        return (
          <Marker key={s.id} position={[lat, lng]} icon={icon}>
            <Popup>
              <div style={{ minWidth: 155 }}>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{s.survivorName}</p>
                {s.phone && <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>{s.phone}</p>}
                {s.notes && (
                  <p style={{ fontSize: 11, color: "#4B5563", marginBottom: 4, fontStyle: "italic" }}>
                    "{s.notes}"
                  </p>
                )}
                <span style={{
                  display: "inline-block", fontSize: 11, fontWeight: 600,
                  padding: "2px 8px", borderRadius: 12,
                  background: s.status === "pending" ? "#FEE2E2" : "#FFEDD5",
                  color: s.status === "pending" ? "#DC2626" : "#EA580C",
                  textTransform: "capitalize",
                }}>
                  {s.status}
                </span>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
