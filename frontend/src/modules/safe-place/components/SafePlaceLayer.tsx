import { Circle, Tooltip } from "react-leaflet";
import type { SafePlace, Supply } from "../types/safe-place.types";

interface SafePlaceLayerProps {
  places: SafePlace[];
  selectedId?: number | null;
  onSelect?: (place: SafePlace) => void;
}

export function SafePlaceLayer({ places, selectedId, onSelect }: SafePlaceLayerProps) {
  return (
    <>
      {places.map((place) => {
        const isSelected = selectedId === place.id;
        const ratio = place.capacity > 0 ? (place.currentCount / place.capacity) * 100 : 0;
        const color = place.currentCount >= place.capacity ? "#EF4444" : "#22C55E";
        
        // Parse supplies list
        let parsedSupplies: Supply[] = [];
        try {
          if (place.supplies) {
            parsedSupplies = JSON.parse(place.supplies);
          }
        } catch (e) {
          console.error("Failed to parse supplies for place", place.id, e);
        }

        const nextSupply = parsedSupplies.length > 0 ? parsedSupplies[0] : null;

        return (
          <Circle
            key={place.id}
            center={[place.lat, place.lng]}
            radius={250} // 250 meters indicator
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: isSelected ? 0.45 : 0.25,
              weight: isSelected ? 3 : 2,
              dashArray: isSelected ? "4 4" : undefined,
            }}
            eventHandlers={{
              click: () => onSelect?.(place),
            }}
          >
            <Tooltip sticky>
              <div className="p-1 space-y-1">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-sm font-bold text-gray-900">{place.name}</span>
                  {place.currentCount >= place.capacity && (
                    <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                      FULL
                    </span>
                  )}
                </div>
                
                {place.description && (
                  <div className="text-xs text-gray-500 italic">{place.description}</div>
                )}

                <div className="text-xs font-semibold mt-1">
                  Occupancy: <span className="text-gray-900">{place.currentCount} / {place.capacity}</span> ({ratio.toFixed(0)}%)
                </div>

                <div className="flex items-center gap-2 text-[10px] mt-1 bg-gray-50 p-1 rounded border border-gray-100">
                  <span className={`font-bold ${place.hasFood ? "text-green-600" : "text-gray-400"}`}>
                    {place.hasFood ? "🍱 Has Food" : "🍲 No Food"}
                  </span>
                  <span className={`font-bold ${place.hasWater ? "text-blue-600" : "text-gray-400"}`}>
                    {place.hasWater ? "💧 Has Water" : "🥤 No Water"}
                  </span>
                </div>

                {nextSupply && (
                  <div className="text-[10px] text-gray-600 border-t border-gray-100 pt-1 mt-1 font-medium">
                    <span className="text-gray-400 block font-semibold">Next Supply Drop:</span>
                    <span>{nextSupply.item} ({nextSupply.quantity})</span>
                    <span className="text-gray-400 block text-[9px]">
                      🕒 {new Date(nextSupply.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}
