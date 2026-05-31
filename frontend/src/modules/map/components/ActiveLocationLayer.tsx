import { useEffect, useRef } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import type { ActiveLocation, ActiveRole } from "../../active-location/types/active-location.types";
import type { MyLocation } from "../../../hooks/useMyLocation";

// ── SVG icons ─────────────────────────────────────────────────────────────────

const SURVIVOR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

const VOLUNTEER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`;

const RESCUE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M10 17H2V7h10v10z"/><path d="M10 9h4l3 3v5h-7V9z"/><circle cx="5" cy="17" r="2"/><circle cx="15.5" cy="17" r="2"/><path d="M5 10v3M3.5 11.5h3"/></svg>`;

// ── Individual pin badges ─────────────────────────────────────────────────────

function badgePin(bgColor: string, svg: string) {
  return L.divIcon({
    html: `<div style="
      width:32px;height:32px;border-radius:8px;
      background:${bgColor};
      border:2.5px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
    ">${svg}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ── Cluster bubble icon ───────────────────────────────────────────────────────

function clusterIcon(bgColor: string, svg: string) {
  return (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    return L.divIcon({
      html: `<div style="
        position:relative;
        width:40px;height:40px;border-radius:10px;
        background:${bgColor};
        border:2.5px solid #fff;
        box-shadow:0 2px 10px rgba(0,0,0,.3);
        display:flex;align-items:center;justify-content:center;
      ">
        ${svg}
        <span style="
          position:absolute;top:-7px;right:-7px;
          background:#1e293b;color:#fff;
          font-size:10px;font-weight:700;
          width:18px;height:18px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          border:1.5px solid #fff;
        ">${count}</span>
      </div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };
}

// ── Blue pulsing dot (own location) ──────────────────────────────────────────

function myDot() {
  return L.divIcon({
    html: `<div class="my-location-dot"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

// ── Role config ───────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<ActiveRole, {
  color: string;
  svg: string;
  label: string;
}> = {
  Survivor:   { color: "#EF4444", svg: SURVIVOR_SVG,  label: "Survivor"    },
  Volunteer:  { color: "#16A34A", svg: VOLUNTEER_SVG, label: "Volunteer"   },
  RescueTeam: { color: "#2563EB", svg: RESCUE_SVG,    label: "Rescue Team" },
};

// Survivors are shown exclusively via SOS pins — exclude them from active-location badges
const ROLES: ActiveRole[] = ["Volunteer", "RescueTeam"];

// ── Per-role cluster groups ───────────────────────────────────────────────────

interface PerRoleClustersProps {
  locations: ActiveLocation[];
  sessionId: string | null;
  authLoading: boolean;
}

function PerRoleClusters({ locations, sessionId, authLoading }: PerRoleClustersProps) {
  const map = useMap();
  const groupsRef = useRef<Record<ActiveRole, L.MarkerClusterGroup> | null>(null);

  useEffect(() => {
    const groups = Object.fromEntries(
      ROLES.map((role) => {
        const { color, svg } = ROLE_CONFIG[role];
        return [
          role,
          L.markerClusterGroup({
            iconCreateFunction: clusterIcon(color, svg),
            maxClusterRadius: 40,
            disableClusteringAtZoom: 17,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
          }),
        ];
      })
    ) as Record<ActiveRole, L.MarkerClusterGroup>;

    groupsRef.current = groups;
    ROLES.forEach((r) => map.addLayer(groups[r]));
    return () => {
      ROLES.forEach((r) => map.removeLayer(groups[r]));
      groupsRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const groups = groupsRef.current;
    if (!groups) return;

    ROLES.forEach((r) => groups[r].clearLayers());

    // While auth is resolving we don't know who we are yet — show nothing
    // to avoid stale DB entries appearing as own-user pins.
    if (authLoading) return;

    locations
      .filter((loc) => loc.sessionId !== sessionId)
      .forEach((loc) => {
        const cfg = ROLE_CONFIG[loc.role];
        if (!cfg) return;
        const group = groups[loc.role];
        if (!group) return;
        const marker = L.marker([loc.lat, loc.lng], {
          icon: badgePin(cfg.color, cfg.svg),
        });
        marker.bindPopup(`<strong style="font-size:13px">${cfg.label}</strong>`);
        group.addLayer(marker);
      });
  }, [locations, sessionId, authLoading]);

  return null;
}

// ── Public component ──────────────────────────────────────────────────────────

interface ActiveLocationLayerProps {
  locations: ActiveLocation[];
  myLocation: MyLocation | null;
  sessionId: string | null;
  authLoading: boolean;
}

export function ActiveLocationLayer({
  locations,
  myLocation,
  sessionId,
  authLoading,
}: ActiveLocationLayerProps) {
  return (
    <>
      <PerRoleClusters
        locations={locations}
        sessionId={sessionId}
        authLoading={authLoading}
      />

      {/* Own location — always on top, never clustered */}
      {myLocation && (
        <Marker
          position={[myLocation.lat, myLocation.lng]}
          icon={myDot()}
          zIndexOffset={9999}
        >
          <Popup>
            <p style={{ fontWeight: 700, fontSize: 13 }}>Your location</p>
          </Popup>
        </Marker>
      )}
    </>
  );
}
