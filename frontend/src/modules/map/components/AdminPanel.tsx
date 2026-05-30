import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, Users, MapPin, TrendingUp,
  Plus, Clock, Calendar,
} from "lucide-react";
import { useMapContext } from "../contexts/MapContext";
import { createFloodZone, deleteFloodZone, updateFloodZone } from "../../forecast/apis/forecast.api";
import { ForecastForm } from "../../forecast/components/ForecastForm";
import { ZoneList } from "../../forecast/components/ZoneList";
import { DEFAULT_FORM } from "../../forecast/types/forecast.form";
import type { FormState } from "../../forecast/types/forecast.form";
import type { FloodZone, FloodType, CreateFloodZoneInput } from "../../forecast/types/forecast.types";

type Tab = "overview" | "forecasts" | "safe-places" | "supplies";

interface AdminPanelProps {
  zones: FloodZone[];
  selectedId: number | null;
  onSelect: (zone: FloodZone | null) => void;
  onRefresh: () => void;
}

export function AdminPanel({ zones, selectedId, onSelect, onRefresh }: AdminPanelProps) {
  const { startPickingLocation, cancelMapAction, mapMode, panTo } = useMapContext();

  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [editingZone, setEditingZone] = useState<FloodZone | null>(null);
  const [editForm, setEditForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const isPicking = mapMode === "picking-location";

  const handleTabChange = useCallback((tab: Tab) => {
    if (isPicking) cancelMapAction();
    setShowForm(false);
    setEditingZone(null);
    setActiveTab(tab);
  }, [isPicking, cancelMapAction]);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleAddForecast = useCallback(() => {
    setForm(DEFAULT_FORM);
    setFormError("");
    setShowForm(true);
    setActiveTab("overview");
  }, []);

  const handlePickCreate = useCallback(() => {
    startPickingLocation((latlng) =>
      setForm((f) => ({ ...f, lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) }))
    );
  }, [startPickingLocation]);

  const handleSubmit = useCallback(async () => {
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    const radius = parseInt(form.radius, 10);

    if (!form.title.trim()) { setFormError("Area name is required"); return; }
    if (isNaN(lat) || lat < -90 || lat > 90) { setFormError("Invalid latitude"); return; }
    if (isNaN(lng) || lng < -180 || lng > 180) { setFormError("Invalid longitude"); return; }
    if (isNaN(radius) || radius < 100 || radius > 50000) { setFormError("Radius must be 100–50,000 m"); return; }

    setSaving(true);
    setFormError("");
    try {
      const input: CreateFloodZoneInput = {
        title: form.title.trim(), severity: form.severity, lat, lng, radius,
        ...(form.floodType ? { floodType: form.floodType as FloodType } : {}),
        ...(form.description.trim() ? { description: form.description.trim() } : {}),
      };
      await createFloodZone(input);
      setShowForm(false);
      setForm(DEFAULT_FORM);
      onRefresh();
    } catch {
      setFormError("Failed to create. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [form, onRefresh]);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEditClick = useCallback((zone: FloodZone, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingZone(zone);
    setEditForm({
      title: zone.title, lat: String(zone.lat), lng: String(zone.lng),
      severity: zone.severity, floodType: zone.floodType ?? "",
      radius: String(zone.radius), description: zone.description ?? "",
    });
    setFormError("");
  }, []);

  const handlePickEdit = useCallback(() => {
    startPickingLocation((latlng) =>
      setEditForm((f) => ({ ...f, lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) }))
    );
  }, [startPickingLocation]);

  const handleUpdate = useCallback(async () => {
    if (!editingZone) return;
    const lat = parseFloat(editForm.lat);
    const lng = parseFloat(editForm.lng);
    const radius = parseInt(editForm.radius, 10);

    if (!editForm.title.trim()) { setFormError("Area name is required"); return; }
    if (isNaN(lat) || lat < -90 || lat > 90) { setFormError("Invalid latitude"); return; }
    if (isNaN(lng) || lng < -180 || lng > 180) { setFormError("Invalid longitude"); return; }
    if (isNaN(radius) || radius < 100 || radius > 50000) { setFormError("Radius must be 100–50,000 m"); return; }

    setSaving(true);
    setFormError("");
    try {
      await updateFloodZone(editingZone.id, {
        title: editForm.title.trim(), severity: editForm.severity,
        floodType: (editForm.floodType as FloodType) || null,
        lat, lng, radius,
        description: editForm.description.trim() || undefined,
      });
      setEditingZone(null);
      onRefresh();
    } catch {
      setFormError("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [editingZone, editForm, onRefresh]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleZoneClick = useCallback((zone: FloodZone) => {
    onSelect(selectedId === zone.id ? null : zone);
    panTo({ lat: zone.lat, lng: zone.lng }, 13);
  }, [selectedId, onSelect, panTo]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const criticalCount = zones.filter((z) => z.severity === "high").length;
  const timeStr = now.toLocaleTimeString("en-US", { hour12: true });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview",    label: "Overview" },
    { key: "forecasts",   label: "Forecasts" },
    { key: "safe-places", label: "Safe Places" },
    { key: "supplies",    label: "Supplies" },
  ];

  return (
    <div className="h-full overflow-y-auto flex flex-col bg-white">

      {/* Dashboard header */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center gap-4 mt-1.5 text-gray-500 text-xs">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeStr}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateStr}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        <StatCard icon={<AlertTriangle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />} iconBg="bg-red-500"    bg="bg-red-50 border-red-100"    label="Critical Alerts" value={criticalCount} sub="Active warnings"      subColor="text-red-500" />
        <StatCard icon={<Users          className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />} iconBg="bg-orange-500" bg="bg-orange-50 border-orange-100" label="Pending"         value="—"             sub="Awaiting rescue"    subColor="text-orange-500" />
        <StatCard icon={<MapPin         className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />} iconBg="bg-green-500"  bg="bg-green-50 border-green-100"  label="Safe Places"     value="—"             sub="Registered locations" subColor="text-green-600" />
        <StatCard icon={<TrendingUp     className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />} iconBg="bg-blue-500"   bg="bg-blue-50 border-blue-100"   label="Teams Ready"     value="—"             sub="Of total teams"     subColor="text-blue-500" />
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 bg-white border-y border-gray-200 flex">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 py-2.5 text-[10px] md:text-[11px] font-semibold border-b-2 transition-colors cursor-pointer truncate px-1 ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 py-4">

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && !showForm && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleAddForecast} className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold py-3.5 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" strokeWidth={2.5} /> Forecast
              </button>
              <button disabled className="bg-green-500 text-white text-[11px] font-bold py-3.5 rounded-xl flex flex-col items-center gap-1 opacity-40 cursor-not-allowed">
                <Plus className="w-4 h-4" strokeWidth={2.5} /> Safe Place
              </button>
              <button disabled className="bg-blue-500 text-white text-[11px] font-bold py-3.5 rounded-xl flex flex-col items-center gap-1 opacity-40 cursor-not-allowed">
                <Plus className="w-4 h-4" strokeWidth={2.5} /> Supply
              </button>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-3">System Status</h3>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                {[
                  { label: "Total Forecasts",   value: zones.length, color: "text-gray-900" },
                  { label: "Active Missions",    value: "—",          color: "text-gray-300" },
                  { label: "People Rescued",     value: "—",          color: "text-gray-300" },
                  { label: "Scheduled Supplies", value: "—",          color: "text-gray-300" },
                ].map(({ label, value, color }, i, arr) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE FORM ── */}
        {activeTab === "overview" && showForm && (
          <ForecastForm
            heading="Create Flood Forecast"
            values={form}
            onChange={setForm}
            onPickLocation={handlePickCreate}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setFormError(""); if (isPicking) cancelMapAction(); }}
            isPicking={isPicking}
            saving={saving}
            error={formError}
            submitLabel="Create Forecast"
            submitColor="red"
          />
        )}

        {/* ── FORECASTS LIST ── */}
        {activeTab === "forecasts" && !editingZone && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Active Flood Forecasts</h2>
            <ZoneList
              zones={zones}
              selectedId={selectedId}
              onZoneClick={handleZoneClick}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              deleting={deleting}
            />
          </div>
        )}

        {/* ── EDIT FORM ── */}
        {activeTab === "forecasts" && editingZone && (
          <ForecastForm
            heading="Edit Flood Zone"
            values={editForm}
            onChange={setEditForm}
            onPickLocation={handlePickEdit}
            onSubmit={handleUpdate}
            onCancel={() => { setEditingZone(null); setFormError(""); if (isPicking) cancelMapAction(); }}
            isPicking={isPicking}
            saving={saving}
            error={formError}
            submitLabel="Save Changes"
            submitColor="blue"
          />
        )}

        {/* ── SAFE PLACES (other member) ── */}
        {activeTab === "safe-places" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="w-8 h-8 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-medium">Safe Places</p>
            <p className="text-gray-300 text-xs mt-1">Managed by another team member</p>
          </div>
        )}

        {/* ── SUPPLIES (other member) ── */}
        {activeTab === "supplies" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="w-8 h-8 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-medium">Supplies</p>
            <p className="text-gray-300 text-xs mt-1">Managed by another team member</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  bg: string;
  label: string;
  value: number | string;
  sub: string;
  subColor: string;
}

function StatCard({ icon, iconBg, bg, label, value, sub, subColor }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-3.5 border ${bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>{icon}</div>
        <span className="text-xs font-medium text-gray-600 leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs mt-0.5 ${subColor}`}>{sub}</p>
    </div>
  );
}
