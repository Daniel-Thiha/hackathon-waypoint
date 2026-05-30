import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getPendingRescuers, approveRescuer } from "../apis/auth.api";
import type { PendingRescuer } from "../types/auth.types";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingRescuer[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadPending = useCallback(async () => {
    try {
      const list = await getPendingRescuers();
      setPending(list);
    } catch {
      // silently ignore — shown in empty state
    }
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      await approveRescuer(id, action);
      setPending((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FFF5EE] flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-[420px] space-y-4">

        {/* Profile card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Admin Dashboard</p>
              <p className="text-gray-500 text-sm">Flood Disaster Management</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 mb-4">
            <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-1">Logged in as</p>
            <p className="text-blue-900 font-bold text-lg">{user?.username}</p>
            <p className="text-blue-500 text-sm">Administrator</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-medium py-3.5 rounded-2xl text-sm transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Pending approvals */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900 text-[15px]">Pending Approvals</p>
            {pending.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No pending applications</p>
          ) : (
            <div className="space-y-3">
              {pending.map((r) => (
                <div key={r.id} className="bg-gray-50 rounded-2xl px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-[13px] truncate">
                        {r.name ?? r.username}
                      </p>
                      <p className="text-gray-400 text-[11px]">@{r.username}</p>
                      <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        r.rescuerType === "GovernmentTeam"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {r.rescuerType === "GovernmentTeam" ? "Government" : "Private"}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(r.id, "approve")}
                        disabled={actionLoading === r.id}
                        className="w-8 h-8 bg-green-100 hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 group"
                        title="Approve"
                      >
                        <CheckIcon className="w-4 h-4 text-green-600 group-hover:text-white transition-colors" />
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "reject")}
                        disabled={actionLoading === r.id}
                        className="w-8 h-8 bg-red-100 hover:bg-red-500 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 group"
                        title="Reject"
                      >
                        <XIcon className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-gray-400 text-[11px]">
          © 2026 Flood Disaster Management System
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
