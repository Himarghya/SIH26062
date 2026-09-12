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
  Sparkles
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
                v2.6 SIH-26062
              </span>
            </div>
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-widest font-semibold">
              NCPOR • Ministry of Earth Sciences (Goa)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition transform hover:-translate-y-0.5"
          >
            <span>Launch Mission Control</span>
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
      <section className="relative px-6 py-16 md:py-24 max-w-6xl mx-auto text-center space-y-6 z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold shadow-sm">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Integrated Polar Expedition Logistics & Asset Management System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 uppercase font-sans leading-none">
          Command The Extremes. <br />
          <span className="gradient-text-aurora">
            Zero-Trust. Zero-Loss.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-600 text-sm md:text-base leading-relaxed font-normal">
          A unified operational command center for India’s research stations in Antarctica (<em className="text-emerald-700 not-italic font-bold">Bharati</em>, <em className="text-emerald-700 not-italic font-bold">Maitri</em>) and the Arctic (<em className="text-indigo-700 not-italic font-bold">Himadri</em>, <em className="text-indigo-700 not-italic font-bold">IndARC</em>). Engineered with offline-first satellite synchronization, cryptographic SHA-256 audit trails, and multi-factor route risk intelligence.
        </p>

        {/* CTA Group */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-sm flex items-center space-x-2.5 shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-1"
          >
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#capabilities"
            className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold transition shadow-sm hover:shadow"
          >
            Explore Technical Capabilities
          </a>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="capabilities" className="px-6 py-12 max-w-6xl mx-auto space-y-8 z-10">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-black font-mono uppercase text-slate-900 gradient-text-aurora">
            Mission-Critical Polar Capabilities
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Designed for sub-zero isolation, 2.4 kbps narrowband satellite uplinks, and harsh wintering autonomy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-400 hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-sm">
              <Compass className="w-6 h-6 group-hover:rotate-45 transition duration-300" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Decision-Support GIS Map</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time multi-layer polar projection integration with multi-factor route risk assessment (67/100 High Risk corridors) and PostGIS proximity asset searching (<code className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">ST_DWithin 50km</code>).
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-400 hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-300 flex items-center justify-center text-indigo-600 shadow-sm">
              <Box className="w-6 h-6 group-hover:scale-110 transition duration-300" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Cold-Chain IoT & Custody</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Continuous temperature tracking for -80°C biological ice core specimens with duration-aware violation logic, sensor heartbeat health, and optical QR custody handover logging.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-rose-400 hover:shadow-xl transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-center text-rose-600 shadow-sm">
              <ShieldAlert className="w-6 h-6 group-hover:animate-pulse transition duration-300" />
            </div>
            <h3 className="font-bold text-base text-slate-900">8-Stage Emergency SAR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Formal incident escalation state machine with automated unaccounted personnel muster auto-escalation and VHF/HF/Iridium emergency communication packages.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-6 border-t border-slate-200 bg-white/80 backdrop-blur-md text-center text-xs text-slate-500 font-mono z-10">
        POLARIS • National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences (MoES), Government of India
      </footer>
    </div>
  );
};

