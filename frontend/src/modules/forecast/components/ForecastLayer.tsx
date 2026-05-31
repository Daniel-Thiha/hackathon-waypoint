import { Circle, Tooltip } from "react-leaflet";
import type { FloodZone, FloodSeverity } from "../types/forecast.types";

const SEVERITY: Record<FloodSeverity, { stroke: string; fill: string; fillOpacity: number; weight: number; depth: string }> = {
  low:    { stroke: "#B45309", fill: "#FCD34D", fillOpacity: 0.40, weight: 2.5, depth: "< 0.5 m"      },
  medium: { stroke: "#C2410C", fill: "#F97316", fillOpacity: 0.38, weight: 2.5, depth: "0.5 – 1.5 m"  },
  high:   { stroke: "#991B1B", fill: "#EF4444", fillOpacity: 0.40, weight: 3,   depth: "> 1.5 m"       },
};


interface ForecastLayerProps {
  zones: FloodZone[];
}

export function ForecastLayer({ zones }: ForecastLayerProps) {
  return (
    <>
      {zones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.lat, zone.lng]}
          radius={zone.radius}
          pathOptions={{
            color: SEVERITY[zone.severity].stroke,
            fillColor: SEVERITY[zone.severity].fill,
            fillOpacity: SEVERITY[zone.severity].fillOpacity,
            weight: SEVERITY[zone.severity].weight,
          }}
        >
          <Tooltip direction="center" permanent opacity={0.9}>
            <div style={{ textAlign: "center", lineHeight: 1.3 }}>
              <span style={{ fontSize: 11, fontWeight: 600, display: "block" }}>{zone.title}</span>
              <span style={{ fontSize: 10, color: "#6B7280" }}>{SEVERITY[zone.severity].depth}</span>
            </div>
          </Tooltip>
        </Circle>
      ))}
    </>
  );
}
