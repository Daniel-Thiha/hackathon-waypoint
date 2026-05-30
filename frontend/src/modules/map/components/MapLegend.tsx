import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const LEGEND_BODY = `
  <div style="font-size:9.5px;font-weight:600;color:#9CA3AF;letter-spacing:.4px;text-transform:uppercase;margin-bottom:5px;">
    Flood Zones
  </div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
    <div style="width:13px;height:13px;border-radius:50%;flex-shrink:0;border:2.5px solid #991B1B;background:rgba(239,68,68,.55);"></div>
    <span>Critical Flooding</span>
  </div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
    <div style="width:13px;height:13px;border-radius:50%;flex-shrink:0;border:2.5px solid #C2410C;background:rgba(249,115,22,.5);"></div>
    <span>Moderate Flood</span>
  </div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
    <div style="width:13px;height:13px;border-radius:50%;flex-shrink:0;border:2px solid #B45309;background:rgba(252,211,77,.6);"></div>
    <span>Flood Watch</span>
  </div>
  <div style="border-top:1px solid #E5E7EB;padding-top:8px;">
    <div style="font-size:9.5px;font-weight:600;color:#9CA3AF;letter-spacing:.4px;text-transform:uppercase;margin-bottom:6px;">
      Markers
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
      <div style="width:13px;height:13px;border-radius:50%;flex-shrink:0;background:#22C55E;border:2px solid #16A34A;"></div>
      <span>Safe Shelter</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
      <div style="width:13px;height:13px;border-radius:4px;flex-shrink:0;background:#2563EB;"></div>
      <span>Rescue Team</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
      <div style="width:11px;height:11px;border-radius:50%;flex-shrink:0;background:#EF4444;border:1.5px solid white;box-shadow:0 0 0 2px rgba(239,68,68,.35);"></div>
      <span>Survivor</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="width:11px;height:11px;border-radius:50%;flex-shrink:0;background:#2563EB;border:1.5px solid white;box-shadow:0 0 0 3px rgba(37,99,235,.3);"></div>
      <span>Your Location</span>
    </div>
  </div>
`;

export function MapLegend() {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "topright" });

    control.onAdd = () => {
      const isMobile = window.innerWidth < 768;
      let expanded = !isMobile;

      const div = L.DomUtil.create("div");
      div.style.cssText =
        "background:white;border-radius:10px;box-shadow:0 2px 14px rgba(0,0,0,.18);pointer-events:auto;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#374151;min-width:168px;";

      const render = () => {
        div.innerHTML = `
          <button style="
            width:100%;display:flex;align-items:center;justify-content:space-between;
            padding:9px 12px;background:none;border:none;cursor:pointer;
            font-family:inherit;
          ">
            <span style="font-size:10px;font-weight:700;color:#6B7280;letter-spacing:.6px;text-transform:uppercase;">
              Map Legend
            </span>
            <span style="font-size:11px;color:#9CA3AF;margin-left:10px;">${expanded ? "▾" : "▸"}</span>
          </button>
          ${expanded ? `<div style="padding:0 12px 12px;">${LEGEND_BODY}</div>` : ""}
        `;

        div.querySelector("button")!.addEventListener("click", () => {
          expanded = !expanded;
          render();
        });
      };

      render();
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);
      return div;
    };

    control.addTo(map);
    return () => { control.remove(); };
  }, [map]);

  return null;
}
