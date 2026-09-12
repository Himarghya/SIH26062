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
    <div className="min-h-screen bg-[#040813] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden relative">
      {/* Background Aurora Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-aurora" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] animate-aurora" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[500px] bg-emerald-500/08 rounded-full blur-[150px] animate-aurora" style={{ animationDelay: '5s' }} />
      </div>

      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-cyan-900/40 bg-polar-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/30 text-lg polar-glow-cyan">
            🧊
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-wider text-slate-100 gradient-text-cyan">
                POLARIS
              </span>
              <span className="text-[10px] text-cyan-300 font-mono uppercase bg-cyan-950/90 px-2 py-0.5 rounded-full border border-cyan-700/60 font-bold">
                v2.6 SIH-26062
              </span>
            </div>
            <span className="block text-[9px] text-slate-400 font-mono uppercase tracking-widest">
              NCPOR • Ministry of Earth Sciences (Goa)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition transform hover:-translate-y-0.5"
          >
            <span>Launch Mission Control</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Live Polar Station Status Ticker */}
      <div className="bg-polar-900/90 border-b border-slate-800/80 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono z-10">
        <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="uppercase font-bold text-slate-300">Live Station Telemetry:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-polar-950 border border-slate-800">
            <span className="text-cyan-300 font-bold">Bharati (Antarctica):</span>
            <span className="text-slate-300">-28.4°C</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">NORMAL</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-polar-950 border border-slate-800">
            <span className="text-cyan-300 font-bold">Maitri (Antarctica):</span>
            <span className="text-slate-300">-34.1°C</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400">STAGE-1 ADVISORY</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-polar-950 border border-slate-800">
            <span className="text-emerald-300 font-bold">Himadri (Arctic):</span>
            <span className="text-slate-300">-12.8°C</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">NORMAL</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-6xl mx-auto text-center space-y-6 z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-inner shadow-cyan-500/20">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Integrated Polar Expedition Logistics & Asset Management System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-100 uppercase font-sans leading-none">
          Command The Extremes. <br />
          <span className="gradient-text-aurora">
            Zero-Trust. Zero-Loss.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base leading-relaxed font-normal">
          A unified operational command center for India’s research stations in Antarctica (<em className="text-cyan-300 not-italic font-semibold">Bharati</em>, <em className="text-cyan-300 not-italic font-semibold">Maitri</em>) and the Arctic (<em className="text-cyan-300 not-italic font-semibold">Himadri</em>, <em className="text-cyan-300 not-italic font-semibold">IndARC</em>). Engineered with offline-first satellite synchronization, cryptographic SHA-256 audit trails, and multi-factor route risk intelligence.
        </p>

        {/* CTA Group */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm flex items-center space-x-2.5 shadow-xl shadow-cyan-500/30 transition transform hover:-translate-y-1"
          >
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#capabilities"
            className="px-6 py-3.5 rounded-2xl bg-polar-900/80 hover:bg-polar-850 border border-cyan-800/60 text-slate-200 text-sm font-semibold transition backdrop-blur-md"
          >
            Explore Technical Capabilities
          </a>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="capabilities" className="px-6 py-12 max-w-6xl mx-auto space-y-8 z-10">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-black font-mono uppercase text-slate-100 gradient-text-cyan">
            Mission-Critical Polar Capabilities
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Designed for sub-zero isolation, 2.4 kbps narrowband satellite uplinks, and harsh wintering autonomy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel-interactive p-6 rounded-2xl space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md">
              <Compass className="w-6 h-6 group-hover:rotate-45 transition duration-300" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Decision-Support GIS Map</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time OpenStreetMap integration with multi-factor route risk assessment (67/100 High Risk corridors) and PostGIS proximity asset searching (<code className="text-cyan-300">ST_DWithin 50km</code>).
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-2xl space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-md">
              <Box className="w-6 h-6 group-hover:scale-110 transition duration-300" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Cold-Chain IoT & Custody</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Continuous temperature tracking for -80°C biological ice core specimens with duration-aware violation logic, sensor heartbeat health, and optical QR custody handover logging.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 rounded-2xl space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-md">
              <ShieldAlert className="w-6 h-6 group-hover:animate-pulse transition duration-300" />
            </div>
            <h3 className="font-bold text-base text-slate-100">8-Stage Emergency SAR</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Formal incident escalation state machine with automated unaccounted personnel muster auto-escalation and VHF/HF/Iridium emergency communication packages.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-6 border-t border-cyan-900/30 bg-polar-950/80 backdrop-blur-md text-center text-xs text-slate-500 font-mono z-10">
        POLARIS • National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences (MoES), Government of India
      </footer>
    </div>
  );
};

