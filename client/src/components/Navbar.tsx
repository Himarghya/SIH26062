import React from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Compass, 
  Box, 
  Layers, 
  Users, 
  Navigation, 
  ShieldAlert, 
  Cpu, 
  RefreshCw,
  Anchor
} from 'lucide-react';
import { Station } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stations: Station[];
  selectedStationId: string;
  setSelectedStationId: (id: string) => void;
  isSimulatedOffline: boolean;
  setIsSimulatedOffline: (offline: boolean) => void;
  queuedMutationsCount: number;
  onOpenSyncModal: () => void;
  onOpenBlizzardModal: () => void;
  onOpenScannerModal: () => void;
  onOpenFuelModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stations,
  selectedStationId,
  setSelectedStationId,
  isSimulatedOffline,
  setIsSimulatedOffline,
  queuedMutationsCount,
  onOpenSyncModal,
  onOpenBlizzardModal,
  onOpenScannerModal,
  onOpenFuelModal
}) => {
  const selectedStation = stations.find(s => s.id === selectedStationId);
  const isHighAlert = stations.some(s => s.weather.blizzardLevel === 'STAGE_3_WHITEOUT_LOCKDOWN');

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: Compass },
    { id: 'expeditions', label: 'Expeditions', icon: Layers },
    { id: 'cargo', label: 'Cargo & Cold-Chain', icon: Box },
    { id: 'inventory', label: 'Station Inventory', icon: Anchor },
    { id: 'personnel', label: 'Personnel & Muster', icon: Users },
    { id: 'sorties', label: 'Field Sorties', icon: Navigation },
    { id: 'sar', label: 'Emergency & SAR', icon: ShieldAlert, alert: isHighAlert },
  ];

  return (
    <header className="sticky top-0 z-40 bg-polar-950/80 backdrop-blur-md border-b border-cyan-900/30">
      {/* Top Telemetry & Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 text-xs border-b border-slate-800/60 bg-polar-900/40">
        {/* Brand & Organization */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              🧊
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider text-slate-100 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                POLARIS
              </span>
              <span className="ml-2 text-[10px] text-cyan-400/80 uppercase font-mono tracking-widest bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
                NCPOR • MoES
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center text-slate-400 pl-4 border-l border-slate-800 space-x-1">
            <span>National Centre for Polar & Ocean Research</span>
          </div>
        </div>

        {/* Global Controls & Satellite Status */}
        <div className="flex items-center space-x-2 md:space-x-4 mt-1 sm:mt-0">
          {/* Station Filter Dropdown */}
          <div className="flex items-center space-x-1 bg-polar-850 px-2 py-1 rounded border border-slate-700/60">
            <span className="text-slate-400 text-[11px]">Base:</span>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-transparent text-cyan-300 font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-polar-900 text-slate-200">🌐 All Polar Stations</option>
              {stations.map(st => (
                <option key={st.id} value={st.id} className="bg-polar-900 text-slate-200">
                  {st.region === 'Arctic' ? '🐻' : '🐧'} {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>

          {/* AI Fuel Predictor Quick Launch */}
          <button
            onClick={onOpenFuelModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-950/60 hover:bg-blue-900/60 text-cyan-300 border border-cyan-700/40 transition"
            title="AI Polar Fuel Burn Rate & Autonomy Forecaster"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline font-mono">AI Fuel Forecaster</span>
          </button>

          {/* Barcode/QR Cargo Scanner Quick Launch */}
          <button
            onClick={onOpenScannerModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Scan QR / RFID Cargo Manifest"
          >
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-mono">QR Scan</span>
          </button>

          {/* Satellite / Offline Status Indicator */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded font-mono text-[11px] transition ${
                isSimulatedOffline
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60 hover:bg-amber-900/80'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900/80'
              }`}
              title="Toggle Satellite Offline Simulation"
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span>Satellite Offline (Sim)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Iridium/Starlink Link: ON</span>
                </>
              )}
            </button>

            {/* Sync Queue Badge */}
            {queuedMutationsCount > 0 && (
              <button
                onClick={onOpenSyncModal}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900 font-mono text-[11px]"
                title="Pending Satellite Delta Sync Queue"
              >
                <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>{queuedMutationsCount} queued</span>
              </button>
            )}
          </div>

          {/* Urgent Blizzard Emergency Lockdown Action */}
          <button
            onClick={onOpenBlizzardModal}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded font-bold transition shadow-md ${
              isHighAlert
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse polar-glow-red'
                : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>BLIZZARD SOS</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center px-4 overflow-x-auto no-scrollbar space-x-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs md:text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-polar-850'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.alert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-1" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
