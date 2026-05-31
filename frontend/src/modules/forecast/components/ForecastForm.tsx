import { Crosshair } from "lucide-react";
import type { Severity, FloodType } from "../types/forecast.types";
import type { FormState } from "../types/forecast.form";

interface ForecastFormProps {
  heading: string;
  values: FormState;
  onChange: (values: FormState) => void;
  onPickLocation: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPicking: boolean;
  saving: boolean;
  error: string;
  submitLabel: string;
  submitColor?: "red" | "blue";
}

const INPUT = "w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

export function ForecastForm({
  heading,
  values,
  onChange,
  onPickLocation,
  onSubmit,
  onCancel,
  isPicking,
  saving,
  error,
  submitLabel,
  submitColor = "red",
}: ForecastFormProps) {
  const set = (patch: Partial<FormState>) => onChange({ ...values, ...patch });

  return (
    <div>
      <h2 className="text-base font-bold text-gray-900 mb-4">{heading}</h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Area name"
          value={values.title}
          onChange={(e) => set({ title: e.target.value })}
          className={`${INPUT} placeholder-gray-400`}
        />

        <button
          onClick={onPickLocation}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
            isPicking
              ? "bg-blue-100 border-blue-400 text-blue-600"
              : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500"
          }`}
        >
          <Crosshair className="w-4 h-4" />
          {isPicking ? "Click on the map to place zone…" : "Pick location from map"}
        </button>

        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            value={values.lat}
            onChange={(e) => set({ lat: e.target.value })}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            step="any"
            value={values.lng}
            onChange={(e) => set({ lng: e.target.value })}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <select
          value={values.severity}
          onChange={(e) => set({ severity: e.target.value as Severity })}
          className={`${INPUT} bg-white text-gray-800`}
        >
          <option value="low">&lt; 0.5 m — Low</option>
          <option value="medium">0.5 – 1.5 m — Moderate</option>
          <option value="high">&gt; 1.5 m — Critical</option>
        </select>

        <select
          value={values.floodType}
          onChange={(e) => set({ floodType: e.target.value as FloodType | "" })}
          className={`${INPUT} bg-white text-gray-700`}
        >
          <option value="">Flood Type (optional)</option>
          <option value="flash">Flash Flood</option>
          <option value="river">River Flood</option>
          <option value="coastal">Coastal Flood</option>
          <option value="urban">Urban Flood</option>
        </select>

        <input
          type="number"
          placeholder="Radius (meters)"
          value={values.radius}
          min={100}
          max={50000}
          onChange={(e) => set({ radius: e.target.value })}
          className={INPUT}
        />

        <textarea
          placeholder="Description of flood forecast"
          value={values.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={3}
          className={`${INPUT} resize-none`}
        />

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={onSubmit}
            disabled={saving}
            className={`flex-1 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors cursor-pointer ${
              submitColor === "blue"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {saving ? "Saving…" : submitLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-5 text-gray-600 hover:text-gray-900 text-sm font-medium py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
