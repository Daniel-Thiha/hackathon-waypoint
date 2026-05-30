import { useState, useEffect, useRef } from "react";
import { CheckCircle, Navigation, Radio, Truck } from "lucide-react";
import type { SosRequest } from "../../survivor/types/survivor.types";
import type { RescueMission, RescueTeamStatus } from "../types/rescue.types";
import { acceptSos, completeMission, setAvailability, updateMyPosition, listActiveMissions } from "../apis/rescue.api";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useMapContext } from "../../map/contexts/MapContext";

interface RescuePanelProps {
  sosRequests: SosRequest[];
  teamStatuses: RescueTeamStatus[];
  onRefresh: () => void;
  onActiveMissionChange: (rescuerId: number | null) => void;
  onSwitchToMap?: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function RescuePanel({ sosRequests, teamStatuses, onRefresh, onActiveMissionChange, onSwitchToMap }: RescuePanelProps) {
  const { user } = useAuth();
  const { panTo } = useMapContext();

  function navigateTo(lat: number, lng: number, zoom = 15) {
    onSwitchToMap?.();
    panTo({ lat, lng }, zoom);
  }

  const [activeMission, setActiveMission] = useState<RescueMission | null>(null);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const watchRef = useRef<number | null>(null);

  const myStatus = teamStatuses.find((t) => t.userId === user?.id);
  const isAvailable = myStatus?.isAvailable ?? true;
  const pending = sosRequests.filter((s) => s.status === "pending");
  const completedCount = sosRequests.filter((s) => s.status === "completed").length;

  useEffect(() => {
    listActiveMissions().then((missions) => {
      const mine = missions.find((m) => m.rescuerId === user?.id && m.status === "active");
      setActiveMission(mine ?? null);
      onActiveMissionChange(mine ? user!.id : null);
    });
  }, [sosRequests, user, onActiveMissionChange]);

  useEffect(() => {
    if (!user) return;
    watchRef.current = navigator.geolocation?.watchPosition(
      (p) => { updateMyPosition(p.coords.latitude, p.coords.longitude).catch(() => {}); onRefresh(); },
      (err) => {
        if (err.code !== err.POSITION_UNAVAILABLE) console.warn("Geolocation:", err.message);
      },
      { maximumAge: 20000, timeout: 15000 }
    );
    return () => { if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current); };
  }, [user, onRefresh]);

  async function handleToggleAvailability() {
    await setAvailability(!isAvailable);
    onRefresh();
  }

  async function handleAccept(sosRequestId: number) {
    setAccepting(sosRequestId);
    try {
      const mission = await acceptSos(sosRequestId);
      setActiveMission(mission);
      onActiveMissionChange(user!.id);
      onRefresh();
    } finally { setAccepting(null); }
  }

  async function handleComplete() {
    if (!activeMission) return;
    setCompleting(true);
    try {
      await completeMission(activeMission.id);
      await setAvailability(true);
      setActiveMission(null);
      onActiveMissionChange(null);
      onRefresh();
    } finally { setCompleting(false); }
  }

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Rescue Operations</h2>
        <p className="text-xs text-gray-400 mt-0.5">Team {user?.username ?? "—"}</p>
      </div>

      {/* Team status */}
      <div className={`rounded-2xl p-4 flex items-center gap-3 ${isAvailable && !activeMission ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAvailable && !activeMission ? "bg-green-500" : "bg-orange-500"}`}>
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-bold ${isAvailable && !activeMission ? "text-green-700" : "text-orange-700"}`}>
            {activeMission ? "On Active Mission" : isAvailable ? "Ready for Deployment" : "Off Duty"}
          </p>
          <p className="text-xs text-gray-500">
            {activeMission ? "Complete mission to become available" : `Team ${user?.username}`}
          </p>
        </div>
        {!activeMission && (
          <button onClick={handleToggleAvailability}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${isAvailable ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isAvailable ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            {isAvailable ? "Available" : "Off Duty"}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "In Progress", value: activeMission ? 1 : 0, color: "text-orange-600" },
          { label: "Completed",   value: completedCount,         color: "text-green-600" },
          { label: "Waiting",     value: pending.length,         color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Active mission */}
      {activeMission && (() => {
        const sos = sosRequests.find((s) => s.id === activeMission.sosRequestId);
        return (
          <section>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Mission</p>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 space-y-2">
              {sos && (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{sos.survivorName}</p>
                      {sos.phone && <p className="text-xs text-gray-500">{sos.phone}</p>}
                      {sos.notes && <p className="text-xs text-gray-600 italic mt-0.5">"{sos.notes}"</p>}
                    </div>
                    <button onClick={() => navigateTo(sos.lastKnownLat ?? sos.lat, sos.lastKnownLng ?? sos.lng)}
                      className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg cursor-pointer">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  </div>
                  <p className="text-xs text-orange-500 flex items-center gap-1"><Radio className="w-3 h-3" /> Live location tracking active</p>
                </>
              )}
            </div>
            <button onClick={handleComplete} disabled={completing}
              className="w-full mt-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <CheckCircle className="w-4 h-4" />
              {completing ? "Completing…" : "Mission Complete — Arrived at Safe Place"}
            </button>
          </section>
        );
      })()}

      {/* Emergency requests */}
      {isAvailable && !activeMission && (
        <section>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Emergency Requests ({pending.length})
          </p>
          {pending.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">No pending SOS requests</p>
              <p className="text-xs text-gray-300 mt-1">Stay ready — alerts will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((s) => (
                <div key={s.id} className="bg-red-50 border border-red-100 rounded-2xl p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{s.survivorName}</p>
                      <p className="text-xs text-gray-500">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <span className="text-orange-500">⏱</span> {timeAgo(s.createdAt)}
                      </p>
                    </div>
                    <button onClick={() => navigateTo(s.lastKnownLat ?? s.lat, s.lastKnownLng ?? s.lng)}
                      className="p-1.5 hover:bg-red-100 rounded-lg cursor-pointer shrink-0">
                      <Navigation className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                  <button onClick={() => handleAccept(s.id)} disabled={accepting === s.id}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-bold py-2 rounded-xl cursor-pointer transition-colors">
                    {accepting === s.id ? "Accepting…" : "Accept & Navigate"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Today's performance */}
      <section>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Today's Performance</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Total Rescued</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Safely Delivered</p>
          </div>
        </div>
      </section>
    </div>
  );
}
