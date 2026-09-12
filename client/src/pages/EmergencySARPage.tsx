import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
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
  LifeBuoy,
  ArrowRight,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { BlizzardModal } from '../components/BlizzardModal';

const ESCALATION_STATES = [
  'Detected',
  'Acknowledged',
  'Triaged',
  'Team Assigned',
  'Rescue Dispatched',
  'On Scene',
  'Resolved',
  'Post-Incident Review'
];

export const EmergencySARPage: React.FC<{
  emergencies?: any[];
  stations?: any[];
  onTriggerSOS?: (incident: any) => void;
  onUpdateStatus?: (id: string, status: any, note?: string) => void;
  onOpenBlizzardModal?: () => void;
}> = ({ 
  emergencies: propEmergencies, 
  stations: propStations, 
  onTriggerSOS, 
  onUpdateStatus, 
  onOpenBlizzardModal 
}) => {
  const [emergencies, setEmergencies] = useState<any[]>(propEmergencies || []);
  const [stations, setStations] = useState<any[]>(propStations || []);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [actionNote, setActionNote] = useState('');
  const [showBlizzardModal, setShowBlizzardModal] = useState(false);

  const fetchEmergencyData = async () => {
    try {
      const [emgs, stns] = await Promise.all([
        polarisApi.getIncidents(),
        polarisApi.getStations()
      ]);
      setEmergencies(emgs);
      setStations(stns);
      if (emgs.length > 0) setSelectedIncident(emgs[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!propEmergencies || propEmergencies.length === 0) {
      fetchEmergencyData();
    } else {
      setEmergencies(propEmergencies);
      if (propEmergencies.length > 0) setSelectedIncident(propEmergencies[0]);
    }
  }, [propEmergencies]);

  const handleUpdateStatus = async (status: string, note?: string) => {
    if (!selectedIncident) return;
    try {
      if (onUpdateStatus) {
        onUpdateStatus(selectedIncident.id, status, note);
      } else {
        await polarisApi.updateIncident(selectedIncident.id, {
          status,
          resolution_notes: status === 'Resolved' || status === 'Post-Incident Review' ? (note || 'Incident resolved by commander') : undefined
        });
        if (note) {
          await polarisApi.addIncidentUpdate(selectedIncident.id, {
            update_text: note,
            reported_by: 'Emergency Response Commander'
          });
        }
        await fetchEmergencyData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddActionLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNote.trim() || !selectedIncident) return;
    try {
      await polarisApi.addIncidentUpdate(selectedIncident.id, {
        update_text: actionNote,
        reported_by: 'Emergency Response Commander'
      });
      setActionNote('');
      await fetchEmergencyData();
    } catch (err) {
      console.error(err);
    }
  };

  const currentStageIndex = selectedIncident 
    ? Math.max(0, ESCALATION_STATES.indexOf(selectedIncident.status))
    : 0;

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
            Standard 8-Stage Incident Escalation State Machine, Whiteout Lockdowns & Helo Evacuation
          </p>
        </div>

        <button
          onClick={() => {
            if (onOpenBlizzardModal) onOpenBlizzardModal();
            else setShowBlizzardModal(true);
          }}
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
            const stnId = inc.station_id || inc.stationId;
            const station = stations.find(s => s.id === stnId);
            const isSelected = selectedIncident?.id === inc.id;
            const code = inc.incident_code || inc.incidentCode;
            const title = inc.title;
            const status = inc.status;

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl cursor-pointer transition border ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50 shadow-lg'
                    : 'glass-panel hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-rose-400 text-xs">{code}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    status === 'Resolved' || status === 'Post-Incident Review' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    status === 'Rescue Dispatched' || status === 'On Scene' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                    'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                  }`}>
                    {status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm mt-2">{title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{inc.description || inc.details}</p>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>{station?.name || 'Bharati Station'}</span>
                  <span>{new Date(inc.reported_at || inc.reportedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                    {selectedIncident.incident_code || selectedIncident.incidentCode}
                  </span>
                  <span className="text-xs text-rose-400 font-mono font-semibold">{selectedIncident.incident_type || selectedIncident.type}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-2">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedIncident.description || selectedIncident.details}</p>
              </div>

              <span className="px-3 py-1 rounded-lg bg-rose-600/30 border border-rose-500/60 text-rose-300 font-mono font-bold text-xs">
                {selectedIncident.severity}
              </span>
            </div>

            {/* 8-Stage State Machine Stepper */}
            <div className="p-4 rounded-xl bg-polar-900/90 border border-slate-800 space-y-2.5">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center justify-between">
                <span>Incident Escalation State Machine:</span>
                <span className="text-cyan-400">Stage {currentStageIndex + 1} of 8: {selectedIncident.status}</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-[9px] font-mono text-center">
                {ESCALATION_STATES.map((state, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <button
                      key={state}
                      onClick={() => handleUpdateStatus(state, `Escalated state to ${state}`)}
                      className={`p-1.5 rounded transition ${
                        isCurrent ? 'bg-cyan-600 text-white font-bold ring-1 ring-cyan-400' :
                        isDone ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-polar-950 text-slate-500 border border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {state}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assigned SAR Team & Status Controls */}
            <div className="p-4 rounded-xl bg-polar-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Assigned Rescue Units:</span>
                <span className="text-xs text-cyan-300 font-mono font-bold">
                  Bharati Medical Unit & Kamov Ka-32 Helo Flight
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">Quick Directive Action:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus('Rescue Dispatched', 'SAR Helicopter dispatched to search coordinates')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                  >
                    Dispatch SAR Flight
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Resolved', 'All personnel accounted and safe. Evac complete.')}
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
                <span>SAR Action Directive & Radio Transcript Timeline</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(selectedIncident.updates || selectedIncident.actionLog || []).map((log: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-polar-900/60 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                      <span>{new Date(log.created_at || log.timestamp || Date.now()).toLocaleString()}</span>
                      <span className="text-cyan-400 font-bold">{log.reported_by || log.operator || 'Field Commander'}</span>
                    </div>
                    <p className="text-slate-200">{log.update_text || log.note}</p>
                  </div>
                ))}
              </div>

              {/* Add Action Log Note Form */}
              <form onSubmit={handleAddActionLog} className="mt-3 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Append operational directive / tactical radio transcript..."
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

      {/* Global Blizzard & SOS Modal */}
      <BlizzardModal
        isOpen={showBlizzardModal}
        onClose={() => setShowBlizzardModal(false)}
        stations={stations}
        onTriggerLockdown={async (stationId, level) => {
          await polarisApi.setBlizzardLevel(stationId, level);
          await fetchEmergencyData();
        }}
        onTriggerSOS={async (incident) => {
          await polarisApi.createIncident(incident);
          await fetchEmergencyData();
        }}
      />
    </div>
  );
};
