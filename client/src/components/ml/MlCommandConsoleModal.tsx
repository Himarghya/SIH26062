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
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles,
  Zap,
  Radio,
  Gauge
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
    if (l === 'CRITICAL') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
    if (l === 'HIGH') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">HIGH</span>;
    if (l === 'MODERATE') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">MODERATE</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">LOW / OK</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-800">
        {/* Modal Top Bar */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 shadow-sm">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider">
                  POLARIS ML Predictive Engine
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  v1.0.0 Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono font-medium">
                XGBoost Classifiers · XGBoost Regressors · Isolation Forests · Multi-Criteria SAR Ranker
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Model Health Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono shadow-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${healthStatus ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-700 font-medium">
                {healthStatus ? `ML Engine Online (${healthStatus.models_loaded.length} models ready)` : 'Connecting ML...'}
              </span>
              <button onClick={checkHealth} className="text-slate-400 hover:text-emerald-700 p-0.5" title="Refresh health">
                <RefreshCw className={`w-3 h-3 ${isHealthLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100/90 px-6 py-2 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shadow-xs ${
              activeTab === 'weather'
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <CloudSnow className={`w-4 h-4 ${activeTab === 'weather' ? 'text-white' : 'text-emerald-600'}`} />
            <span>1. Weather / Blizzard (XGBoost)</span>
          </button>

          <button
            onClick={() => setActiveTab('fuel')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shadow-xs ${
              activeTab === 'fuel'
                ? 'bg-amber-600 text-white shadow-amber-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Flame className={`w-4 h-4 ${activeTab === 'fuel' ? 'text-white' : 'text-amber-600'}`} />
            <span>2. Fuel Forecast (XGBoost)</span>
          </button>

          <button
            onClick={() => setActiveTab('coldchain')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shadow-xs ${
              activeTab === 'coldchain'
                ? 'bg-teal-600 text-white shadow-teal-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <ThermometerSnowflake className={`w-4 h-4 ${activeTab === 'coldchain' ? 'text-white' : 'text-teal-600'}`} />
            <span>3. Cold-Chain (Isolation Forest)</span>
          </button>

          <button
            onClick={() => setActiveTab('sar')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shadow-xs ${
              activeTab === 'sar'
                ? 'bg-rose-600 text-white shadow-rose-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <LifeBuoy className={`w-4 h-4 ${activeTab === 'sar' ? 'text-white' : 'text-rose-600'}`} />
            <span>4a. SAR Incident Risk</span>
          </button>

          <button
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shadow-xs ${
              activeTab === 'ranking'
                ? 'bg-violet-600 text-white shadow-violet-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Award className={`w-4 h-4 ${activeTab === 'ranking' ? 'text-white' : 'text-violet-600'}`} />
            <span>4b. Asset Ranking</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white font-sans text-slate-800">

          {/* TAB 1: WEATHER / BLIZZARD RISK */}
          {activeTab === 'weather' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200">
                <div className="flex items-center space-x-2 text-xs text-teal-900 font-mono font-medium">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>XGBoost Classifier trained on multi-variate polar barometric & thermal telemetry.</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setWStation('Bharati'); setWTemp(-38); setWWind(95); setWGust(130);
                      setWPres(955); setWDPres(-6); setWVis(250); setWHum(88); setWChill(-55);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-mono font-bold rounded-lg border border-slate-300 shadow-2xs transition"
                  >
                    Preset: Severe Blizzard
                  </button>
                  <button 
                    onClick={() => {
                      setWStation('Maitri'); setWTemp(-12); setWWind(25); setWGust(35);
                      setWPres(992); setWDPres(1.2); setWVis(8000); setWHum(65); setWChill(-18);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-mono font-bold rounded-lg border border-slate-300 shadow-2xs transition"
                  >
                    Preset: Clear Weather
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Target Station</label>
                  <input
                    type="text"
                    value={wStation}
                    onChange={(e) => setWStation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Temperature (°C)</label>
                  <input
                    type="number"
                    value={wTemp}
                    onChange={(e) => setWTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Wind Speed (km/h)</label>
                  <input
                    type="number"
                    value={wWind}
                    onChange={(e) => setWWind(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Wind Gust (km/h)</label>
                  <input
                    type="number"
                    value={wGust}
                    onChange={(e) => setWGust(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Atmospheric Pressure (hPa)</label>
                  <input
                    type="number"
                    value={wPres}
                    onChange={(e) => setWPres(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Pressure Δ 3h (hPa/3h)</label>
                  <input
                    type="number"
                    value={wDPres}
                    onChange={(e) => setWDPres(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Visibility (meters)</label>
                  <input
                    type="number"
                    value={wVis}
                    onChange={(e) => setWVis(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Relative Humidity (%)</label>
                  <input
                    type="number"
                    value={wHum}
                    onChange={(e) => setWHum(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Wind Chill Index (°C)</label>
                  <input
                    type="number"
                    value={wChill}
                    onChange={(e) => setWChill(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePredictWeather}
                  disabled={wLoading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 disabled:opacity-50 transition"
                >
                  {wLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>RUN BLIZZARD PREDICTION</span>
                </button>
              </div>

              {wResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-emerald-800 uppercase flex items-center space-x-2">
                      <CloudSnow className="w-4 h-4 text-emerald-600" />
                      <span>Prediction Results for {wResult.station}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-medium">Overall Risk:</span>
                      {renderBadge(wResult.predicted_risk)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">BLIZZARD PROBABILITY</div>
                      <div className="text-xl font-bold text-emerald-700 mt-1">{wResult.blizzard_probability_pct}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">VISIBILITY RISK</div>
                      <div className="mt-1">{renderBadge(wResult.visibility_risk)}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">WIND GUST RISK</div>
                      <div className="mt-1">{renderBadge(wResult.wind_risk)}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">MODEL CONFIDENCE</div>
                      <div className="text-xl font-bold text-emerald-700 mt-1">{wResult.confidence_pct}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FUEL & INVENTORY FORECAST */}
          {activeTab === 'fuel' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center space-x-2 text-xs text-amber-900 font-mono font-medium">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>XGBoost Regressor modeling nonlinear thermal loss, generator load & equipment demand.</span>
                </div>
                <button 
                  onClick={() => {
                    setFStation('Bharati'); setFStock(72400); setFResupply(26); setFTemp(-32);
                    setFWind(60); setFPers(55); setFLoad(70); setFBliz(0); setFEquip(12);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-mono font-bold rounded-lg border border-slate-300 shadow-2xs transition"
                >
                  Preset: Normal Winter Baseline
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Station</label>
                  <input
                    type="text"
                    value={fStation}
                    onChange={(e) => setFStation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Current Stock (Liters D-10)</label>
                  <input
                    type="number"
                    value={fStock}
                    onChange={(e) => setFStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Next Resupply (Days)</label>
                  <input
                    type="number"
                    value={fResupply}
                    onChange={(e) => setFResupply(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Avg Ambient Temp (°C)</label>
                  <input
                    type="number"
                    value={fTemp}
                    onChange={(e) => setFTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Avg Wind Speed (km/h)</label>
                  <input
                    type="number"
                    value={fWind}
                    onChange={(e) => setFWind(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Station Personnel Count</label>
                  <input
                    type="number"
                    value={fPers}
                    onChange={(e) => setFPers(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Generator Load (%)</label>
                  <input
                    type="number"
                    value={fLoad}
                    onChange={(e) => setFLoad(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Blizzard Flag (0 or 1)</label>
                  <input
                    type="number"
                    value={fBliz}
                    onChange={(e) => setFBliz(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Equipment Usage (hrs/day)</label>
                  <input
                    type="number"
                    value={fEquip}
                    onChange={(e) => setFEquip(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePredictFuel}
                  disabled={fLoading}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center space-x-2 disabled:opacity-50 transition"
                >
                  {fLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>RUN FUEL CONSUMPTION FORECAST</span>
                </button>
              </div>

              {fResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-amber-800 uppercase flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-amber-600" />
                      <span>Forecast Results for {fResult.station}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-medium">Stockout Risk:</span>
                      {renderBadge(fResult.risk)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">PREDICTED DAILY BURN</div>
                      <div className="text-xl font-bold text-amber-700 mt-1">{fResult.predicted_burn_l_per_day.toLocaleString()} L/day</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">ESTIMATED EXHAUSTION</div>
                      <div className="text-xl font-bold text-indigo-700 mt-1">
                        {fResult.predicted_exhaustion_day ? `Day ${fResult.predicted_exhaustion_day}` : 'Beyond Horizon (>30d)'}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">NEXT RESUPPLY</div>
                      <div className="text-xl font-bold text-slate-900 mt-1">Day {fResult.next_resupply_in_days ?? 'N/A'}</div>
                    </div>
                  </div>

                  {/* Stock Trajectory Table */}
                  {fResult.projection && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-xs font-mono font-bold text-slate-800 uppercase">Forward Stock Projections:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                        {Object.entries(fResult.projection).map(([key, val]: [string, any]) => (
                          <div key={key} className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between items-center shadow-2xs">
                            <span className="text-slate-500 font-medium">{key.replace('_', ' ').toUpperCase()}:</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-teal-50 border border-teal-200">
                <div className="flex items-center space-x-2 text-xs text-teal-900 font-mono font-medium">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Isolation Forest trained on rolling trend volatility & slope to detect thermal degradation early.</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setCId('ICE-CORE-204'); setCTarget(-80);
                      setCStream('-80,-79,-80,-81,-80,-79,-77,-74,-70,-68');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-rose-700 text-[11px] font-mono font-bold rounded-lg border border-slate-300 shadow-2xs transition"
                  >
                    Preset: Warming Trend Breach
                  </button>
                  <button 
                    onClick={() => {
                      setCId('BIO-PLASMA-09'); setCTarget(-80);
                      setCStream('-80.1,-79.8,-80.2,-80.0,-80.1,-79.9,-80.0,-80.1');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-emerald-700 text-[11px] font-mono font-bold rounded-lg border border-slate-300 shadow-2xs transition"
                  >
                    Preset: Stable Cryo Stream
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Cargo Package ID</label>
                  <input
                    type="text"
                    value={cId}
                    onChange={(e) => setCId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Target Cryogenic Temperature (°C)</label>
                  <input
                    type="number"
                    value={cTarget}
                    onChange={(e) => setCTarget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">
                    Recent Temperature Stream (Oldest → Newest, comma separated)
                  </label>
                  <input
                    type="text"
                    value={cStream}
                    onChange={(e) => setCStream(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
                  />
                  <div className="text-[10px] text-slate-500 font-mono font-medium">
                    Must have at least 2 telemetry readings to calculate slope & rolling standard deviation.
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePredictColdchain}
                  disabled={cLoading}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-teal-600/20 flex items-center space-x-2 disabled:opacity-50 transition"
                >
                  {cLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>SCORE TEMPERATURE STREAM</span>
                </button>
              </div>

              {cResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-teal-800 uppercase flex items-center space-x-2">
                      <ThermometerSnowflake className="w-4 h-4 text-teal-600" />
                      <span>Isolation Forest Evaluation: {cResult.cargo_id}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-medium">Trend Status:</span>
                      {cResult.trend_anomaly_detected ? renderBadge('CRITICAL') : renderBadge('LOW')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">CURRENT TELEMETRY</div>
                      <div className="text-xl font-bold text-teal-700 mt-1">{cResult.current_temperature_c}°C</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">TARGET TEMP</div>
                      <div className="text-xl font-bold text-slate-900 mt-1">{cResult.target_temp_c}°C</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">ANOMALY SCORE</div>
                      <div className="text-xl font-bold text-amber-700 mt-1">{cResult.anomaly_score} / 1.0</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">EST. STEPS TO BREACH</div>
                      <div className="text-xl font-bold text-rose-700 mt-1">
                        {cResult.estimated_steps_to_breach ?? 'None (Stable)'}
                      </div>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl border font-mono text-xs ${
                    cResult.trend_anomaly_detected
                      ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                  }`}>
                    <span>Recommended Action: </span>
                    {cResult.action}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4a: SAR INCIDENT RESPONSE RISK */}
          {activeTab === 'sar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center space-x-2 text-xs text-rose-900 font-mono font-medium">
                  <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>XGBoost Classification Pipeline with OneHot categorical encoding for SAR mission friction.</span>
                </div>
                <button 
                  onClick={() => {
                    setSId('Field-Team-07'); setSDist(43); setSVis(180); setSWind(104);
                    setSTemp(-39); setSPers(6); setSFuel(70); setSContact(5); setSType('snowcat');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-mono font-bold rounded-lg border border-slate-300 shadow-2xs transition"
                >
                  Preset: Field Team 07 Distress
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Incident ID</label>
                  <input
                    type="text"
                    value={sId}
                    onChange={(e) => setSId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Distance to Target (km)</label>
                  <input
                    type="number"
                    value={sDist}
                    onChange={(e) => setSDist(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Visibility (m)</label>
                  <input
                    type="number"
                    value={sVis}
                    onChange={(e) => setSVis(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Wind Velocity (km/h)</label>
                  <input
                    type="number"
                    value={sWind}
                    onChange={(e) => setSWind(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Ambient Temp (°C)</label>
                  <input
                    type="number"
                    value={sTemp}
                    onChange={(e) => setSTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Personnel Available</label>
                  <input
                    type="number"
                    value={sPers}
                    onChange={(e) => setSPers(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Asset Fuel Tank (%)</label>
                  <input
                    type="number"
                    value={sFuel}
                    onChange={(e) => setSFuel(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Hours Since Last Radio Contact</label>
                  <input
                    type="number"
                    value={sContact}
                    onChange={(e) => setSContact(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Asset Vehicle Type</label>
                  <select
                    value={sType}
                    onChange={(e) => setSType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-medium focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
                  >
                    <option value="snowcat">Snowcat (PistenBully / Antarctic)</option>
                    <option value="helicopter">Helicopter (Airborne SAR)</option>
                    <option value="vessel">Vessel (Icebreaker / Polar)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePredictSar}
                  disabled={sLoading}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center space-x-2 disabled:opacity-50 transition"
                >
                  {sLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>ASSESS SAR INCIDENT RISK</span>
                </button>
              </div>

              {sResult && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-mono font-bold text-sm text-rose-800 uppercase flex items-center space-x-2">
                      <LifeBuoy className="w-4 h-4 text-rose-600" />
                      <span>Response Risk Analysis: {sResult.incident_id}</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 font-medium">Calculated Risk Level:</span>
                      {renderBadge(sResult.risk_level)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">CRITICAL RESPONSE RISK</div>
                        <div className="text-2xl font-black text-rose-700 mt-1">{sResult.response_risk_pct}%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">ESTIMATED RESPONSE TIME</div>
                        <div className="text-2xl font-black text-indigo-700 mt-1">{sResult.estimated_response_time_min} minutes</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
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
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900 font-mono font-medium flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
                <span>Multi-criteria asset ranking formula: Distance (30%) + Fuel (20%) + Weather Compat (30%) + Availability (20%).</span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] uppercase font-mono font-bold text-slate-700">Fleet Asset Configuration (JSON format)</label>
                <textarea
                  rows={6}
                  value={aAssetsJson}
                  onChange={(e) => setAAssetsJson(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-mono font-medium focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-2xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRankAssets}
                  disabled={aLoading}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold font-mono text-xs rounded-xl shadow-md shadow-violet-600/20 flex items-center space-x-2 disabled:opacity-50 transition"
                >
                  {aLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>RANK ASSETS FOR SAR MISSION</span>
                </button>
              </div>

              {aResult && Array.isArray(aResult) && (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-mono font-bold text-sm text-violet-800 uppercase flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Recommended Asset Dispatch Ranking</span>
                  </h3>

                  <div className="space-y-3 font-mono">
                    {aResult.map((asset: any, idx: number) => {
                      const medal = idx === 0 ? ' 1st Choice' : idx === 1 ? ' 2nd Choice' : ' 3rd Choice';
                      const isTop = idx === 0;
                      return (
                        <div
                          key={asset.name}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isTop 
                              ? 'bg-violet-50/70 border-violet-300 shadow-xs'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-white text-amber-700 border border-slate-200 shadow-2xs">
                              {medal}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{asset.name}</div>
                              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                Distance: {asset.distance_km}km · Fuel: {asset.fuel_pct}% · Weather Compat: {asset.weather_compatibility_pct}%
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {renderBadge(asset.availability)}
                            <div className="text-right">
                              <div className="text-[10px] text-slate-500 font-medium">SUITABILITY</div>
                              <div className="text-lg font-bold text-violet-700">{asset.suitability_pct}%</div>
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
