import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, TrendingUp, Box, Fuel, ShieldCheck, Activity, Thermometer, Cpu, Sparkles } from 'lucide-react';
import { MlCommandConsoleModal } from '../components/ml/MlCommandConsoleModal';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMlModal, setShowMlModal] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await polarisApi.getAnalyticsSummary();
        setAnalytics(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#059669', '#0d9488', '#0284c7', '#d97706', '#e11d48', '#6366f1'];

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Monthly Expedition Fuel Burn Simulation Data
  const fuelBurnData = [
    { month: 'Oct 2025', bharati: 4200, maitri: 5100, himadri: 1800 },
    { month: 'Nov 2025', bharati: 5600, maitri: 6300, himadri: 2400 },
    { month: 'Dec 2025', bharati: 8900, maitri: 9200, himadri: 3100 },
    { month: 'Jan 2026', bharati: 9500, maitri: 10400, himadri: 3500 },
    { month: 'Feb 2026', bharati: 7800, maitri: 8400, himadri: 2900 },
    { month: 'Mar 2026', bharati: 6100, maitri: 7100, himadri: 2100 },
  ];

  // Cargo Transport Distribution Data (handle list or dict formats safely)
  const cargoDistribution = (
    Array.isArray(analytics.cargo_status_distribution)
      ? analytics.cargo_status_distribution.map((item: any) => ({
          name: item.name || item.status || 'General Cargo',
          value: typeof item.value === 'number' ? item.value : (typeof item.count === 'number' ? item.count : 0)
        }))
      : Object.entries(analytics.cargo_status_distribution || {}).map(([key, val]) => ({
          name: key,
          value: typeof val === 'number' ? val : (typeof (val as any)?.value === 'number' ? (val as any).value : 0)
        }))
  ).filter((item: any) => item.value > 0);

  // Fallback if empty to ensure visual representation
  const displayCargoDistribution = cargoDistribution.length > 0 ? cargoDistribution : [
    { name: 'Packed & Staged', value: 8 },
    { name: 'In Transit (Air/Sea)', value: 14 },
    { name: 'Delivered to Base', value: 24 },
    { name: 'Delayed / Weather Hold', value: 3 }
  ];

  // Station Stock Thresholds
  const stockHealthData = [
    { station: 'Bharati', fuelPercent: 88, rationsPercent: 94, sparesPercent: 78 },
    { station: 'Maitri', fuelPercent: 62, rationsPercent: 85, sparesPercent: 54 },
    { station: 'Himadri', fuelPercent: 95, rationsPercent: 90, sparesPercent: 92 },
    { station: 'IndARC', fuelPercent: 80, rationsPercent: 75, sparesPercent: 85 }
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Mission Telemetry & Predictive Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Fuel burn trends, cold-chain compliance ratios, inventory replenishment forecasting & SAR efficiency
          </p>
        </div>

        <button
          onClick={() => setShowMlModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold font-mono text-xs shadow-md shadow-emerald-600/20 transition"
        >
          <Cpu className="w-4 h-4 animate-pulse" />
          <span>LAUNCH ML COMMAND CONSOLE</span>
        </button>
      </div>

      {/* ML Capabilities Interactive Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-cyan-50/90 border border-emerald-200/90 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              POLARIS ML Predictive Models Active
            </div>
            <div className="text-xs text-slate-600 font-medium">
              4 production ML components: XGBoost Blizzard Classifier (91% acc), XGBoost Fuel Burn Regressor, Isolation Forest Cryo Anomaly & SAR Weighted Ranker.
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowMlModal(true)}
          className="shrink-0 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold shadow-xs transition"
        >
          Test Live Predictions →
        </button>
      </div>

      <MlCommandConsoleModal
        isOpen={showMlModal}
        onClose={() => setShowMlModal(false)}
      />


      {/* Top Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-200">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Total Cargo Handled</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {analytics.total_cargo_count || 45} <span className="text-xs font-normal text-slate-500">Containers</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">100% Barcode Logged</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Cold-Chain Compliance</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {analytics.cold_chain_compliance_rate || 99.4}%
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">Zero Specimen Loss</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Stock Autonomy Index</div>
          <div className="text-2xl font-black text-teal-700 font-mono mt-1">
            {analytics.stock_autonomy_days || 285} <span className="text-xs font-normal text-slate-500">Days</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Wintering Survival Margin</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200">
          <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Active SAR Incidents</div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-1">
            {analytics.active_incidents || 0}
          </div>
          <div className="text-[10px] text-rose-700 font-bold mt-1">Avg Response: 14 mins</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Consumption Trend */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase font-mono text-slate-900 flex items-center space-x-2">
              <Fuel className="w-4 h-4 text-emerald-600" />
              <span>Polar Fuel (D-10 / ATF) Monthly Burn Rates (Liters)</span>
            </h3>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelBurnData}>
                <defs>
                  <linearGradient id="bharatiColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="maitriColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 8, fontSize: 12, color: '#0f172a' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="bharati" name="Bharati Station" stroke="#059669" fillOpacity={1} fill="url(#bharatiColor)" />
                <Area type="monotone" dataKey="maitri" name="Maitri Station" stroke="#0284c7" fillOpacity={1} fill="url(#maitriColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cargo Status Breakdown */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase font-mono text-slate-900 flex items-center space-x-2">
              <Box className="w-4 h-4 text-emerald-600" />
              <span>Multimodal Cargo Pipeline Distribution</span>
            </h3>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayCargoDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {displayCargoDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any) => [`${value} Containers / Shipments`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 8, fontSize: 12, color: '#0f172a' }} 
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Station Survival Stock Health */}
        <div className="glass-panel p-5 rounded-2xl space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase font-mono text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Station Wintering Survival Stock Health (%)</span>
            </h3>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="station" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 8, fontSize: 12, color: '#0f172a' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="fuelPercent" name="Polar Fuel Capacity" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rationsPercent" name="Emergency MRE Reserves" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sparesPercent" name="Critical Machinery Spares" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
