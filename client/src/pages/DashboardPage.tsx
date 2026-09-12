import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
import { PolarLeafletMap } from '../components/maps/PolarLeafletMap';
import { 
  Compass, 
  Layers, 
  Box, 
  Anchor, 
  Users, 
  Truck, 
  ShieldAlert, 
  AlertTriangle, 
  Thermometer, 
  Wind, 
  CheckCircle2, 
  Clock, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [cargo, setCargo] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sumData, stns, asts, crg, emgs, actLogs] = await Promise.all([
        polarisApi.getDashboardSummary(),
        polarisApi.getStations(),
        polarisApi.getAssets(),
        polarisApi.getCargoList(),
        polarisApi.getIncidents(),
        polarisApi.getActivityFeed()
      ]);
      setSummary(sumData);
      setStations(stns);
      setAssets(asts);
      setCargo(crg);
      setEmergencies(emgs);
      setActivityLogs(actLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-polar-900 animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 bg-polar-900 animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-polar-900 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const { kpis, cargo_stats, station_weather } = summary;
  const activeEmergency = emergencies.find(e => e.status !== 'Resolved');

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner if Active Emergency Exists */}
      {activeEmergency && (
        <div className="glass-panel-danger p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono font-bold text-rose-200 text-sm flex items-center space-x-2">
                <span>ACTIVE POLAR EMERGENCY</span>
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px]">{activeEmergency.incident_code}</span>
              </div>
              <p className="text-xs text-rose-300 mt-0.5">{activeEmergency.title} — {activeEmergency.description}</p>
            </div>
          </div>
          <Link
            to="/emergency"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
          >
            <span>Open Incident Commander</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3.5 rounded-2xl border border-cyan-900/40">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Active Expeditions</div>
          <div className="text-2xl font-black font-mono text-slate-100 mt-1">{kpis.active_expeditions}</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">ISEA-44 & Arctic</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-cyan-900/40">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Cargo In Transit</div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-1">{kpis.cargo_in_transit}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">Vessels & Helo</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-cyan-900/40">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Deployed Crew</div>
          <div className="text-2xl font-black font-mono text-slate-100 mt-1">{kpis.personnel_deployed}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">100% Muster OK</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-cyan-900/40">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Operational Assets</div>
          <div className="text-2xl font-black font-mono text-slate-100 mt-1">{kpis.operational_assets}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Ships & Snowcats</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-cyan-900/40">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Low Stock Alerts</div>
          <div className={`text-2xl font-black font-mono mt-1 ${kpis.critical_inventory_alerts > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
            {kpis.critical_inventory_alerts}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Critical items</div>
        </div>

        <div className="glass-panel p-3.5 rounded-2xl border border-cyan-900/40">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Active Emergencies</div>
          <div className={`text-2xl font-black font-mono mt-1 ${kpis.active_emergencies > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
            {kpis.active_emergencies}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">SAR Response</div>
        </div>
      </div>

      {/* Main Polar GIS Map */}
      <PolarLeafletMap
        stations={stations}
        assets={assets}
        cargo={cargo}
        emergencies={emergencies}
        height="460px"
      />

      {/* Station Meteorological & Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stations Live Status */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase font-mono text-slate-100 flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <span>Research Stations & Sub-Zero Telemetry</span>
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">Live Sat-Link AWS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {station_weather.map((st: any) => (
              <div key={st.id} className="p-3.5 rounded-xl bg-polar-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs">{st.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{st.code} • {st.region}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    st.blizzard_level === 'STAGE_3_WHITEOUT_LOCKDOWN' ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse' :
                    st.blizzard_level === 'STAGE_1_ADVISORY' ? 'bg-amber-950 text-amber-300 border border-amber-600' :
                    'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {st.blizzard_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Thermometer className="w-3 h-3 text-cyan-400" />
                      <span>Ambient</span>
                    </div>
                    <div className="font-mono font-bold text-slate-100">{st.temperature_c}°C</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Wind className="w-3 h-3 text-blue-400" />
                      <span>Wind</span>
                    </div>
                    <div className="font-mono font-bold text-slate-100">{st.wind_speed_kmh} km/h</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Activity Stream */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm uppercase font-mono text-slate-100 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Operational Log Stream</span>
          </h3>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {activityLogs.map((log: any) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-polar-900/60 border border-slate-800/80 text-xs space-y-0.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-cyan-400 font-bold">[{log.action}]</span>
                  <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-slate-300 text-[11px] truncate">{log.user_email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
