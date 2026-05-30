import { Circle, Tooltip } from "react-leaflet";
import type { FloodZone } from "../types/forecast.types";

const SEVERITY_COLOR: Record<string, string> = {
  low: "#EAB308",
  medium: "#F97316",
  high: "#EF4444",
};

const SEVERITY_OPACITY: Record<string, number> = {
  low: 0.25,
  medium: 0.30,
  high: 0.35,
};

const FLOOD_TYPE_LABEL: Record<string, string> = {
  flash: "Flash Flood",
  river: "River Flood",
  coastal: "Coastal Flood",
  urban: "Urban Flood",
};

interface ForecastLayerProps {
  zones: FloodZone[];
  selectedId?: number | null;
  onSelect?: (zone: FloodZone) => void;
}

export function ForecastLayer({ zones, selectedId, onSelect }: ForecastLayerProps) {
  return (
    <>
      {zones.map((zone) => {
        const color = SEVERITY_COLOR[zone.severity] ?? "#EF4444";
        const fillOpacity = SEVERITY_OPACITY[zone.severity] ?? 0.3;
        const isSelected = selectedId === zone.id;

        return (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: isSelected ? fillOpacity + 0.15 : fillOpacity,
              weight: isSelected ? 3 : 2,
              dashArray: isSelected ? "6 4" : undefined,
            }}
            eventHandlers={{ click: () => onSelect?.(zone) }}
          >
            <Tooltip sticky>
              <div className="text-sm font-semibold">{zone.title}</div>
              {zone.floodType && (
                <div className="text-xs text-gray-500">{FLOOD_TYPE_LABEL[zone.floodType]}</div>
              )}
              <div className="text-xs capitalize">{zone.severity} severity</div>
              <div className="text-xs">{zone.radius.toLocaleString()} m radius</div>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}
