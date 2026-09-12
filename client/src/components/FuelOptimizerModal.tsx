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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase font-mono tracking-wide">
                AI Polar Thermal & Fuel Burn Optimizer
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Predictive Autonomy & Winter Resupply Planning Engine
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-white border border-slate-200 shadow-sm transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Station Selector */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-slate-700 font-bold">Target Base:</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 font-mono"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} (Stock: {(st.resources.polarDieselLiters / 1000).toFixed(0)}k L D-10)
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Simulation Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
            {/* Ambient Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Mean Winter Temp:</span>
                <span className="font-mono font-bold text-emerald-700">{winterTemp}°C</span>
              </div>
              <input
                type="range"
                min="-55"
                max="-10"
                value={winterTemp}
                onChange={(e) => setWinterTemp(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-55°C (Extreme)</span>
                <span>-10°C (Mild)</span>
              </div>
            </div>

            {/* Active Generators */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Active Gen Units:</span>
                <span className="font-mono font-bold text-indigo-700">{generators} Units</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={generators}
                onChange={(e) => setGenerators(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 (Emergency)</span>
                <span>4 (Full Load)</span>
              </div>
            </div>

            {/* Blizzard Days */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Projected Blizzards:</span>
                <span className="font-mono font-bold text-amber-700">{blizzardDays} Days</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={blizzardDays}
                onChange={(e) => setBlizzardDays(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5 Days</span>
                <span>60 Days</span>
              </div>
            </div>
          </div>

          {/* AI Forecast Result Metrics */}
          {forecast && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="text-[11px] text-slate-500 font-mono font-bold">ESTIMATED DAILY BURN</div>
                <div className="text-xl font-bold text-amber-700 font-mono mt-1">
                  {forecast.projectedDailyBurnLiters} <span className="text-xs text-slate-500 font-normal">Liters/day</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Adjusted for cold degree index</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="text-[11px] text-slate-500 font-mono font-bold">AUTONOMOUS ENDURANCE</div>
                <div className="text-xl font-bold text-emerald-700 font-mono mt-1">
                  {forecast.projectedDaysAutonomous} <span className="text-xs text-slate-500 font-normal">Days</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Without external resupply</div>
              </div>

              <div className={`p-4 rounded-2xl border shadow-sm ${
                forecast.safetyStatus === 'SAFE_AUTONOMOUS'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="text-[11px] font-mono font-bold">RESUPPLY WINDOW</div>
                <div className="text-base font-bold font-mono mt-1">
                  Day {forecast.recommendedResupplyWindowDays}
                </div>
                <div className="text-[10px] mt-0.5 font-medium">
                  {forecast.safetyStatus === 'SAFE_AUTONOMOUS' ? '✅ Full wintering survival margin' : '⚠️ Schedule early resupply'}
                </div>
              </div>
            </div>
          )}

          {/* Fuel Depletion Curve Chart */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-mono font-bold text-slate-800 uppercase mb-3 flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Projected 300-Day Winter Fuel Reserves Trajectory</span>
            </h4>

            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [`${Number(val).toLocaleString()} Liters`, 'Diesel D-10']}
                  />
                  <Area type="monotone" dataKey="fuelReserves" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#fuelGrad)" />
                  <Area type="monotone" dataKey="safetyBuffer" stroke="#e11d48" strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-2 font-medium">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-emerald-600" />
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
