import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { polarisApi } from '../api/services';
import { 
  Settings, 
  User, 
  Shield, 
  Radio, 
  Database, 
  Activity, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Sliders
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [blizzardLevel, setBlizzardLevel] = useState('NORMAL');
  const [isUpdating, setIsUpdating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [stns, logs] = await Promise.all([
          polarisApi.getStations(),
          polarisApi.getActivityFeed()
        ]);
        setStations(stns);
        setAuditLogs(logs);
        if (stns.length > 0) {
          setSelectedStation(stns[0]);
          setBlizzardLevel(stns[0].blizzard_level || 'NORMAL');
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();
  }, []);

  const handleUpdateStationBlizzard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation) return;
    setIsUpdating(true);
    try {
      await polarisApi.setBlizzardLevel(selectedStation.id, blizzardLevel);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      const updated = await polarisApi.getStations();
      setStations(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-100 uppercase font-mono flex items-center space-x-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>System Settings, Station Parameters & Security Audit</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Role-based operational thresholds, satellite telemetry intervals, and compliance audit trail
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Identity & Active Role */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-xs uppercase font-mono text-slate-100 flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Active Operator Profile</span>
          </h3>

          <div className="p-4 rounded-xl bg-polar-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-lg text-white">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{user?.name || 'Polaris Operator'}</h4>
                <div className="text-xs text-cyan-400 font-mono">{user?.email}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Assigned RBAC Role:</span>
                <span className="font-mono font-bold text-slate-200 capitalize">{user?.role ? user.role.replace('_', ' ') : 'Operator'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Security Clearance:</span>
                <span className="font-mono font-bold text-emerald-400">LEVEL-5 CLASSIFIED</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Session Status:</span>
                <span className="text-cyan-300 font-mono">Authenticated via JWT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Station Telemetry Override */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase font-mono text-slate-100 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Base Meteorological Alert & Lockdown Control</span>
            </h3>
            {savedSuccess && (
              <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Station parameters updated</span>
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateStationBlizzard} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase">Target Station</label>
                <select
                  value={selectedStation?.id || ''}
                  onChange={(e) => {
                    const st = stations.find(s => s.id === e.target.value);
                    setSelectedStation(st);
                    setBlizzardLevel(st?.blizzard_level || 'NORMAL');
                  }}
                  className="w-full bg-polar-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                >
                  {stations.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.region})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase">Blizzard Alert & Lockdown Level</label>
                <select
                  value={blizzardLevel}
                  onChange={(e) => setBlizzardLevel(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono"
                >
                  <option value="NORMAL">NORMAL (Unrestricted Field Operations)</option>
                  <option value="STAGE_1_ADVISORY">STAGE 1: ADVISORY (Wind &gt; 60 km/h, Outdoor Caution)</option>
                  <option value="STAGE_2_WARNING">STAGE 2: WARNING (Wind &gt; 90 km/h, Field Sortie Recall)</option>
                  <option value="STAGE_3_WHITEOUT_LOCKDOWN">STAGE 3: WHITEOUT LOCKDOWN (Zero Visibility, Seal Airlocks)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition"
              >
                <Save className="w-4 h-4" />
                <span>{isUpdating ? 'Applying Override...' : 'Apply Weather / Lockdown Directives'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* System Compliance Audit Logs */}
        <div className="glass-panel p-5 rounded-2xl space-y-3 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase font-mono text-slate-100 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Immutable System Audit Log (Government Compliance & Incident Traceability)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">{auditLogs.length} Logged Events</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-cyan-400 font-bold">[{log.action}]</span>
                  <span className="text-slate-300">{log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''}</span>
                  <span className="text-slate-500 text-[11px] truncate max-w-xs">{log.user_email}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
