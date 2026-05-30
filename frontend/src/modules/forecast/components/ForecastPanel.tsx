import { useState, useCallback } from "react";
import { Waves, Plus, Trash2, X, MapPin, AlertTriangle } from "lucide-react";
import { useMapContext } from "../../map/contexts/MapContext";
import { createFloodZone, deleteFloodZone } from "../apis/forecast.api";
import type { FloodZone, Severity, FloodType, CreateFloodZoneInput } from "../types/forecast.types";
import type { LatLng } from "../../map/types/map.types";

const SEVERITY_BADGE: Record<Severity, string> = {
  low: "bg-yellow-100 text-yellow-800",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-800",
};

const FLOOD_TYPE_LABEL: Record<FloodType, string> = {
  flash: "Flash Flood",
  river: "River Flood",
  coastal: "Coastal Flood",
  urban: "Urban Flood",
};

interface ForecastPanelProps {
  zones: FloodZone[];
  selectedId: number | null;
  onSelect: (zone: FloodZone | null) => void;
  onRefresh: () => void;
}

interface FormState {
  title: string;
  severity: Severity;
  floodType: FloodType | "";
  radius: string;
  description: string;
}

const DEFAULT_FORM: FormState = {
  title: "",
  severity: "medium",
  floodType: "",
  radius: "1000",
  description: "",
};

export function ForecastPanel({ zones, selectedId, onSelect, onRefresh }: ForecastPanelProps) {
  const { startPickingLocation, cancelMapAction, mapMode } = useMapContext();
  const [pickedLocation, setPickedLocation] = useState<LatLng | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const isPicking = mapMode === "picking-location";
  const showForm = pickedLocation !== null;

  const handleAddClick = useCallback(() => {
    setPickedLocation(null);
    setForm(DEFAULT_FORM);
    setError("");
    startPickingLocation((latlng) => {
      setPickedLocation(latlng);
    });
  }, [startPickingLocation]);

  const handleCancel = useCallback(() => {
    setPickedLocation(null);
    setForm(DEFAULT_FORM);
    setError("");
    cancelMapAction();
  }, [cancelMapAction]);

  const handleSubmit = useCallback(async () => {
    if (!pickedLocation) return;
    if (!form.title.trim()) { setError("Title is required"); return; }
    const radius = Number(form.radius);
    if (isNaN(radius) || radius < 100 || radius > 50000) {
      setError("Radius must be between 100 and 50,000 m");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const input: CreateFloodZoneInput = {
        title: form.title.trim(),
        severity: form.severity,
        lat: pickedLocation.lat,
        lng: pickedLocation.lng,
        radius,
        ...(form.floodType ? { floodType: form.floodType as FloodType } : {}),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      };
      await createFloodZone(input);
      setPickedLocation(null);
      setForm(DEFAULT_FORM);
      onRefresh();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [pickedLocation, form, onRefresh]);

  const handleDelete = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      await deleteFloodZone(id);
      if (selectedId === id) onSelect(null);
      onRefresh();
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  }, [selectedId, onSelect, onRefresh]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-blue-500" strokeWidth={2} />
          <span className="font-semibold text-gray-900 text-sm">Flood Forecast</span>
          {zones.length > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-md">
              {zones.length}
            </span>
          )}
        </div>
        {!showForm && (
          <button
            onClick={isPicking ? cancelMapAction : handleAddClick}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isPicking
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            {isPicking ? (
              <><X className="w-3.5 h-3.5" /> Cancel</>
            ) : (
              <><Plus className="w-3.5 h-3.5" /> Add Zone</>
            )}
          </button>
        )}
      </div>

      {/* Picking hint */}
      {isPicking && !showForm && (
        <div className="mx-4 mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 flex-shrink-0">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-blue-700 text-xs leading-relaxed">
            Click anywhere on the map to place the flood zone center.
          </p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="mx-4 mt-3 bg-gray-50 rounded-2xl p-4 flex-shrink-0 border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            New Flood Zone
          </p>

          {/* Coords display */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Lat</p>
              <p className="text-xs font-medium text-gray-700">{pickedLocation!.lat.toFixed(5)}</p>
            </div>
            <div className="flex-1 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Lng</p>
              <p className="text-xs font-medium text-gray-700">{pickedLocation!.lng.toFixed(5)}</p>
            </div>
          </div>

          {/* Title */}
          <input
            placeholder="Zone title *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Severity */}
          <div className="flex gap-1.5 mb-2">
            {(["low", "medium", "high"] as Severity[]).map((s) => (
              <button
                key={s}
                onClick={() => setForm((f) => ({ ...f, severity: s }))}
                className={`flex-1 text-xs font-medium py-1.5 rounded-lg capitalize transition-colors cursor-pointer border ${
                  form.severity === s
                    ? s === "low" ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                      : s === "medium" ? "bg-orange-100 border-orange-400 text-orange-800"
                      : "bg-red-100 border-red-400 text-red-800"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Flood Type */}
          <select
            value={form.floodType}
            onChange={(e) => setForm((f) => ({ ...f, floodType: e.target.value as FloodType | "" }))}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          >
            <option value="">Type (optional)</option>
            {(Object.entries(FLOOD_TYPE_LABEL) as [FloodType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {/* Radius */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              placeholder="Radius (m)"
              value={form.radius}
              onChange={(e) => setForm((f) => ({ ...f, radius: e.target.value }))}
              min={100}
              max={50000}
              className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-xs text-gray-400 whitespace-nowrap">meters</span>
          </div>

          {/* Description */}
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />

          {error && (
            <p className="text-red-500 text-xs mb-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 text-sm text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-60 py-2 rounded-xl transition-colors cursor-pointer font-medium"
            >
              {saving ? "Saving…" : "Save Zone"}
            </button>
          </div>
        </div>
      )}

      {/* Zone list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        {zones.length === 0 && !showForm && !isPicking && (
          <p className="text-gray-400 text-sm text-center py-6">
            No flood zones yet. Click "Add Zone" to draw one on the map.
          </p>
        )}
        {zones.map((zone) => (
          <div
            key={zone.id}
            onClick={() => onSelect(selectedId === zone.id ? null : zone)}
            className={`rounded-2xl border p-3 cursor-pointer transition-all ${
              selectedId === zone.id
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{zone.title}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md capitalize ${SEVERITY_BADGE[zone.severity]}`}>
                    {zone.severity}
                  </span>
                  {zone.floodType && (
                    <span className="text-[11px] text-gray-500">
                      {FLOOD_TYPE_LABEL[zone.floodType]}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400">{zone.radius.toLocaleString()} m</span>
                </div>
                {zone.description && (
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{zone.description}</p>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(zone.id); }}
                disabled={deleting === zone.id}
                className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 flex-shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
