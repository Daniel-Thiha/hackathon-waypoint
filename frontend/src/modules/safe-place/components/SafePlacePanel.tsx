import { useState } from "react";
import { MapPin, Plus, Trash2, Droplets, UtensilsCrossed, X } from "lucide-react";
import type { SafePlace } from "../types/safe-place.types";
import type { LatLng } from "../../map/types/map.types";
import { createSafePlace, deleteSafePlace } from "../apis/safe-place.api";
import { useMapContext } from "../../map/contexts/MapContext";

interface SafePlacePanelProps {
  places: SafePlace[];
  onRefresh: () => void;
}

function CapacityBar({ place }: { place: SafePlace }) {
  const pct = place.capacity > 0 ? Math.min(100, (place.currentCount / place.capacity) * 100) : 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-orange-400" : "bg-green-500";
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

interface AddFormState {
  name: string;
  description: string;
  capacity: string;
  hasFood: boolean;
  hasWater: boolean;
  location: LatLng | null;
}

const emptyForm = (): AddFormState => ({
  name: "", description: "", capacity: "50",
  hasFood: false, hasWater: false, location: null,
});

export function SafePlacePanel({ places, onRefresh }: SafePlacePanelProps) {
  const { mapMode, startPickingLocation, cancelMapAction } = useMapContext();
  const [form, setForm] = useState<AddFormState | null>(null);
  const [saving, setSaving] = useState(false);

  function handleAdd() {
    setForm(emptyForm());
  }

  function handlePickLocation() {
    startPickingLocation((latlng) => {
      setForm((prev) => prev ? { ...prev, location: latlng } : prev);
    });
  }

  async function handleSave() {
    if (!form || !form.name.trim() || !form.location) return;
    setSaving(true);
    try {
      await createSafePlace({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        lat: form.location.lat,
        lng: form.location.lng,
        capacity: Number(form.capacity) || 50,
        hasFood: form.hasFood,
        hasWater: form.hasWater,
      });
      setForm(null);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this safe place?")) return;
    await deleteSafePlace(id);
    onRefresh();
  }

  if (mapMode === "picking-location") {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          <strong>Tap the map</strong> to set the safe place location
        </div>
        <button
          onClick={cancelMapAction}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-xl cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (form) {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Add Safe Place</p>
          <button onClick={() => setForm(null)} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Capacity"
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
          <button
            onClick={handlePickLocation}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
              form.location
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <MapPin className="w-4 h-4" />
            {form.location ? "✓ Set" : "Pin"}
          </button>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.hasFood} onChange={(e) => setForm({ ...form, hasFood: e.target.checked })} className="rounded" />
            <UtensilsCrossed className="w-3.5 h-3.5" /> Food
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.hasWater} onChange={(e) => setForm({ ...form, hasWater: e.target.checked })} className="rounded" />
            <Droplets className="w-3.5 h-3.5" /> Water
          </label>
        </div>
        <button
          onClick={handleSave}
          disabled={!form.name.trim() || !form.location || saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
        >
          {saving ? "Saving…" : "Save Safe Place"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
          <MapPin className="w-4 h-4" /> {places.length} place{places.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Place
        </button>
      </div>
      <div className="space-y-2 max-h-44 overflow-y-auto">
        {places.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">No safe places yet.</p>
        )}
        {places.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
            <div className="flex-1 min-w-0 mr-2">
              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
              <p className="text-xs text-gray-500">{p.currentCount}/{p.capacity} capacity</p>
              <CapacityBar place={p} />
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {p.hasFood && <UtensilsCrossed className="w-3.5 h-3.5 text-green-500" />}
              {p.hasWater && <Droplets className="w-3.5 h-3.5 text-blue-500" />}
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
