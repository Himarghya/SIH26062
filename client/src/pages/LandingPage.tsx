import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Compass, 
  Box, 
  Anchor, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  Cpu,
  Thermometer,
  Wind,
  Wifi,
  Activity,
  Layers,
  Sparkles,
  QrCode,
  Lock,
  BarChart3,
  Server
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white overflow-x-hidden relative">
      {/* Background Aurora Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-aurora" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] animate-aurora" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] animate-aurora" style={{ animationDelay: '5s' }} />
      </div>

      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/25 text-xl">
            🧊
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-wider text-slate-900 font-mono">
                POLARIS
              </span>
              <span className="text-[10px] text-emerald-700 font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300 font-bold">
                SIH-26062 • MoES
              </span>
            </div>
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest font-semibold">
              NCPOR • Ministry of Earth Sciences (Goa)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/pwa"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">Field PWA</span>
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition transform hover:-translate-y-0.5"
          >
            <span>Mission Control</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Live Polar Station Status Ticker */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono z-10 shadow-inner">
        <div className="flex items-center space-x-2 text-slate-600 text-[11px]">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="uppercase font-bold text-slate-700">Live Station Telemetry:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-sm">
            <span className="text-emerald-700 font-bold">Bharati (Antarctica):</span>
            <span className="text-slate-800 font-bold">-28.4°C</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-bold">NORMAL</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-sm">
            <span className="text-indigo-700 font-bold">Maitri (Antarctica):</span>
            <span className="text-slate-800 font-bold">-34.1°C</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-600 font-bold">STAGE-1 ADVISORY</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-sm">
            <span className="text-teal-700 font-bold">Himadri (Arctic):</span>
            <span className="text-slate-800 font-bold">-12.8°C</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-bold">NORMAL</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-14 md:py-20 max-w-6xl mx-auto text-center space-y-6 z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold shadow-sm">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Integrated Logistics & Supply Chain Management for Polar Research Stations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 uppercase font-sans leading-none">
          POLARIS <br />
          <span className="gradient-text-aurora">
            Offline-First Polar Command
          </span>
        </h1>

        <p className="max-w-3xl mx-auto text-slate-600 text-sm md:text-base leading-relaxed font-normal">
          An offline-first polar logistics command platform that eliminates winter isolation risks, transforms real-time ambient telemetry and supply chain data into predictive life-support autonomy forecasts and continuous cryogenic cold-chain monitoring for Indian polar research stations (<strong>Bharati</strong>, <strong>Maitri</strong>, <strong>Himadri</strong>).
        </p>

        {/* Prototype Verification Callout */}
        <div className="inline-block bg-cyan-50 border border-cyan-300 px-4 py-2 rounded-2xl text-xs font-mono font-bold text-cyan-900">
          ✨ Fully functional prototype, verified across all 5 core operational modules.
        </div>

        {/* CTA Group */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm flex items-center space-x-2.5 shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-1"
          >
            <span>Launch Commander Desktop</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/pwa"
            className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold transition shadow-sm hover:shadow flex items-center space-x-2"
          >
            <QrCode className="w-4 h-4 text-cyan-600" />
            <span>Open Field Operator PWA</span>
          </Link>
        </div>
      </section>

      {/* 6 Core Platform Pillars Grid */}
      <section className="px-6 py-8 max-w-6xl mx-auto space-y-6 z-10">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-black font-mono uppercase text-slate-900 gradient-text-aurora">
            Core Architecture Pillars
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Designed for sub-zero isolation, 2.4 kbps narrowband satellite uplinks, and harsh wintering autonomy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Pillar 1 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2.5 border border-slate-200 hover:border-emerald-400 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">5-Module Polar Command</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Weather, cargo, crew, SAR, and polar mapping — unified in one responsive real-time command dashboard.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2.5 border border-slate-200 hover:border-cyan-400 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-300 flex items-center justify-center text-cyan-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">4-Model AI Suite</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              XGBoost storm predictor, LSTM fuel burn regressor (R²=0.94), Random Forest cryo detector, and multicriteria SAR rescue scoring.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2.5 border border-slate-200 hover:border-indigo-400 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-300 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">6 Role-Based Workspaces</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dedicated dashboards for Super Admin, Expedition Leader, Logistics Officer, Station Manager, SAR Coordinator, and Analyst.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2.5 border border-slate-200 hover:border-amber-400 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">What-If Expedition Planner</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic scenario simulations computing multi-resource Leontief survival curves across Fuel, Food & O₂ stockpiles.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2.5 border border-slate-200 hover:border-teal-400 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-300 flex items-center justify-center text-teal-600">
              <Wifi className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Offline 2.4 kbps Sat-Sync</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compact JSON patch delta synchronization over Iridium SBD and S-band links with local IndexedDB/SQLite offline buffers.
            </p>
          </div>

          {/* Pillar 6 */}
          <div className="glass-panel p-5 rounded-2xl space-y-2.5 border border-slate-200 hover:border-rose-400 transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-center text-rose-600">
              <Thermometer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">9-Stage Cold-Chain Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prevents thermal excursions across the 9-stage multimodal journey from Goa Logistics Port to Antarctic -80°C subglacial cryo vaults.
            </p>
          </div>

        </div>
      </section>

      {/* "WHY WE STAND OUT?" Section */}
      <section className="px-6 py-10 max-w-6xl mx-auto space-y-6 z-10">
        <div className="text-center space-y-1">
          <span className="px-3 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded-full uppercase tracking-wider">
            Competitive Edge
          </span>
          <h2 className="text-2xl font-black font-mono uppercase text-slate-900 mt-2">
            Why We Stand Out?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-sm">
              ⚛️
            </div>
            <h4 className="font-bold text-xs text-slate-900">Physics & Leontief Autonomy</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Solves multi-resource bottleneck (Fuel/Food/O₂) with live NOAA wind chill multipliers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              📡
            </div>
            <h4 className="font-bold text-xs text-slate-900">Offline-First Resilience</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Full IndexedDB mutation buffer & 2.4 kbps Iridium SBD micro-delta sync.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
              🛡️
            </div>
            <h4 className="font-bold text-xs text-slate-900">Deterministic SAR Engine</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              8-stage rapid rescue escalation ranking helicopter vs snowcat in seconds.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-300 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
              🔐
            </div>
            <h4 className="font-bold text-xs text-slate-900">Tamper-Evident SHA-256 Ledger</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cryptographic audit trail for supply adjustments and Antarctic treaty compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-6 border-t border-slate-200 bg-white/80 backdrop-blur-md text-center text-xs text-slate-500 font-mono z-10 flex flex-wrap items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        <div>POLARIS • National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences (MoES)</div>
        <div className="flex items-center space-x-3">
          <Link to="/pwa" className="underline hover:text-slate-800 font-bold">Field PWA Mode</Link>
          <Link to="/login" className="underline hover:text-slate-800 font-bold">Commander Desktop</Link>
        </div>
      </footer>
    </div>
  );
};
