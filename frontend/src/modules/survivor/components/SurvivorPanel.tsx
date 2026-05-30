import { useState, useEffect, useRef } from "react";
import { AlertTriangle, MapPin, CheckCircle, Navigation, X, Phone, ChevronRight, Clock, Loader } from "lucide-react";
import type { SafePlace } from "../../safe-place/types/safe-place.types";
import type { FloodZone } from "../../forecast/types/forecast.types";
import type { RescueTeamStatus } from "../../rescue/types/rescue.types";
import type { SurvivorRegistration, SosStatus } from "../types/survivor.types";
import { registerSurvivor, createSosRequest, updateSurvivorLocation, getSosStatus } from "../apis/survivor.api";
import { useMapContext } from "../../map/contexts/MapContext";

type SeverityKey = "low" | "medium" | "high";
const SEVERITY_BADGE: Record<SeverityKey, { label: string; cls: string }> = {
  low:    { label: "Low",      cls: "bg-yellow-100 text-yellow-700" },
  medium: { label: "Medium",   cls: "bg-orange-100 text-orange-700" },
  high:   { label: "Critical", cls: "bg-red-100 text-red-600" },
};

interface SurvivorPanelProps {
  safePlaces: SafePlace[];
  floodZones: FloodZone[];
  teamStatuses: RescueTeamStatus[];
  locationShared?: boolean;
  onSwitchToMap?: () => void;
}

type Screen = "main" | "register-form" | "sos-form";

function validateName(v: string) {
  if (!v.trim()) return "Name is required";
  if (v.trim().length < 2) return "Name must be at least 2 characters";
  return "";
}

function validatePhone(v: string) {
  if (!v) return ""; // optional
  const digits = v.replace(/[\s\-\+\(\)]/g, "");
  if (!/^\d+$/.test(digits)) return "Phone must contain only digits";
  if (digits.length < 7) return "Phone must be at least 7 digits";
  return "";
}

export function SurvivorPanel({ safePlaces, floodZones, teamStatuses, locationShared = false, onSwitchToMap }: SurvivorPanelProps) {
  const { mapInstance } = useMapContext();

  function flyToPlace(place: SafePlace) {
    onSwitchToMap?.();
    // Wait for map container to become visible before flying (mobile hidden→visible transition)
    setTimeout(() => {
      mapInstance?.flyTo([place.lat, place.lng], 15, { duration: 0.8 });
    }, 150);
  }

  const [screen, setScreen] = useState<Screen>("main");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [registration, setRegistration] = useState<SurvivorRegistration | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SafePlace | null>(null);
  const [activeSosId, setActiveSosId] = useState<number | null>(null);
  const [sosStatus, setSosStatus] = useState<SosStatus>("pending");
  const [saving, setSaving] = useState(false);

  // Registration form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regErrors, setRegErrors] = useState<{ name?: string; phone?: string }>({});

  // SOS form
  const [sosName, setSosName] = useState("");
  const [sosPhone, setSosPhone] = useState("");
  const [sosNotes, setSosNotes] = useState("");
  const [sosErrors, setSosErrors] = useState<{ name?: string; phone?: string }>({});

  const watchRef = useRef<number | null>(null);

  // Get GPS position on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
      undefined,
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  // Stream live location while SOS is active and pending/assigned
  useEffect(() => {
    if (activeSosId === null || sosStatus === "completed") return;
    watchRef.current = navigator.geolocation?.watchPosition(
      (p) => { updateSurvivorLocation(activeSosId, p.coords.latitude, p.coords.longitude).catch(() => {}); },
      undefined,
      { enableHighAccuracy: false, maximumAge: 15000 }
    );
    return () => { if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current); };
  }, [activeSosId, sosStatus]);

  // Poll SOS status every 5s until completed
  useEffect(() => {
    if (activeSosId === null || sosStatus === "completed") return;
    const interval = setInterval(async () => {
      try {
        const { status } = await getSosStatus(activeSosId);
        setSosStatus(status);
      } catch { /* keep showing last known status */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSosId, sosStatus]);

  // ── Registration ──────────────────────────────────────────────────────────
  async function handleRegister() {
    const nameErr = validateName(regName);
    const phoneErr = validatePhone(regPhone);
    if (nameErr || phoneErr) { setRegErrors({ name: nameErr || undefined, phone: phoneErr || undefined }); return; }
    setRegErrors({});

    if (!selectedPlace) return;
    const loc = gps ?? { lat: selectedPlace.lat, lng: selectedPlace.lng };
    setSaving(true);
    try {
      const reg = await registerSurvivor({ name: regName.trim(), phone: regPhone.trim() || undefined, lat: loc.lat, lng: loc.lng, safePlaceId: selectedPlace.id });
      setRegistration(reg);
      setScreen("main");
    } finally { setSaving(false); }
  }

  // ── SOS ───────────────────────────────────────────────────────────────────
  async function handleSendSos() {
    const nameErr = validateName(sosName);
    const phoneErr = validatePhone(sosPhone);
    if (nameErr || phoneErr) { setSosErrors({ name: nameErr || undefined, phone: phoneErr || undefined }); return; }
    setSosErrors({});

    const loc = gps ?? { lat: 13.7563, lng: 100.5018 };
    setSaving(true);
    try {
      const sos = await createSosRequest({ survivorName: sosName.trim(), phone: sosPhone.trim() || undefined, lat: loc.lat, lng: loc.lng, notes: sosNotes.trim() || undefined });
      setActiveSosId(sos.id);
      setSosStatus("pending");
      setScreen("main");
    } finally { setSaving(false); }
  }

  const inputCls = "w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50";
  const inputErrCls = "w-full border border-red-300 rounded-2xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50";
  const availableTeams = teamStatuses.filter((t) => t.isAvailable);

  // ── Register form ─────────────────────────────────────────────────────────
  if (screen === "register-form" && selectedPlace) {
    return (
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Register to Shelter</h3>
            <p className="text-sm text-gray-500 mt-0.5">{selectedPlace.name}</p>
          </div>
          <button onClick={() => setScreen("main")} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 cursor-pointer active:bg-gray-200"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-1">
          <input
            className={regErrors.name ? inputErrCls : inputCls}
            placeholder="Your full name *"
            value={regName}
            onChange={(e) => { setRegName(e.target.value); if (regErrors.name) setRegErrors((p) => ({ ...p, name: undefined })); }}
          />
          {regErrors.name && <p className="text-xs text-red-500 px-1">{regErrors.name}</p>}
        </div>

        <div className="space-y-1">
          <input
            className={regErrors.phone ? inputErrCls : inputCls}
            placeholder="Phone number (optional)"
            value={regPhone}
            onChange={(e) => { setRegPhone(e.target.value); if (regErrors.phone) setRegErrors((p) => ({ ...p, phone: undefined })); }}
          />
          {regErrors.phone && <p className="text-xs text-red-500 px-1">{regErrors.phone}</p>}
        </div>

        <button onClick={handleRegister} disabled={!regName.trim() || saving}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-[15px] cursor-pointer transition-colors">
          {saving ? "Registering…" : "Confirm Registration"}
        </button>

        {registration && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Your Reference ID</p>
            <p className="text-2xl font-bold text-green-700 tracking-wider mt-1">{registration.referenceId}</p>
            <p className="text-xs text-green-600 mt-1">Keep this safe — share with rescue teams</p>
          </div>
        )}
      </div>
    );
  }

  // ── SOS form ──────────────────────────────────────────────────────────────
  if (screen === "sos-form") {
    return (
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-600 text-lg leading-tight">Emergency SOS</h3>
              <p className="text-xs text-gray-500">Fill in all required fields</p>
            </div>
          </div>
          <button onClick={() => setScreen("main")} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 cursor-pointer active:bg-gray-200"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 px-1">Full Name <span className="text-red-500">*</span></label>
          <input
            className={sosErrors.name ? inputErrCls : inputCls}
            placeholder="Min. 2 characters"
            value={sosName}
            onChange={(e) => { setSosName(e.target.value); if (sosErrors.name) setSosErrors((p) => ({ ...p, name: undefined })); }}
          />
          {sosErrors.name && <p className="text-xs text-red-500 px-1">{sosErrors.name}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 px-1">Phone Number <span className="text-gray-400">(optional)</span></label>
          <input
            className={sosErrors.phone ? inputErrCls : inputCls}
            placeholder="e.g. 081-234-5678"
            value={sosPhone}
            onChange={(e) => { setSosPhone(e.target.value); if (sosErrors.phone) setSosErrors((p) => ({ ...p, phone: undefined })); }}
          />
          {sosErrors.phone && <p className="text-xs text-red-500 px-1">{sosErrors.phone}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 px-1">Additional Notes <span className="text-gray-400">(optional)</span></label>
          <textarea
            className={inputCls + " resize-none"}
            placeholder="Injuries, number of people, landmarks nearby…"
            rows={4}
            value={sosNotes}
            onChange={(e) => setSosNotes(e.target.value)}
          />
        </div>

        {gps ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">GPS detected — rescue teams can find you</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">Location not detected — allow GPS for faster rescue</p>
          </div>
        )}

        <button onClick={handleSendSos} disabled={sosName.trim().length < 2 || saving}
          className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-[15px] cursor-pointer transition-colors">
          {saving ? "Sending…" : "🚨 Send Emergency Request Now"}
        </button>
        <p className="text-center text-xs text-gray-400">Your location will be shared with rescue teams after submission</p>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────

  // Status card config based on SOS state
  const statusCard = !activeSosId ? (
    registration
      ? { bg: "bg-green-50 border-green-200", iconBg: "bg-green-500", icon: <CheckCircle className="w-5 h-5 text-white" />, title: "You are Safe", titleCls: "text-green-700", sub: registration.name }
      : { bg: "bg-blue-50 border-blue-200",  iconBg: "bg-blue-500",  icon: <MapPin className="w-5 h-5 text-white" />,       title: "Find Help Near You", titleCls: "text-blue-700",  sub: "Ready to assist you" }
  ) : sosStatus === "pending" ? {
    bg: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-500",
    icon: <Clock className="w-5 h-5 text-white animate-pulse" />,
    title: "Waiting for Rescuers",
    titleCls: "text-amber-700",
    sub: "Your SOS has been received — a team will accept shortly",
  } : sosStatus === "assigned" ? {
    bg: "bg-green-50 border-green-200",
    iconBg: "bg-green-500",
    icon: <CheckCircle className="w-5 h-5 text-white" />,
    title: "Help is Coming!",
    titleCls: "text-green-700",
    sub: "A rescuer accepted your call and is on their way",
  } : {
    bg: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-600",
    icon: <CheckCircle className="w-5 h-5 text-white" />,
    title: "You Have Been Rescued",
    titleCls: "text-blue-700",
    sub: "Mission completed — stay safe",
  };

  return (
    <div className="p-4 md:p-5 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Survivor Portal</h2>
        <p className="text-xs text-gray-400 mt-0.5">Emergency assistance and safe shelter</p>
      </div>

      {/* Location sharing notice */}
      {locationShared ? (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
          <p className="text-xs text-green-700 leading-snug">
            <strong>Your location is being shared</strong> with nearby rescue teams so they can find you.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-snug">
            Allow location access so rescue teams can find you faster.
          </p>
        </div>
      )}

      {/* Status card */}
      <div className={`rounded-2xl p-4 border ${statusCard.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusCard.iconBg}`}>
            {statusCard.icon}
          </div>
          <div className="min-w-0">
            <p className={`font-bold text-sm ${statusCard.titleCls}`}>{statusCard.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{statusCard.sub}</p>
          </div>
          {activeSosId && sosStatus === "pending" && (
            <Loader className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0 ml-auto" />
          )}
        </div>
      </div>

      {/* Registered shelter */}
      {registration && selectedPlace && (
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Registered Shelter</p>
          <div className="border border-gray-100 rounded-2xl p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{selectedPlace.name}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-10">{selectedPlace.currentCount}/{selectedPlace.capacity} capacity</p>
              </div>
              <button onClick={() => flyToPlace(selectedPlace)}
                className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer">
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
            {registration.referenceId && (
              <div className="ml-10 bg-green-50 rounded-lg px-2 py-1">
                <p className="text-xs text-green-600">Ref: <strong>{registration.referenceId}</strong></p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Nearby rescue teams */}
      <section>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nearby Rescue Teams</p>
        {availableTeams.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No teams currently available.</p>
        ) : (
          <div className="space-y-2">
            {availableTeams.slice(0, 3).map((t) => (
              <div key={t.userId} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-sm font-medium text-gray-800">Team #{t.userId}</p>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">Available</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SOS button or active SOS state */}
      {activeSosId ? (
        sosStatus === "pending" ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-1">
            <p className="text-base font-bold text-amber-700">🚨 SOS Sent — Waiting for Rescuers</p>
            <p className="text-sm text-amber-600">Your request has been received. A rescue team will accept your call shortly.</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mt-2">
              <Phone className="w-4 h-4" /> Emergency: <strong className="text-gray-700">199</strong>
            </p>
          </div>
        ) : sosStatus === "assigned" ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center space-y-1">
            <p className="text-base font-bold text-green-700">✅ Help is Coming!</p>
            <p className="text-sm text-green-600">A rescuer has accepted your call and is heading to your location. Stay where you are.</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mt-2">
              <Phone className="w-4 h-4" /> Emergency: <strong className="text-gray-700">199</strong>
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center space-y-1">
            <p className="text-base font-bold text-blue-700">✅ You Have Been Rescued</p>
            <p className="text-sm text-blue-600">The rescue mission has been completed. Please make your way to a safe shelter.</p>
          </div>
        )
      ) : (
        <button onClick={() => setScreen("sos-form")}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 rounded-2xl text-base cursor-pointer transition-colors flex items-center justify-center gap-2.5 shadow-lg shadow-orange-200">
          <AlertTriangle className="w-5 h-5" /> Request Emergency Rescue
        </button>
      )}

      {/* Active flood warnings */}
      {floodZones.length > 0 && (
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Flood Warnings</p>
          <div className="space-y-2">
            {floodZones.map((z) => (
              <div key={z.id} className="border border-gray-100 rounded-2xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900">{z.title}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0 ${SEVERITY_BADGE[z.severity].cls}`}>
                    {SEVERITY_BADGE[z.severity].label}
                  </span>
                </div>
                {z.description && <p className="text-xs text-gray-500 mt-1">{z.description}</p>}
                <p className="text-xs text-gray-400 mt-1">Radius: {z.radius}m</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available safe shelters */}
      <section>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Available Safe Shelters</p>
        {safePlaces.length === 0 && <p className="text-sm text-gray-400">No safe places nearby.</p>}
        <div className="space-y-2">
          {safePlaces.map((p) => {
            const pct = p.capacity > 0 ? Math.min(100, (p.currentCount / p.capacity) * 100) : 0;
            const full = pct >= 100;
            return (
              <div key={p.id} className="border border-gray-100 rounded-2xl p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => flyToPlace(p)}
                      className="p-1 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    {!full && !registration && (
                      <button onClick={() => { setSelectedPlace(p); setScreen("register-form"); }}
                        className="flex items-center gap-0.5 text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg cursor-pointer font-semibold">
                        Register <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1.5">{p.currentCount}/{p.capacity} capacity</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-orange-400" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                </div>
                {full && <p className="text-xs text-red-500 mt-1 font-medium">This shelter is full</p>}
              </div>
            );
          })}
        </div>
      </section>

      <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center justify-center gap-2">
        <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
        <p className="text-sm text-orange-700">Emergency hotline: <strong>199</strong> — Available 24/7</p>
      </div>
    </div>
  );
}
