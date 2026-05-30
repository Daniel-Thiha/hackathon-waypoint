import { useState } from "react";
import { Layers, Plus, Trash2, CheckCircle, X } from "lucide-react";
import type { FloodZone, FloodSeverity } from "../types/forecast.types";
import { createFloodZone, deleteFloodZone } from "../apis/forecast.api";
import { useMapContext } from "../../map/contexts/MapContext";

const SEVERITY_BADGE: Record<FloodSeverity, string> = {
  low:    "bg-amber-100 text-amber-700",
  medium: "bg-orange-100 text-orange-700",
  high:   "bg-red-100 text-red-700",
};

interface ForecastPanelProps {
  zones: FloodZone[];
  onRefresh: () => void;
}

export function ForecastPanel({ zones, onRefresh }: ForecastPanelProps) {
  const { mapMode, drawnCoords, startDrawingZone, finishDrawingZone, cancelMapAction } =
    useMapContext();

  const [showForm, setShowForm] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number }[]>([]);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<FloodSeverity>("medium");
  const [saving, setSaving] = useState(false);

  function handleStartDraw() {
    setShowForm(false);
    startDrawingZone();
  }

  function handleFinish() {
    const coords = finishDrawingZone();
    if (coords.length < 3) return;
    setPendingCoords(coords);
    setTitle("");
    setSeverity("medium");
    setShowForm(true);
  }

  async function handleSave() {
    if (!title.trim() || pendingCoords.length < 3) return;
    setSaving(true);
    try {
      await createFloodZone({ title, severity, coordinates: pendingCoords });
      setShowForm(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this flood zone?")) return;
    await deleteFloodZone(id);
    onRefresh();
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          Name this zone ({pendingCoords.length} points)
        </p>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Zone title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex gap-2">
          {(["low", "medium", "high"] as FloodSeverity[]).map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                severity === s
                  ? SEVERITY_BADGE[s] + " ring-2 ring-offset-1 ring-current"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl cursor-pointer transition-colors"
          >
            {saving ? "Saving…" : "Save Zone"}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  if (mapMode === "drawing-zone") {
    return (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
          <strong>Drawing mode</strong> — tap the map to add vertices
          <br />
          <span className="text-blue-500">{drawnCoords.length} point{drawnCoords.length !== 1 ? "s" : ""} added</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFinish}
            disabled={drawnCoords.length < 3}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Finish ({drawnCoords.length} pts)
          </button>
          <button
            onClick={cancelMapAction}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> {zones.length} zone{zones.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={handleStartDraw}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Draw Zone
        </button>
      </div>
      <div className="space-y-2 max-h-44 overflow-y-auto">
        {zones.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">No flood zones published yet.</p>
        )}
        {zones.map((z) => (
          <div key={z.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
            <div>
              <p className="text-sm font-medium text-gray-800">{z.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${SEVERITY_BADGE[z.severity]}`}>
                {z.severity}
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
