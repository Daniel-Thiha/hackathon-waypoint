import { Pencil, Trash2 } from "lucide-react";
import type { FloodZone, Severity, FloodType } from "../types/forecast.types";

const SEVERITY_BADGE: Record<Severity, { label: string; cls: string }> = {
  low:    { label: "< 0.5 m",     cls: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
  medium: { label: "0.5–1.5 m",   cls: "bg-orange-100 text-orange-800 border border-orange-200" },
  high:   { label: "> 1.5 m",     cls: "bg-red-100 text-red-700 border border-red-200" },
};

const FLOOD_TYPE_LABEL: Record<FloodType, string> = {
  flash:   "Flash Flood",
  river:   "River Flood",
  coastal: "Coastal Flood",
  urban:   "Urban Flood",
};

interface ZoneListProps {
  zones: FloodZone[];
  selectedId: number | null;
  onZoneClick: (zone: FloodZone) => void;
  onEdit: (zone: FloodZone, e: React.MouseEvent) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
  deleting: number | null;
}

export function ZoneList({ zones, selectedId, onZoneClick, onEdit, onDelete, deleting }: ZoneListProps) {
  if (zones.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-10">
        No flood zones yet. Go to Overview and click + Forecast.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {zones.map((zone) => {
        const badge = SEVERITY_BADGE[zone.severity];
        const isSelected = selectedId === zone.id;

        return (
          <div
            key={zone.id}
            onClick={() => onZoneClick(zone)}
            className={`rounded-2xl border p-4 cursor-pointer transition-all ${
              isSelected
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="font-bold text-gray-900 text-sm leading-tight">{zone.title}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${badge.cls}`}>
                {badge.label}
              </span>
            </div>

            {zone.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                {zone.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-400 truncate">
                {zone.floodType ? `${FLOOD_TYPE_LABEL[zone.floodType]} • ` : ""}
                Radius: {zone.radius.toLocaleString()}m •{" "}
                {new Date(zone.createdAt).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <button
                  onClick={(e) => onEdit(zone, e)}
                  className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => onDelete(zone.id, e)}
                  disabled={deleting === zone.id}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
