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
  Cpu 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-polar-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-polar-950">
      {/* Top Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-cyan-900/40 bg-polar-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/20 text-base">
            🧊
          </div>
          <div>
            <span className="font-black text-base tracking-wider text-slate-100 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              POLARIS
            </span>
            <span className="ml-2 text-[10px] text-cyan-400 font-mono uppercase bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
              NCPOR • MoES
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-28 max-w-6xl mx-auto text-center space-y-6">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>National Centre for Polar & Ocean Research Operational Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-100 uppercase font-sans">
          One Command Center. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Every Expedition. Every Asset.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base leading-relaxed">
          Centralized operational logistics for Indian Antarctic (<em className="text-cyan-300 not-italic">Bharati</em>, <em className="text-cyan-300 not-italic">Maitri</em>) and Arctic (<em className="text-cyan-300 not-italic">Himadri</em>, <em className="text-cyan-300 not-italic">IndARC</em>) research expeditions. Managing cargo tracking, station survival reserves, crew muster, and emergency Search & Rescue.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center space-x-2 shadow-xl shadow-cyan-600/30 transition transform hover:-translate-y-0.5"
          >
            <span>Access Command Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#capabilities"
            className="px-6 py-3 rounded-xl bg-polar-900 hover:bg-polar-850 border border-slate-700 text-slate-300 text-sm font-semibold transition"
          >
            View Platform Capabilities
          </a>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="capabilities" className="px-6 py-16 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-mono uppercase text-slate-100">Integrated Expedition Architecture</h2>
          <p className="text-xs text-slate-400">Mission-critical modules built for sub-zero isolation and narrowband connectivity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Polar GIS Operations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time stereographic mapping tracking chartered icebreakers (MV Vasiliy Golovnin), Kamov helicopters, field sorties, and crevasse danger zones.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Cold-Chain & Cargo QR</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous IoT sensor monitoring for -80°C cryo-samples, hazardous materials, and 2D barcode status transition tracking.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Blizzard & SAR Incident Response</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stage-1/2/3 whiteout lockdown triggers, outdoor sortie recall, and biometric muster roll verification for 100% crew safety.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 border-t border-cyan-900/30 bg-polar-950 text-center text-xs text-slate-500 font-mono">
        POLARIS • National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences (MoES)
      </footer>
    </div>
  );
};
