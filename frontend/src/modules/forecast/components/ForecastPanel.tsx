import { Layers, Trash2 } from "lucide-react";
import type { FloodZone, FloodSeverity } from "../types/forecast.types";
import { deleteFloodZone } from "../apis/forecast.api";

const SEVERITY_BADGE: Record<FloodSeverity, { cls: string; label: string }> = {
  low:    { cls: "bg-amber-100 text-amber-700",  label: "< 0.5 m"    },
  medium: { cls: "bg-orange-100 text-orange-700", label: "0.5–1.5 m" },
  high:   { cls: "bg-red-100 text-red-700",       label: "> 1.5 m"   },
};

interface ForecastPanelProps {
  zones: FloodZone[];
  onRefresh: () => void;
}

export function ForecastPanel({ zones, onRefresh }: ForecastPanelProps) {
  async function handleDelete(id: number) {
    if (!confirm("Delete this flood zone?")) return;
    await deleteFloodZone(id);
    onRefresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> {zones.length} zone{zones.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-2 max-h-44 overflow-y-auto">
        {zones.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">No flood zones published yet.</p>
        )}
        {zones.map((z) => (
          <div key={z.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
            <div>
              <p className="text-sm font-medium text-gray-800">{z.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_BADGE[z.severity as FloodSeverity].cls}`}>
                {SEVERITY_BADGE[z.severity as FloodSeverity].label}
              </span>
            </div>
            <button
              onClick={() => handleDelete(z.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
