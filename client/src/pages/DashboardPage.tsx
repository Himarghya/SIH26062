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
  Fuel, 
  Calculator,
  Navigation,
  FileText,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle,
  Eye,
  MapPin,
  TrendingUp,
  Download
} from 'lucide-react';
import { AutonomyDerivationPanel } from '../components/AutonomyDerivationPanel';
import { Link } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user, switchDemoRole } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [cargo, setCargo] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [showAutonomyDerivation, setShowAutonomyDerivation] = useState(true);
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
  const role = user?.role || 'super_admin';

  // Role Metadata Config
  const roleConfig: Record<string, { title: string; subtitle: string; badge: string; color: string }> = {
    super_admin: {
      title: 'POLARIS Omnipresent Mission Command Center',
      subtitle: 'Complete unobstructed visibility & operational control across all Antarctic & Arctic divisions',
      badge: 'Super Admin • Full System Authority',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-900'
    },
    expedition_manager: {
      title: 'Expedition Director Command Center',
      subtitle: 'Scientific field sortie planning, route safety monitoring, and personnel field dispatch',
      badge: 'Expedition Manager • Field & Sortie Authority',
      color: 'border-cyan-500 bg-cyan-50 text-cyan-900'
    },
    logistics_officer: {
      title: 'Cold-Chain & Multimodal Cargo Supply Command',
      subtitle: 'Vessel holds, airlift manifests, cryo biological storage (-80°C), and stockout prevention',
      badge: 'Logistics Officer • Supply Chain Authority',
      color: 'border-amber-500 bg-amber-50 text-amber-900'
    },
    station_manager: {
      title: 'Station Commander Wintering Autonomy Console',
      subtitle: 'Sub-zero life-support metrics, diesel generator burn, daily muster, and isolation reserves',
      badge: 'Station Manager • Bharati / Maitri Base Authority',
      color: 'border-teal-500 bg-teal-50 text-teal-900'
    },
    emergency_coordinator: {
      title: 'SAR Tactical Emergency Operations Center',
      subtitle: '8-stage Search & Rescue incident escalation, distress beacons, and asset deployment',
      badge: 'Emergency Coordinator • Tactical SAR Authority',
      color: 'border-rose-500 bg-rose-50 text-rose-900'
    },
    viewer: {
      title: 'Scientific Telemetry & Environmental Intelligence',
      subtitle: 'Read-only meteorological telemetry streams, atmospheric trends, and open research data',
      badge: 'Viewer / Analyst • Read-Only Scientific Access',
      color: 'border-indigo-500 bg-indigo-50 text-indigo-900'
    }
  };

  const currentRoleMeta = roleConfig[role] || roleConfig.super_admin;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Active Role Banner with Instant Role Switching Context */}
      <div className={`p-4 rounded-2xl border-l-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${currentRoleMeta.color}`}>
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2 rounded-xl bg-white/80 shadow-xs shrink-0">
            <Sparkles className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-300">
                {currentRoleMeta.badge}
              </span>
              <h2 className="font-mono font-black text-sm sm:text-base text-slate-900">
                {currentRoleMeta.title}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              {currentRoleMeta.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto text-xs font-mono">
          <span className="text-slate-500 text-[10px] uppercase font-bold hidden md:inline">Quick Role:</span>
          <select
            value={role}
            onChange={(e) => switchDemoRole(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs shadow-2xs cursor-pointer"
          >
            {DEMO_ACCOUNTS.map((acc) => (
              <option key={acc.role} value={acc.role}>
                {acc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Critical Alert Banner if Active Emergency Exists (Visible to Super Admin, Emergency Coordinator, Station Commander) */}
      {activeEmergency && (role === 'super_admin' || role === 'emergency_coordinator' || role === 'station_manager') && (
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

      {/* ========================================================================= */}
      {/* 1. SUPER ADMIN DASHBOARD: EVERYTHING & ALL METRICS                         */}
      {/* ========================================================================= */}
      {role === 'super_admin' && (
        <>
          {/* Master 6-KPI Row */}
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

          {/* Live Ambient Readings & Autonomy Mathematical Model Derivation Panel */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3 className="font-bold text-xs sm:text-sm uppercase font-mono text-slate-900">
                  Live Sensor Readings & Formula Derivation
                </h3>
              </div>
              <button
                onClick={() => setShowAutonomyDerivation(!showAutonomyDerivation)}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[11px] sm:text-xs font-mono font-bold flex items-center space-x-1.5 transition shadow-2xs cursor-pointer active:scale-95"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showAutonomyDerivation ? 'Collapse Derivation Model' : 'Expand Formula Derivation'}</span>
              </button>
            </div>

            {showAutonomyDerivation && (
              <AutonomyDerivationPanel initialTemp={-28.5} initialWind={68} initialCrew={25} />
            )}
          </div>

          {/* Wintering Autonomy & Station Environmental Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                              daysRemaining < 40 ? 'bg-amber-500' : 'bg-slate-900  '
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
                    <p className="text-slate-800 font-medium text-[11px] line-clamp-2">{log.metadata_json}</p>
                    <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1">
                      <span>By: {log.user_email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. EXPEDITION MANAGER DASHBOARD: FIELD TRAVERSE & SORTIES                 */}
      {/* ========================================================================= */}
      {role === 'expedition_manager' && (
        <>
          {/* Expedition Specific 4-KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-cyan-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Active Polar Expeditions</div>
              <div className="text-2xl font-black font-mono text-slate-900">{kpis.active_expeditions}</div>
              <div className="text-[10px] text-cyan-700 font-bold">ISEA-44 Antarctic & Arctic Batch</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-teal-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Field Personnel Deployed</div>
              <div className="text-2xl font-black font-mono text-slate-900">{kpis.personnel_deployed}</div>
              <div className="text-[10px] text-teal-700 font-bold">Across 4 Bases & Deep Field Camps</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-indigo-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Field Sorties In Progress</div>
              <div className="text-2xl font-black font-mono text-indigo-900">4 Active</div>
              <div className="text-[10px] text-indigo-700 font-bold">GPS Beacon Uplink 100% OK</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-emerald-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Traverse Route Safety</div>
              <div className="text-2xl font-black font-mono text-emerald-600">96.4%</div>
              <div className="text-[10px] text-emerald-700 font-bold">Crevasse Radar Verified</div>
            </div>
          </div>

          {/* Expedition Map (Filtered to Field Units & Bases) */}
          <PolarLeafletMap
            stations={stations}
            assets={assets}
            cargo={[]}
            emergencies={emergencies}
            height="420px"
          />

          {/* Active Field Sorties & Traverse Corridor Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-cyan-700" />
                  <span>Live Field Sorties & Waypoint Traverses</span>
                </h3>
                <Link to="/expeditions" className="text-xs text-cyan-700 font-bold hover:underline">
                  Manage Sorties →
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">SORTIE-A44-01: Larsemann Ice Shelf Core Sampling</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">Active On Route</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                    <span>Leader: Dr. A. Sharma (Glaciologist)</span>
                    <span>Waypoints: 4 / 6 Passed</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-600 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">SORTIE-M44-03: Schirmacher Oasis Geophysical Traverse</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">Active On Route</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                    <span>Leader: Er. V. Nair (Geophysicist)</span>
                    <span>Waypoints: 8 / 10 Passed</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-600 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">SORTIE-H24-02: Kongsfjorden Fjord Marine Transect</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-mono font-bold">Marine Mooring OK</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                    <span>Leader: Dr. R. Sengupta (Oceanographer)</span>
                    <span>Subsurface Mooring: 192m</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Field Traverse Weather & Katabatic Wind Risk Advisories */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                <Wind className="w-4 h-4 text-cyan-700" />
                <span>Field Route Meteorological Risk & Katabatic Advisories</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>️ Maitri 100km Traverse Corridor</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-200 text-[10px] font-mono">Katabatic Gust Advisory</span>
                  </div>
                  <p className="text-[11px] text-amber-900">
                    Wind gusts projected to exceed 75 km/h near Polar Plateau edge at 18:00 UTC. Snowcat tethering recommended.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span> Bharati Ice-Shelf Corridor</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-[10px] font-mono">Route Clear</span>
                  </div>
                  <p className="text-[11px] text-emerald-900">
                    Visibility &gt; 5,000m. Optimal conditions for scientific drilling and Kamov helicopter VIP transport.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <Link
                  to="/expeditions"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs text-center shadow-sm"
                >
                  Open Expedition Planner
                </Link>
                <Link
                  to="/personnel"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center border border-slate-300"
                >
                  View Field Rosters
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. LOGISTICS OFFICER DASHBOARD: COLD-CHAIN & CARGO SUPPLY                  */}
      {/* ========================================================================= */}
      {role === 'logistics_officer' && (
        <>
          {/* Logistics 4-KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-amber-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Cargo In Transit</div>
              <div className="text-2xl font-black font-mono text-amber-900">{kpis.cargo_in_transit}</div>
              <div className="text-[10px] text-amber-700 font-bold">Vessels & Supply Helos</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-emerald-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Cold-Chain Compliance Rate</div>
              <div className="text-2xl font-black font-mono text-emerald-600">99.4%</div>
              <div className="text-[10px] text-emerald-700 font-bold">Zero Cryo Thermal Excursions</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-rose-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Critical Stock SKUs</div>
              <div className="text-2xl font-black font-mono text-rose-600">{kpis.critical_inventory_alerts}</div>
              <div className="text-[10px] text-rose-700 font-bold">At or Below Minimum Stock</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-indigo-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Pending Reorder ROPs</div>
              <div className="text-2xl font-black font-mono text-indigo-900">3 Purchase Orders</div>
              <div className="text-[10px] text-indigo-700 font-bold">Next Resupply: MV Golovnin</div>
            </div>
          </div>

          {/* Logistics Polar Map (Filtered to Vessels, Cargo Containers & Helos) */}
          <PolarLeafletMap
            stations={stations}
            assets={assets}
            cargo={cargo}
            emergencies={[]}
            height="420px"
          />

          {/* Multimodal Cargo Pipeline & Cold-Chain Vault Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                  <Box className="w-4 h-4 text-amber-600" />
                  <span>Multimodal Cargo Pipeline & Chain of Custody</span>
                </h3>
                <Link to="/cargo" className="text-xs text-amber-700 font-bold hover:underline">
                  View All Shipments →
                </Link>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {cargo.slice(0, 4).map((c: any) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-900">{c.cargo_code}: {c.name}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex justify-between font-mono">
                      <span>Location: {c.current_location}</span>
                      <span>Category: {c.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cold-Chain Cryogenic Preservation Status */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-emerald-600" />
                <span>Cold-Chain Cryo Vault Temperature Bands</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1 font-mono">
                  <div className="flex items-center justify-between font-bold">
                    <span> Cryo Deep Ice Cores (Target: -80°C)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-[10px]">Active Temp: -81.2°C (OK)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Bharati Cryo Vault #1: Vacuum insulation active. Liquid nitrogen buffer at 94%.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-950 space-y-1 font-mono">
                  <div className="flex items-center justify-between font-bold">
                    <span> Frozen Winter Provisions (Target: -20°C)</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-200 text-[10px]">Active Temp: -21.4°C (OK)</span>
                  </div>
                  <p className="text-[11px] text-cyan-800">
                    Maitri Deep Freeze Chamber: Sealed for 8-month winter isolation period.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <Link
                  to="/cargo"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs text-center shadow-sm"
                >
                  Manage Cargo Chain
                </Link>
                <Link
                  to="/inventory"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center border border-slate-300"
                >
                  Inventory Ledger
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. STATION MANAGER DASHBOARD: BASE WINTERING AUTONOMY                      */}
      {/* ========================================================================= */}
      {role === 'station_manager' && (
        <>
          {/* Station 4-KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-emerald-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Station Wintering Autonomy</div>
              <div className="text-2xl font-black font-mono text-emerald-600">48 Days</div>
              <div className="text-[10px] text-emerald-700 font-bold">Bharati Station Survival Margin</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-rose-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Ambient Surface Temp</div>
              <div className="text-2xl font-black font-mono text-rose-600">-28.5 °C</div>
              <div className="text-[10px] text-rose-700 font-bold">Wind Chill: -49.1 °C</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-teal-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Gale Surface Wind</div>
              <div className="text-2xl font-black font-mono text-teal-800">68 km/h</div>
              <div className="text-[10px] text-teal-700 font-bold">Auxiliary HVAC Heating Active</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-indigo-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Station Crew Muster</div>
              <div className="text-2xl font-black font-mono text-indigo-900">25 / 25</div>
              <div className="text-[10px] text-indigo-700 font-bold">100% Inside Habitat Sealed</div>
            </div>
          </div>

          {/* Prominent Live Ambient Readings & Autonomy Mathematical Derivation Panel */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm uppercase font-mono text-slate-900">
                Bharati Station Survival Autonomy & Weather Multiplier Derivation
              </h3>
            </div>
            <AutonomyDerivationPanel initialTemp={-28.5} initialWind={68} initialCrew={25} />
          </div>

          {/* Station Diesel Generators & Living Quarters Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-emerald-600" />
                <span>Station Diesel Power Plants & Thermal Generators</span>
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>Main Generator 1 (Cummins QSK60)</span>
                    <span className="text-emerald-700">ONLINE (68% Load)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between">
                    <span>Fuel Burn: 42.5 L/hr</span>
                    <span>Coolant: 84°C (Optimal)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>Aux Generator 2 (Cold Standby)</span>
                    <span className="text-cyan-700">STANDBY (Heated Coil Ready)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between">
                    <span>Pre-heating: Active</span>
                    <span>Battery Bank: 99.2%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions for Station Commander */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Station Commander Operational Actions</span>
              </h3>

              <div className="space-y-2.5">
                <Link
                  to="/inventory"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 font-bold text-xs transition"
                >
                  <span>Open Base Stockout & Reorder Ledger</span>
                  <ArrowRight className="w-4 h-4 text-emerald-700" />
                </Link>

                <Link
                  to="/personnel"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-950 font-bold text-xs transition"
                >
                  <span>Verify Station Crew Biometric Muster Roll</span>
                  <ArrowRight className="w-4 h-4 text-cyan-700" />
                </Link>

                <Link
                  to="/emergency"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 font-bold text-xs transition"
                >
                  <span>Station Emergency Whiteout Protocol</span>
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 5. EMERGENCY COORDINATOR DASHBOARD: SAR TACTICAL COMMAND                   */}
      {/* ========================================================================= */}
      {role === 'emergency_coordinator' && (
        <>
          {/* SAR 4-KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-rose-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Active SAR Emergencies</div>
              <div className="text-2xl font-black font-mono text-rose-600">{kpis.active_emergencies}</div>
              <div className="text-[10px] text-rose-700 font-bold">Stage-3 Incident Underway</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-amber-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Personnel in Risk Zone</div>
              <div className="text-2xl font-black font-mono text-amber-900">2 Personnel</div>
              <div className="text-[10px] text-amber-700 font-bold">Glacial Ridge Crevasse Fall</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-emerald-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Deployable SAR Assets</div>
              <div className="text-2xl font-black font-mono text-emerald-600">3 Ready</div>
              <div className="text-[10px] text-emerald-700 font-bold">Kamov Ka-32 & PistenBully</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-indigo-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Avg Rescue Mobilization</div>
              <div className="text-2xl font-black font-mono text-indigo-900">14 Mins</div>
              <div className="text-[10px] text-indigo-700 font-bold">Air Force / NCPOR Standard</div>
            </div>
          </div>

          {/* SAR Tactical Emergency Map (Distress Beacon & Search Grids) */}
          <PolarLeafletMap
            stations={stations}
            assets={assets}
            cargo={[]}
            emergencies={emergencies}
            height="440px"
          />

          {/* 8-Stage Escalation Board Preview & Quick Dispatch */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>SAR 8-Stage Escalation Protocol State Machine</span>
              </h3>
              <Link
                to="/emergency"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <span>Full Incident Commander</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs font-mono">
              {['1. Detection', '2. Triage', '3. Mobilize', '4. Grid Search', '5. Contact', '6. Evac', '7. Arrival', '8. Debrief'].map((stg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border font-bold ${
                    idx <= 2 
                      ? 'bg-rose-100 border-rose-300 text-rose-950 font-black' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="text-[9px] text-slate-400">STAGE {idx + 1}</div>
                  <div className="mt-0.5 text-[11px] truncate">{stg.split('. ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 6. VIEWER / ANALYST DASHBOARD: READ-ONLY SCIENTIFIC INTELLIGENCE           */}
      {/* ========================================================================= */}
      {role === 'viewer' && (
        <>
          {/* Analyst 4-KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-indigo-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Monitored Observatories</div>
              <div className="text-2xl font-black font-mono text-indigo-950">4 Stations</div>
              <div className="text-[10px] text-indigo-700 font-bold">Bharati, Maitri, Himadri, IndARC</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-cyan-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Antarctic Wind Chill</div>
              <div className="text-2xl font-black font-mono text-cyan-900">-49.1 °C</div>
              <div className="text-[10px] text-cyan-700 font-bold">Live NOAA/JAG Index Calculated</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-emerald-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Telemetry Sensor Uptime</div>
              <div className="text-2xl font-black font-mono text-emerald-600">99.8%</div>
              <div className="text-[10px] text-emerald-700 font-bold">Satellite Telemetry Streaming</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-t-2 border-t-teal-500 space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Open Scientific Datasets</div>
              <div className="text-2xl font-black font-mono text-teal-900">24 Ready</div>
              <div className="text-[10px] text-teal-700 font-bold">MoES Open Data Portal</div>
            </div>
          </div>

          {/* Read-Only Polar Map */}
          <PolarLeafletMap
            stations={stations}
            assets={assets}
            cargo={cargo}
            emergencies={[]}
            height="440px"
          />

          {/* Scientific Telemetry Feeds & Analytics Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-indigo-600" />
                <span>Station Meteorological Telemetry Feed (Read-Only)</span>
              </h3>

              <div className="space-y-3 text-xs font-mono">
                {station_weather.map((st: any) => (
                  <div key={st.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{st.name} ({st.code})</div>
                      <div className="text-[10px] text-slate-500">{st.region} • AWS Stream OK</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">{st.temperature_c}°C | {st.wind_speed_kmh} km/h</div>
                      <div className="text-[10px] text-indigo-700 font-bold">P: {st.pressure_hpa} hPa</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm uppercase font-mono text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Scientific Data Export & Mission Reports</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scientific researchers and policy analysts can view real-time environmental telemetry, fuel optimization models, and cryo-storage trends. Operational write actions are restricted to field commanders.
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <Link
                  to="/analytics"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs text-center shadow-sm"
                >
                  View Full Analytics Trends
                </Link>
                <button
                  onClick={() => alert('Downloading MoES Polar Telemetry CSV dataset...')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1.5 border border-slate-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
