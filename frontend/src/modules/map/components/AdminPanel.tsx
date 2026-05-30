import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, Users, MapPin, TrendingUp,
  Plus, Clock, Calendar, Edit2, Trash2, Shield,
} from "lucide-react";
import { useMapContext } from "../contexts/MapContext";
import { createFloodZone, deleteFloodZone, updateFloodZone } from "../../forecast/apis/forecast.api";
import { ForecastForm } from "../../forecast/components/ForecastForm";
import { ZoneList } from "../../forecast/components/ZoneList";
import { DEFAULT_FORM } from "../../forecast/types/forecast.form";
import type { FormState } from "../../forecast/types/forecast.form";
import type { FloodZone, FloodType, CreateFloodZoneInput } from "../../forecast/types/forecast.types";

import { createSafePlace, updateSafePlace, deleteSafePlace } from "../../safe-place/apis/safe-place.api";
import type { SafePlace, Supply } from "../../safe-place/types/safe-place.types";

type Tab = "overview" | "forecasts" | "safe-places" | "supplies";

interface AdminPanelProps {
  zones: FloodZone[];
  selectedId: number | null;
  onSelect: (zone: FloodZone | null) => void;
  safePlaces: SafePlace[];
  selectedPlaceId: number | null;
  onSelectPlace: (place: SafePlace | null) => void;
  onRefresh: () => void;
}

export function AdminPanel({
  zones,
  selectedId,
  onSelect,
  safePlaces,
  selectedPlaceId,
  onSelectPlace,
  onRefresh
}: AdminPanelProps) {
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

  // Safe Place Custom Forms
  const [currentSafePlaceForm, setCurrentSafePlaceForm] = useState<"none" | "add-place" | "add-supply">("none");
  const [placeName, setPlaceName] = useState("");
  const [placeDesc, setPlaceDesc] = useState("");
  const [placeLat, setPlaceLat] = useState("");
  const [placeLng, setPlaceLng] = useState("");
  const [placeCapacity, setPlaceCapacity] = useState("");
  const [placeCount, setPlaceCount] = useState("0");
  const [placeHasFood, setPlaceHasFood] = useState(false);
  const [placeHasWater, setPlaceHasWater] = useState(false);

  // Supply Custom Forms
  const [targetPlaceId, setTargetPlaceId] = useState("");
  const [supplyItem, setSupplyItem] = useState("Water");
  const [supplyQty, setSupplyQty] = useState("");
  const [supplyDate, setSupplyDate] = useState("");
  const [supplyDesc, setSupplyDesc] = useState("");

  // Editing state
  const [editingPlace, setEditingPlace] = useState<SafePlace | null>(null);
  const [editingSupply, setEditingSupply] = useState<{ placeId: number; supply: Supply } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; type: "place" | "supply"; name: string; supplyId?: string } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const isPicking = mapMode === "picking-location";

  const handleTabChange = useCallback((tab: Tab) => {
    if (isPicking) cancelMapAction();
    setShowForm(false);
    setEditingZone(null);
    setCurrentSafePlaceForm("none");
    setEditingPlace(null);
    setEditingSupply(null);
    setActiveTab(tab);
  }, [isPicking, cancelMapAction]);

  // ── Create Forecast ────────────────────────────────────────────────────────
  const handleAddForecast = useCallback(() => {
    setForm(DEFAULT_FORM);
    setFormError("");
    setShowForm(true);
    setCurrentSafePlaceForm("none");
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

  // ── Edit Forecast ──────────────────────────────────────────────────────────
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

  // ── Delete Forecast ────────────────────────────────────────────────────────
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

  // ── Safe Places CRUD ──────────────────────────────────────────────────────
  const resetPlaceForm = () => {
    setPlaceName(""); setPlaceDesc(""); setPlaceLat(""); setPlaceLng("");
    setPlaceCapacity(""); setPlaceCount("0"); setPlaceHasFood(false); setPlaceHasWater(false);
    setFormError("");
  };

  const handlePickPlaceLocation = useCallback(() => {
    startPickingLocation((latlng) => {
      setPlaceLat(latlng.lat.toFixed(6));
      setPlaceLng(latlng.lng.toFixed(6));
    });
  }, [startPickingLocation]);

  const handleAddSafePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(placeLat);
    const lng = parseFloat(placeLng);
    const capacity = parseInt(placeCapacity, 10);
    const currentCount = parseInt(placeCount, 10);

    if (!placeName.trim()) { setFormError("Place name is required"); return; }
    if (isNaN(lat) || lat < -90 || lat > 90) { setFormError("Invalid latitude"); return; }
    if (isNaN(lng) || lng < -180 || lng > 180) { setFormError("Invalid longitude"); return; }
    if (isNaN(capacity) || capacity <= 0) { setFormError("Capacity must be greater than 0"); return; }

    setSaving(true);
    setFormError("");
    try {
      await createSafePlace({
        name: placeName.trim(),
        description: placeDesc.trim() || undefined,
        lat,
        lng,
        capacity,
        currentCount,
        hasFood: placeHasFood,
        hasWater: placeHasWater,
        supplies: JSON.stringify([]),
      });
      resetPlaceForm();
      setCurrentSafePlaceForm("none");
      onRefresh();
      setActiveTab("safe-places");
    } catch {
      setFormError("Failed to register safe place.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSafePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace) return;
    setSaving(true);
    setFormError("");
    try {
      await updateSafePlace(editingPlace.id, {
        name: editingPlace.name.trim(),
        description: editingPlace.description?.trim() || "",
        lat: editingPlace.lat,
        lng: editingPlace.lng,
        capacity: editingPlace.capacity,
        currentCount: editingPlace.currentCount,
        hasFood: editingPlace.hasFood,
        hasWater: editingPlace.hasWater,
      });
      setEditingPlace(null);
      onRefresh();
    } catch {
      setFormError("Failed to update safe place.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlaceClick = (id: number, name: string) => {
    setDeleteConfirm({ id, type: "place", name });
  };

  // ── Supplies CRUD (JSON array in SafePlace.supplies) ──────────────────────
  const resetSupplyForm = () => {
    setTargetPlaceId(""); setSupplyItem("Water"); setSupplyQty("");
    setSupplyDate(""); setSupplyDesc(""); setFormError("");
  };

  const handleAddSupplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const placeId = parseInt(targetPlaceId, 10);
    if (isNaN(placeId)) { setFormError("Please select a valid Safe Place"); return; }
    if (!supplyQty.trim()) { setFormError("Quantity is required"); return; }
    if (!supplyDate) { setFormError("Distribution date/time is required"); return; }

    setSaving(true);
    setFormError("");
    try {
      const place = safePlaces.find((p) => p.id === placeId);
      if (!place) throw new Error("Place not found");

      let currentSupplies: Supply[] = [];
      try {
        if (place.supplies) currentSupplies = JSON.parse(place.supplies);
      } catch { }

      const newSupply: Supply = {
        id: Math.random().toString(36).substring(2, 9),
        item: supplyItem,
        scheduledAt: new Date(supplyDate).toISOString(),
        quantity: supplyQty.trim(),
        description: supplyDesc.trim(),
      };

      const updatedSupplies = [...currentSupplies, newSupply];
      
      // Auto-update hasFood / hasWater flags
      const hasFood = place.hasFood || supplyItem === "Food";
      const hasWater = place.hasWater || supplyItem === "Water";

      await updateSafePlace(placeId, {
        supplies: JSON.stringify(updatedSupplies),
        hasFood,
        hasWater,
      });

      resetSupplyForm();
      setCurrentSafePlaceForm("none");
      onRefresh();
      setActiveTab("supplies");
    } catch {
      setFormError("Failed to schedule supply.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSupplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupply) return;
    setSaving(true);
    setFormError("");
    try {
      const place = safePlaces.find((p) => p.id === editingSupply.placeId);
      if (!place) throw new Error("Place not found");

      let currentSupplies: Supply[] = [];
      try {
        if (place.supplies) currentSupplies = JSON.parse(place.supplies);
      } catch { }

      const updatedSupplies = currentSupplies.map((sup) =>
        sup.id === editingSupply.supply.id
          ? {
              ...editingSupply.supply,
              scheduledAt: new Date(editingSupply.supply.scheduledAt).toISOString(),
            }
          : sup
      );

      await updateSafePlace(editingSupply.placeId, {
        supplies: JSON.stringify(updatedSupplies),
      });

      setEditingSupply(null);
      onRefresh();
    } catch {
      setFormError("Failed to update supply.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupplyClick = (placeId: number, supplyId: string, itemName: string) => {
    setDeleteConfirm({ id: placeId, type: "supply", name: itemName, supplyId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === "place") {
        await deleteSafePlace(deleteConfirm.id);
        if (selectedPlaceId === deleteConfirm.id) onSelectPlace(null);
      } else {
        const place = safePlaces.find((p) => p.id === deleteConfirm.id);
        if (place && deleteConfirm.supplyId) {
          let currentSupplies: Supply[] = [];
          try {
            if (place.supplies) currentSupplies = JSON.parse(place.supplies);
          } catch { }
          const updatedSupplies = currentSupplies.filter((sup) => sup.id !== deleteConfirm.supplyId);
          await updateSafePlace(deleteConfirm.id, {
            supplies: JSON.stringify(updatedSupplies),
          });
        }
      }
      onRefresh();
    } catch {
      // error
    } finally {
      setSaving(false);
      setDeleteConfirm(null);
    }
  };

  // ── Derived Metrics ──────────────────────────────────────────────────────
  const criticalCount = zones.filter((z) => z.severity === "high").length;
  const timeStr = now.toLocaleTimeString("en-US", { hour12: true });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const totalOccupants = safePlaces.reduce((sum, p) => sum + p.currentCount, 0);
  const totalCapacity = safePlaces.reduce((sum, p) => sum + p.capacity, 0);

  // Flattened supplies list across all places
  const allSupplies = safePlaces.flatMap((place) => {
    let list: Supply[] = [];
    try {
      if (place.supplies) list = JSON.parse(place.supplies);
    } catch { }
    return list.map((sup) => ({
      ...sup,
      placeId: place.id,
      placeName: place.name,
    }));
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview",    label: "Overview" },
    { key: "forecasts",   label: "Forecasts" },
    { key: "safe-places", label: "Safe Places" },
    { key: "supplies",    label: "Supplies" },
  ];

  return (
    <div className="h-full overflow-y-auto flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 font-bold px-2 py-1 rounded-lg border border-red-100">
            <Shield className="w-3 h-3" /> Admin Auth
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1.5 text-gray-500 text-xs">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeStr}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateStr}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        <StatCard icon={<AlertTriangle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />} iconBg="bg-red-500" bg="bg-red-50 border-red-100" label="Critical Alerts" value={criticalCount} sub="Active warnings" subColor="text-red-500" />
        <StatCard icon={<Users className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />} iconBg="bg-orange-500" bg="bg-orange-50 border-orange-100" label="People Safe" value={totalOccupants} sub={`Out of ${totalCapacity || "—"} max`} subColor="text-orange-500" />
        <StatCard icon={<MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />} iconBg="bg-green-500" bg="bg-green-50 border-green-100" label="Safe Places" value={safePlaces.length} sub="Registered spots" subColor="text-green-600" />
        <StatCard icon={<TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />} iconBg="bg-blue-500" bg="bg-blue-50 border-blue-100" label="Supplies Scheduled" value={allSupplies.length} sub="Active supply drops" subColor="text-blue-500" />
      </div>

      {/* Sticky Tab Bar */}
      <div className="sticky top-0 z-10 bg-white border-y border-gray-200 flex">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 py-2.5 text-[10px] md:text-[11px] font-bold border-b-2 transition-colors cursor-pointer truncate px-1 ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-4 py-4">

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && !showForm && currentSafePlaceForm === "none" && (
          <div className="space-y-5">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleAddForecast} className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold py-3.5 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer shadow-sm">
                <Plus className="w-4 h-4" strokeWidth={2.5} /> Forecast
              </button>
              <button onClick={() => { setCurrentSafePlaceForm("add-place"); setFormError(""); }} className="bg-green-500 hover:bg-green-600 text-white text-[11px] font-bold py-3.5 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer shadow-sm">
                <Plus className="w-4 h-4" strokeWidth={2.5} /> Safe Place
              </button>
              <button onClick={() => { setCurrentSafePlaceForm("add-supply"); setFormError(""); }} className="bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-bold py-3.5 rounded-xl flex flex-col items-center gap-1 transition-colors cursor-pointer shadow-sm">
                <Plus className="w-4 h-4" strokeWidth={2.5} /> Supply
              </button>
            </div>

            {/* System Status Table */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-3">System Status</h3>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                {[
                  { label: "Total Forecasts", value: zones.length, color: "text-gray-900 font-bold" },
                  { label: "Safe Zones Running", value: safePlaces.length, color: "text-green-600 font-bold" },
                  { label: "Active Supply Lines", value: allSupplies.length, color: "text-blue-600 font-bold" },
                  { label: "Occupancy Ratio", value: totalCapacity > 0 ? `${((totalOccupants / totalCapacity) * 100).toFixed(0)}%` : "0%", color: "text-orange-500 font-bold" },
                ].map(({ label, value, color }, i, arr) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`text-sm ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE FORECAST FORM ── */}
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

        {/* ── ADD SAFE PLACE FORM ── */}
        {activeTab === "overview" && currentSafePlaceForm === "add-place" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-green-500" /> Add Safe Place
              </h3>
            </div>
            
            <form onSubmit={handleAddSafePlaceSubmit} className="space-y-3.5">
              {formError && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">{formError}</div>}
              
              <input
                type="text" required placeholder="Safe Place Name" value={placeName} onChange={(e) => setPlaceName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
              />
              
              <textarea
                placeholder="Description / Contact details" value={placeDesc} onChange={(e) => setPlaceDesc(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800 min-h-[60px]"
              />

              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <input
                    type="number" step="any" required placeholder="Latitude" value={placeLat} onChange={(e) => setPlaceLat(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
                  />
                  <input
                    type="number" step="any" required placeholder="Longitude" value={placeLng} onChange={(e) => setPlaceLng(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
                  />
                </div>
                <button
                  type="button" onClick={handlePickPlaceLocation}
                  className={`px-3 border rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isPicking ? "bg-green-500 border-green-500 text-white animate-pulse" : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {isPicking ? "Click Map..." : "🎯 Pick Map"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold mb-1">CAPACITY</label>
                  <input
                    type="number" required placeholder="Capacity" value={placeCapacity} onChange={(e) => setPlaceCapacity(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold mb-1">INITIAL COUNT</label>
                  <input
                    type="number" required placeholder="Current occupants" value={placeCount} onChange={(e) => setPlaceCount(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1 text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={placeHasFood} onChange={(e) => setPlaceHasFood(e.target.checked)} className="rounded text-green-500 focus:ring-green-500" />
                  Has Food
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={placeHasWater} onChange={(e) => setPlaceHasWater(e.target.checked)} className="rounded text-green-500 focus:ring-green-500" />
                  Has Water
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  {saving ? "Saving..." : "Add Safe Place"}
                </button>
                <button
                  type="button" onClick={() => { resetPlaceForm(); setCurrentSafePlaceForm("none"); if (isPicking) cancelMapAction(); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── SCHEDULE SUPPLY FORM ── */}
        {activeTab === "overview" && currentSafePlaceForm === "add-supply" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" /> Schedule Supply
            </h3>
            
            <form onSubmit={handleAddSupplySubmit} className="space-y-3.5">
              {formError && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">{formError}</div>}

              <select
                required value={targetPlaceId} onChange={(e) => setTargetPlaceId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-700 cursor-pointer"
              >
                <option value="">Select Destination Safe Place</option>
                {safePlaces.map((place) => (
                  <option key={place.id} value={place.id}>{place.name} (Cap: {place.currentCount}/{place.capacity})</option>
                ))}
              </select>

              <select
                required value={supplyItem} onChange={(e) => setSupplyItem(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-700 cursor-pointer"
              >
                <option value="Water">Water (Bottles/Filters)</option>
                <option value="Food">Food (Meals/Dry rations)</option>
                <option value="Medical">Medical (First-aid/Medicines)</option>
                <option value="Clothing">Clothing (Blankets/Raincoats)</option>
              </select>

              <input
                type="text" required placeholder="Quantity (e.g., 500 bottles, 200 boxes)" value={supplyQty} onChange={(e) => setSupplyQty(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-800"
              />

              <div>
                <label className="text-[10px] text-gray-400 block font-semibold mb-1">ESTIMATED DROP DATE & TIME</label>
                <input
                  type="datetime-local" required value={supplyDate} onChange={(e) => setSupplyDate(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-700"
                />
              </div>

              <textarea
                placeholder="Dropoff notes/Instructions" value={supplyDesc} onChange={(e) => setSupplyDesc(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-800 min-h-[60px]"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  {saving ? "Scheduling..." : "Schedule Distribution"}
                </button>
                <button
                  type="button" onClick={() => { resetSupplyForm(); setCurrentSafePlaceForm("none"); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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

        {/* ── EDIT FORECAST FORM ── */}
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

        {/* ── SAFE PLACES LIST & EDIT ── */}
        {activeTab === "safe-places" && !editingPlace && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center justify-between">
              <span>Safe Place Management</span>
              <button
                onClick={() => { setActiveTab("overview"); setCurrentSafePlaceForm("add-place"); }}
                className="text-xs bg-green-50 text-green-600 font-bold px-2.5 py-1.5 rounded-lg border border-green-100 flex items-center gap-1 hover:bg-green-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Spot
              </button>
            </h2>

            {safePlaces.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl">
                No active safe zones registered.
              </div>
            ) : (
              <div className="space-y-3">
                {safePlaces.map((place) => {
                  const ratio = place.capacity > 0 ? (place.currentCount / place.capacity) * 100 : 0;
                  const isSelected = selectedPlaceId === place.id;
                  
                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        onSelectPlace(isSelected ? null : place);
                        panTo({ lat: place.lat, lng: place.lng }, 14);
                      }}
                      className={`bg-white border rounded-2xl p-4 shadow-sm space-y-3 cursor-pointer transition-all hover:border-green-300 ${
                        isSelected ? "border-green-500 ring-2 ring-green-100" : "border-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1">
                            {place.name}
                            {place.currentCount >= place.capacity && (
                              <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                Full
                              </span>
                            )}
                          </h3>
                          {place.description && <p className="text-xs text-gray-500 mt-0.5">{place.description}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block font-semibold">CAPACITY</span>
                          <span className="text-xs font-bold text-gray-900">{place.currentCount} / {place.capacity}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-50">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            place.currentCount >= place.capacity ? "bg-red-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-gray-100 pt-2.5 mt-1">
                        <div className="flex gap-2">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${place.hasFood ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                            {place.hasFood ? "🍱 Food Ready" : "🍲 No Food"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded font-bold ${place.hasWater ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-400"}`}>
                            {place.hasWater ? "🥤 Water Ready" : "🥤 No Water"}
                          </span>
                        </div>
                        <div className="flex gap-2.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingPlace(place)}
                            className="text-green-600 hover:text-green-800 font-bold flex items-center gap-0.5 transition"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlaceClick(place.id, place.name)}
                            className="text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 transition"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── EDIT SAFE PLACE FORM ── */}
        {activeTab === "safe-places" && editingPlace && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Edit2 className="w-4 h-4 text-green-500" /> Edit Safe Place
            </h3>
            
            <form onSubmit={handleUpdateSafePlaceSubmit} className="space-y-3.5">
              {formError && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">{formError}</div>}
              
              <input
                type="text" required placeholder="Safe Place Name" value={editingPlace.name} onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
              />

              <textarea
                placeholder="Description" value={editingPlace.description || ""} onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800 min-h-[60px]"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" step="any" required placeholder="Latitude" value={editingPlace.lat} onChange={(e) => setEditingPlace({ ...editingPlace, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
                />
                <input
                  type="number" step="any" required placeholder="Longitude" value={editingPlace.lng} onChange={(e) => setEditingPlace({ ...editingPlace, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold mb-1">CAPACITY</label>
                  <input
                    type="number" required placeholder="Capacity" value={editingPlace.capacity} onChange={(e) => setEditingPlace({ ...editingPlace, capacity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block font-semibold mb-1">CURRENT COUNT</label>
                  <input
                    type="number" required placeholder="Current occupants" value={editingPlace.currentCount} onChange={(e) => setEditingPlace({ ...editingPlace, currentCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-green-500 transition text-gray-800"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1 text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={editingPlace.hasFood} onChange={(e) => setEditingPlace({ ...editingPlace, hasFood: e.target.checked })} className="rounded text-green-500 focus:ring-green-500" />
                  Has Food
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={editingPlace.hasWater} onChange={(e) => setEditingPlace({ ...editingPlace, hasWater: e.target.checked })} className="rounded text-green-500 focus:ring-green-500" />
                  Has Water
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button" onClick={() => setEditingPlace(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── SUPPLIES LIST & EDIT ── */}
        {activeTab === "supplies" && !editingSupply && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center justify-between">
              <span>Supply Deliveries</span>
              <button
                onClick={() => { setActiveTab("overview"); setCurrentSafePlaceForm("add-supply"); }}
                className="text-xs bg-blue-50 text-blue-600 font-bold px-2.5 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1 hover:bg-blue-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule Drop
              </button>
            </h2>

            {allSupplies.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl">
                No scheduled supply drops.
              </div>
            ) : (
              <div className="space-y-3">
                {allSupplies.map((sup, idx) => {
                  return (
                    <div key={sup.id || idx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-3 hover:border-blue-200 transition">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 bg-blue-50">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-sm font-bold text-gray-950 truncate">{sup.item}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                            idx === 0
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-gray-50 text-gray-500 border-gray-100"
                          }`}>
                            {idx === 0 ? "Next Drop" : "Scheduled"}
                          </span>
                        </div>

                        {sup.description && <p className="text-xs text-gray-500 truncate">{sup.description}</p>}

                        <div className="text-xs text-gray-700 font-medium">
                          Quantity: <span className="text-gray-950 font-bold">{sup.quantity}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50/50 px-2 py-0.5 rounded border border-green-50 w-fit">
                          <MapPin className="w-3 h-3" /> {sup.placeName}
                        </div>

                        <div className="text-[10px] text-gray-400 font-semibold pt-1">
                          🕒 {new Date(sup.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>

                        <div className="flex gap-3 pt-2 text-[10px] justify-end border-t border-gray-50 mt-1">
                          <button
                            onClick={() => setEditingSupply({ placeId: sup.placeId, supply: sup })}
                            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 transition"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          {sup.id && (
                            <button
                              onClick={() => handleDeleteSupplyClick(sup.placeId, sup.id!, sup.item)}
                              className="text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 transition"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── EDIT SUPPLY FORM ── */}
        {activeTab === "supplies" && editingSupply && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Edit2 className="w-4 h-4 text-blue-500" /> Edit Supply
            </h3>
            
            <form onSubmit={handleUpdateSupplySubmit} className="space-y-3.5">
              {formError && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">{formError}</div>}

              <select
                required value={editingSupply.supply.item} onChange={(e) => setEditingSupply({ ...editingSupply, supply: { ...editingSupply.supply, item: e.target.value } })}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-750 cursor-pointer"
              >
                <option value="Water">Water (Bottles/Filters)</option>
                <option value="Food">Food (Meals/Dry rations)</option>
                <option value="Medical">Medical (First-aid/Medicines)</option>
                <option value="Clothing">Clothing (Blankets/Raincoats)</option>
              </select>

              <input
                type="text" required placeholder="Quantity" value={editingSupply.supply.quantity} onChange={(e) => setEditingSupply({ ...editingSupply, supply: { ...editingSupply.supply, quantity: e.target.value } })}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-800"
              />

              <div>
                <label className="text-[10px] text-gray-400 block font-semibold mb-1">DATE & TIME</label>
                <input
                  type="datetime-local" required
                  value={editingSupply.supply.scheduledAt ? new Date(editingSupply.supply.scheduledAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingSupply({ ...editingSupply, supply: { ...editingSupply.supply, scheduledAt: e.target.value } })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-700"
                />
              </div>

              <textarea
                placeholder="Description" value={editingSupply.supply.description} onChange={(e) => setEditingSupply({ ...editingSupply, supply: { ...editingSupply.supply, description: e.target.value } })}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition text-gray-800 min-h-[60px]"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button" onClick={() => setEditingSupply(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ── CONFIRM DELETE MODAL ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[99999] animate-fadeIn backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4 text-center">
            <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteConfirm.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmDelete} disabled={saving}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition cursor-pointer"
              >
                {saving ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 px-4 rounded-xl text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat Card ──
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
        <span className="text-xs font-semibold text-gray-600 leading-tight">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-950">{value}</p>
      <p className={`text-xs mt-0.5 ${subColor} font-medium`}>{sub}</p>
    </div>
  );
}
