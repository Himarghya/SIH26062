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
  Info
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

  // Reset to live ambient sensor preset
  const handleResetToLive = () => {
    setAmbientTemp(-28.5);
    setWindSpeed(68);
    setCrewCount(25);
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
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white/95 shadow-xl space-y-6 text-slate-800">
      {/* Panel Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black font-mono text-slate-900 uppercase tracking-tight">
                Polar Autonomy & Weather Multiplier Derivation Model
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-300">
                Live Formula Solver
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Deterministic survival modeling with wind-chill thermal loss and Leontief minimum resource bottlenecking
            </p>
          </div>
        </div>

        <button
          onClick={handleResetToLive}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center space-x-1.5 transition border border-slate-300 shadow-2xs cursor-pointer"
          title="Reset to ambient readings (-28.5°C, 68 km/h)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Reset Ambient Presets</span>
        </button>
      </div>

      {/* Live Ambient Readings Input Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
        {/* Ambient Temperature Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-bold flex items-center space-x-1.5">
              <Thermometer className="w-4 h-4 text-rose-600" />
              <span>Ambient Temp (T)</span>
            </span>
            <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-300">
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
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>-60°C (Extreme)</span>
            <span className="text-emerald-700 font-bold">-28.5°C (Sensor Live)</span>
            <span>+10°C (Summer)</span>
          </div>
        </div>

        {/* Wind Speed Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-bold flex items-center space-x-1.5">
              <Wind className="w-4 h-4 text-teal-600" />
              <span>Wind Speed (V)</span>
            </span>
            <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-300">
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
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0 km/h (Calm)</span>
            <span className="text-teal-700 font-bold">68 km/h (Gale/Storm)</span>
            <span>150 km/h (Blizzard)</span>
          </div>
        </div>

        {/* Crew Headcount Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 font-bold flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Expedition Crew</span>
            </span>
            <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-300">
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
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>1 Solo</span>
            <span className="text-indigo-700 font-bold">25 Station Wintering</span>
            <span>60 Full Base</span>
          </div>
        </div>
      </div>

      {/* Core Mathematical Model Equations Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white font-mono space-y-3 shadow-lg">
        <div className="flex items-center justify-between text-xs text-indigo-300 font-bold border-b border-slate-700 pb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>MATHEMATICAL MODEL: POLAR WINTERING AUTONOMY</span>
          </div>
          <span className="text-[10px] text-slate-400">NCPOR Standard Ops Model</span>
        </div>

        {/* Primary Formula Display */}
        <div className="py-2 overflow-x-auto text-center">
          <div className="inline-block px-4 py-2 rounded-xl bg-slate-950/60 border border-indigo-500/30 text-amber-300 font-mono text-sm sm:text-base font-black tracking-wide">
            Autonomy Days = min<sub>i ∈ {'{Fuel, Food, O₂}'}</sub> 
            <span className="mx-2 text-white">
              [ Current Stock<sub>i</sub> / (Daily Burn<sub>i</sub> × Crew × Weather Multiplier<sub>i</sub>) ]
            </span>
          </div>
        </div>

        {/* Multiplier Sub-equations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 text-slate-300">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-amber-400 font-bold">M_Fuel:</span> 1.0 + 0.015·ΔT + 0.25·(V/50)
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-emerald-400 font-bold">M_Food:</span> 1.0 + 0.006·ΔT
          </div>
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-cyan-400 font-bold">M_O2:</span> 1.0 + 0.10·(V/50)
          </div>
        </div>
      </div>

      {/* Step-by-Step Live Derivation Cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-black uppercase text-slate-700 flex items-center space-x-2">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>Step-by-Step Live Numerical Derivation (Evaluated at T = {ambientTemp}°C, V = {windSpeed} km/h)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 Card: Wind Chill */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-500">STEP 1</span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px]">
                Wind Chill Index
              </span>
            </div>
            <div className="text-xs font-mono font-semibold text-slate-700">
              T<sub>wc</sub> = 13.12 + 0.6215(T) - 11.37(V<sup>0.16</sup>) + 0.3965(T)(V<sup>0.16</sup>)
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
              <div className="text-[11px] text-slate-500">68<sup>0.16</sup> ≈ 1.9645</div>
              <div className="text-base font-black text-teal-800 mt-1">
                T<sub>wc</sub> = {windChill} °C
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Thermal dissipation increases {Math.abs(windChill - ambientTemp).toFixed(1)}°C below ambient, intensifying convective heat loss.
            </p>
          </div>

          {/* Step 2 Card: Weather Multipliers */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-500">STEP 2</span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                Weather Multipliers
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center p-1.5 rounded-lg bg-amber-50/60 border border-amber-200">
                <span className="font-bold text-amber-900">Fuel Multiplier (M_fuel)</span>
                <span className="font-black text-amber-800">
                  {calculations.items.find(i => i.category === 'Fuel')?.weatherMultiplier}x
                </span>
              </div>
              <div className="flex justify-between items-center p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <span className="font-bold text-emerald-900">Food Multiplier (M_food)</span>
                <span className="font-black text-emerald-800">
                  {calculations.items.find(i => i.category === 'Food')?.weatherMultiplier}x
                </span>
              </div>
              <div className="flex justify-between items-center p-1.5 rounded-lg bg-cyan-50/60 border border-cyan-200">
                <span className="font-bold text-cyan-900">O₂ Multiplier (M_O2)</span>
                <span className="font-black text-cyan-800">
                  {calculations.items.find(i => i.category === 'O2')?.weatherMultiplier}x
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Fuel burn surges by +{((calculations.items.find(i => i.category === 'Fuel')?.weatherMultiplier! - 1) * 100).toFixed(1)}% due to gale convection.
            </p>
          </div>

          {/* Step 3 Card: Bottleneck & Autonomy */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-500">STEP 3</span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-[10px]">
                Leontief Minimum
              </span>
            </div>
            <div className="text-xs font-mono font-semibold text-slate-700">
              Autonomy = min({calculations.items.map(i => `${i.autonomyDays}d`).join(', ')})
            </div>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 font-mono text-xs">
              <div className="text-[10px] uppercase font-bold text-rose-700">Critical Bottleneck:</div>
              <div className="text-base font-black text-rose-950 mt-0.5">
                {calculations.bottleneckCategory} ({calculations.overallAutonomyDays} Days)
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Station operational lifetime is strictly constrained by the single most depleted survival stock.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Resource Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-black uppercase text-slate-700">
            Per-Resource Inventory Autonomy & Depletion Rate
          </h4>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            Crew: {crewCount} | Temp: {ambientTemp}°C | Wind: {windSpeed} km/h
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {calculations.items.map((res) => {
            const isBottleneck = res.category === calculations.bottleneckCategory;
            const Icon = res.icon;
            const autonomyPct = Math.min(100, Math.round((res.autonomyDays / 270) * 100));

            return (
              <div 
                key={res.category}
                className={`p-4 rounded-2xl border transition shadow-xs space-y-3 ${
                  isBottleneck 
                    ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-400/20' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-xl border ${res.accentColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{res.name}</h5>
                      <span className="text-[10px] text-slate-500 font-mono">{res.category} Reserve</span>
                    </div>
                  </div>
                  {isBottleneck && (
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider animate-pulse">
                      Bottleneck
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Current Stock</div>
                    <div className="font-black text-slate-900 text-sm mt-0.5">{res.stock} {res.unit}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Effective Burn</div>
                    <div className="font-black text-slate-900 text-sm mt-0.5">{res.effectiveDailyBurn} {res.unit}/d</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-600 font-bold">Autonomy:</span>
                    <span className={`font-black ${isBottleneck ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {res.autonomyDays} Days
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
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
                  <div className="flex justify-between text-[9px] font-mono text-slate-400">
                    <span>ROP: {res.reorderPoint} {res.unit}</span>
                    <span>Safety Stock: {res.safetyBufferRequired} {res.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-slate-900 flex items-center space-x-2">
              <span>OVERALL MISSION WINTERING AUTONOMY</span>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono">
                {calculations.overallAutonomyDays} DAYS
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Current environment (-28.5°C, 68 km/h) requires active thermal preservation. Fuel resupply priority: High.
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <div className="text-slate-500 text-[10px] uppercase font-bold">Wintering Status</div>
          <div className={`font-black text-sm ${
            calculations.overallAutonomyDays >= 270 
              ? 'text-emerald-700' 
              : calculations.overallAutonomyDays >= 180 
                ? 'text-amber-700' 
                : 'text-rose-700'
          }`}>
            {calculations.overallAutonomyDays >= 270 
              ? '✅ OPTIMAL POLAR RESERVE' 
              : calculations.overallAutonomyDays >= 180 
                ? '⚠️ WARNING BUFFER ACTIVE' 
                : '🚨 CRITICAL STOCK ALERT'}
          </div>
        </div>
      </div>
    </div>
  );
};
