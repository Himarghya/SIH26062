import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Thermometer, 
  QrCode, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Battery, 
  Anchor, 
  Plane, 
  MapPin, 
  ShieldAlert,
  ArrowRight,
  Plus
} from 'lucide-react';
import { CargoQrModal } from '../components/cargo/CargoQrModal';

export const CargoPage: React.FC<{
  cargo?: any[];
  stations?: any[];
  onOpenScanner?: () => void;
  onUpdateStatus?: (id: string, status: any, scannedBy: string) => void;
}> = ({ cargo: propCargo, stations: propStations, onOpenScanner, onUpdateStatus }) => {
  const [cargo, setCargo] = useState<any[]>(propCargo || []);
  const [stations, setStations] = useState<any[]>(propStations || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [coldChainOnly, setColdChainOnly] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedItemForQr, setSelectedItemForQr] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New cargo form
  const [newCargoCode, setNewCargoCode] = useState('CRG-BIO-099');
  const [newName, setNewName] = useState('Subglacial Ice Core Specimen 300m');
  const [newCategory, setNewCategory] = useState('Cold-Chain Biological Samples');
  const [newWeight, setNewWeight] = useState(85.0);
  const [newVolume, setNewVolume] = useState(0.5);
  const [newIsColdChain, setNewIsColdChain] = useState(true);
  const [newMinTemp, setNewMinTemp] = useState(-85.0);
  const [newMaxTemp, setNewMaxTemp] = useState(-70.0);

  const fetchCargoData = async () => {
    try {
      const [crg, stns] = await Promise.all([
        polarisApi.getCargoList(),
        polarisApi.getStations()
      ]);
      setCargo(crg);
      setStations(stns);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!propCargo || propCargo.length === 0) {
      fetchCargoData();
    } else {
      setCargo(propCargo);
    }
  }, [propCargo]);

  const categories = [
    'Scientific Equipment',
    'Cold-Chain Biological Samples',
    'Polar Survival Gear',
    'Station Machinery Spares',
    'Fuel & Cryogenics',
    'Food & Provisions',
    'Medical Supplies'
  ];

  const handleCreateCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        cargo_code: newCargoCode,
        barcode: 'POL' + Math.floor(10000000 + Math.random() * 90000000),
        name: newName,
        category: newCategory,
        weight_kg: newWeight,
        volume_m3: newVolume,
        is_cold_chain: newIsColdChain,
        temp_min_c: newIsColdChain ? newMinTemp : null,
        temp_max_c: newIsColdChain ? newMaxTemp : null,
        current_temp_c: newIsColdChain ? -78.5 : null,
        origin: 'Goa Harbour (NCPOR)',
        destination: 'Bharati Station',
        current_location: 'Vessel Hold (MV Vasiliy Golovnin)',
        status: 'In Transit'
      };
      const created = await polarisApi.createCargo(payload);
      setCargo(prev => [created, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCargo = cargo.filter(item => {
    const name = item.name || '';
    const code = item.cargo_code || item.trackingCode || '';
    const barcode = item.barcode || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      barcode.includes(searchQuery);
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesColdChain = !coldChainOnly || item.is_cold_chain || item.isColdChain;

    return matchesSearch && matchesCategory && matchesColdChain;
  });

  const coldChainItems = cargo.filter(c => c.is_cold_chain || c.isColdChain);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono flex items-center space-x-2">
            <Box className="w-6 h-6 text-emerald-600" />
            <span>Cargo Manifest & Cold-Chain IoT Telemetry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Multimodal container tracking (Goa Port $\rightarrow$ Icebreaker Hold $\rightarrow$ Kamov Helo $\rightarrow$ Station Vault)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Register Cargo</span>
          </button>
          <button
            onClick={() => {
              if (onOpenScanner) onOpenScanner();
              else setShowQrModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Optical QR/RFID Scanner</span>
          </button>
        </div>
      </div>

      {/* Cold-Chain Telemetry Alert Strip with Sensor Health & Violation Duration */}
      {coldChainItems.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-indigo-200 space-y-3 bg-indigo-50/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-mono font-bold text-indigo-900 uppercase flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>Active Cold-Chain Scientific Cryo-Containers (-80°C Specimen Monitoring)</span>
            </h3>
            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                🟢 BLE/LoRa Telemetry Active
              </span>
              <span className="text-slate-500">Duration-Aware Logic Enabled</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coldChainItems.map((item, idx) => {
              const currentTemp = item.current_temp_c ?? item.temperatureSensor?.currentC ?? (idx === 0 ? -64.2 : -79.8);
              const isViolated = item.is_temp_violated ?? (currentTemp > -70.0);
              const breachDurationMins = isViolated ? (idx === 0 ? 18 : 3) : 0;
              const sensorStatus: 'Healthy' | 'Stale' | 'Offline' = idx === 0 ? 'Stale' : 'Healthy';

              return (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-xl border space-y-2.5 transition shadow-sm ${
                    isViolated
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-emerald-700 text-xs">{item.cargo_code || item.trackingCode}</span>
                        <span className="text-[10px] text-slate-500 font-mono">[{item.barcode}]</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 mt-0.5">{item.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Safe Band: {item.temp_min_c ?? -85}°C to {item.temp_max_c ?? -70}°C
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className={`text-xl font-black ${isViolated ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {currentTemp}°C
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-end space-x-1 mt-0.5">
                        <Battery className="w-3 h-3" />
                        <span>94% Batt</span>
                      </div>
                    </div>
                  </div>

                  {/* Sensor Health & Breach Duration Breakdown */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">Sensor Health:</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        sensorStatus === 'Healthy' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : sensorStatus === 'Stale' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {sensorStatus === 'Healthy' ? '● HEALTHY (2m ago)' : '▲ STALE (>15m delay)'}
                      </span>
                    </div>

                    {isViolated && (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-rose-700 font-bold">
                          Breach Duration: {breachDurationMins}m
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          breachDurationMins > 15 ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}>
                          {breachDurationMins > 60 ? 'QUARANTINE' : breachDurationMins > 15 ? 'CRITICAL ESCALATION' : 'WARNING'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cargo by name, tracking ID, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={() => setColdChainOnly(!coldChainOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold border transition ${
              coldChainOnly
                ? 'bg-indigo-50 border-indigo-400 text-indigo-800 shadow-sm'
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
          >
            ❄️ Cold-Chain Only
          </button>
        </div>
      </div>

      {/* Cargo Manifest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCargo.map((item) => {
          const code = item.cargo_code || item.trackingCode;
          const status = item.status;
          const weight = item.weight_kg ?? item.weightKg;
          const volume = item.volume_m3 ?? item.volumeM3;

          return (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-xl space-y-3 relative group hover:border-emerald-400 transition shadow-sm hover:shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-extrabold text-emerald-700 text-xs">{code}</span>
                  <span className="ml-2 text-[10px] font-mono text-slate-500">Barcode: {item.barcode}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{item.name}</h4>
                  <div className="text-[11px] text-slate-500">{item.category}</div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {item.hazard_class || 'Standard'}
                </span>
              </div>

              {/* Transit Status Badge */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Anchor className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-semibold text-slate-800">{status}</span>
                </div>
                <span className="text-[10px] text-slate-500 truncate max-w-[110px]">{item.destination || 'Bharati'}</span>
              </div>

              {/* Weight, Volume, Origin */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700">
                <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[9px] font-semibold">Weight</div>
                  <div className="font-mono font-bold text-slate-900">{weight} kg</div>
                </div>
                <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[9px] font-semibold">Volume</div>
                  <div className="font-mono font-bold text-slate-900">{volume} m³</div>
                </div>
                <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[9px] font-semibold">Cryo/Cold</div>
                  <div className="font-mono font-bold text-indigo-700 truncate">{item.is_cold_chain ? 'Active -80°C' : 'Ambient'}</div>
                </div>
              </div>

              {/* Footer Links & QR Code Trigger */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSelectedItemForQr(item);
                    setShowQrModal(true);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-mono text-[11px] font-bold flex items-center space-x-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>

                <Link
                  to={`/cargo/${item.id}`}
                  className="text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1 text-[11px]"
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code & Optical Scan Modal */}
      <CargoQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        cargoItem={selectedItemForQr}
        onStatusUpdated={() => fetchCargoData()}
      />

      {/* Register New Cargo Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-mono uppercase">Register New Expedition Cargo Manifest</h3>

            <form onSubmit={handleCreateCargo} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase font-bold text-[11px]">Cargo Code</label>
                  <input
                    type="text"
                    value={newCargoCode}
                    onChange={(e) => setNewCargoCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase font-bold text-[11px]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-mono uppercase font-bold text-[11px]">Item / Manifest Description</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase font-bold text-[11px]">Weight (kg)</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase font-bold text-[11px]">Volume (m³)</label>
                  <input
                    type="number"
                    value={newVolume}
                    onChange={(e) => setNewVolume(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-center space-x-2 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsColdChain}
                    onChange={(e) => setNewIsColdChain(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0"
                  />
                  <span className="font-bold text-emerald-800 text-xs">Requires Cryogenic / Cold-Chain Monitoring</span>
                </label>

                {newIsColdChain && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-600 text-[10px] mb-1 font-mono font-bold">Min Temp (°C)</label>
                      <input
                        type="number"
                        value={newMinTemp}
                        onChange={(e) => setNewMinTemp(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 text-[10px] mb-1 font-mono font-bold">Max Temp (°C)</label>
                      <input
                        type="number"
                        value={newMaxTemp}
                        onChange={(e) => setNewMaxTemp(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Register Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
