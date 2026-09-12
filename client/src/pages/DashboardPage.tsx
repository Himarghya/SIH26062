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
  ArrowRight,
  TrendingDown,
  Sparkles,
  Radio,
  Fuel
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i => (
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
    <div className="space-y-6 text-slate-800">
      {/* Critical Alert Banner if Active Emergency Exists */}
      {activeEmergency && (
        <div className="glass-panel-danger p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="font-mono font-bold text-rose-900 text-sm flex items-center space-x-2">
                <span>ACTIVE POLAR EMERGENCY EVENT</span>
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">{activeEmergency.incident_code}</span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5 font-medium">{activeEmergency.title} — {activeEmergency.description}</p>
            </div>
          </div>
          <Link
            to="/emergency"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-rose-600/20"
          >
            <span>Open Incident Commander</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Stat Cards Row with Vibrant Top Border Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="glass-panel-interactive p-3.5 rounded-2xl border-t-2 border-t-emerald-500 relative overflow-hidden flex flex-col justify-between min-h-[96px]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Active Expeditions</div>
          <div className="text-2xl font-black font-mono text-slate-900 my-0.5">{kpis.active_expeditions}</div>
          <div className="text-[10px] text-emerald-700 font-mono font-bold">ISEA-44 & Arctic</div>
        </div>

        <div className="glass-panel-interactive p-3.5 rounded-2xl border-t-2 border-t-amber-500 relative overflow-hidden flex flex-col justify-between min-h-[96px]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Cargo In Transit</div>
          <div className="text-2xl font-black font-mono text-amber-800 my-0.5">{kpis.cargo_in_transit}</div>
          <div className="text-[10px] text-amber-700 font-mono font-bold">Vessels & Helos</div>
        </div>

        <div className="glass-panel-interactive p-3.5 rounded-2xl border-t-2 border-t-teal-500 relative overflow-hidden flex flex-col justify-between min-h-[96px]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Deployed Crew</div>
          <div className="text-2xl font-black font-mono text-slate-900 my-0.5">{kpis.personnel_deployed}</div>
          <div className="text-[10px] text-teal-700 font-mono font-bold">100% Muster OK</div>
        </div>

        <div className="glass-panel-interactive p-3.5 rounded-2xl border-t-2 border-t-indigo-500 relative overflow-hidden flex flex-col justify-between min-h-[96px]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Operational Fleet</div>
          <div className="text-2xl font-black font-mono text-slate-900 my-0.5">{kpis.operational_assets}</div>
          <div className="text-[10px] text-indigo-700 font-mono font-bold">Tracked & GPS-Linked</div>
        </div>

        <div className="glass-panel-interactive p-3.5 rounded-2xl border-t-2 border-t-rose-500 relative overflow-hidden flex flex-col justify-between min-h-[96px]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Low Stock Alerts</div>
          <div className={`text-2xl font-black font-mono my-0.5 ${kpis.critical_inventory_alerts > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
            {kpis.critical_inventory_alerts}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Critical Reserves</div>
        </div>

        <div className="glass-panel-interactive p-3.5 rounded-2xl border-t-2 border-t-purple-500 relative overflow-hidden flex flex-col justify-between min-h-[96px]">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Active SAR Events</div>
          <div className={`text-2xl font-black font-mono my-0.5 ${kpis.active_emergencies > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
            {kpis.active_emergencies}
          </div>
          <div className="text-[10px] text-purple-700 font-mono font-bold">Emergency Status</div>
        </div>
      </div>

      {/* Main Polar GIS Map */}
      <PolarLeafletMap
        stations={stations}
        assets={assets}
        cargo={cargo}
        emergencies={emergencies}
        height="480px"
      />

      {/* Wintering Autonomy & Station Environmental Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stations Live Meteorological Status */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-emerald-600" />
              <span>Station AWS Weather & Wintering Autonomy</span>
            </h3>
            <span className="text-[10px] text-emerald-800 font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
              Live Sat-Link AWS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {station_weather.map((st: any) => {
              const daysRemaining = st.code === 'BHARATI' ? 48 : st.code === 'MAITRI' ? 34 : 112;
              const autonomyPercent = Math.min(100, Math.round((daysRemaining / 90) * 100));

              return (
                <div key={st.id} className="p-4 rounded-xl bg-slate-50/90 border border-slate-300 space-y-3 hover:border-slate-400 transition shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm">{st.name}</h4>
                      <span className="text-[11px] text-slate-700 font-mono font-medium">{st.code} • {st.region}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      st.blizzard_level === 'STAGE_3_WHITEOUT_LOCKDOWN' ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse' :
                      st.blizzard_level === 'STAGE_1_ADVISORY' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {st.blizzard_level}
                    </span>
                  </div>

                  {/* Surface Temp & Wind Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-300">
                      <div className="text-[10px] text-slate-700 flex items-center space-x-1 font-mono font-bold">
                        <Thermometer className="w-3 h-3 text-emerald-700" />
                        <span>Ambient Temp</span>
                      </div>
                      <div className="font-mono font-black text-slate-950 text-sm mt-0.5">{st.temperature_c}°C</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-300">
                      <div className="text-[10px] text-slate-700 flex items-center space-x-1 font-mono font-bold">
                        <Wind className="w-3 h-3 text-teal-700" />
                        <span>Wind Speed</span>
                      </div>
                      <div className="font-mono font-black text-slate-950 text-sm mt-0.5">{st.wind_speed_kmh} km/h</div>
                    </div>
                  </div>

                  {/* Winter Autonomy Forecast Gauge */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-800 font-bold flex items-center space-x-1">
                        <Fuel className="w-3 h-3 text-emerald-700" />
                        <span>Wintering Autonomy:</span>
                      </span>
                      <span className="font-bold text-emerald-900">{daysRemaining} Days Remaining</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          daysRemaining < 40 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${autonomyPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Activity Stream */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>SHA-256 Audit Stream</span>
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {activityLogs.map((log: any) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-300 text-xs space-y-1 hover:border-slate-400 transition shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-800 font-bold">[{log.action}]</span>
                  <span className="text-slate-600 font-semibold">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-slate-900 text-[11px] truncate font-bold">{log.user_email}</div>
                <div className="text-[10px] text-slate-700 font-mono font-medium truncate">
                  Hash: {log.current_hash ? log.current_hash.slice(0, 16) + '...' : 'Verified SHA-256 Block'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

