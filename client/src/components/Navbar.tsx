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
    <header className="sticky top-0 z-40 bg-white/90  border-b border-slate-200">
      {/* Top Telemetry & Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 text-xs border-b border-slate-100 bg-slate-50/80">
        {/* Brand & Organization */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900   flex items-center justify-center font-bold text-white shadow-xs">
              
            </div>
            <div>
              <span className="font-black text-sm tracking-wider text-slate-900">
                POLARIS
              </span>
              <span className="ml-2 text-[10px] text-emerald-800 uppercase font-mono font-bold tracking-widest bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                NCPOR • MoES
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center text-slate-500 font-medium pl-4 border-l border-slate-200 space-x-1">
            <span>National Centre for Polar & Ocean Research</span>
          </div>
        </div>

        {/* Global Controls & Satellite Status */}
        <div className="flex items-center space-x-2 md:space-x-4 mt-1 sm:mt-0">
          {/* Station Filter Dropdown */}
          <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-lg border border-slate-300 shadow-2xs">
            <span className="text-slate-500 text-[11px] font-medium">Base:</span>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white text-slate-900"> All Polar Stations</option>
              {stations.map(st => (
                <option key={st.id} value={st.id} className="bg-white text-slate-900">
                  {st.region === 'Arctic' ? '' : ''} {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>

          {/* AI Fuel Predictor Quick Launch */}
          <button
            onClick={onOpenFuelModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition shadow-2xs font-bold"
            title="AI Polar Fuel Burn Rate & Autonomy Forecaster"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline font-mono text-[11px]">AI Fuel Forecaster</span>
          </button>

          {/* Barcode/QR Cargo Scanner Quick Launch */}
          <button
            onClick={onOpenScannerModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 transition shadow-2xs font-bold"
            title="Scan QR / RFID Cargo Manifest"
          >
            <Box className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline font-mono text-[11px]">QR Scan</span>
          </button>

          {/* Satellite / Offline Status Indicator */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition shadow-2xs ${
                isSimulatedOffline
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
              }`}
              title="Toggle Satellite Offline Simulation"
            >
              {isSimulatedOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
                  <span>Satellite Offline (Sim)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Iridium/Starlink Link: ON</span>
                </>
              )}
            </button>

            {/* Sync Queue Badge */}
            {queuedMutationsCount > 0 && (
              <button
                onClick={onOpenSyncModal}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-300 hover:bg-indigo-200 font-mono text-[11px] font-bold shadow-2xs"
                title="Pending Satellite Delta Sync Queue"
              >
                <RefreshCw className="w-3 h-3 text-indigo-700 animate-spin" />
                <span>{queuedMutationsCount} queued</span>
              </button>
            )}
          </div>

          {/* Urgent Blizzard Emergency Lockdown Action */}
          <button
            onClick={onOpenBlizzardModal}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold text-xs transition shadow-sm ${
              isHighAlert
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
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
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
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

