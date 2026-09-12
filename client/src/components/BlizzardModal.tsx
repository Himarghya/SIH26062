import React, { useState } from 'react';
import { Station, BlizzardAlertLevel } from '../types';
import { AlertTriangle, ShieldAlert, Wind, Volume2, CheckCircle2, X } from 'lucide-react';

interface BlizzardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  onTriggerLockdown: (stationId: string, level: BlizzardAlertLevel) => void;
  onTriggerSOS: (details: { stationId: string; title: string; details: string; severity: 'Moderate' | 'Critical (Life Threat)' }) => void;
}

export const BlizzardModal: React.FC<BlizzardModalProps> = ({
  isOpen,
  onClose,
  stations,
  onTriggerLockdown,
  onTriggerSOS
}) => {
  if (!isOpen) return null;

  const [selectedStationId, setSelectedStationId] = useState(stations[0]?.id || 'stn-bharati');
  const [sosTitle, setSosTitle] = useState('Severe Blizzard Stage-3 Whiteout & Katabatic Wind Surge');
  const [sosDetails, setSosDetails] = useState('Katabatic winds exceeding 85 km/h. Zero visibility (<50m). Immediate outdoor traverse recall and station airtight lockdown enforced.');
  const [severity, setSeverity] = useState<'Moderate' | 'Critical (Life Threat)'>('Critical (Life Threat)');
  const [lockdownTriggered, setLockdownTriggered] = useState(false);

  const selectedStation = stations.find(s => s.id === selectedStationId);

  const handleApplyLockdown = (level: BlizzardAlertLevel) => {
    onTriggerLockdown(selectedStationId, level);
    if (level === 'STAGE_3_WHITEOUT_LOCKDOWN') {
      onTriggerSOS({
        stationId: selectedStationId,
        title: `EMERGENCY: Stage-3 Blizzard Lockdown at ${selectedStation?.name}`,
        details: sosDetails,
        severity
      });
      setLockdownTriggered(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-polar-950 border border-rose-500/50 rounded-2xl overflow-hidden shadow-2xl polar-glow-red">
        {/* Header with flashing hazard bar */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 px-6 py-4 flex items-center justify-between border-b border-rose-600/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-wide uppercase font-mono">
                Polar Extreme Blizzard & Emergency Protocol
              </h2>
              <p className="text-xs text-rose-200">
                MoES • Antarctic & Arctic Station Emergency Lockdown Dispatch
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-rose-300 hover:text-white p-1.5 rounded-lg bg-rose-950/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Station Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
              Target Station / Base
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-polar-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.region}) - Currently: {st.weather.temperatureC}°C, {st.weather.blizzardLevel}
                </option>
              ))}
            </select>
          </div>

          {/* Blizzard Stage Selector Buttons */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
              Set Blizzard Alert Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleApplyLockdown('NORMAL')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedStation?.weather.blizzardLevel === 'NORMAL'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-polar-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs">NORMAL</div>
                <div className="text-[11px] text-slate-400 mt-1">Normal Operations. Clear visibility.</div>
              </button>

              <button
                onClick={() => handleApplyLockdown('STAGE_1_ADVISORY')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedStation?.weather.blizzardLevel === 'STAGE_1_ADVISORY' || selectedStation?.weather.blizzardLevel === 'STAGE_2_WARNING'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                    : 'bg-polar-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-xs text-amber-400">STAGE 1 & 2 WARNING</div>
                <div className="text-[11px] text-slate-400 mt-1">Gale Winds (&gt;50 km/h). Traverses restricted.</div>
              </button>

              <button
                onClick={() => handleApplyLockdown('STAGE_3_WHITEOUT_LOCKDOWN')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedStation?.weather.blizzardLevel === 'STAGE_3_WHITEOUT_LOCKDOWN'
                    ? 'bg-rose-950 border-rose-500 text-rose-200 animate-pulse'
                    : 'bg-polar-900 border-rose-900/60 text-rose-300 hover:border-rose-500'
                }`}
              >
                <div className="font-bold text-xs text-rose-400 flex items-center justify-between">
                  <span>STAGE 3 WHITEOUT</span>
                  <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="text-[11px] text-rose-300/80 mt-1">Total Lockdown. Zero visibility. Siren active.</div>
              </button>
            </div>
          </div>

          {/* Emergency SOS Dispatch Form */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-3">
            <h4 className="text-xs font-mono font-bold text-rose-300 uppercase flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Broadcast Immediate Search & Rescue (SAR) Distress</span>
            </h4>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Incident Title</label>
              <input
                type="text"
                value={sosTitle}
                onChange={(e) => setSosTitle(e.target.value)}
                className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Situation Description & Action Directive</label>
              <textarea
                value={sosDetails}
                onChange={(e) => setSosDetails(e.target.value)}
                rows={2}
                className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-slate-400">Severity:</span>
                <label className="flex items-center space-x-1 text-amber-300 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    checked={severity === 'Moderate'}
                    onChange={() => setSeverity('Moderate')}
                  />
                  <span>Moderate</span>
                </label>
                <label className="flex items-center space-x-1 text-rose-400 cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    checked={severity === 'Critical (Life Threat)'}
                    onChange={() => setSeverity('Critical (Life Threat)')}
                  />
                  <span>Critical Life Threat</span>
                </label>
              </div>

              <button
                onClick={() => handleApplyLockdown('STAGE_3_WHITEOUT_LOCKDOWN')}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>EXECUTE LOCKDOWN & SOS</span>
              </button>
            </div>
          </div>

          {lockdownTriggered && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Lockdown order and SOS broadcasted to all polar stations, vessels, and NCPOR HQ Goa.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
