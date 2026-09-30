import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Thermometer, 
  Wind, 
  Users, 
  Fuel, 
  Utensils, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ResourceData {
  name: string;
  category: 'Fuel' | 'Food' | 'O2';
  stock: number;
  unit: string;
  baseBurnPerPersonPerDay: number;
  alphaTemp: number;
  betaWind: number;
  icon: React.ElementType;
  accentColor: string;
}

export const AutonomyDerivationPanel: React.FC<{
  initialTemp?: number;
  initialWind?: number;
  initialCrew?: number;
  compact?: boolean;
}> = ({
  initialTemp = -28.5,
  initialWind = 68,
  initialCrew = 25,
  compact = false
}) => {
  // Live ambient states (default to user's exact specification: -28.5°C, 68 km/h, 25 crew)
  const [ambientTemp, setAmbientTemp] = useState<number>(initialTemp);
  const [windSpeed, setWindSpeed] = useState<number>(initialWind);
  const [crewCount, setCrewCount] = useState<number>(initialCrew);
  const [showMathDetails, setShowMathDetails] = useState<boolean>(true);

  // Preset Presets for quick mobile tapping
  const presets = [
    { label: ' Live Telemetry (-28.5°C, 68 km/h)', temp: -28.5, wind: 68, crew: 25 },
    { label: '️ Blizzard Lockdown (-42°C, 110 km/h)', temp: -42.0, wind: 110, crew: 25 },
    { label: '️ Polar Summer (-12°C, 25 km/h)', temp: -12.0, wind: 25, crew: 45 },
  ];

  // Station Stock Presets
  const [resources, setResources] = useState<ResourceData[]>([
    {
      name: 'Polar Jet A-1 / D-10 Diesel',
      category: 'Fuel',
      stock: 45000,
      unit: 'Liters',
      baseBurnPerPersonPerDay: 8.5,
      alphaTemp: 0.015,
      betaWind: 0.25,
      icon: Fuel,
      accentColor: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      name: 'High-Calorie Polar Rations',
      category: 'Food',
      stock: 2800,
      unit: 'kg',
      baseBurnPerPersonPerDay: 2.4,
      alphaTemp: 0.006,
      betaWind: 0.0,
      icon: Utensils,
      accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      name: 'Life-Support Medical O2',
      category: 'O2',
      stock: 1500,
      unit: 'kg',
      baseBurnPerPersonPerDay: 0.84,
      alphaTemp: 0.001,
      betaWind: 0.10,
      icon: Activity,
      accentColor: 'text-cyan-600 bg-cyan-50 border-cyan-200'
    }
  ]);

  const handleApplyPreset = (t: number, w: number, c: number) => {
    setAmbientTemp(t);
    setWindSpeed(w);
    setCrewCount(c);
  };

  // Step 1: Polar Wind Chill (NOAA / JAG/TI formula)
  const windChill = useMemo(() => {
    if (windSpeed < 4.8) return ambientTemp;
    const vExp = Math.pow(Math.max(0.1, windSpeed), 0.16);
    const twc = 13.12 + (0.6215 * ambientTemp) - (11.37 * vExp) + (0.3965 * ambientTemp * vExp);
    return Number(twc.toFixed(2));
  }, [ambientTemp, windSpeed]);

  // Step 2 & 3: Multipliers & Effective Burn
  const calculations = useMemo(() => {
    const deltaT = Math.max(0, 0.0 - ambientTemp);
    const windRatio = Math.max(0, windSpeed) / 50.0;

    let minDays = Infinity;
    let bottleneckCategory = '';

    const results = resources.map(res => {
      // M_weather = 1.0 + alpha * deltaT + beta * (V / V_ref)
      const multiplier = Math.max(1.0, 1.0 + (res.alphaTemp * deltaT) + (res.betaWind * windRatio));
      const dailyBurn = res.baseBurnPerPersonPerDay * crewCount * multiplier;
      const days = dailyBurn > 0 ? res.stock / dailyBurn : 0;

      if (days < minDays) {
        minDays = days;
        bottleneckCategory = res.category;
      }

      return {
        ...res,
        weatherMultiplier: Number(multiplier.toFixed(3)),
        effectiveDailyBurn: Number(dailyBurn.toFixed(2)),
        autonomyDays: Number(days.toFixed(1)),
        safetyBufferRequired: Number((dailyBurn * 90).toFixed(0)),
        reorderPoint: Number(((dailyBurn * 60) + (dailyBurn * 90)).toFixed(0))
      };
    });

    return {
      items: results,
      overallAutonomyDays: Number(minDays.toFixed(1)),
      bottleneckCategory,
      deltaT: Number(deltaT.toFixed(1)),
      windRatio: Number(windRatio.toFixed(2))
    };
  }, [ambientTemp, windSpeed, crewCount, resources]);

  return (
    <div className="glass-panel p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/95 shadow-xl space-y-4 sm:space-y-6 text-slate-800 transition-all">
      {/* Panel Top Header - Fully Flexible for Mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 sm:pb-4">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xs shrink-0">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className="text-sm sm:text-base md:text-lg font-black font-mono text-slate-900 uppercase tracking-tight">
                Polar Autonomy & Weather Derivation
              </h3>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] sm:text-[10px] font-bold border border-emerald-300">
                Live Formula Solver
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium leading-tight">
              Deterministic survival modeling with wind-chill thermal loss and Leontief bottleneck solver
            </p>
          </div>
        </div>

        <button
          onClick={() => handleApplyPreset(-28.5, 68, 25)}
          className="self-start sm:self-auto px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 transition border border-slate-300 shadow-2xs active:scale-95 cursor-pointer"
          title="Reset to ambient readings (-28.5°C, 68 km/h)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Reset Ambient Presets</span>
        </button>
      </div>

      {/* Mobile-Friendly Quick Presets Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] sm:text-[11px] font-mono">
        <span className="text-slate-400 font-bold uppercase shrink-0">Presets:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleApplyPreset(p.temp, p.wind, p.crew)}
            className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition cursor-pointer active:scale-95 ${
              ambientTemp === p.temp && windSpeed === p.wind
                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Live Ambient Readings Input Sliders (Responsive 1-col on mobile, 3-col on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
        {/* Ambient Temperature Slider */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-bold flex items-center space-x-1.5">
              <Thermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              <span>Ambient Temp (T)</span>
            </span>
            <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-300 shadow-2xs">
              {ambientTemp} °C
            </span>
          </div>
          <input
            type="range"
            min="-60"
            max="10"
            step="0.5"
            value={ambientTemp}
            onChange={(e) => setAmbientTemp(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600 touch-pan-x"
          />
          <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
            <span>-60°C</span>
            <span className="text-emerald-700 font-bold">-28.5°C (Sensor)</span>
            <span>+10°C</span>
          </div>
        </div>

        {/* Wind Speed Slider */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-bold flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
              <span>Wind Speed (V)</span>
            </span>
            <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-300 shadow-2xs">
              {windSpeed} km/h
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="1"
            value={windSpeed}
            onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 touch-pan-x"
          />
          <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
            <span>0 km/h</span>
            <span className="text-teal-700 font-bold">68 km/h (Gale)</span>
            <span>150 km/h</span>
          </div>
        </div>

        {/* Crew Headcount Slider */}
        <div className="space-y-1.5 sm:space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-bold flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
              <span>Expedition Crew</span>
            </span>
            <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-300 shadow-2xs">
              {crewCount} Personnel
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={crewCount}
            onChange={(e) => setCrewCount(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 touch-pan-x"
          />
          <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
            <span>1 Solo</span>
            <span className="text-indigo-700 font-bold">25 Station Wintering</span>
            <span>60 Max</span>
          </div>
        </div>
      </div>

      {/* Core Mathematical Model Equations Box - High-End Scientific Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1829] via-[#0f233d] to-[#0a1b2d] border border-indigo-500/30 text-white p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Calculator className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold font-mono tracking-wider text-white flex items-center gap-2">
                <span>POLAR AUTONOMY GOVERNING EQUATION</span>
              </div>
              <span className="text-[10px] text-cyan-300/80 font-mono block">
                Deterministic Multi-Factor Thermodynamic &amp; Consumable Depletion Model
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-semibold shadow-xs">
            NCPOR Operational Algorithm
          </span>
        </div>

        {/* Primary Formula Display - Polished Mathematical Fraction Layout */}
        <div className="relative z-10 py-1 flex justify-center">
          <div className="w-full max-w-2xl bg-slate-900/90 border border-indigo-400/30 rounded-xl p-3 sm:p-4 shadow-inner">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 font-mono text-center">
              
              {/* Left LHS */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-amber-300 font-extrabold text-sm sm:text-base tracking-wide">
                  Autonomy Days
                </span>
                <span className="text-slate-400 font-bold">=</span>
              </div>

              {/* Operator */}
              <div className="flex items-center gap-1 shrink-0 text-cyan-300 font-bold text-xs sm:text-sm">
                <span>min</span>
                <span className="text-[11px] text-cyan-200/70 font-sans">i ∈ &#123;Fuel, Food, O₂&#125;</span>
              </div>

              {/* Fraction Term */}
              <div className="inline-flex flex-col items-center justify-center px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/20">
                {/* Numerator */}
                <span className="text-white font-bold text-xs sm:text-sm pb-0.5 border-b border-indigo-400/50 w-full text-center">
                  Stock<sub>i</sub>
                </span>
                {/* Denominator */}
                <span className="text-slate-300 text-[11px] sm:text-xs pt-0.5 tracking-tight">
                  Burn<sub>i</sub> × Crew × M<sub>weather, i</sub>
                </span>
              </div>

            </div>

            {/* Variable Legend Chips */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                <strong className="text-slate-200">Stock<sub>i</sub>:</strong> Usable Base Inventory
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                <strong className="text-slate-200">Burn<sub>i</sub>:</strong> Base Rate / Person-Day
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <strong className="text-slate-200">M<sub>weather, i</sub>:</strong> Environmental Multiplier
              </span>
            </div>
          </div>
        </div>

        {/* Multiplier Factor Cards - 3 Themed Technical Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs font-mono relative z-10">
          
          {/* Fuel Multiplier */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-slate-900/90 to-[#1c1a14]/90 border border-amber-500/30 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-xs">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                <span>M<sub>Fuel</sub> (Thermal Heating)</span>
              </div>
              <span className="text-[9px] text-amber-400/70 uppercase">Heating &amp; Power</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-amber-500/20 text-amber-200 font-mono text-xs font-bold text-center">
              1.0 + 0.015 · ΔT + 0.25 · (V / 50)
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">
              Accounts for sub-zero heat dissipation (&Delta;T) and katabatic wind power generation.
            </p>
          </div>

          {/* Food Multiplier */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-slate-900/90 to-[#122018]/90 border border-emerald-500/30 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-emerald-300 font-bold text-xs">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                <span>M<sub>Food</sub> (Caloric Intake)</span>
              </div>
              <span className="text-[9px] text-emerald-400/70 uppercase">Metabolism</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-emerald-500/20 text-emerald-200 font-mono text-xs font-bold text-center">
              1.0 + 0.006 · ΔT
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">
              Elevates caloric requirements to sustain 4,500+ kcal daily metabolism in deep freeze.
            </p>
          </div>

          {/* O2 Multiplier */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-slate-900/90 to-[#0e212f]/90 border border-cyan-500/30 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-cyan-300 font-bold text-xs">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>M<sub>O₂</sub> (Life Support)</span>
              </div>
              <span className="text-[9px] text-cyan-400/70 uppercase">HVAC Pressure</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-cyan-500/20 text-cyan-200 font-mono text-xs font-bold text-center">
              1.0 + 0.10 · (V / 50)
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">
              Accounts for habitat hermetic sealing and high-wind ventilation overpressure.
            </p>
          </div>

        </div>
      </div>

      {/* Step-by-Step Live Derivation Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] sm:text-xs font-mono font-black uppercase text-slate-700 flex items-center space-x-1.5 sm:space-x-2">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span>Derivation Steps ({ambientTemp}°C, {windSpeed} km/h)</span>
          </h4>
          <button
            onClick={() => setShowMathDetails(!showMathDetails)}
            className="text-[10px] sm:text-[11px] font-mono text-indigo-600 font-bold flex items-center space-x-1 cursor-pointer sm:hidden"
          >
            <span>{showMathDetails ? 'Collapse' : 'Expand'}</span>
            {showMathDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showMathDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 animate-fadeIn">
            {/* Step 1 Card: Wind Chill */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-500">STEP 1</span>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px]">
                  Wind Chill Index
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-mono font-semibold text-slate-700 truncate">
                T<sub>wc</sub> = 13.12 + 0.6215(T) - 11.37(V<sup>0.16</sup>) ...
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
                <div className="text-[10px] text-slate-500">{windSpeed}<sup>0.16</sup> ≈ {(Math.pow(Math.max(0.1, windSpeed), 0.16)).toFixed(3)}</div>
                <div className="text-sm sm:text-base font-black text-teal-800 mt-0.5">
                  T<sub>wc</sub> = {windChill} °C
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                Apparent temperature drops {Math.abs(windChill - ambientTemp).toFixed(1)}°C below ambient from convective wind chill.
              </p>
            </div>

            {/* Step 2 Card: Weather Multipliers */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-500">STEP 2</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                  Weather Multipliers
                </span>
              </div>
              <div className="space-y-1 sm:space-y-1.5 font-mono text-[11px] sm:text-xs">
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-amber-50/60 border border-amber-200">
                  <span className="font-bold text-amber-900">M_Fuel</span>
                  <span className="font-black text-amber-800">
                    {calculations.items.find(i => i.category === 'Fuel')?.weatherMultiplier}x
                  </span>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <span className="font-bold text-emerald-900">M_Food</span>
                  <span className="font-black text-emerald-800">
                    {calculations.items.find(i => i.category === 'Food')?.weatherMultiplier}x
                  </span>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-cyan-50/60 border border-cyan-200">
                  <span className="font-bold text-cyan-900">M_O2</span>
                  <span className="font-black text-cyan-800">
                    {calculations.items.find(i => i.category === 'O2')?.weatherMultiplier}x
                  </span>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                Fuel burn increases by +{((calculations.items.find(i => i.category === 'Fuel')?.weatherMultiplier! - 1) * 100).toFixed(1)}% in this weather.
              </p>
            </div>

            {/* Step 3 Card: Bottleneck & Autonomy */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-500">STEP 3</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px]">
                  Leontief Minimum
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-mono font-semibold text-slate-700 truncate">
                Autonomy = min({calculations.items.map(i => `${i.autonomyDays}d`).join(', ')})
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50 border border-rose-200 font-mono text-xs">
                <div className="text-[9px] uppercase font-bold text-rose-700">Critical Bottleneck:</div>
                <div className="text-sm sm:text-base font-black text-rose-950 mt-0.5">
                  {calculations.bottleneckCategory} ({calculations.overallAutonomyDays} Days)
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                Mission autonomy is constrained by the earliest depleted critical reserve.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Resource Breakdown Cards - Responsive Grid */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <h4 className="text-[11px] sm:text-xs font-mono font-black uppercase text-slate-700">
            Per-Resource Inventory Autonomy
          </h4>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500">
            Crew: {crewCount} | {ambientTemp}°C | {windSpeed} km/h
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {calculations.items.map((res) => {
            const isBottleneck = res.category === calculations.bottleneckCategory;
            const Icon = res.icon;
            const autonomyPct = Math.min(100, Math.round((res.autonomyDays / 270) * 100));

            return (
              <div 
                key={res.category}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition shadow-xs space-y-2.5 sm:space-y-3 ${
                  isBottleneck 
                    ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-400/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${res.accentColor}`}>
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900">{res.name}</h5>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">{res.category} Reserve</span>
                    </div>
                  </div>
                  {isBottleneck && (
                    <span className="px-1.5 sm:px-2 py-0.5 rounded bg-rose-600 text-white font-mono font-bold text-[8px] sm:text-[9px] uppercase tracking-wider animate-pulse">
                      Bottleneck
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold">Current Stock</div>
                    <div className="font-black text-slate-900 text-xs sm:text-sm mt-0.5">{res.stock} {res.unit}</div>
                  </div>
                  <div className="p-2 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold">Effective Burn</div>
                    <div className="font-black text-slate-900 text-xs sm:text-sm mt-0.5">{res.effectiveDailyBurn} {res.unit}/d</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] sm:text-[11px] font-mono">
                    <span className="text-slate-600 font-bold">Autonomy:</span>
                    <span className={`font-black ${isBottleneck ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {res.autonomyDays} Days
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 sm:h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        res.autonomyDays < 90 
                          ? 'bg-rose-500' 
                          : res.autonomyDays < 180 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${autonomyPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] sm:text-[9px] font-mono text-slate-400">
                    <span>ROP: {res.reorderPoint} {res.unit}</span>
                    <span>Safety: {res.safetyBufferRequired} {res.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Banner - Stacks nicely on mobile screens */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center space-x-2.5 sm:space-x-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[11px] sm:text-xs font-mono font-bold text-emerald-950 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>MISSION WINTERING AUTONOMY</span>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono">
                {calculations.overallAutonomyDays} DAYS
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-800 mt-0.5 leading-tight font-medium">
              Live conditions (-28.5°C, 68 km/h) actively modeled. Limiting factor: {calculations.bottleneckCategory}.
            </p>
          </div>
        </div>

        <div className="sm:text-right font-mono text-xs border-t sm:border-t-0 border-emerald-200 pt-2 sm:pt-0">
          <div className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold">Wintering Status</div>
          <div className={`font-black text-xs sm:text-sm ${
            calculations.overallAutonomyDays >= 270 
              ? 'text-emerald-700' 
              : calculations.overallAutonomyDays >= 180 
                ? 'text-amber-700' 
                : 'text-rose-700'
          }`}>
            {calculations.overallAutonomyDays >= 270 
              ? ' OPTIMAL RESERVE' 
              : calculations.overallAutonomyDays >= 180 
                ? '️ WARNING BUFFER ACTIVE' 
                : ' CRITICAL STOCK ALERT'}
          </div>
        </div>
      </div>
    </div>
  );
};
