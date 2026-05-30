import { useState, useEffect } from 'react';
import api from './api';

interface Supply {
  id: number;
  safePlaceId: number;
  supplyType: string;
  quantity: string;
  distributionAt: string;
  description?: string;
  status?: 'in-progress' | 'scheduled' | string;
}

interface SafePlace {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupants: number;
  facilities: string;
  supplies: Supply[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'forecasts' | 'safe-places' | 'supplies'>('overview');
  const [mobileActiveView, setMobileActiveView] = useState<'info' | 'map'>('info');
  const [currentForm, setCurrentForm] = useState<'none' | 'add-place' | 'add-supply'>('none');
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString('en-US', { hour12: true }));

  const [editingPlace, setEditingPlace] = useState<SafePlace | null>(null);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; type: 'place' | 'supply'; name: string } | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [placeName, setPlaceName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [capacity, setCapacity] = useState('');
  const [facilities, setFacilities] = useState('');

  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [supplyType, setSupplyType] = useState('Water');
  const [quantity, setQuantity] = useState('');
  const [distTime, setDistTime] = useState('');
  const [description, setDescription] = useState('');

  const fetchSafePlaces = async () => {
    try {
      const response = await api.get('/safe-places');
      setSafePlaces(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchSafePlaces();
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/safe-places', {
        name: placeName,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        capacity: parseInt(capacity),
        facilities: facilities
      });
      showToast('📌 Safe Place registered successfully!');
      resetPlaceForm();
      fetchSafePlaces();
      setCurrentForm('none');
      setActiveTab('safe-places');
    } catch (error) {
      showToast('❌ Failed to create Safe Place.');
    }
  };

  const handleUpdatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace) return;
    try {
      await api.put(`/safe-places/${editingPlace.id}`, {
        name: editingPlace.name,
        latitude: editingPlace.latitude,
        longitude: editingPlace.longitude,
        capacity: editingPlace.capacity,
        currentOccupants: editingPlace.currentOccupants,
        facilities: editingPlace.facilities
      });
      showToast('📌 Safe Place updated successfully!');
      setEditingPlace(null);
      fetchSafePlaces();
    } catch (error) {
      showToast('❌ Failed to update Safe Place.');
    }
  };

  const handleDeletePlace = (id: number, name: string) => {
    setDeleteConfirm({ id, type: 'place', name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    try {
      if (type === 'place') {
        await api.delete(`/safe-places/${id}`);
        showToast("📌 Safe Place deleted successfully!");
      } else {
        await api.delete(`/supplies/${id}`);
        showToast("📦 Supply distribution deleted successfully!");
      }
      fetchSafePlaces();
    } catch (error) {
      showToast(`❌ Failed to delete ${type === 'place' ? 'Safe Place' : 'supply distribution'}.`);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleAddSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaceId) return showToast('Please select a target safe place');
    try {
      await api.post('/supplies', {
        safePlaceId: parseInt(selectedPlaceId),
        supplyType: supplyType,
        quantity: quantity,
        distributionAt: new Date(distTime).toISOString(),
        description: description
      });
      showToast('📦 Supply drop scheduled successfully!');
      resetSupplyForm();
      fetchSafePlaces();
      setCurrentForm('none');
      setActiveTab('supplies');
    } catch (error) {
      showToast('❌ Failed to schedule supply distribution.');
    }
  };

  const handleUpdateSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupply) return;
    try {
      await api.put(`/supplies/${editingSupply.id}`, {
        safePlaceId: editingSupply.safePlaceId,
        supplyType: editingSupply.supplyType,
        quantity: editingSupply.quantity,
        distributionAt: new Date(editingSupply.distributionAt).toISOString(),
        description: editingSupply.description
      });
      showToast('📦 Supply distribution updated successfully!');
      setEditingSupply(null);
      fetchSafePlaces();
    } catch (error) {
      showToast('❌ Failed to update supply distribution.');
    }
  };

  const handleDeleteSupply = (id: number, name: string) => {
    setDeleteConfirm({ id, type: 'supply', name });
  };

  const resetPlaceForm = () => {
    setPlaceName(''); setLat(''); setLng(''); setCapacity(''); setFacilities('');
  };

  const resetSupplyForm = () => {
    setQuantity(''); setDistTime(''); setDescription(''); setSelectedPlaceId('');
  };

  const allSupplies = safePlaces.flatMap(place =>
    (place.supplies || []).map(sup => ({ ...sup, placeName: place.name }))
  );

  const totalScheduledSupplies = safePlaces.reduce((acc, place) => acc + (place.supplies?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-[#0f172a] font-sans antialiased flex flex-col h-screen overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className={`w-full lg:w-[38%] xl:w-[35%] min-w-[380px] max-w-[550px] border-r border-[#e4ecf5] bg-white flex-col overflow-y-auto h-full lg:h-auto lg:shrink-0 ${mobileActiveView === 'info' ? 'flex' : 'hidden'} lg:flex`}>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Admin Dashboard</h2>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 font-bold">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{timeStr}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#fef2f2] border border-[#fecaca] p-4 rounded-2xl flex flex-col justify-between h-[105px] hover:scale-[1.02] hover:shadow-sm transition-all duration-300 cursor-default">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg bg-[#fee2e2] border border-[#fecaca] flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#b91c1c] uppercase tracking-wider">Critical Alerts</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#991b1b]">1</div>
                  <div className="text-[10px] font-bold text-[#b91c1c]/85">Active warnings</div>
                </div>
              </div>

              <div className="bg-[#fff7ed] border border-[#fed7aa] p-4 rounded-2xl flex flex-col justify-between h-[105px] hover:scale-[1.02] hover:shadow-sm transition-all duration-300 cursor-default">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg bg-[#ffedd5] border border-[#fed7aa] flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-[#f97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#c2410c] uppercase tracking-wider">Pending</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#9a3412]">3</div>
                  <div className="text-[10px] font-bold text-[#c2410c]/85">Awaiting rescue</div>
                </div>
              </div>

              <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-4 rounded-2xl flex flex-col justify-between h-[105px] hover:scale-[1.02] hover:shadow-sm transition-all duration-300 cursor-default">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg bg-[#dcfce7] border border-[#bbf7d0] flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#15803d] uppercase tracking-wider">Safe Places</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#166534]">{safePlaces.length}</div>
                  <div className="text-[10px] font-bold text-[#15803d]/85">
                    {safePlaces.reduce((acc, p) => acc + p.currentOccupants, 0)}/{safePlaces.reduce((acc, p) => acc + p.capacity, 0)} occupied
                  </div>
                </div>
              </div>

              <div className="bg-[#eff6ff] border border-[#bfdbfe] p-4 rounded-2xl flex flex-col justify-between h-[105px] hover:scale-[1.02] hover:shadow-sm transition-all duration-300 cursor-default">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg bg-[#dbeafe] border border-[#bfdbfe] flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-[#1d4ed8] uppercase tracking-wider">Teams Ready</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#1e40af]">2</div>
                  <div className="text-[10px] font-bold text-[#1d4ed8]/85">of 4 teams</div>
                </div>
              </div>
            </div>

            <div className="flex bg-[#f0f4f9] p-1 rounded-xl w-full border border-[#e2e8f0]">
              {(['overview', 'forecasts', 'safe-places', 'supplies'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentForm('none'); }}
                  className={`flex-1 text-center py-2 text-[12px] font-bold rounded-lg transition-all capitalize cursor-pointer ${activeTab === tab && currentForm === 'none'
                      ? 'bg-white text-[#0f172a] shadow-sm border border-[#dee5ed]'
                      : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                >
                  {tab === 'safe-places' ? 'Safe Places' : tab}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => showToast('📊 Forecast Form Initialization')}
                      className="bg-[#cc0000] hover:bg-[#b30000] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 text-[11px] transition shadow-sm cursor-pointer"
                    >
                      <span>+</span> Forecast
                    </button>
                    <button
                      onClick={() => {
                        setCurrentForm(currentForm === 'add-place' ? 'none' : 'add-place');
                      }}
                      className="bg-[#009966] hover:bg-[#008055] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 text-[11px] transition shadow-sm cursor-pointer"
                    >
                      <span>+</span> Safe Place
                    </button>
                    <button
                      onClick={() => {
                        setCurrentForm(currentForm === 'add-supply' ? 'none' : 'add-supply');
                      }}
                      className="bg-[#1a66ff] hover:bg-[#004de6] text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 text-[11px] transition shadow-sm cursor-pointer"
                    >
                      <span>+</span> Supply
                    </button>
                  </div>

                  {currentForm === 'add-place' && (
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
                      <h3 className="text-lg font-bold text-[#091e42]">Add Safe Place</h3>
                      <form onSubmit={handleAddPlace} className="space-y-3">
                        <input
                          type="text" required placeholder="Place name" value={placeName} onChange={(e) => setPlaceName(e.target.value)}
                          className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number" step="any" required placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)}
                            className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                          />
                          <input
                            type="number" step="any" required placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)}
                            className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                          />
                        </div>
                        <input
                          type="number" required placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)}
                          className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                        />
                        <input
                          type="text" placeholder="Facilities (comma separated)" value={facilities} onChange={(e) => setFacilities(e.target.value)}
                          className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                        />

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 bg-[#009966] hover:bg-[#008055] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                          >
                            Add Safe Place
                          </button>
                          <button
                            type="button" onClick={() => { resetPlaceForm(); setCurrentForm('none'); }}
                            className="bg-[#e8edf4] hover:bg-[#dbe3ed] text-[#475569] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {currentForm === 'add-supply' && (
                    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
                      <h3 className="text-lg font-bold text-[#091e42]">Schedule Supply Distribution</h3>
                      <form onSubmit={handleAddSupply} className="space-y-3">
                        <select
                          required value={selectedPlaceId} onChange={(e) => setSelectedPlaceId(e.target.value)}
                          className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#1a66ff] transition text-slate-700 cursor-pointer"
                        >
                          <option value="">Select Safe Place</option>
                          {safePlaces.map((place) => (
                            <option key={place.id} value={place.id}>{place.name}</option>
                          ))}
                        </select>
                        <select
                          required value={supplyType} onChange={(e) => setSupplyType(e.target.value)}
                          className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#1a66ff] transition text-slate-700 cursor-pointer"
                        >
                          <option value="">Select Supply Type</option>
                          <option value="Water">Water</option>
                          <option value="Food">Food</option>
                          <option value="Medical">Medical</option>
                          <option value="Clothing">Clothing</option>
                        </select>
                        <input
                          type="datetime-local" required value={distTime} onChange={(e) => setDistTime(e.target.value)}
                          className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#1a66ff] transition text-slate-700"
                        />
                        <input
                          type="text" required placeholder="Quantity (e.g., 500 meals)" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                          className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#1a66ff] transition placeholder-slate-400 text-slate-800"
                        />
                        <textarea
                          placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-white border border-[#e2e8f0] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#1a66ff] transition placeholder-slate-400 text-slate-800 min-h-[60px]"
                        />

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 bg-[#1a66ff] hover:bg-[#004de6] text-white font-bold py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                          >
                            Schedule Supply
                          </button>
                          <button
                            type="button" onClick={() => { resetSupplyForm(); setCurrentForm('none'); }}
                            className="bg-[#e8edf4] hover:bg-[#dbe3ed] text-[#475569] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white border border-[#e4ecf5] rounded-2xl p-5 shadow-sm border-slate-200">
                    <h2 className="text-base font-bold text-[#091e42] mb-3">System Status</h2>
                    <div className="divide-y divide-slate-100 text-xs font-semibold text-[#475569]">
                      <div className="flex justify-between py-2.5">
                        <span>Total Forecasts</span>
                        <span className="text-black font-bold">3</span>
                      </div>
                      <div className="flex justify-between py-2.5">
                        <span>Active Missions</span>
                        <span className="text-black font-bold">2</span>
                      </div>
                      <div className="flex justify-between py-2.5">
                        <span>People Rescued</span>
                        <span className="text-[#009966] font-bold">0</span>
                      </div>
                      <div className="flex justify-between py-2.5">
                        <span>Scheduled Supplies</span>
                        <span className="text-[#1a66ff] font-bold">{totalScheduledSupplies}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'safe-places' && (
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-[#091e42] mb-1">Safe Place Management</h2>

                  {safePlaces.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 bg-white border border-slate-100 rounded-xl">No active safe zones registered.</div>
                  ) : (
                    safePlaces.map((place) => {
                      const ratio = place.capacity > 0 ? (place.currentOccupants / place.capacity) * 100 : 0;
                      const latestSup = place.supplies && place.supplies.length > 0 ? place.supplies[0] : null;
                      return (
                        <div key={place.id} className="bg-white border border-[#e4ecf5] rounded-2xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-[#091e42]">{place.name}</h3>
                              {place.currentOccupants >= place.capacity && (
                                <span className="bg-[#cc0000] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Full
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-semibold">Capacity</span>
                              <span className="text-xs font-bold text-[#0f172a]">{place.currentOccupants}/{place.capacity}</span>
                            </div>
                          </div>

                          <div className="w-full bg-[#f0f4f8] h-2 rounded-full overflow-hidden border border-slate-50">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                place.currentOccupants >= place.capacity ? 'bg-[#cc0000]' : 'bg-[#009966]'
                              }`}
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                            />
                          </div>

                          <div className="pt-2 flex justify-between items-center text-[10px] border-t border-slate-50 mt-1">
                            <div className="max-w-[70%]">
                              <span className="block text-slate-400 mb-0.5 font-semibold">Next Supply:</span>
                              {latestSup ? (
                                <span className="text-slate-700 font-bold truncate block">
                                  {latestSup.supplyType} - {new Date(latestSup.distributionAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic font-medium">No supplies scheduled</span>
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingPlace(place)}
                                className="text-[#009966] hover:text-[#008055] font-bold px-1.5 py-0.5 rounded hover:bg-slate-50 transition cursor-pointer"
                              >
                                Edit
                              </button>
                               <button
                                onClick={() => handleDeletePlace(place.id, place.name)}
                                className="text-[#cc0000] hover:text-[#b30000] font-bold px-1.5 py-0.5 rounded hover:bg-slate-50 transition cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'supplies' && (
                <div className="space-y-3">
                  <h2 className="text-base font-bold text-[#091e42] mb-1">Supply Distributions</h2>

                  {allSupplies.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 bg-white border border-slate-100 rounded-xl">No active supply lines running.</div>
                  ) : (
                    allSupplies.map((sup, idx) => (
                      <div key={sup.id || idx} className="bg-white border border-[#e4ecf5] rounded-2xl p-4 shadow-sm flex justify-between items-start gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                            {sup.supplyType === 'Water' ? (
                              <div className="bg-[#eff6ff] w-full h-full rounded-xl flex items-center justify-center">
                                <svg className="w-4.5 h-4.5 text-[#1a66ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5c-4.142 0-7.5-3.358-7.5-7.5C4.5 9.15 12 2.5 12 2.5S19.5 9.15 19.5 14c0 4.142-3.358 7.5-7.5 7.5z" />
                                </svg>
                              </div>
                            ) : sup.supplyType === 'Food' ? (
                              <div className="bg-[#fff7ed] w-full h-full rounded-xl flex items-center justify-center">
                                <svg className="w-4.5 h-4.5 text-[#d97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v7a6 6 0 006 6h3m0 0v5m0-5h3a6 6 0 006-6V3M9 3v4m6-4v4" />
                                </svg>
                              </div>
                            ) : sup.supplyType === 'Medical' ? (
                              <div className="bg-[#fef2f2] w-full h-full rounded-xl flex items-center justify-center">
                                <svg className="w-4.5 h-4.5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m8-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="bg-[#faf5ff] w-full h-full rounded-xl flex items-center justify-center">
                                <svg className="w-4.5 h-4.5 text-[#8b5cf6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a3 3 0 00-3 3v1H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-3V7a3 3 0 00-3-3z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-sm font-bold text-[#091e42] truncate">{sup.supplyType}</h4>
                            {sup.description && <p className="text-xs text-slate-500 font-semibold truncate">{sup.description}</p>}
                            <p className="text-[10px] text-slate-400 font-semibold pt-0.5">
                              Quantity: <span className="text-slate-700 font-bold">{sup.quantity}</span>
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#009966] font-bold pt-0.5 truncate">
                              <svg className="w-3.5 h-3.5 text-[#009966] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="truncate">{sup.placeName}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              🕒 {new Date(sup.distributionAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold tracking-wide border ${idx === 0
                              ? 'bg-[#eff6ff] text-[#1a66ff] border-[#dbeafe]'
                              : 'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                            {idx === 0 ? 'in-progress' : 'scheduled'}
                          </span>
                          <div className="flex gap-1.5 text-[10px]">
                            <button
                              onClick={() => setEditingSupply(sup)}
                              className="text-[#1a66ff] hover:text-[#004de6] font-bold px-1.5 py-0.5 rounded hover:bg-slate-50 transition cursor-pointer"
                            >
                              Edit
                            </button>
                             <button
                              onClick={() => handleDeleteSupply(sup.id, sup.supplyType)}
                              className="text-[#cc0000] hover:text-[#b30000] font-bold px-1.5 py-0.5 rounded hover:bg-slate-50 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'forecasts' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center py-10">
                  <span className="text-xl block mb-1.5">📊</span>
                  <h3 className="text-sm font-bold text-slate-800">Flood Forecast Metrics</h3>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">Data simulations and warning alerts are active and synchronized with the department.</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className={`flex-1 bg-white relative min-h-[500px] w-full h-full overflow-hidden items-center justify-center ${mobileActiveView === 'map' ? 'flex' : 'hidden'} lg:flex`}>
          <img src="/map.png" alt="Disaster Zone Map" className="w-full h-full object-contain" />
        </main>
      </div>

      {editingPlace && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999] animate-fadeIn backdrop-blur-sm">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-[#091e42]">Edit Safe Place</h3>
            <form onSubmit={handleUpdatePlace} className="space-y-4">
              <input
                type="text" required placeholder="Place name" value={editingPlace.name} onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number" step="any" required placeholder="Latitude" value={editingPlace.latitude} onChange={(e) => setEditingPlace({ ...editingPlace, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                />
                <input
                  type="number" step="any" required placeholder="Longitude" value={editingPlace.longitude} onChange={(e) => setEditingPlace({ ...editingPlace, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number" required placeholder="Capacity" value={editingPlace.capacity} onChange={(e) => setEditingPlace({ ...editingPlace, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                />
                <input
                  type="number" required placeholder="Current Occupants" value={editingPlace.currentOccupants} onChange={(e) => setEditingPlace({ ...editingPlace, currentOccupants: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
                />
              </div>
              <input
                type="text" placeholder="Facilities (comma separated)" value={editingPlace.facilities} onChange={(e) => setEditingPlace({ ...editingPlace, facilities: e.target.value })}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#009966] transition placeholder-slate-400 text-slate-800"
              />

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#009966] hover:bg-[#008055] text-white font-semibold py-3 px-6 rounded-xl text-sm transition shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button" onClick={() => setEditingPlace(null)}
                  className="bg-[#e8edf4] hover:bg-[#dbe3ed] text-[#475569] font-semibold py-3 px-6 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSupply && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999] animate-fadeIn backdrop-blur-sm">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-[#091e42]">Edit Supply Distribution</h3>
            <form onSubmit={handleUpdateSupply} className="space-y-4">
              <select
                required value={editingSupply.safePlaceId} onChange={(e) => setEditingSupply({ ...editingSupply, safePlaceId: parseInt(e.target.value) || 0 })}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a66ff] transition text-slate-700 cursor-pointer"
              >
                <option value="">Select Safe Place</option>
                {safePlaces.map((place) => (
                  <option key={place.id} value={place.id}>{place.name}</option>
                ))}
              </select>
              <select
                required value={editingSupply.supplyType} onChange={(e) => setEditingSupply({ ...editingSupply, supplyType: e.target.value })}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a66ff] transition text-slate-700 cursor-pointer"
              >
                <option value="">Select Supply Type</option>
                <option value="Water">Water</option>
                <option value="Food">Food</option>
                <option value="Medical">Medical</option>
                <option value="Clothing">Clothing</option>
              </select>
              <input
                type="datetime-local" required
                value={editingSupply.distributionAt ? new Date(editingSupply.distributionAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditingSupply({ ...editingSupply, distributionAt: e.target.value })}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a66ff] transition text-slate-700"
              />
              <input
                type="text" required placeholder="Quantity" value={editingSupply.quantity} onChange={(e) => setEditingSupply({ ...editingSupply, quantity: e.target.value })}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a66ff] transition placeholder-slate-400 text-slate-800"
              />
              <textarea
                placeholder="Description" value={editingSupply.description || ''} onChange={(e) => setEditingSupply({ ...editingSupply, description: e.target.value })}
                className="w-full bg-white border border-[#e2e8f0] rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a66ff] transition placeholder-slate-400 text-slate-800 min-h-[80px]"
              />

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#1a66ff] hover:bg-[#004de6] text-white font-semibold py-3 px-6 rounded-xl text-sm transition shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button" onClick={() => setEditingSupply(null)}
                  className="bg-[#e8edf4] hover:bg-[#dbe3ed] text-[#475569] font-semibold py-3 px-6 rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[99999] animate-fadeIn backdrop-blur-sm">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4 text-center">
            <h3 className="text-lg font-bold text-[#091e42]">Confirm Delete</h3>
            <p className="text-sm text-slate-500">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteConfirm.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 bg-[#cc0000] hover:bg-[#b30000] text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition cursor-pointer"
              >
                Delete
              </button>
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-[#e8edf4] hover:bg-[#dbe3ed] text-[#475569] font-semibold py-2.5 px-4 rounded-xl text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] animate-fadeIn">
          <div className="bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 backdrop-blur-sm tracking-wide">
            {toast}
          </div>
        </div>
      )}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 border border-[#e4ecf5] rounded-full shadow-2xl p-1.5 flex gap-1.5 lg:hidden backdrop-blur-md">
        <button
          onClick={() => setMobileActiveView('info')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            mobileActiveView === 'info'
              ? 'bg-[#ff5c00] text-white shadow-md shadow-[#ff5c00]/20'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
            <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
            <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
            <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Info</span>
        </button>
        <button
          onClick={() => setMobileActiveView('map')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            mobileActiveView === 'map'
              ? 'bg-[#ff5c00] text-white shadow-md shadow-[#ff5c00]/20'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="9" y1="3" x2="9" y2="18" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="6" x2="15" y2="21" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Map</span>
        </button>
      </div>
    </div>
  );
}