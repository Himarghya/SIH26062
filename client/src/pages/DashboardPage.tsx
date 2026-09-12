import React from 'react';
import { Station, Vessel, CargoItem, Personnel, FieldSortie, EmergencyIncident } from '../types';
import { PolarMap } from '../components/PolarMap';
import { 
  Flame, 
  Users, 
  Box, 
  Thermometer, 
  Wind, 
  ShieldAlert, 
  AlertTriangle, 
  Anchor, 
  Radio, 
  Navigation,
  Compass,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface DashboardPageProps {
  stations: Station[];
  vessels: Vessel[];
  cargo: CargoItem[];
  personnel: Personnel[];
  sorties: FieldSortie[];
  emergencies: EmergencyIncident[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  onOpenScanner: () => void;
  onOpenFuelModal: () => void;
  onOpenBlizzardModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stations,
  vessels,
  cargo,
  personnel,
  sorties,
  emergencies,
  selectedStationId,
  onSelectStation,
  onOpenScanner,
  onOpenFuelModal,
  onOpenBlizzardModal
}) => {
  // Aggregate summary metrics
  const totalWinterers = personnel.filter(p => p.status === 'On Station' || p.status === 'Field Sortie').length;
  const totalDieselLiters = stations.reduce((acc, s) => acc + s.resources.polarDieselLiters, 0);
  const coldChainAlerts = cargo.filter(c => c.isColdChain && c.temperatureSensor?.isViolated).length;
  const activeSortiesCount = sorties.filter(s => s.status === 'Active In Field').length;
  const activeEmergencies = emergencies.filter(e => e.status !== 'Resolved');

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if any emergency is active */}
      {activeEmergencies.length > 0 && (
        <div className="glass-panel-danger p-4 rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <div className="font-mono font-bold text-rose-200 text-sm flex items-center space-x-2">
                <span>ACTIVE POLAR EMERGENCY ALERT</span>
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px]">
                  {activeEmergencies[0].incidentCode}
                </span>
              </div>
              <p className="text-xs text-rose-300/90 mt-0.5">
                {activeEmergencies[0].title} — {activeEmergencies[0].details}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBlizzardModal}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
          >
            Manage SOS
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Polar Crew */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Deployed Winterers</span>
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 mt-2">
            {totalWinterers} <span className="text-xs font-normal text-slate-400">Scientists & Crew</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Medical Clearances Active</span>
          </div>
        </div>

        {/* Polar Diesel Fuel Reserves */}
        <div 
          onClick={onOpenFuelModal}
          className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-amber-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Total Polar Fuel (D-10)</span>
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-2">
            {(totalDieselLiters / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">Liters</span>
          </div>
          <div className="text-[11px] text-cyan-400 flex items-center space-x-1 mt-1 font-mono">
            <span>⚡ AI Projected: ~320 Days Autonomy</span>
          </div>
        </div>

        {/* Cold-Chain IoT Sensor Status */}
        <div 
          onClick={onOpenScanner}
          className={`glass-panel p-4 rounded-xl relative overflow-hidden group transition cursor-pointer ${
            coldChainAlerts > 0 ? 'border-rose-500/60' : 'hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Cold-Chain (-80°C) Samples</span>
            <div className={`p-2 rounded-lg ${coldChainAlerts > 0 ? 'bg-rose-950 text-rose-400 animate-pulse' : 'bg-blue-950 text-blue-400'}`}>
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 mt-2">
            {cargo.filter(c => c.isColdChain).length} <span className="text-xs font-normal text-slate-400">Active Sensors</span>
          </div>
          <div className={`text-[11px] flex items-center space-x-1 mt-1 font-mono ${
            coldChainAlerts > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'
          }`}>
            {coldChainAlerts > 0 ? (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>{coldChainAlerts} Temp Threshold Violations!</span>
              </>
            ) : (
              <span>✅ All sample temperatures within limits</span>
            )}
          </div>
        </div>

        {/* Active Field Sorties & Vessels */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Operations In Field</span>
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 mt-2">
            {activeSortiesCount} <span className="text-xs font-normal text-slate-400">Sorties</span> • {vessels.filter(v => v.status === 'Underway').length} <span className="text-xs font-normal text-slate-400">Vessels</span>
          </div>
          <div className="text-[11px] text-purple-300 flex items-center space-x-1 mt-1 font-mono">
            <span>📡 Radio checks hourly active</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Polar Map */}
      <PolarMap
        stations={stations}
        vessels={vessels}
        sorties={sorties}
        selectedStationId={selectedStationId}
        onSelectStation={onSelectStation}
      />

      {/* Station Live Weather & Telemetry Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-mono uppercase text-slate-200 flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            <span>Real-Time Polar Meteorological Feeds & Station Telemetry</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Updates live every 4s via WebSocket</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stations.map((station) => {
            const isSelected = selectedStationId === station.id;
            const isLockdown = station.weather.blizzardLevel === 'STAGE_3_WHITEOUT_LOCKDOWN';
            const isAdvisory = station.weather.blizzardLevel === 'STAGE_1_ADVISORY' || station.weather.blizzardLevel === 'STAGE_2_WARNING';

            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station.id)}
                className={`p-4 rounded-xl cursor-pointer transition border ${
                  isSelected 
                    ? 'bg-polar-850 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/10' 
                    : isLockdown
                    ? 'bg-rose-950/60 border-rose-600/70'
                    : isAdvisory
                    ? 'bg-amber-950/60 border-amber-600/70'
                    : 'glass-panel hover:border-slate-600'
                }`}
              >
                {/* Station Title & Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{station.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{station.region} • {station.code}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    isLockdown ? 'bg-rose-600 text-white animate-pulse' :
                    isAdvisory ? 'bg-amber-500 text-polar-950 font-bold' :
                    'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  }`}>
                    {station.weather.blizzardLevel.replace('STAGE_', 'STG-')}
                  </span>
                </div>

                {/* Weather Readings */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Thermometer className="w-3 h-3 text-cyan-400" />
                      <span>Ambient</span>
                    </div>
                    <div className="font-mono font-bold text-slate-100 text-base mt-0.5">
                      {station.weather.temperatureC}°C
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono">
                      Chill: {station.weather.windChillC}°C
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Wind className="w-3 h-3 text-blue-400" />
                      <span>Wind Speed</span>
                    </div>
                    <div className="font-mono font-bold text-slate-100 text-base mt-0.5">
                      {station.weather.windSpeedKmh} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {station.weather.windDirection}
                    </div>
                  </div>
                </div>

                {/* Reserves & Personnel */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>{(station.resources.polarDieselLiters / 1000).toFixed(0)}k L D-10</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>{station.activePersonnel} Crew</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
