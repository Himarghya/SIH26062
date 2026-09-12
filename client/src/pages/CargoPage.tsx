import React, { useState } from 'react';
import { CargoItem, Station, CargoCategory } from '../types';
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
  ShieldAlert 
} from 'lucide-react';

interface CargoPageProps {
  cargo: CargoItem[];
  stations: Station[];
  onOpenScanner: () => void;
  onUpdateStatus: (id: string, status: CargoItem['status'], scannedBy: string) => void;
}

export const CargoPage: React.FC<CargoPageProps> = ({
  cargo,
  stations,
  onOpenScanner,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [coldChainOnly, setColdChainOnly] = useState(false);

  const categories: CargoCategory[] = [
    'Scientific Equipment',
    'Cold-Chain Biological Samples',
    'Polar Survival Gear',
    'Station Machinery Spares',
    'Fuel & Cryogenics',
    'Food & Provisions',
    'Medical Supplies'
  ];

  const filteredCargo = cargo.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery);
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesColdChain = !coldChainOnly || item.isColdChain;

    return matchesSearch && matchesCategory && matchesColdChain;
  });

  const coldChainItems = cargo.filter(c => c.isColdChain);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase font-mono flex items-center space-x-2">
            <Box className="w-6 h-6 text-cyan-400" />
            <span>Cargo Manifest & Cold-Chain IoT Telemetry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal container tracking (Goa Port $\rightarrow$ Icebreaker Hold $\rightarrow$ Kamov Helo $\rightarrow$ Station Vault)
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/25 transition"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch Optical QR/RFID Scanner</span>
        </button>
      </div>

      {/* Cold-Chain Telemetry Alert Strip */}
      {coldChainItems.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-blue-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-blue-300 uppercase flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Active Cold-Chain Scientific Cryo-Containers (-80°C Specimen Monitoring)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Continuous IoT Logger Feeds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {coldChainItems.map(item => (
              <div 
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  item.temperatureSensor?.isViolated
                    ? 'bg-rose-950/70 border-rose-500/70 text-rose-200'
                    : 'bg-polar-900/90 border-blue-800/40 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-400 text-xs">{item.trackingCode}</span>
                    <span className="text-[10px] text-slate-400 font-mono">[{item.containerId}]</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-100 mt-0.5">{item.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Safe Band: {item.temperatureSensor?.requiredMinC}°C to {item.temperatureSensor?.requiredMaxC}°C
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className={`text-xl font-black ${item.temperatureSensor?.isViolated ? 'text-rose-400' : 'text-cyan-300'}`}>
                    {item.temperatureSensor?.currentC}°C
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center justify-end space-x-1 mt-0.5">
                    <Battery className="w-3 h-3" />
                    <span>{item.temperatureSensor?.batteryPct}% Batt</span>
                  </div>
                </div>
              </div>
            ))}
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
            className="w-full bg-polar-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-polar-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={() => setColdChainOnly(!coldChainOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium border transition ${
              coldChainOnly
                ? 'bg-blue-950 border-cyan-400 text-cyan-300'
                : 'bg-polar-900 border-slate-700 text-slate-400'
            }`}
          >
            ❄️ Cold-Chain Only
          </button>
        </div>
      </div>

      {/* Cargo Manifest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCargo.map((item) => {
          const destStation = stations.find(s => s.id === item.destinationStationId);

          return (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-xl space-y-3 relative group hover:border-cyan-500/40 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-extrabold text-cyan-400 text-xs">{item.trackingCode}</span>
                  <span className="ml-2 text-[10px] font-mono text-slate-400">Barcode: {item.barcode}</span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{item.name}</h4>
                  <div className="text-[11px] text-slate-400">{item.category}</div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  item.priority === 'Mission Critical' ? 'bg-rose-950 text-rose-300 border border-rose-700/50' : 'bg-slate-800 text-slate-300'
                }`}>
                  {item.priority}
                </span>
              </div>

              {/* Transit Status Badge */}
              <div className="p-2 rounded-lg bg-polar-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {item.status === 'Vessel Hold' && <Anchor className="w-3.5 h-3.5 text-amber-400" />}
                  {item.status === 'Helicopter Transit' && <Plane className="w-3.5 h-3.5 text-cyan-400" />}
                  {item.status === 'Received at Station' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="font-mono font-semibold text-slate-200">{item.status}</span>
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[110px]">{destStation?.name || 'Bharati'}</span>
              </div>

              {/* Weight, Volume, Hazard */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div className="p-1.5 rounded bg-polar-950/60 border border-slate-800/80">
                  <div className="text-slate-500 text-[9px]">Weight</div>
                  <div className="font-mono font-bold">{item.weightKg} kg</div>
                </div>
                <div className="p-1.5 rounded bg-polar-950/60 border border-slate-800/80">
                  <div className="text-slate-500 text-[9px]">Volume</div>
                  <div className="font-mono font-bold">{item.volumeM3} m³</div>
                </div>
                <div className="p-1.5 rounded bg-polar-950/60 border border-slate-800/80">
                  <div className="text-slate-500 text-[9px]">Hazard</div>
                  <div className="font-mono font-bold text-amber-400 truncate">{item.hazardType}</div>
                </div>
              </div>

              {/* Footer Scan Info */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Scanned: {new Date(item.lastScannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="truncate max-w-[140px]">{item.lastScannedBy}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
