import React, { useState } from 'react';
import { EmergencyIncident, Station } from '../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Radio, 
  Users, 
  Clock, 
  FileText, 
  Flame,
  LifeBuoy
} from 'lucide-react';

interface EmergencySARPageProps {
  emergencies: EmergencyIncident[];
  stations: Station[];
  onTriggerSOS: (incident: Partial<EmergencyIncident>) => void;
  onUpdateStatus: (id: string, status: EmergencyIncident['status'], note?: string) => void;
  onOpenBlizzardModal: () => void;
}

export const EmergencySARPage: React.FC<EmergencySARPageProps> = ({
  emergencies,
  stations,
  onTriggerSOS,
  onUpdateStatus,
  onOpenBlizzardModal
}) => {
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident>(emergencies[0]);
  const [actionNote, setActionNote] = useState('');

  const handleAddActionLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNote.trim() || !selectedIncident) return;
    onUpdateStatus(selectedIncident.id, selectedIncident.status, actionNote);
    setActionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase font-mono flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            <span>Search & Rescue (SAR) & Emergency Response Commander</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Polar whiteout lockdowns, medical evacuations, crevasse rescues & generator failover response
          </p>
        </div>

        <button
          onClick={onOpenBlizzardModal}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition animate-pulse"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Broadcast Emergency SOS / Blizzard Alert</span>
        </button>
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents List */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">Active Incident Board</h3>
          {emergencies.map((inc) => {
            const station = stations.find(s => s.id === inc.stationId);
            const isSelected = selectedIncident?.id === inc.id;
            const isCritical = inc.severity === 'Critical (Life Threat)';

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl cursor-pointer transition border ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50 shadow-lg'
                    : isCritical
                    ? 'glass-panel-danger hover:border-rose-600'
                    : 'glass-panel hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-rose-400 text-xs">{inc.incidentCode}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    inc.status === 'Resolved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    inc.status === 'SAR Deployed' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                    'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  }`}>
                    {inc.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm mt-2">{inc.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{inc.details}</p>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{station?.name || 'Antarctic Base'}</span>
                  <span>{new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Incident Commander Dossier */}
        {selectedIncident && (
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-rose-900/40 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-700/60 font-bold">
                    {selectedIncident.incidentCode}
                  </span>
                  <span className="text-xs text-rose-400 font-mono font-semibold">{selectedIncident.type}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-2">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedIncident.details}</p>
              </div>

              <span className="px-3 py-1 rounded-lg bg-rose-600/30 border border-rose-500/60 text-rose-300 font-mono font-bold text-xs">
                {selectedIncident.severity}
              </span>
            </div>

            {/* Assigned SAR Team & Status Controls */}
            <div className="p-4 rounded-xl bg-polar-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Assigned Rescue Units:</span>
                <span className="text-xs text-cyan-300 font-mono font-bold">
                  {selectedIncident.sarTeamAssigned?.join(', ') || 'Station Emergency Medical Team'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">Update Incident Lifecycle:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateStatus(selectedIncident.id, 'SAR Deployed', 'SAR Rescue Team Dispatched into field')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                  >
                    Deploy SAR Team
                  </button>
                  <button
                    onClick={() => onUpdateStatus(selectedIncident.id, 'Resolved', 'Incident safely resolved. All personnel accounted.')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>

            {/* Action Log Timeline */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>SAR Action Directive & Log Timeline</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedIncident.actionLog.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-polar-900/60 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span className="text-cyan-400 font-bold">{log.operator}</span>
                    </div>
                    <p className="text-slate-200">{log.note}</p>
                  </div>
                ))}
              </div>

              {/* Add Action Log Note Form */}
              <form onSubmit={handleAddActionLog} className="mt-3 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Append operational log note / radio transcript..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="flex-1 bg-polar-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-polar-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                >
                  Log Entry
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
