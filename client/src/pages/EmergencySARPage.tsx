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
  Navigation,
  Wind,
  Send,
  Plane,
  Activity,
  MapPin,
  CheckCircle
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
        if (note && note.trim()) {
          await polarisApi.addIncidentUpdate(selectedIncident.id, {
            status,
            message: note.trim(),
            update_text: note.trim(),
            created_by: 'Emergency Response Commander',
            reported_by: 'Emergency Response Commander'
          });
        }
        await fetchEmergencyData();
      }
    } catch (err) {
      console.error("Failed to update incident status:", err);
    }
  };

  const handleAddActionLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNote.trim() || !selectedIncident) return;
    try {
      await polarisApi.addIncidentUpdate(selectedIncident.id, {
        status: selectedIncident.status || 'Active',
        message: actionNote.trim(),
        update_text: actionNote.trim(),
        created_by: 'Emergency Response Commander',
        reported_by: 'Emergency Response Commander'
      });
      setActionNote('');
      await fetchEmergencyData();
    } catch (err) {
      console.error("Failed to add action log:", err);
    }
  };

  const currentStageIndex = selectedIncident 
    ? Math.max(0, ESCALATION_STATES.indexOf(selectedIncident.status))
    : 0;

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase font-mono tracking-wide">
                Search &amp; Rescue (SAR) &amp; Incident Commander
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Standard 8-Stage Incident Escalation State Machine, Whiteout Lockdowns &amp; Helo Evacuation
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (onOpenBlizzardModal) onOpenBlizzardModal();
            else setShowBlizzardModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-md shadow-rose-600/20 transition cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
          <span>Broadcast Emergency SOS / Blizzard Alert</span>
        </button>
      </div>

      {/* Quick Incident Telemetry Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm">
            <Activity className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">ACTIVE SAR INCIDENTS</div>
            <div className="text-base font-black text-rose-700">{emergencies.filter(e => e.status !== 'Resolved').length} High Priority</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm">
            <Wind className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">WEATHER THREAT</div>
            <div className="text-base font-black text-amber-800">Stage 3 Blizzard (92 km/h)</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-sm">
            <Plane className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">SAR DISPATCH ASSETS</div>
            <div className="text-base font-black text-indigo-800">Kamov Ka-32 / Medical</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">CREW ACCOUNTABILITY</div>
            <div className="text-base font-black text-emerald-800">100% Muster OK</div>
          </div>
        </div>
      </div>

      {/* Split View: Left Column Incidents List, Right Column Incident Commander Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Active Incident Board (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Active Incident Board</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                {emergencies.length}
              </span>
            </h3>
          </div>

          <div className="space-y-3">
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
                  className={`p-4 rounded-2xl cursor-pointer transition border shadow-xs ${
                    isSelected
                      ? 'bg-white border-2 border-rose-500 ring-2 ring-rose-200/50 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-rose-700 text-xs tracking-wide">{code}</span>
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                      status === 'Resolved' || status === 'Post-Incident Review' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      status === 'Rescue Dispatched' || status === 'On Scene' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2 leading-snug">{title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">{inc.description || inc.details}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {station?.name || 'Bharati Research Station'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(inc.reported_at || inc.reportedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Incident Commander Dossier (8 cols) */}
        {selectedIncident && (
          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
            
            {/* Dossier Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-black">
                    {selectedIncident.incident_code || selectedIncident.incidentCode}
                  </span>
                  <span className="text-xs text-rose-700 font-bold">{selectedIncident.incident_type || selectedIncident.type || 'Severe Weather'}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 pt-1 leading-tight">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{selectedIncident.description || selectedIncident.details}</p>
              </div>

              <div className="flex flex-col items-end gap-1.5 font-mono">
                <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-black text-xs">
                  Severity: {selectedIncident.severity || 'High'}
                </span>
                <span className="text-[10px] text-slate-400">GPS: 69°24′S, 76°11′E</span>
              </div>
            </div>

            {/* 8-Stage Incident Escalation State Machine Stepper */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono">
              <div className="text-[11px] uppercase text-slate-700 font-bold flex items-center justify-between">
                <span>Incident Escalation State Machine</span>
                <span className="text-emerald-700 font-black">
                  Stage {currentStageIndex + 1} of 8: {selectedIncident.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-[10px] text-center">
                {ESCALATION_STATES.map((state, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <button
                      key={state}
                      onClick={() => handleUpdateStatus(state, `Commander advanced state to ${state}`)}
                      className={`p-2 rounded-xl transition font-bold flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-2xs ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 shadow-sm'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-white text-slate-500 border border-slate-200 hover:text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[8px] opacity-75">STEP {idx + 1}</span>
                      <span className="leading-tight">{state}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assigned SAR Team & Directives Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="uppercase text-slate-600 font-bold text-[11px]">Assigned Tactical Units:</span>
                <span className="text-emerald-800 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Bharati Medical Unit &amp; Kamov Ka-32 Helo Flight
                </span>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-slate-600 font-medium text-[11px]">Quick Directive Action:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus('Rescue Dispatched', 'SAR Helicopter dispatched to search coordinates')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>Dispatch SAR Flight</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Resolved', 'All personnel accounted and safe. Evac complete.')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Log & Radio Transcript Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-black text-slate-800 uppercase flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>SAR Action Directive &amp; Radio Transcript Timeline</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Chronological Audit Log</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(selectedIncident.updates || selectedIncident.actionLog || []).map((log: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono font-semibold">
                      <span>{new Date(log.created_at || log.timestamp || Date.now()).toLocaleString()}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {log.reported_by || log.operator || 'Field Commander'}
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-mono text-[11px] pt-0.5">
                      {log.update_text || log.note || log.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Add Action Log Note Form */}
              <form onSubmit={handleAddActionLog} className="pt-2 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Append operational directive / tactical radio transcript..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-mono focus:ring-2 focus:ring-rose-500/10 transition shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!actionNote.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-mono font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Entry</span>
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
