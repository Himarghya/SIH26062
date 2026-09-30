import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CloudSnow, 
  Flame, 
  ThermometerSnowflake, 
  LifeBuoy, 
  Award, 
  X, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles,
  Zap,
  Gauge,
  Thermometer,
  Wind,
  Compass,
  Users,
  Clock,
  Radio,
  Sliders,
  TrendingUp,
  Eye,
  Droplets,
  Layers,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { polarisApi } from '../../api/services';

interface MlCommandConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MlCommandConsoleModal: React.FC<MlCommandConsoleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Active Tab: 'weather' | 'fuel' | 'coldchain' | 'sar' | 'ranking'
  const [activeTab, setActiveTab] = useState<'weather' | 'fuel' | 'coldchain' | 'sar' | 'ranking'>('weather');

  // Health State
  const [healthStatus, setHealthStatus] = useState<{ status: string; models_loaded: string[] } | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState<boolean>(false);

  // 1. Weather / Blizzard State
  const [wStation, setWStation] = useState('Bharati');
  const [wTemp, setWTemp] = useState(-38);
  const [wWind, setWWind] = useState(95);
  const [wGust, setWGust] = useState(130);
  const [wPres, setWPres] = useState(955);
  const [wDPres, setWDPres] = useState(-6);
  const [wVis, setWVis] = useState(250);
  const [wHum, setWHum] = useState(88);
  const [wChill, setWChill] = useState(-55);
  const [wResult, setWResult] = useState<any>(null);
  const [wLoading, setWLoading] = useState(false);

  // 2. Fuel Forecast State
  const [fStation, setFStation] = useState('Bharati');
  const [fStock, setFStock] = useState(72400);
  const [fResupply, setFResupply] = useState(26);
  const [fTemp, setFTemp] = useState(-32);
  const [fWind, setFWind] = useState(60);
  const [fPers, setFPers] = useState(55);
  const [fLoad, setFLoad] = useState(70);
  const [fBliz, setFBliz] = useState(0);
  const [fEquip, setFEquip] = useState(12);
  const [fResult, setFResult] = useState<any>(null);
  const [fLoading, setFLoading] = useState(false);

  // 3. Cold-Chain State
  const [cId, setCId] = useState('ICE-CORE-204');
  const [cTarget, setCTarget] = useState(-80);
  const [cStream, setCStream] = useState('-80,-79,-80,-81,-80,-79,-77,-74,-70,-68');
  const [cResult, setCResult] = useState<any>(null);
  const [cLoading, setCLoading] = useState(false);

  // 4a. SAR Risk State
  const [sId, setSId] = useState('Field-Team-07');
  const [sDist, setSDist] = useState(43);
  const [sVis, setSVis] = useState(180);
  const [sWind, setSWind] = useState(104);
  const [sTemp, setSTemp] = useState(-39);
  const [sPers, setSPers] = useState(6);
  const [sFuel, setSFuel] = useState(70);
  const [sContact, setSContact] = useState(5);
  const [sType, setSType] = useState('snowcat');
  const [sResult, setSResult] = useState<any>(null);
  const [sLoading, setSLoading] = useState(false);

  // 4b. Asset Ranking State
  const [aAssetsJson, setAAssetsJson] = useState(JSON.stringify([
    { name: "Helicopter A", distance_km: 80, fuel_pct: 75, weather_compat_pct: 45, availability: "WEATHER_LIMITED" },
    { name: "Snowcat B", distance_km: 31, fuel_pct: 82, weather_compat_pct: 94, availability: "READY" },
    { name: "Snowcat C", distance_km: 47, fuel_pct: 60, weather_compat_pct: 88, availability: "READY" }
  ], null, 2));
  const [aResult, setAResult] = useState<any>(null);
  const [aLoading, setALoading] = useState(false);

  // Check ML Engine Health on open
  const checkHealth = async () => {
    setIsHealthLoading(true);
    try {
      const data = await polarisApi.getMlHealth();
      setHealthStatus(data);
    } catch (e) {
      setHealthStatus(null);
    } finally {
      setIsHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // Handlers
  const handlePredictWeather = async () => {
    setWLoading(true);
    try {
      const data = await polarisApi.predictWeatherRisk({
        station: wStation,
        temperature_c: Number(wTemp),
        wind_speed_kmh: Number(wWind),
        wind_gust_kmh: Number(wGust),
        pressure_hpa: Number(wPres),
        pressure_change_3h: Number(wDPres),
        visibility_m: Number(wVis),
        humidity_pct: Number(wHum),
        wind_chill_c: Number(wChill)
      });
      setWResult(data);
    } catch (err: any) {
      setWResult({ error: err?.response?.data?.detail || err.message });
    } finally {
      setWLoading(false);
    }
  };

  const handlePredictFuel = async () => {
    setFLoading(true);
    try {
      const data = await polarisApi.predictFuelForecast({
        station: fStation,
        current_stock_l: Number(fStock),
        temperature_c: Number(fTemp),
        wind_speed_kmh: Number(fWind),
        personnel_count: Number(fPers),
        generator_load_pct: Number(fLoad),
        blizzard_flag: Number(fBliz),
        equipment_usage_hrs: Number(fEquip),
        resupply_in_days: fResupply ? Number(fResupply) : null
      });
      setFResult(data);
    } catch (err: any) {
      setFResult({ error: err?.response?.data?.detail || err.message });
    } finally {
      setFLoading(false);
    }
  };

  const handlePredictColdchain = async () => {
    setCLoading(true);
    try {
      const temps = cStream.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      const data = await polarisApi.predictColdchainAnomaly({
        cargo_id: cId,
        temperatures: temps,
        target_temp_c: Number(cTarget)
      });
      setCResult(data);
    } catch (err: any) {
      setCResult({ error: err?.response?.data?.detail || err.message });
    } finally {
      setCLoading(false);
    }
  };

  const handlePredictSar = async () => {
    setSLoading(true);
    try {
      const data = await polarisApi.predictSarRisk({
        incident_id: sId,
        distance_km: Number(sDist),
        visibility_m: Number(sVis),
        wind_kmh: Number(sWind),
        temperature_c: Number(sTemp),
        personnel_available: Number(sPers),
        asset_fuel_pct: Number(sFuel),
        time_since_contact_hr: Number(sContact),
        asset_type: sType
      });
      setSResult(data);
    } catch (err: any) {
      setSResult({ error: err?.response?.data?.detail || err.message });
    } finally {
      setSLoading(false);
    }
  };

  const handleRankAssets = async () => {
    setALoading(true);
    try {
      const parsed = JSON.parse(aAssetsJson);
      const data = await polarisApi.predictSarAssetRanking({
        assets: parsed
      });
      setAResult(data);
    } catch (err: any) {
      setAResult({ error: err?.response?.data?.detail || err.message });
    } finally {
      setALoading(false);
    }
  };

  const renderBadge = (level: string) => {
    const l = (level || '').toUpperCase();
    if (l === 'CRITICAL') return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
        CRITICAL
      </span>
    );
    if (l === 'HIGH') return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
        HIGH
      </span>
    );
    if (l === 'MODERATE') return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
        MODERATE
      </span>
    );
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        LOW / NORMAL
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-slate-800">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-700 text-white">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-inner">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider">
                  POLARIS ML Predictive Engine
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v1.0.0 Active
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono font-medium mt-0.5">
                XGBoost Classifiers · XGBoost Regressors · Isolation Forests · Multi-Criteria SAR Ranker
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Model Health Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono shadow-xs">
              <span className={`w-2 h-2 rounded-full ${healthStatus ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-slate-300 font-medium text-[11px]">
                {healthStatus ? `ML Ready (${healthStatus.models_loaded.length} models)` : 'Connecting ML...'}
              </span>
              <button 
                onClick={checkHealth} 
                className="text-slate-400 hover:text-emerald-400 p-0.5 transition" 
                title="Refresh health"
              >
                <RefreshCw className={`w-3 h-3 ${isHealthLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 transition border border-slate-700/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
              activeTab === 'weather'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
            }`}
          >
            <CloudSnow className={`w-4 h-4 ${activeTab === 'weather' ? 'text-white' : 'text-emerald-600'}`} />
            <span>1. Blizzard & Weather (XGBoost)</span>
          </button>

          <button
            onClick={() => setActiveTab('fuel')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
              activeTab === 'fuel'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
            }`}
          >
            <Flame className={`w-4 h-4 ${activeTab === 'fuel' ? 'text-white' : 'text-amber-600'}`} />
            <span>2. Fuel Forecast (XGBoost)</span>
          </button>

          <button
            onClick={() => setActiveTab('coldchain')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
              activeTab === 'coldchain'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
            }`}
          >
            <ThermometerSnowflake className={`w-4 h-4 ${activeTab === 'coldchain' ? 'text-white' : 'text-teal-600'}`} />
            <span>3. Cold-Chain (Isolation Forest)</span>
          </button>

          <button
            onClick={() => setActiveTab('sar')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
              activeTab === 'sar'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
            }`}
          >
            <LifeBuoy className={`w-4 h-4 ${activeTab === 'sar' ? 'text-white' : 'text-rose-600'}`} />
            <span>4a. SAR Incident Risk</span>
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
              activeTab === 'ranking'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent'
            }`}
          >
            <Award className={`w-4 h-4 ${activeTab === 'ranking' ? 'text-white' : 'text-indigo-600'}`} />
            <span>4b. Asset Ranking</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40 font-sans text-slate-800">

          {/* TAB 1: WEATHER / BLIZZARD RISK */}
          {activeTab === 'weather' && (
            <div className="space-y-6">
              {/* Telemetry Sub-Banner & Quick Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-teal-100 shadow-xs">
                <div className="flex items-center space-x-3 text-xs text-slate-700 font-medium">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block font-mono text-[11px] uppercase tracking-wider">XGBoost Blizzard Risk Model</span>
                    <span className="text-slate-500 text-xs">Evaluates multi-variate polar barometric & thermal telemetry in real-time.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase mr-1">Presets:</span>
                  <button 
                    onClick={() => {
                      setWStation('Bharati'); setWTemp(-38); setWWind(95); setWGust(130);
                      setWPres(955); setWDPres(-6); setWVis(250); setWHum(88); setWChill(-55);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-mono font-bold rounded-xl border border-rose-200/80 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    Severe Blizzard
                  </button>
                  <button 
                    onClick={() => {
                      setWStation('Maitri'); setWTemp(-12); setWWind(25); setWGust(35);
                      setWPres(992); setWDPres(1.2); setWVis(8000); setWHum(65); setWChill(-18);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-xl border border-emerald-200/80 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    Clear Weather
                  </button>
                </div>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {/* Station */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      Target Station
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={wStation}
                      onChange={(e) => setWStation(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Temperature */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
                      Temperature
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">°C</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={wTemp}
                      onChange={(e) => setWTemp(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Wind Speed */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-blue-600" />
                      Wind Speed
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">km/h</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={wWind}
                      onChange={(e) => setWWind(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Wind Gust */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-600" />
                      Wind Gust Peak
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">km/h</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={wGust}
                      onChange={(e) => setWGust(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Atmospheric Pressure */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                      Barometric Pressure
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">hPa</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={wPres}
                      onChange={(e) => setWPres(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pressure Delta */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
                      Pressure Δ (3h)
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">hPa/3h</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={wDPres}
                      onChange={(e) => setWDPres(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Visibility */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      Optical Visibility
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">meters</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={wVis}
                      onChange={(e) => setWVis(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Relative Humidity */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-teal-600" />
                      Relative Humidity
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">%</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={wHum}
                      onChange={(e) => setWHum(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Wind Chill */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />
                      Wind Chill Index
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">°C</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={wChill}
                      onChange={(e) => setWChill(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>9 features fed into XGBoost pipeline</span>
                </div>
                <button
                  onClick={handlePredictWeather}
                  disabled={wLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center space-x-2 disabled:opacity-50 transition cursor-pointer"
                >
                  {wLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>RUN BLIZZARD INFERENCE</span>
                </button>
              </div>

              {/* Prediction Results Card */}
              {wResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-slate-900 uppercase flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <CloudSnow className="w-4 h-4" />
                      </div>
                      <span>Inference Output &middot; Station {wResult.station}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-mono font-medium">Overall Risk:</span>
                      {renderBadge(wResult.predicted_risk)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">BLIZZARD PROBABILITY</div>
                      <div className="text-2xl font-black text-emerald-700 mt-1">{wResult.blizzard_probability_pct}%</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">VISIBILITY RISK</div>
                      <div className="mt-1.5">{renderBadge(wResult.visibility_risk)}</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">WIND GUST RISK</div>
                      <div className="mt-1.5">{renderBadge(wResult.wind_risk)}</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">MODEL CONFIDENCE</div>
                      <div className="text-2xl font-black text-indigo-700 mt-1">{wResult.confidence_pct}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FUEL & INVENTORY FORECAST */}
          {activeTab === 'fuel' && (
            <div className="space-y-6">
              {/* Telemetry Sub-Banner & Quick Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-amber-100 shadow-xs">
                <div className="flex items-center space-x-3 text-xs text-slate-700 font-medium">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block font-mono text-[11px] uppercase tracking-wider">XGBoost Fuel Consumption Regressor</span>
                    <span className="text-slate-500 text-xs">Models station thermal loss, generator load curves, and multi-day resupply horizons.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase mr-1">Preset:</span>
                  <button 
                    onClick={() => {
                      setFStation('Bharati'); setFStock(72400); setFResupply(26); setFTemp(-32);
                      setFWind(60); setFPers(55); setFLoad(70); setFBliz(0); setFEquip(12);
                    }}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-mono font-bold rounded-xl border border-amber-200/80 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    Normal Winter Baseline
                  </button>
                </div>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {/* Station */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-600" />
                      Station
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={fStation}
                      onChange={(e) => setFStation(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Current Stock */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      Current D-10 Stock
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Liters</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={fStock}
                      onChange={(e) => setFStock(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Resupply Days */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Next Resupply
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Days</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={fResupply}
                      onChange={(e) => setFResupply(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Avg Ambient Temp */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
                      Ambient Temperature
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">°C</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={fTemp}
                      onChange={(e) => setFTemp(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Avg Wind Speed */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-blue-600" />
                      Wind Speed
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">km/h</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={fWind}
                      onChange={(e) => setFWind(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Station Personnel */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-700" />
                      Station Personnel
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">count</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={fPers}
                      onChange={(e) => setFPers(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Generator Load */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-600" />
                      Generator Load
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">%</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={fLoad}
                      onChange={(e) => setFLoad(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Blizzard Flag */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <CloudSnow className="w-3.5 h-3.5 text-cyan-600" />
                      Active Blizzard
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">0 or 1</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={fBliz}
                      onChange={(e) => setFBliz(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Equipment Usage */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Equipment Run Time
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">hrs/day</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={fEquip}
                      onChange={(e) => setFEquip(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Multivariate regression with stockout depletion projection</span>
                </div>
                <button
                  onClick={handlePredictFuel}
                  disabled={fLoading}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-amber-600/25 flex items-center space-x-2 disabled:opacity-50 transition cursor-pointer"
                >
                  {fLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>RUN FUEL CONSUMPTION FORECAST</span>
                </button>
              </div>

              {/* Prediction Results Card */}
              {fResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-slate-900 uppercase flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                        <Flame className="w-4 h-4" />
                      </div>
                      <span>Burn Rate Forecast &middot; Station {fResult.station}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-mono font-medium">Stockout Risk:</span>
                      {renderBadge(fResult.risk)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">PREDICTED DAILY BURN</div>
                      <div className="text-2xl font-black text-amber-700 mt-1">{fResult.predicted_burn_l_per_day.toLocaleString()} L/day</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">ESTIMATED EXHAUSTION</div>
                      <div className="text-2xl font-black text-indigo-700 mt-1">
                        {fResult.predicted_exhaustion_day ? `Day ${fResult.predicted_exhaustion_day}` : 'Beyond Horizon (>30d)'}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">NEXT RESUPPLY</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">Day {fResult.next_resupply_in_days ?? 'N/A'}</div>
                    </div>
                  </div>

                  {/* Stock Trajectory Table */}
                  {fResult.projection && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <span>Forward Stock Depletion Projections</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                        {Object.entries(fResult.projection).map(([key, val]: [string, any]) => (
                          <div key={key} className="p-2.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center shadow-2xs">
                            <span className="text-slate-500 font-medium text-[11px]">{key.replace('_', ' ').toUpperCase()}:</span>
                            <span className="font-bold text-emerald-700">{Number(val).toLocaleString()} L</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COLD-CHAIN ANOMALY DETECTION */}
          {activeTab === 'coldchain' && (
            <div className="space-y-6">
              {/* Telemetry Sub-Banner & Quick Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-teal-100 shadow-xs">
                <div className="flex items-center space-x-3 text-xs text-slate-700 font-medium">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                    <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block font-mono text-[11px] uppercase tracking-wider">Isolation Forest Anomaly Engine</span>
                    <span className="text-slate-500 text-xs">Detects subtle slope warming & sensor drift anomalies before thermal threshold breaches.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase mr-1">Presets:</span>
                  <button 
                    onClick={() => {
                      setCId('ICE-CORE-204'); setCTarget(-80);
                      setCStream('-80,-79,-80,-81,-80,-79,-77,-74,-70,-68');
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-mono font-bold rounded-xl border border-rose-200/80 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    Warming Trend Breach
                  </button>
                  <button 
                    onClick={() => {
                      setCId('BIO-PLASMA-09'); setCTarget(-80);
                      setCStream('-80.1,-79.8,-80.2,-80.0,-80.1,-79.9,-80.0,-80.1');
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-xl border border-emerald-200/80 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    Stable Cryo Stream
                  </button>
                </div>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Cargo ID */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      Cargo Package ID
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={cId}
                      onChange={(e) => setCId(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Target Cryo Temp */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />
                      Target Cryogenic Temp
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">°C</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={cTarget}
                      onChange={(e) => setCTarget(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Temperature Stream */}
                <div className="md:col-span-2 p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-600" />
                      Recent Telemetry Stream (Oldest &rarr; Newest, comma separated)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Min 2 readings</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={cStream}
                      onChange={(e) => setCStream(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Calculates rolling volatility, slope derivation, and outlier scores</span>
                </div>
                <button
                  onClick={handlePredictColdchain}
                  disabled={cLoading}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-teal-600/25 flex items-center space-x-2 disabled:opacity-50 transition cursor-pointer"
                >
                  {cLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>SCORE TEMPERATURE STREAM</span>
                </button>
              </div>

              {/* Prediction Results Card */}
              {cResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-slate-900 uppercase flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                        <ThermometerSnowflake className="w-4 h-4" />
                      </div>
                      <span>Isolation Forest Evaluation &middot; {cResult.cargo_id}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-mono font-medium">Trend Status:</span>
                      {cResult.trend_anomaly_detected ? renderBadge('CRITICAL') : renderBadge('LOW')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">CURRENT TELEMETRY</div>
                      <div className="text-2xl font-black text-teal-700 mt-1">{cResult.current_temperature_c}°C</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">TARGET TEMP</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">{cResult.target_temp_c}°C</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">ANOMALY SCORE</div>
                      <div className="text-2xl font-black text-amber-700 mt-1">{cResult.anomaly_score} / 1.0</div>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 font-semibold tracking-wider">EST. STEPS TO BREACH</div>
                      <div className="text-2xl font-black text-rose-700 mt-1">
                        {cResult.estimated_steps_to_breach ?? 'None (Stable)'}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border font-mono text-xs flex items-center space-x-2.5 ${
                    cResult.trend_anomaly_detected
                      ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                  }`}>
                    {cResult.trend_anomaly_detected ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">Recommended Action: </span>
                      <span>{cResult.action}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4a: SAR INCIDENT RESPONSE RISK */}
          {activeTab === 'sar' && (
            <div className="space-y-6">
              {/* Telemetry Sub-Banner & Quick Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-rose-100 shadow-xs">
                <div className="flex items-center space-x-3 text-xs text-slate-700 font-medium">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                    <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block font-mono text-[11px] uppercase tracking-wider">SAR Response Risk Engine</span>
                    <span className="text-slate-500 text-xs">Evaluates emergency rescue friction based on weather, vehicle capability & distance.</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase mr-1">Preset:</span>
                  <button 
                    onClick={() => {
                      setSId('Field-Team-07'); setSDist(43); setSVis(180); setSWind(104);
                      setSTemp(-39); setSPers(6); setSFuel(70); setSContact(5); setSType('snowcat');
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-mono font-bold rounded-xl border border-rose-200/80 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    Field Team 07 Distress
                  </button>
                </div>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {/* Incident ID */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
                      Incident ID
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={sId}
                      onChange={(e) => setSId(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Distance to Target */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      Distance to Target
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">km</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={sDist}
                      onChange={(e) => setSDist(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Visibility */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      Visibility
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">meters</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={sVis}
                      onChange={(e) => setSVis(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Wind Velocity */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-blue-600" />
                      Wind Velocity
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">km/h</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={sWind}
                      onChange={(e) => setSWind(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Ambient Temp */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
                      Ambient Temp
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">°C</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={sTemp}
                      onChange={(e) => setSTemp(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Personnel Available */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-700" />
                      Personnel Available
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">count</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={sPers}
                      onChange={(e) => setSPers(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Asset Fuel */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      Asset Fuel Tank
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">%</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={sFuel}
                      onChange={(e) => setSFuel(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Radio Contact */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-rose-600" />
                      Last Radio Contact
                    </label>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">hours ago</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={sContact}
                      onChange={(e) => setSContact(Number(e.target.value))}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Asset Type */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-violet-600" />
                      Vehicle Type
                    </label>
                  </div>
                  <div className="flex items-center">
                    <select
                      value={sType}
                      onChange={(e) => setSType(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 font-mono font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="snowcat">Snowcat (PistenBully / Polar)</option>
                      <option value="helicopter">Helicopter (Airborne SAR)</option>
                      <option value="vessel">Vessel (Icebreaker / Polar)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>XGBoost Classification with OneHot vehicle categorical encoding</span>
                </div>
                <button
                  onClick={handlePredictSar}
                  disabled={sLoading}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-rose-600/25 flex items-center space-x-2 disabled:opacity-50 transition cursor-pointer"
                >
                  {sLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>ASSESS SAR INCIDENT RISK</span>
                </button>
              </div>

              {/* Prediction Results Card */}
              {sResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-slate-900 uppercase flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                        <LifeBuoy className="w-4 h-4" />
                      </div>
                      <span>Response Risk Analysis &middot; {sResult.incident_id}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-mono font-medium">Risk Level:</span>
                      {renderBadge(sResult.risk_level)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold tracking-wider">RESPONSE RISK SCORE</div>
                        <div className="text-3xl font-black text-rose-700 mt-1">{sResult.response_risk_pct}%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-semibold tracking-wider">ESTIMATED RESPONSE TIME</div>
                        <div className="text-3xl font-black text-indigo-700 mt-1">{sResult.estimated_response_time_min} mins</div>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
                        <Activity className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4b: SAR ASSET SUITABILITY RANKING */}
          {activeTab === 'ranking' && (
            <div className="space-y-6">
              {/* Telemetry Sub-Banner & Quick Presets */}
              <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3 text-xs text-slate-700 font-medium">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block font-mono text-[11px] uppercase tracking-wider">Multi-Criteria Decision Analysis (MCDA)</span>
                    <span className="text-slate-500 text-xs">Weighted formula: Distance (30%) + Fuel (20%) + Weather Compatibility (30%) + Availability (20%).</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAAssetsJson(JSON.stringify([
                      { name: "Helicopter A", distance_km: 80, fuel_pct: 75, weather_compat_pct: 45, availability: "WEATHER_LIMITED" },
                      { name: "Snowcat B", distance_km: 31, fuel_pct: 82, weather_compat_pct: 94, availability: "READY" },
                      { name: "Snowcat C", distance_km: 47, fuel_pct: 60, weather_compat_pct: 88, availability: "READY" }
                    ], null, 2));
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-mono font-bold rounded-xl border border-indigo-200/80 shadow-2xs transition active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  Reset JSON Sample
                </button>
              </div>

              {/* JSON Configuration Editor */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 transition">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Fleet Asset Manifest (JSON Schema)
                  </label>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">application/json</span>
                </div>
                <textarea
                  rows={6}
                  value={aAssetsJson}
                  onChange={(e) => setAAssetsJson(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono font-medium focus:bg-white focus:outline-none shadow-inner"
                />
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Calculates Pareto optimality & MCDA rank scores</span>
                </div>
                <button
                  onClick={handleRankAssets}
                  disabled={aLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-indigo-600/25 flex items-center space-x-2 disabled:opacity-50 transition cursor-pointer"
                >
                  {aLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>RANK ASSETS FOR SAR MISSION</span>
                </button>
              </div>

              {/* Prediction Results Card */}
              {aResult && Array.isArray(aResult) && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-slate-900 uppercase flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                        <Award className="w-4 h-4" />
                      </div>
                      <span>Recommended Asset Dispatch Ranking</span>
                    </h3>
                  </div>

                  <div className="space-y-3 font-mono">
                    {aResult.map((asset: any, idx: number) => {
                      const medal = idx === 0 ? '1st Choice' : idx === 1 ? '2nd Choice' : '3rd Choice';
                      const isTop = idx === 0;
                      return (
                        <div
                          key={asset.name}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                            isTop 
                              ? 'bg-gradient-to-r from-indigo-50/80 to-violet-50/80 border-indigo-300 shadow-xs'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${
                              isTop ? 'bg-amber-400 text-slate-950 border-amber-300 font-black' : 'bg-white text-slate-700 border-slate-200'
                            }`}>
                              {medal}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{asset.name}</div>
                              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                Distance: {asset.distance_km}km &middot; Fuel: {asset.fuel_pct}% &middot; Weather Compat: {asset.weather_compatibility_pct}%
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {renderBadge(asset.availability)}
                            <div className="text-right">
                              <div className="text-[10px] text-slate-500 font-semibold">SUITABILITY</div>
                              <div className="text-xl font-black text-indigo-700">{asset.suitability_pct}%</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
