import React, { useState, useEffect } from 'react';
import { Station } from '../types';
import { api } from '../services/api';
import { 
  Flame, 
  Cpu, 
  Sliders, 
  Thermometer, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Calendar, 
  TrendingDown 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface FuelOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
}

export const FuelOptimizerModal: React.FC<FuelOptimizerModalProps> = ({
  isOpen,
  onClose,
  stations
}) => {
  if (!isOpen) return null;

  const [selectedStationId, setSelectedStationId] = useState(stations[0]?.id || 'stn-bharati');
  const [winterTemp, setWinterTemp] = useState(-34);
  const [generators, setGenerators] = useState(2);
  const [blizzardDays, setBlizzardDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<any>(null);

  const selectedStation = stations.find(s => s.id === selectedStationId);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data = await api.getFuelForecast({
        stationId: selectedStationId,
        avgWinterTempC: winterTemp,
        generatorCount: generators,
        blizzardDaysEstimated: blizzardDays
      });
      setForecast(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedStationId, winterTemp, generators, blizzardDays]);

  // Generate 12-month projection curve data for Recharts
  const currentStock = selectedStation?.resources.polarDieselLiters || 180000;
  const dailyBurn = forecast?.projectedDailyBurnLiters || 580;

  const projectionData = Array.from({ length: 10 }, (_, i) => {
    const monthName = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i];
    const daysElapsed = i * 30;
    const remaining = Math.max(0, currentStock - (daysElapsed * dailyBurn));
    return {
      month: monthName,
      fuelReserves: remaining,
      safetyBuffer: 80000 // Min safety threshold
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-polar-950 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl polar-glow">
        {/* Header */}
        <div className="bg-gradient-to-r from-polar-900 to-polar-850 px-6 py-4 flex items-center justify-between border-b border-cyan-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-600/20 border border-cyan-500/50 text-cyan-300">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 uppercase font-mono tracking-wide">
                AI Polar Thermal & Fuel Burn Optimizer
              </h2>
              <p className="text-xs text-slate-400">
                Predictive Autonomy & Winter Resupply Planning Engine
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-polar-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Station Selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-slate-300">Target Base:</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-polar-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} (Stock: {(st.resources.polarDieselLiters / 1000).toFixed(0)}k L D-10)
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Simulation Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-polar-900/70 border border-slate-800">
            {/* Ambient Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Mean Winter Temp:</span>
                <span className="font-mono font-bold text-cyan-400">{winterTemp}°C</span>
              </div>
              <input
                type="range"
                min="-55"
                max="-10"
                value={winterTemp}
                onChange={(e) => setWinterTemp(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>-55°C (Extreme)</span>
                <span>-10°C (Mild)</span>
              </div>
            </div>

            {/* Active Generators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Power Gen Units:</span>
                <span className="font-mono font-bold text-cyan-400">{generators} Units</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={generators}
                onChange={(e) => setGenerators(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Emergency)</span>
                <span>4 (Full Lab Load)</span>
              </div>
            </div>

            {/* Blizzard Days */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Projected Blizzard Days:</span>
                <span className="font-mono font-bold text-cyan-400">{blizzardDays} Days</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={blizzardDays}
                onChange={(e) => setBlizzardDays(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5 Days</span>
                <span>60 Days</span>
              </div>
            </div>
          </div>

          {/* AI Forecast Result Metrics */}
          {forecast && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-polar-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">ESTIMATED DAILY BURN</div>
                <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                  {forecast.projectedDailyBurnLiters} <span className="text-xs text-slate-400">Liters/day</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Adjusted for cold degree index</div>
              </div>

              <div className="p-3.5 rounded-xl bg-polar-900 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-mono">AUTONOMOUS ENDURANCE</div>
                <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
                  {forecast.projectedDaysAutonomous} <span className="text-xs text-slate-400">Days</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Without external resupply</div>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                forecast.safetyStatus === 'SAFE_AUTONOMOUS'
                  ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-200'
                  : 'bg-amber-950/70 border-amber-600/60 text-amber-200'
              }`}>
                <div className="text-[11px] font-mono">RESUPPLY WINDOW</div>
                <div className="text-base font-bold font-mono mt-1">
                  Day {forecast.recommendedResupplyWindowDays}
                </div>
                <div className="text-[10px] mt-0.5 opacity-80">
                  {forecast.safetyStatus === 'SAFE_AUTONOMOUS' ? '✅ Full wintering survival margin' : '⚠️ Schedule early resupply'}
                </div>
              </div>
            </div>
          )}

          {/* Fuel Depletion Curve Chart */}
          <div className="p-4 rounded-xl bg-polar-900/90 border border-slate-800">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <span>Projected 300-Day Winter Fuel Reserves Trajectory</span>
            </h4>

            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1628', borderColor: '#38bdf8', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} Liters`, 'Diesel D-10']}
                  />
                  <Area type="monotone" dataKey="fuelReserves" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#fuelGrad)" />
                  <Area type="monotone" dataKey="safetyBuffer" stroke="#f43f5e" strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-cyan-400" />
                <span>Projected Fuel Stock (Liters)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed" />
                <span>Safety Emergency Reserve Line (80,000 L)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
