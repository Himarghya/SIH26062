import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  ArrowRight, 
  Radio, 
  Thermometer, 
  Activity, 
  QrCode, 
  Snowflake, 
  Wind, 
  Navigation, 
  Fuel, 
  Package, 
  Shield, 
  ExternalLink,
  ChevronRight,
  Pause,
  Play,
  FileText,
  Search,
  Globe,
  Bell,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isNewsPlaying, setIsNewsPlaying] = useState(true);

  const slides = [
    {
      title: "Bharati Station - Larsemann Hills, East Antarctica",
      subtitle: "Wintering Over Operations, Zero-Bandwidth Polar Logistics & Satellite Feeds",
      tag: "Permanent Antarctic Research Base",
      image: "/images/bharati_station.png"
    },
    {
      title: "Southern Ocean & Antarctic Marine Expedition",
      subtitle: "Iceberg Tracking, Hydrographic Surveys & Cold-Chain Supply Routes",
      tag: "Indian Antarctic Scientific Expedition",
      image: "/images/antarctic_fjord.jpg"
    },
    {
      title: "Transantarctic Mountains & Cryospheric Observations",
      subtitle: "Glaciology, Deep Ice Core Drilling & Severe Blizzard Survival Tracking",
      tag: "High-Latitude Field Research",
      image: "/images/antarctic_peaks.png"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-[#f4f7fa] text-slate-800 flex flex-col font-sans selection:bg-[#006399] selection:text-white text-[14px]">
      
      {/* Official POLARIS Government Header (Cyan-Blue Ocean Banner) */}
      <header className="bg-gradient-to-r from-[#004f7c] via-[#016590] to-[#014970] text-white py-4 px-4 sm:px-6 shadow-md border-b-2 border-[#e59b19]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left: POLARIS Compass Emblem & Logo */}
          <div className="flex items-center space-x-3.5 shrink-0">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-300 to-sky-600 p-0.5 shadow-lg border-2 border-white/80 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#003857] to-[#005c8f] flex flex-col items-center justify-center text-center">
                <Compass className="w-7 h-7 text-cyan-200 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl sm:text-3xl tracking-widest text-white block font-mono leading-none">
                  POLARIS
                </span>
                <span className="text-[9px] text-cyan-300 font-mono uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/40 font-bold">
                  v2.4.0
                </span>
              </div>
              <span className="text-[10px] text-cyan-200 tracking-wider uppercase font-mono block mt-1">
                NCPOR &bull; MOES &bull; GOVT. OF INDIA
              </span>
            </div>
          </div>

          {/* Center: System Explanation & Official Bilingual Titles */}
          <div className="text-center lg:text-left flex-1 lg:pl-5 lg:border-l border-white/20">
            <h1 className="text-xs sm:text-sm md:text-base font-bold text-white leading-tight font-serif tracking-wide drop-shadow-xs">
              पोलारिस: राष्ट्रीय ध्रुवीय अनुसंधान रसद एवं अभियान कमान प्रणाली
            </h1>
            <div className="mt-0.5">
              <span className="text-sm sm:text-base md:text-lg font-extrabold uppercase text-white tracking-wider block font-serif leading-tight">
                POLAR RESEARCH LOGISTICS &amp; EXPEDITION COMMAND OS
              </span>
              <span className="text-xs text-cyan-200 font-serif block">
                National Centre for Polar and Ocean Research &bull; Ministry of Earth Sciences, Govt. of India
              </span>
            </div>
            <p className="text-[11px] text-cyan-100/90 font-sans mt-1 leading-relaxed hidden sm:block">
              Integrated multi-station life support autonomy, cold-chain supply chain, zero-bandwidth offline sync, and deterministic SAR dispatch across Bharati, Maitri &amp; Himadri stations.
            </p>
          </div>

          {/* Right: Direct Login & Field Operator Access Options */}
          <div className="flex items-center space-x-3 shrink-0 flex-wrap justify-center">
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <Link
                  to="/pwa"
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/40 hover:border-cyan-400 text-cyan-200 hover:text-white font-mono text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Field PWA</span>
                </Link>

                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-mono text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                  <span>Mission Control Login &rarr;</span>
                </Link>
              </div>
              <span className="text-[10px] font-mono text-cyan-200/80 hidden sm:block">
                Secure NDMA / NCPOR Credentials Required
              </span>
            </div>

            {/* Emblem Badge */}
            <div className="hidden xl:flex w-11 h-14 border-l border-white/20 pl-3 flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-300">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[7px] text-amber-200 font-serif font-bold uppercase mt-0.5">सत्यमेव जयते</span>
            </div>
          </div>

        </div>
      </header>

      {/* 3. Golden-Amber Navigation Bar (Authentic NCPOR Top Menu) */}
      <nav className="bg-[#f3a826] border-b-2 border-[#d48c13] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none font-sans text-xs font-bold text-[#1f2937]">
          <div className="flex items-center flex-wrap">
            <Link to="/" className="px-4 py-2.5 bg-[#c2410c] text-white hover:bg-[#9a3412] transition flex items-center gap-1 shrink-0">
              Home
            </Link>
            <span className="px-3.5 py-2.5 hover:bg-[#e0991e] transition cursor-pointer shrink-0">
              About NCPOR
            </span>
            <span className="px-3.5 py-2.5 hover:bg-[#e0991e] transition cursor-pointer shrink-0">
              Expeditions
            </span>
            <span className="px-3.5 py-2.5 hover:bg-[#e0991e] transition cursor-pointer shrink-0">
              Management &amp; Support
            </span>
            <span className="px-3.5 py-2.5 hover:bg-[#e0991e] transition cursor-pointer shrink-0">
              Data Center
            </span>
            <span className="px-3.5 py-2.5 hover:bg-[#e0991e] transition cursor-pointer shrink-0">
              Information Services
            </span>
            <span className="px-3.5 py-2.5 hover:bg-[#e0991e] transition cursor-pointer shrink-0">
              Tender
            </span>
            <span className="px-3.5 py-2.5 hover:bg-[#e0991e] transition cursor-pointer shrink-0">
              Careers
            </span>
            <span className="px-3.5 py-2.5 hover:bg-[#e0991e] transition cursor-pointer shrink-0">
              Webmail
            </span>
          </div>

          {/* POLARIS Mission Control Quick Jump Launcher */}
          <div className="flex items-center space-x-1.5 px-3 shrink-0 py-1.5">
            <Link
              to="/pwa"
              className="px-3 py-1.5 rounded bg-[#004d77] hover:bg-[#003857] text-white font-mono text-[11px] font-bold flex items-center gap-1 transition shadow-xs"
            >
              <QrCode className="w-3 h-3 text-cyan-300" />
              <span>Field PWA</span>
            </Link>
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded bg-[#0f766e] hover:bg-[#115e59] text-white font-mono text-[11px] font-extrabold flex items-center gap-1 transition shadow-xs"
            >
              <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
              <span>POLARIS Mission Control →</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. Main Body with Antarctic Iceberg Fjord Side Margins */}
      <div className="flex-1 bg-gradient-to-b from-[#eaf2f8] to-[#f4f7fa] relative" id="main-content">
        
        {/* Subtle Polar Watermark Side Banners */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Main Left/Center Column (8 or 9 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Banner Photo Carousel (Matches NCPOR BRICS / Expedition Photo Banner) */}
            <div className="relative rounded-lg overflow-hidden border border-slate-300 shadow-md bg-slate-900 aspect-[21/9] sm:aspect-[21/8]">
              <img 
                src={slides[activeSlide].image} 
                alt={slides[activeSlide].title}
                className="w-full h-full object-cover transition-all duration-700 brightness-90"
              />
              
              {/* Carousel Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                <span className="text-[10px] font-mono bg-[#005c8f] text-cyan-200 px-2.5 py-0.5 rounded w-fit uppercase font-bold mb-1 shadow">
                  {slides[activeSlide].tag}
                </span>
                <h2 className="text-base sm:text-xl md:text-2xl font-bold font-serif leading-tight drop-shadow-md">
                  {slides[activeSlide].title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-sans mt-0.5 line-clamp-1 drop-shadow">
                  {slides[activeSlide].subtitle}
                </p>
              </div>

              {/* Dot Indicators */}
              <div className="absolute bottom-2.5 right-4 flex items-center space-x-1.5 z-10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeSlide === i ? 'bg-emerald-400 scale-125 ring-1 ring-white' : 'bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Welcome to NCPOR Headline & Introduction Section */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-[#004d77] font-serif">
                  Welcome to NCPOR <span className="text-xs font-normal text-slate-500 font-sans">(erstwhile NCAOR)</span>
                </h2>
                <span className="text-xs text-[#006399] font-bold hover:underline cursor-pointer flex items-center gap-1">
                  Read More &rsaquo;
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-sans">
                National Centre for Polar and Ocean Research (NCPOR) is India's premier R&amp;D institution responsible for the country's research activities in the polar and Southern Ocean realms. The Centre coordinates and steers the Indian Antarctic Programme, the Indian Arctic Programme, the Southern Ocean Programme, and the Cryosphere &amp; Climate studies across the Indian Himalayas.
              </p>
            </div>

            {/* 🚀 FEATURED PORTAL SPOTLIGHT: POLARIS LOGISTICS & EXPEDITION OS */}
            <div className="bg-gradient-to-r from-[#003857] via-[#004d77] to-[#025a87] text-white p-5 rounded-xl border-2 border-cyan-400 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shrink-0">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-lg text-white tracking-wide">POLARIS</span>
                      <span className="bg-cyan-900/80 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-400/30">
                        OFFLINE FIELD &amp; MISSION OS v2.4
                      </span>
                    </div>
                    <p className="text-xs text-cyan-100 font-sans mt-0.5">
                      Integrated Polar Station Supply Chain, Fuel Autonomy &amp; Search &amp; Rescue Command System
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to="/pwa"
                    className="px-3.5 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs border border-cyan-400/40 hover:border-cyan-400 transition flex items-center gap-1.5 shadow"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Field PWA</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-900/40"
                  >
                    <span>Open Desktop Command</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Real-time Telemetry Snapshot Inside Spotlight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/15 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Snowflake className="w-4 h-4 text-cyan-300" />
                    <div>
                      <span className="text-[10px] text-slate-300 block font-sans">Bharati (Antarctica)</span>
                      <strong className="text-white font-bold">-28.4°C</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    Normal Ops
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-amber-300" />
                    <div>
                      <span className="text-[10px] text-slate-300 block font-sans">Maitri (Antarctica)</span>
                      <strong className="text-white font-bold">-34.1°C</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                    Blizzard Watch
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-cyan-300" />
                    <div>
                      <span className="text-[10px] text-slate-300 block font-sans">Himadri (Arctic)</span>
                      <strong className="text-white font-bold">-12.8°C</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    Normal Ops
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Scientific Divisions Cards (Exact replica of NCPOR cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              
              {/* Card 1 */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-[#004d77] transition group cursor-pointer flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#004d77] text-xs pb-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span>Polar Science &amp; Cryosphere</span>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition">&rsaquo;</span>
                  </h3>
                  <div className="my-2 rounded overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=400&q=80" alt="Cryosphere" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Long-term monitoring of Antarctic ice sheets, sea ice dynamics, and polar atmospheric chemistry.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-[#004d77] transition group cursor-pointer flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#004d77] text-xs pb-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span>Geoscience</span>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition">&rsaquo;</span>
                  </h3>
                  <div className="my-2 rounded overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80" alt="Geoscience" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Continental drift studies, Gondwana reconstruction, and deep crustal seismology under ice sheets.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-[#004d77] transition group cursor-pointer flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#004d77] text-xs pb-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span>Exploration Mineral Resources</span>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition">&rsaquo;</span>
                  </h3>
                  <div className="my-2 rounded overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80" alt="Ocean Exploration" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Hydrothermal polymetallic sulfides exploration along the Central and South West Indian Ridges.
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-[#004d77] transition group cursor-pointer flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#004d77] text-xs pb-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span>Science Updates</span>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition">&rsaquo;</span>
                  </h3>
                  <div className="my-2 rounded overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                    <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" alt="Science Update" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Latest publications, ice-core temperature reconstructions, and oceanic paleoclimate records.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Latest News Box (Exact NCPOR blue header style with Pause button) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-[#005c8f] text-white px-4 py-2.5 flex items-center justify-between">
                <h3 className="font-bold text-sm font-serif">Latest News &amp; Bulletins</h3>
                <button
                  onClick={() => setIsNewsPlaying(!isNewsPlaying)}
                  className="p-1 rounded hover:bg-white/20 text-white transition"
                  title={isNewsPlaying ? 'Pause News' : 'Play News'}
                >
                  {isNewsPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3.5 divide-y divide-slate-100 text-xs space-y-2.5">
                <div className="pt-2 first:pt-0">
                  <span className="text-[10px] font-mono text-cyan-700 font-bold block">18 SEP 2026</span>
                  <a href="#" className="text-slate-800 hover:text-[#005c8f] font-semibold leading-snug block mt-0.5">
                    AFops 2026 Opens in Kochi for pre-expedition logistics and survival trials.
                  </a>
                </div>

                <div className="pt-2.5">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold block">15 SEP 2026</span>
                  <a href="#" className="text-slate-800 hover:text-[#005c8f] font-semibold leading-snug block mt-0.5">
                    POLARIS Polar Station Supply Chain OS v2.4 successfully deployed across Bharati &amp; Maitri stations.
                  </a>
                </div>

                <div className="pt-2.5">
                  <span className="text-[10px] font-mono text-slate-500 font-bold block">12 SEP 2026</span>
                  <a href="#" className="text-slate-800 hover:text-[#005c8f] font-semibold leading-snug block mt-0.5">
                    Unravelling Glacier-Lake Dynamics and GLOF hazards in the Higher Himalayas.
                  </a>
                </div>

                <div className="pt-2.5">
                  <span className="text-[10px] font-mono text-amber-700 font-bold block">10 AUG 2026</span>
                  <a href="#" className="text-slate-800 hover:text-[#005c8f] font-serif leading-snug block mt-0.5">
                    एनसीपीओआर में 45वें भारतीय अंटार्कटिक वैज्ञानिक अभियान हेतु विशेष शीतकालीन ईंधन निविदा आमंत्रित।
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 text-right">
                <span className="text-[11px] text-[#005c8f] font-bold hover:underline cursor-pointer">
                  View All News &rsaquo;
                </span>
              </div>
            </div>

            {/* Quick Links & Direct Resources */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#004d77] pb-1.5 border-b border-slate-200">
                Quick Access &amp; Portals
              </h3>

              <div className="space-y-1.5 text-xs">
                <Link
                  to="/login"
                  className="p-2 rounded bg-slate-50 hover:bg-[#004d77] hover:text-white transition flex items-center justify-between group border border-slate-100"
                >
                  <span className="font-bold flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-cyan-600 group-hover:text-cyan-300" />
                    POLARIS Desktop Command
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </Link>

                <Link
                  to="/pwa"
                  className="p-2 rounded bg-slate-50 hover:bg-[#004d77] hover:text-white transition flex items-center justify-between group border border-slate-100"
                >
                  <span className="font-bold flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-teal-600 group-hover:text-teal-300" />
                    Field Operator PWA (Offline)
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </Link>

                <div className="p-2 rounded bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer border border-slate-100">
                  <span className="font-medium text-slate-700">Indian Antarctic Stations Telemetry</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </div>

                <div className="p-2 rounded bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer border border-slate-100">
                  <span className="font-medium text-slate-700">National Polar Data Centre (NPDC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Official Treaty Compliance Badge */}
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Antarctic Treaty Environmental Compliance</span>
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed font-sans">
                All polar sorties, fuel decanting, and hazardous waste manifests adhere strictly to the Protocol on Environmental Protection to the Antarctic Treaty (Madrid Protocol).
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* 5. Official Government Footer */}
      <footer className="bg-[#003857] text-white text-xs border-t-4 border-[#e59b19] py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div>
              <span className="font-bold text-sm block font-serif">
                NATIONAL CENTRE FOR POLAR AND OCEAN RESEARCH (NCPOR)
              </span>
              <span className="text-[11px] text-cyan-200 block mt-0.5">
                Headland Sada, Vasco-da-Gama, Goa - 403 804, India
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <span className="hover:underline cursor-pointer">Terms &amp; Conditions</span>
              <span>&bull;</span>
              <span className="hover:underline cursor-pointer">Privacy Policy</span>
              <span>&bull;</span>
              <span className="hover:underline cursor-pointer">RTI</span>
              <span>&bull;</span>
              <span className="hover:underline cursor-pointer">Copyright Policy</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 font-mono">
            <div>
              &copy; {new Date().getFullYear()} National Centre for Polar and Ocean Research. Ministry of Earth Sciences, Govt. of India.
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-cyan-300">Powered by POLARIS Logistics Command Engine</span>
              <span>|</span>
              <span>Last Updated: 30 Sep 2026</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
