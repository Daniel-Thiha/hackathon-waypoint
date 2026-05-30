import { useState } from "react";
import { AlertTriangle, Clock, Shield, Users, Plus, Trash2, MapPin, X } from "lucide-react";
import type { FloodZone, FloodSeverity } from "../../forecast/types/forecast.types";
import type { SafePlace } from "../../safe-place/types/safe-place.types";
import type { SosRequest } from "../../survivor/types/survivor.types";
import type { RescueTeamStatus } from "../../rescue/types/rescue.types";
import { createFloodZone, deleteFloodZone } from "../../forecast/apis/forecast.api";
import { createSafePlace, deleteSafePlace, updateSafePlace } from "../../safe-place/apis/safe-place.api";
import { useMapContext } from "../contexts/MapContext";

type AdminTab = "overview" | "forecasts" | "safe-places" | "supplies";
type FormView = "create-forecast" | "create-safe-place" | "create-supply" | null;

const SEVERITY_STYLE: Record<FloodSeverity, { badge: string; label: string }> = {
  low:    { badge: "bg-yellow-100 text-yellow-700 border border-yellow-200", label: "Low" },
  medium: { badge: "bg-orange-100 text-orange-700 border border-orange-200", label: "Medium" },
  high:   { badge: "bg-red-100 text-red-600 border border-red-200",          label: "Critical" },
};

interface AdminPanelProps {
  floodZones: FloodZone[];
  safePlaces: SafePlace[];
  sosRequests: SosRequest[];
  teamStatuses: RescueTeamStatus[];
  onRefresh: () => void;
}

function StatCard({ icon, bg, label, value, sub }: { icon: React.ReactNode; bg: string; label: string; value: number | string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

export function AdminPanel({ floodZones, safePlaces, sosRequests, teamStatuses, onRefresh }: AdminPanelProps) {
  const { startPickingLocation, cancelMapAction, mapMode } = useMapContext();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [formView, setFormView] = useState<FormView>(null);

  const criticalAlerts = floodZones.filter((z) => z.severity === "high").length;
  const pendingSos = sosRequests.filter((s) => s.status === "pending").length;
  const totalCapacity = safePlaces.reduce((s, p) => s + p.capacity, 0);
  const totalOccupied = safePlaces.reduce((s, p) => s + p.currentCount, 0);
  const availableTeams = teamStatuses.filter((t) => t.isAvailable).length;
  const activeMissions = teamStatuses.filter((t) => !t.isAvailable).length;
  const peopleRescued = sosRequests.filter((s) => s.status === "completed").length;
  const totalSupplies = safePlaces.reduce((s, p) => s + (p.supplies?.length ?? 0), 0);

  // ── Forecast form state ────────────────────────────────────────────────────
  const [fTitle, setFTitle] = useState("");
  const [fLat, setFLat] = useState("13.7563");
  const [fLng, setFLng] = useState("100.5018");
  const [fSeverity, setFSeverity] = useState<FloodSeverity>("low");
  const [fRadius, setFRadius] = useState("1000");
  const [fDesc, setFDesc] = useState("");
  const [fSaving, setFSaving] = useState(false);

  async function handleCreateForecast() {
    if (!fTitle.trim()) return;
    setFSaving(true);
    try {
      await createFloodZone({
        title: fTitle.trim(), severity: fSeverity,
        lat: parseFloat(fLat) || 13.7563,
        lng: parseFloat(fLng) || 100.5018,
        radius: parseInt(fRadius) || 1000,
        description: fDesc.trim() || undefined,
      });
      setFTitle(""); setFLat("13.7563"); setFLng("100.5018");
      setFSeverity("low"); setFRadius("1000"); setFDesc("");
      setFormView(null);
      onRefresh();
    } finally { setFSaving(false); }
  }

  // ── Safe place form state ─────────────────────────────────────────────────
  const [spName, setSpName] = useState("");
  const [spLat, setSpLat] = useState("13.7563");
  const [spLng, setSpLng] = useState("100.5018");
  const [spCapacity, setSpCapacity] = useState("500");
  const [spDesc, setSpDesc] = useState("");
  const [spSaving, setSpSaving] = useState(false);

  function handlePickLocation() {
    startPickingLocation((ll) => {
      setSpLat(ll.lat.toFixed(4));
      setSpLng(ll.lng.toFixed(4));
    });
  }

  async function handleCreateSafePlace() {
    if (!spName.trim()) return;
    setSpSaving(true);
    try {
      await createSafePlace({
        name: spName.trim(),
        description: spDesc.trim() || undefined,
        lat: parseFloat(spLat) || 13.7563,
        lng: parseFloat(spLng) || 100.5018,
        capacity: parseInt(spCapacity) || 500,
        hasFood: false, hasWater: false,
      });
      setSpName(""); setSpLat("13.7563"); setSpLng("100.5018"); setSpCapacity("500"); setSpDesc("");
      setFormView(null);
      onRefresh();
    } finally { setSpSaving(false); }
  }

  // ── Supply form state ─────────────────────────────────────────────────────
  const [supPlaceId, setSupPlaceId] = useState("");
  const [supType, setSupType] = useState("Water");
  const [supDate, setSupDate] = useState("");
  const [supQty, setSupQty] = useState("");
  const [supDesc, setSupDesc] = useState("");
  const [supSaving, setSupSaving] = useState(false);

  async function handleScheduleSupply() {
    const id = parseInt(supPlaceId);
    const place = safePlaces.find((p) => p.id === id);
    if (!place || !supDate) return;
    setSupSaving(true);
    try {
      const label = [supType, supQty && `Qty: ${supQty}`, supDesc].filter(Boolean).join(" — ");
      await updateSafePlace(id, {
        supplies: [...(place.supplies ?? []), { item: label, scheduledAt: new Date(supDate).toISOString() }],
      });
      setSupPlaceId(""); setSupType("Water"); setSupDate(""); setSupQty(""); setSupDesc("");
      setFormView(null);
      onRefresh();
    } finally { setSupSaving(false); }
  }

  function closeForm() { setFormView(null); cancelMapAction(); }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  // ── Location pick overlay ─────────────────────────────────────────────────
  if (mapMode === "picking-location") {
    return (
      <div className="p-4 space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          <strong>Tap the map</strong> to set the location
        </div>
        <button onClick={cancelMapAction}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-xl cursor-pointer">
          Cancel
        </button>
      </div>
    );
  }

  // ── Create Forecast form ───────────────────────────────────────────────────
  if (formView === "create-forecast") {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Create Flood Forecast</h3>
          <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <input className={inputCls} placeholder="Area name" value={fTitle} onChange={(e) => setFTitle(e.target.value)} />
        <div className="flex gap-2">
          <input type="number" step="0.0001" className={inputCls + " flex-1"} placeholder="Latitude" value={fLat} onChange={(e) => setFLat(e.target.value)} />
          <input type="number" step="0.0001" className={inputCls + " flex-1"} placeholder="Longitude" value={fLng} onChange={(e) => setFLng(e.target.value)} />
        </div>
        <select className={inputCls} value={fSeverity} onChange={(e) => setFSeverity(e.target.value as FloodSeverity)}>
          <option value="low">Low Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="high">High Severity</option>
        </select>
        <input type="number" className={inputCls} placeholder="Radius (meters)" value={fRadius} onChange={(e) => setFRadius(e.target.value)} />
        <textarea className={inputCls + " resize-none"} placeholder="Description of flood forecast" rows={3} value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={handleCreateForecast} disabled={!fTitle.trim() || fSaving}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors">
            {fSaving ? "Creating…" : "Create Forecast"}
          </button>
          <button onClick={closeForm} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
        </div>
      </div>
    );
  }

  // ── Add Safe Place form ───────────────────────────────────────────────────
  if (formView === "create-safe-place") {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Add Safe Place</h3>
          <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <input className={inputCls} placeholder="Place name" value={spName} onChange={(e) => setSpName(e.target.value)} />
        <div className="flex gap-2">
          <input type="number" step="0.0001" className={inputCls + " flex-1"} placeholder="Latitude" value={spLat} onChange={(e) => setSpLat(e.target.value)} />
          <input type="number" step="0.0001" className={inputCls + " flex-1"} placeholder="Longitude" value={spLng} onChange={(e) => setSpLng(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <input type="number" className={inputCls + " flex-1"} placeholder="Capacity" value={spCapacity} onChange={(e) => setSpCapacity(e.target.value)} />
          <button onClick={handlePickLocation}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm cursor-pointer flex items-center gap-1.5 flex-shrink-0">
            <MapPin className="w-4 h-4" /> Pick
          </button>
        </div>
        <input className={inputCls} placeholder="Facilities (e.g. Medical Aid, Sanitation)" value={spDesc} onChange={(e) => setSpDesc(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={handleCreateSafePlace} disabled={!spName.trim() || spSaving}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors">
            {spSaving ? "Adding…" : "Add Safe Place"}
          </button>
          <button onClick={closeForm} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
        </div>
      </div>
    );
  }

  // ── Schedule Supply form ──────────────────────────────────────────────────
  if (formView === "create-supply") {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Schedule Supply Distribution</h3>
          <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <select className={inputCls} value={supPlaceId} onChange={(e) => setSupPlaceId(e.target.value)}>
          <option value="">Select Safe Place</option>
          {safePlaces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className={inputCls} value={supType} onChange={(e) => setSupType(e.target.value)}>
          <option>Water</option>
          <option>Food</option>
          <option>Medical</option>
          <option>Other</option>
        </select>
        <input type="datetime-local" className={inputCls} value={supDate} onChange={(e) => setSupDate(e.target.value)} />
        <input className={inputCls} placeholder="Quantity (e.g. 500 meals, 1000 bottles)" value={supQty} onChange={(e) => setSupQty(e.target.value)} />
        <input className={inputCls} placeholder="Description" value={supDesc} onChange={(e) => setSupDesc(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={handleScheduleSupply} disabled={!supPlaceId || !supDate || supSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm cursor-pointer transition-colors">
            {supSaving ? "Scheduling…" : "Schedule Supply"}
          </button>
          <button onClick={closeForm} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl cursor-pointer">Cancel</button>
        </div>
      </div>
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<AlertTriangle className="w-4 h-4 text-white" />} bg="bg-red-500"
          label="Critical Alerts" value={criticalAlerts} sub="Active warnings" />
        <StatCard icon={<Clock className="w-4 h-4 text-white" />} bg="bg-orange-500"
          label="Pending SOS" value={pendingSos} sub="Awaiting rescue" />
        <StatCard icon={<Shield className="w-4 h-4 text-white" />} bg="bg-green-500"
          label="Safe Places" value={safePlaces.length} sub={`${totalOccupied}/${totalCapacity} occupied`} />
        <StatCard icon={<Users className="w-4 h-4 text-white" />} bg="bg-blue-500"
          label="Teams Ready" value={availableTeams} sub={`of ${teamStatuses.length} teams`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(["overview", "forecasts", "safe-places", "supplies"] as AdminTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {t === "safe-places" ? "Places" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview tab ───────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">System Status</p>
            {[
              { label: "Total Forecasts", value: floodZones.length },
              { label: "Active Missions", value: activeMissions },
              { label: "People Rescued", value: peopleRescued, accent: true },
              { label: "Scheduled Supplies", value: totalSupplies },
            ].map(({ label, value, accent }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`text-sm font-bold ${accent ? "text-blue-600" : "text-gray-900"}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Forecasts tab ──────────────────────────────────────────────────── */}
      {tab === "forecasts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Active Flood Forecasts</p>
            <button onClick={() => setFormView("create-forecast")}
              className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          {floodZones.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No forecast zones yet.</p>
          )}
          {floodZones.map((z) => (
            <div key={z.id} className="border border-gray-100 rounded-2xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900">{z.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${SEVERITY_STYLE[z.severity].badge}`}>
                      {SEVERITY_STYLE[z.severity].label}
                    </span>
                  </div>
                  {z.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{z.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">Radius: {z.radius}m · {new Date(z.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={async () => { if (!confirm("Delete?")) return; await deleteFloodZone(z.id); onRefresh(); }}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Safe Places tab ────────────────────────────────────────────────── */}
      {tab === "safe-places" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Safe Place Management</p>
            <button onClick={() => setFormView("create-safe-place")}
              className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          {safePlaces.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No safe places yet.</p>
          )}
          {safePlaces.map((p) => {
            const pct = p.capacity > 0 ? Math.min(100, (p.currentCount / p.capacity) * 100) : 0;
            const barColor = pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-orange-400" : "bg-green-500";
            const next = p.supplies?.[0];
            return (
              <div key={p.id} className="border border-gray-100 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Capacity {p.currentCount}/{p.capacity}</span>
                    <button onClick={async () => { if (!confirm("Delete?")) return; await deleteSafePlace(p.id); onRefresh(); }}
                      className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                {next && (
                  <p className="text-xs text-gray-400">
                    Next Supply: {next.item.split("—")[0].trim()} · {new Date(next.scheduledAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Supplies tab ───────────────────────────────────────────────────── */}
      {tab === "supplies" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Supply Distributions</p>
            <button onClick={() => setFormView("create-supply")}
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Schedule
            </button>
          </div>
          {safePlaces.every((p) => !p.supplies?.length) && (
            <p className="text-sm text-gray-400 text-center py-6">No supply schedules yet.</p>
          )}
          {safePlaces
            .flatMap((p) => (p.supplies ?? []).map((s, i) => ({ key: `${p.id}-${i}`, placeName: p.name, ...s })))
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
            .map((s) => (
              <div key={s.key} className="border border-gray-100 rounded-2xl p-3">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900">{s.item.split("—")[0].trim()}</p>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2">Scheduled</span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.placeName}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(s.scheduledAt).toLocaleString()}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
