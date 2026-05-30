import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Plus, Edit2, Trash2, Shield,
  TrendingUp, ArrowLeft, Loader2, AlertTriangle, Users
} from "lucide-react";
import { listSafePlaces, createSafePlace, updateSafePlace, deleteSafePlace } from "../apis/safe-place.api";
import type { SafePlace, Supply } from "../types/safe-place.types";

export default function SafePlacePage() {
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState<"places" | "supplies">("places");
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showAddSupply, setShowAddSupply] = useState(false);

  // Safe Place Forms
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [capacity, setCapacity] = useState("");
  const [currentCount, setCurrentCount] = useState("0");
  const [hasFood, setHasFood] = useState(false);
  const [hasWater, setHasWater] = useState(false);

  // Supply Forms
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [supplyItem, setSupplyItem] = useState("Water");
  const [supplyQty, setSupplyQty] = useState("");
  const [supplyDate, setSupplyDate] = useState("");
  const [supplyDesc, setSupplyDesc] = useState("");

  // Edit / Delete modals
  const [editingPlace, setEditingPlace] = useState<SafePlace | null>(null);
  const [editingSupply, setEditingSupply] = useState<{ placeId: number; supply: Supply } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; type: "place" | "supply"; name: string; supplyId?: string } | null>(null);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const data = await listSafePlaces();
      setSafePlaces(data);
    } catch {
      setError("Failed to fetch safe places.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedCap = parseInt(capacity, 10);
    const parsedCount = parseInt(currentCount, 10);

    if (isNaN(parsedLat) || isNaN(parsedLng) || isNaN(parsedCap)) {
      setError("Please fill out coordinates and capacity with valid numbers.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createSafePlace({
        name,
        description: description || undefined,
        lat: parsedLat,
        lng: parsedLng,
        capacity: parsedCap,
        currentCount: parsedCount,
        hasFood,
        hasWater,
        supplies: JSON.stringify([]),
      });
      triggerSuccess("📌 Safe Place registered successfully!");
      setShowAddPlace(false);
      setName(""); setDescription(""); setLat(""); setLng(""); setCapacity(""); setCurrentCount("0");
      setHasFood(false); setHasWater(false);
      fetchPlaces();
    } catch {
      setError("Failed to register Safe Place.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace) return;
    setSaving(true);
    setError("");
    try {
      await updateSafePlace(editingPlace.id, {
        name: editingPlace.name,
        description: editingPlace.description || "",
        lat: editingPlace.lat,
        lng: editingPlace.lng,
        capacity: editingPlace.capacity,
        currentCount: editingPlace.currentCount,
        hasFood: editingPlace.hasFood,
        hasWater: editingPlace.hasWater,
      });
      triggerSuccess("📌 Safe Place updated successfully!");
      setEditingPlace(null);
      fetchPlaces();
    } catch {
      setError("Failed to update Safe Place.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    const placeId = parseInt(selectedPlaceId, 10);
    if (isNaN(placeId)) {
      setError("Please select a target Safe Place.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const place = safePlaces.find((p) => p.id === placeId);
      if (!place) throw new Error();

      let currentSupplies: Supply[] = [];
      try {
        if (place.supplies) currentSupplies = JSON.parse(place.supplies);
      } catch { }

      const newSupply: Supply = {
        id: Math.random().toString(36).substring(2, 9),
        item: supplyItem,
        scheduledAt: new Date(supplyDate).toISOString(),
        quantity: supplyQty,
        description: supplyDesc,
      };

      await updateSafePlace(placeId, {
        supplies: JSON.stringify([...currentSupplies, newSupply]),
        hasFood: place.hasFood || supplyItem === "Food",
        hasWater: place.hasWater || supplyItem === "Water",
      });

      triggerSuccess("📦 Supply drop scheduled successfully!");
      setShowAddSupply(false);
      setSelectedPlaceId(""); setSupplyQty(""); setSupplyDate(""); setSupplyDesc("");
      fetchPlaces();
    } catch {
      setError("Failed to schedule supply distribution.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupply) return;
    setSaving(true);
    setError("");
    try {
      const place = safePlaces.find((p) => p.id === editingSupply.placeId);
      if (!place) throw new Error();

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

      triggerSuccess("📦 Supply distribution updated successfully!");
      setEditingSupply(null);
      fetchPlaces();
    } catch {
      setError("Failed to update supply distribution.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === "place") {
        await deleteSafePlace(deleteConfirm.id);
        triggerSuccess("📌 Safe Place deleted successfully!");
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
          triggerSuccess("📦 Supply drop deleted successfully!");
        }
      }
      fetchPlaces();
    } catch {
      setError("Failed to perform deletion.");
    } finally {
      setSaving(false);
      setDeleteConfirm(null);
    }
  };

  // Metrics
  const totalCount = safePlaces.reduce((acc, p) => acc + p.currentCount, 0);
  const totalCapacity = safePlaces.reduce((acc, p) => acc + p.capacity, 0);

  // Supplies list
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
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      {/* Toast Alert */}
      {(success || error) && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full px-4">
          <div className={`p-4 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-sm ${
            success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {success || error}
          </div>
        </div>
      )}

      {/* Header bar */}
      <header className="bg-[#1e2433] text-white py-4 px-6 shadow-md shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/map" className="p-2 rounded-xl hover:bg-slate-700/50 transition">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Shelter & Supply Dashboard</h1>
            <p className="text-[10px] text-slate-400 font-medium">Safe Places & Resource Distribution Log</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-slate-300">Admin Control</span>
        </div>
      </header>

      {/* Dashboard container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 overflow-y-auto">
        {/* Statistics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[115px]">
            <div className="flex justify-between items-center">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
              </div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Alerts</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">Active</div>
              <div className="text-[10px] text-slate-400 font-semibold">Flood levels monitored</div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[115px]">
            <div className="flex justify-between items-center">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">People Safe</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalCount} / {totalCapacity}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Shelter Occupancy Log</div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[115px]">
            <div className="flex justify-between items-center">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5 text-indigo-500" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Shelters</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{safePlaces.length}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Registered locations</div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-[115px]">
            <div className="flex justify-between items-center">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-sky-500" />
              </div>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Supply Chains</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{allSupplies.length} Drops</div>
              <div className="text-[10px] text-slate-400 font-semibold">Deliveries scheduled</div>
            </div>
          </div>
        </div>

        {/* Tab Controls and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
            <button
              onClick={() => { setActiveTab("places"); setError(""); }}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                activeTab === "places" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Shelters ({safePlaces.length})
            </button>
            <button
              onClick={() => { setActiveTab("supplies"); setError(""); }}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                activeTab === "supplies" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Supply Log ({allSupplies.length})
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowAddPlace(true); setError(""); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 text-xs transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Shelter
            </button>
            <button
              onClick={() => { setShowAddSupply(true); setError(""); }}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 text-xs transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Schedule Drop
            </button>
          </div>
        </div>

        {/* Main List Sections */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
            <p className="text-slate-500 text-xs font-semibold">Loading data...</p>
          </div>
        ) : activeTab === "places" ? (
          /* SHELTERS TABLE / LIST */
          safePlaces.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 font-semibold text-xs">
              No shelters registered in this region yet.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Name & Info</th>
                      <th className="px-6 py-4">Coordinates</th>
                      <th className="px-6 py-4">Occupancy Ratio</th>
                      <th className="px-6 py-4">Facilities</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {safePlaces.map((place) => {
                      const ratio = place.capacity > 0 ? (place.currentCount / place.capacity) * 100 : 0;
                      return (
                        <tr key={place.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 text-sm">{place.name}</div>
                            {place.description && <div className="text-slate-400 text-[10px] mt-0.5 max-w-[250px] truncate">{place.description}</div>}
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                            Lat: {place.lat.toFixed(5)}<br />Lng: {place.lng.toFixed(5)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900 min-w-[55px]">
                                {place.currentCount} / {place.capacity}
                              </span>
                              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
                                <div
                                  className={`h-full rounded-full ${place.currentCount >= place.capacity ? "bg-red-500" : "bg-emerald-500"}`}
                                  style={{ width: `${Math.min(ratio, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${place.hasFood ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>
                                🍱 Food
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${place.hasWater ? "bg-sky-50 text-sky-700" : "bg-slate-50 text-slate-400"}`}>
                                🥤 Water
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => setEditingPlace(place)}
                                className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-0.5 transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: place.id, type: "place", name: place.name })}
                                className="text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* SUPPLIES LOG LIST */
          allSupplies.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 font-semibold text-xs">
              No supply drops scheduled yet.
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Item Type</th>
                      <th className="px-6 py-4">Destination Shelter</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Estimated Delivery</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {allSupplies.map((sup, idx) => (
                      <tr key={sup.id || idx} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                            {sup.item}
                          </div>
                          {sup.description && <div className="text-slate-400 text-[10px] mt-0.5">{sup.description}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-emerald-600 font-bold">{sup.placeName}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {sup.quantity}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          🕒 {new Date(sup.scheduledAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => setEditingSupply({ placeId: sup.placeId, supply: sup })}
                              className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-0.5 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            {sup.id && (
                              <button
                                onClick={() => setDeleteConfirm({ id: sup.placeId, type: "supply", name: sup.item, supplyId: sup.id })}
                                className="text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </main>

      {/* ── MODALS (ADD/EDIT/DELETE) ── */}

      {/* 1. Add Place Modal */}
      {showAddPlace && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Register Safe Shelter
            </h3>
            <form onSubmit={handleAddPlace} className="space-y-4">
              <input
                type="text" required placeholder="Shelter Name" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
              />
              <textarea
                placeholder="Description / Contact Info" value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800 min-h-[60px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" step="any" required placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
                />
                <input
                  type="number" step="any" required placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" required placeholder="Max Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
                />
                <input
                  type="number" required placeholder="Current Count" value={currentCount} onChange={(e) => setCurrentCount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
                />
              </div>
              <div className="flex gap-4 pt-1 text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={hasFood} onChange={(e) => setHasFood(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Has Food Supplies
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={hasWater} onChange={(e) => setHasWater(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Has Water Supplies
                </label>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {saving ? "Saving..." : "Add Shelter"}
                </button>
                <button
                  type="button" onClick={() => setShowAddPlace(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Place Modal */}
      {editingPlace && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-emerald-600" /> Edit Shelter Info
            </h3>
            <form onSubmit={handleUpdatePlace} className="space-y-4">
              <input
                type="text" required placeholder="Shelter Name" value={editingPlace.name} onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
              />
              <textarea
                placeholder="Description" value={editingPlace.description || ""} onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800 min-h-[60px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" step="any" required placeholder="Latitude" value={editingPlace.lat} onChange={(e) => setEditingPlace({ ...editingPlace, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
                />
                <input
                  type="number" step="any" required placeholder="Longitude" value={editingPlace.lng} onChange={(e) => setEditingPlace({ ...editingPlace, lng: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" required placeholder="Max Capacity" value={editingPlace.capacity} onChange={(e) => setEditingPlace({ ...editingPlace, capacity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
                />
                <input
                  type="number" required placeholder="Current Count" value={editingPlace.currentCount} onChange={(e) => setEditingPlace({ ...editingPlace, currentCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition text-slate-800"
                />
              </div>
              <div className="flex gap-4 pt-1 text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={editingPlace.hasFood} onChange={(e) => setEditingPlace({ ...editingPlace, hasFood: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Has Food Supplies
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={editingPlace.hasWater} onChange={(e) => setEditingPlace({ ...editingPlace, hasWater: e.target.checked })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  Has Water Supplies
                </label>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button" onClick={() => setEditingPlace(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Supply Modal */}
      {showAddSupply && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" /> Schedule Supply Drop
            </h3>
            <form onSubmit={handleAddSupply} className="space-y-4">
              <select
                required value={selectedPlaceId} onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-700 cursor-pointer"
              >
                <option value="">Select Target Shelter</option>
                {safePlaces.map((place) => (
                  <option key={place.id} value={place.id}>{place.name}</option>
                ))}
              </select>

              <select
                required value={supplyItem} onChange={(e) => setSupplyItem(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-700 cursor-pointer"
              >
                <option value="Water">Water (Bottles/Filters)</option>
                <option value="Food">Food (Meals/Dry rations)</option>
                <option value="Medical">Medical (First-aid kits)</option>
                <option value="Clothing">Clothing (Warm blankets)</option>
              </select>

              <input
                type="text" required placeholder="Quantity (e.g. 500 boxes, 1000 items)" value={supplyQty} onChange={(e) => setSupplyQty(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-800"
              />

              <div>
                <label className="text-[10px] text-slate-400 block font-semibold mb-1">DATE & TIME OF DELIVERY</label>
                <input
                  type="datetime-local" required value={supplyDate} onChange={(e) => setSupplyDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-700"
                />
              </div>

              <textarea
                placeholder="Description/Delivery notes" value={supplyDesc} onChange={(e) => setSupplyDesc(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-800 min-h-[60px]"
              />

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {saving ? "Scheduling..." : "Schedule Supply"}
                </button>
                <button
                  type="button" onClick={() => setShowAddSupply(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Supply Modal */}
      {editingSupply && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-sky-600" /> Edit Supply Drop
            </h3>
            <form onSubmit={handleUpdateSupply} className="space-y-4">
              <select
                required value={editingSupply.supply.item} onChange={(e) => setEditingSupply({ ...editingSupply, supply: { ...editingSupply.supply, item: e.target.value } })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-755 cursor-pointer"
              >
                <option value="Water">Water (Bottles/Filters)</option>
                <option value="Food">Food (Meals/Dry rations)</option>
                <option value="Medical">Medical (First-aid kits)</option>
                <option value="Clothing">Clothing (Warm blankets)</option>
              </select>

              <input
                type="text" required placeholder="Quantity" value={editingSupply.supply.quantity} onChange={(e) => setEditingSupply({ ...editingSupply, supply: { ...editingSupply.supply, quantity: e.target.value } })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-800"
              />

              <div>
                <label className="text-[10px] text-slate-400 block font-semibold mb-1">DATE & TIME OF DELIVERY</label>
                <input
                  type="datetime-local" required
                  value={editingSupply.supply.scheduledAt ? new Date(editingSupply.supply.scheduledAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditingSupply({ ...editingSupply, supply: { ...editingSupply.supply, scheduledAt: e.target.value } })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-700"
                />
              </div>

              <textarea
                placeholder="Description" value={editingSupply.supply.description} onChange={(e) => setEditingSupply({ ...editingSupply, supply: { ...editingSupply.supply, description: e.target.value } })}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-sky-500 transition text-slate-800 min-h-[60px]"
              />

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button" onClick={() => setEditingSupply(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl w-full max-w-sm space-y-4 text-center">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you absolutely sure you want to delete <span className="font-semibold text-slate-950">"{deleteConfirm.name}"</span>? This will permanently erase the record.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmDelete} disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                {saving ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
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
