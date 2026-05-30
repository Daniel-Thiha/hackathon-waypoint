import { Circle, Tooltip } from "react-leaflet";
import type { FloodZone, FloodSeverity } from "../types/forecast.types";

const SEVERITY: Record<FloodSeverity, { stroke: string; fill: string; fillOpacity: number; weight: number }> = {
  low:    { stroke: "#B45309", fill: "#FCD34D", fillOpacity: 0.40, weight: 2.5 },
  medium: { stroke: "#C2410C", fill: "#F97316", fillOpacity: 0.38, weight: 2.5 },
  high:   { stroke: "#991B1B", fill: "#EF4444", fillOpacity: 0.40, weight: 3   },
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
            <span style={{ fontSize: 11, fontWeight: 600 }}>{zone.title}</span>
          </Tooltip>
        </Circle>
      ))}
    </>
  );
}
