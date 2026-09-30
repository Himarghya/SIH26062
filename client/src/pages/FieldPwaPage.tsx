import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  MapPin, 
  Users, 
  Radio, 
  Wifi, 
  WifiOff, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft,
  Camera,
  Battery,
  HardDrive,
  Sparkles,
  Smartphone,
  Download,
  UploadCloud,
  FileCheck,
  RotateCcw,
  Zap,
  Tag,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { offlineStorage } from '../services/offlineDb';

export const FieldPwaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'checkin' | 'cryo' | 'muster'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedItemDetails, setScannedItemDetails] = useState<any>(null);
  const [selectedStation, setSelectedStation] = useState('Bharati Research Station (Antarctica)');
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [musterRoll, setMusterRoll] = useState([
    { id: 'EXP-101', name: 'Dr. Aarav Sharma', role: 'Chief Glaciologist', status: 'MUSTERED', time: '14:22 UTC' },
    { id: 'EXP-102', name: 'Capt. Rajesh Nair', role: 'Station Logistics Lead', status: 'MUSTERED', time: '14:20 UTC' },
    { id: 'EXP-103', name: 'Dr. Sneha Paul', role: 'Meteorologist', status: 'PENDING', time: '--' },
    { id: 'EXP-104', name: 'Tenzing Norbu', role: 'Traverse Cat Operator', status: 'MUSTERED', time: '14:15 UTC' },
  ]);
  const [isOffline, setIsOffline] = useState(false);
  const [queuedMutations, setQueuedMutations] = useState(offlineStorage.getQueue().length);

  useEffect(() => {
    const handleQueueUpdate = () => {
      setQueuedMutations(offlineStorage.getQueue().length);
    };
    window.addEventListener('polaris-queue-updated', handleQueueUpdate);
    return () => window.removeEventListener('polaris-queue-updated', handleQueueUpdate);
  }, []);

  const simulateScan = (customCode?: string, customName?: string) => {
    setIsScanning(true);
    setScanResult(null);
    setScannedItemDetails(null);

    setTimeout(() => {
      setIsScanning(false);
      const code = customCode || 'CRG-BIO-089';
      const name = customName || 'Subglacial Ice Core (-80°C Verified)';
      setScanResult(`${code} (${name})`);
      setScannedItemDetails({
        code,
        name,
        temp: '-79.8°C',
        status: 'Seal Intact & Monitored',
        location: selectedStation,
        timestamp: new Date().toLocaleTimeString() + ' UTC'
      });

      offlineStorage.enqueueMutation({
        entity: 'cargo',
        type: 'CARGO_SCANNED',
        data: { barcode: code, name, location: selectedStation }
      });
      setQueuedMutations(offlineStorage.getQueue().length);
    }, 1000);
  };

  const handleFieldCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckinSuccess(true);
    offlineStorage.enqueueMutation({
      entity: 'personnel',
      type: 'PERSONNEL_CHECKIN',
      data: { station: selectedStation, coords: '-69.4075° S, 76.1914° E' }
    });
    setQueuedMutations(offlineStorage.getQueue().length);
    setTimeout(() => setCheckinSuccess(false), 4000);
  };

  const handleMusterIndividual = (id: string) => {
    setMusterRoll(prev => prev.map(m => m.id === id ? { ...m, status: 'MUSTERED', time: new Date().toLocaleTimeString() } : m));
    offlineStorage.enqueueMutation({
      entity: 'personnel',
      type: 'MUSTER_VERIFIED',
      data: { memberId: id }
    });
    setQueuedMutations(offlineStorage.getQueue().length);
  };

  const handleFlushSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      offlineStorage.clearQueue();
      setQueuedMutations(0);
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Header & Telemetry Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-black text-slate-900 uppercase font-mono tracking-wide">
              Field Operator PWA &amp; Zero-Bandwidth Terminal
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-mono font-bold">
              v2.6 Field Edition
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Rugged zero-bandwidth cache, 2D Datamatrix barcode scanner, -80°C Cryo telemetry &amp; GPS muster roll
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center space-x-1.5 transition shadow-2xs ${
              isOffline
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? 'Simulated Offline (Buffer Active)' : 'Iridium Sat-Link (2.4 kbps)'}</span>
          </button>

          <button
            onClick={handleFlushSync}
            disabled={isSyncing || queuedMutations === 0}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-500 font-bold flex items-center space-x-1.5 transition shadow-xs"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : `Flush Sync Queue (${queuedMutations})`}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Rugged Mobile Terminal on Left, Operations Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Rugged Field Terminal Interactive Simulator (5 cols) */}
        <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-slate-900 border-4 border-slate-800 rounded-[36px] p-4 shadow-2xl text-slate-100 flex flex-col gap-3.5 relative overflow-hidden">
            
            {/* Terminal Top Bezel & Speaker */}
            <div className="flex justify-center pb-1">
              <div className="w-20 h-1.5 bg-slate-700 rounded-full" />
            </div>

            {/* Device Status Bar */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-1 text-cyan-400 font-bold text-[11px]">
                <Compass className="w-3.5 h-3.5 text-cyan-300" />
                <span>POLARIS FIELD PWA</span>
              </div>
              <div className="flex items-center space-x-2.5 text-[10px]">
                <div className="flex items-center space-x-1">
                  <Battery className="w-3 h-3 text-emerald-400" />
                  <span>94%</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full font-bold border ${
                  isOffline ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}>
                  {isOffline ? 'Offline' : 'Sat-Link'}
                </div>
              </div>
            </div>

            {/* PWA Title Bar */}
            <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60">
              <div>
                <div className="text-xs font-black font-mono tracking-wider text-white">
                  {selectedStation.split('(')[0]}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Antarctic Cold-Chain Field Logger</div>
              </div>
              <div className="text-right font-mono text-[10px]">
                <div className="text-cyan-300 font-bold">Queue: {queuedMutations}</div>
                <div className="text-emerald-400 font-bold">● GPS Lock OK</div>
              </div>
            </div>

            {/* 4 Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-bold font-mono">
              <button
                onClick={() => setActiveTab('scan')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
                  activeTab === 'scan' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="text-[9px]">2D Scan</span>
              </button>
              <button
                onClick={() => setActiveTab('checkin')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
                  activeTab === 'checkin' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-[9px]">Check-In</span>
              </button>
              <button
                onClick={() => setActiveTab('cryo')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
                  activeTab === 'cryo' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Thermometer className="w-4 h-4" />
                <span className="text-[9px]">-80°C Cryo</span>
              </button>
              <button
                onClick={() => setActiveTab('muster')}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
                  activeTab === 'muster' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[9px]">Muster</span>
              </button>
            </div>

            {/* TAB 1: 2D OPTICAL & RFID SCANNER */}
            {activeTab === 'scan' && (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] w-full bg-slate-950 rounded-2xl border-2 border-dashed border-cyan-500/60 flex flex-col items-center justify-center overflow-hidden p-4 text-center">
                  {isScanning ? (
                    <div className="space-y-2">
                      <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                      <p className="font-mono text-xs text-cyan-300">Decoding 2D Datamatrix &amp; RFID...</p>
                    </div>
                  ) : scannedItemDetails ? (
                    <div className="space-y-2 bg-emerald-950/90 border border-emerald-500/60 p-3 rounded-xl w-full text-left font-mono">
                      <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                        <span>{scannedItemDetails.code}</span>
                        <span className="text-[9px] bg-emerald-900/80 px-1.5 py-0.5 rounded border border-emerald-400/40">VERIFIED</span>
                      </div>
                      <div className="text-white text-xs font-bold">{scannedItemDetails.name}</div>
                      <div className="text-[10px] text-slate-300">Temp: <strong className="text-cyan-300">{scannedItemDetails.temp}</strong> • {scannedItemDetails.status}</div>
                      <button
                        onClick={() => { setScanResult(null); setScannedItemDetails(null); }}
                        className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition"
                      >
                        Scan Next Container
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                      <p className="font-mono text-[11px] text-slate-400">Aim camera at Cryogenic Container, Cargo Palette, or RFID tag</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => simulateScan()}
                  disabled={isScanning}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Scanning...' : 'Trigger Optical / RFID Scanner'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: FIELD CHECK-IN */}
            {activeTab === 'checkin' && (
              <form onSubmit={handleFieldCheckin} className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Station Base:</span>
                    <span className="text-cyan-400 font-bold">Bharati (Larsemann Hills)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">GPS Coords:</span>
                    <span className="text-slate-200">69°24′28″ S, 76°11′14″ E</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Surface Temp:</span>
                    <span className="text-rose-400 font-bold">-28.5°C (Wind Chill -42°C)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Station / Traverse Sector:</label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono"
                  >
                    <option>Bharati Research Station (Antarctica)</option>
                    <option>Maitri Research Station (Antarctica)</option>
                    <option>Himadri Arctic Base (Ny-Ålesund, Svalbard)</option>
                    <option>Dalk Glacier Traverse Outpost (Sector 4)</option>
                  </select>
                </div>

                {checkinSuccess && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-[11px] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Check-in saved to local buffer &amp; queued for sync.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Submit GPS Field Check-In</span>
                </button>
              </form>
            )}

            {/* TAB 3: -80°C CRYO TELEMETRY */}
            {activeTab === 'cryo' && (
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-2xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-300 text-xs">CRG-BIO-089 (Subglacial Core)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[9px]">
                      STABLE
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-white">-79.8°C</span>
                    <span className="text-[10px] text-slate-400">Safe: -85°C to -70°C</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-3/4 rounded-full" />
                  </div>
                </div>

                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-300 text-xs">CRG-REAG-012 (Enzyme Cryo)</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[9px]">
                      ADVISORY
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-rose-400">-71.2°C</span>
                    <span className="text-[10px] text-rose-300 font-bold">18m Thermal Excursion</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BIOMETRIC MUSTER ROLL */}
            {activeTab === 'muster' && (
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center px-1 text-slate-400 text-[11px]">
                  <span>Muster Status:</span>
                  <span className="text-emerald-400 font-bold">3 / 4 Accounted</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {musterRoll.map((m) => (
                    <div key={m.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[9px] text-slate-400">{m.role} • {m.id}</div>
                      </div>
                      {m.status === 'MUSTERED' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-[9px]">
                          ✓ {m.time}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMusterIndividual(m.id)}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[9px]"
                        >
                          Muster
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency SAR Shortcut */}
            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/emergency"
                className="w-full py-2 bg-rose-700/80 hover:bg-rose-600 text-white font-mono font-bold text-[11px] uppercase flex items-center justify-center space-x-1.5 rounded-xl border border-rose-500 shadow-md transition"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Emergency SAR &amp; Blizzard Distress</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Right Column: Offline Sync Station & Barcode Test Console (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          
          {/* Card 1: Zero-Bandwidth Offline Sync Architecture */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-900">
                  Zero-Bandwidth Sync Engine
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                ServiceWorker Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Local Mutation Queue</div>
                <div className="text-lg font-black text-indigo-700 mt-0.5">{queuedMutations} Actions</div>
                <div className="text-[9px] text-slate-400">Buffered in IndexedDB</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Cache Integrity</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">100% OK</div>
                <div className="text-[9px] text-slate-400">Offline SQLite/IDB Ready</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-500 uppercase">Satellite Burst</div>
                <div className="text-lg font-black text-cyan-700 mt-0.5">Iridium 9602</div>
                <div className="text-[9px] text-slate-400">Delta Conflict Resolver</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              When field operators lose VHF or Iridium satellite reception during polar blizzards, all barcode scans, container temperature logs, and muster check-ins are preserved with cryptographic hashes in the browser buffer and dispatched automatically on base uplink.
            </p>
          </div>

          {/* Card 2: Interactive Barcode & Specimen Test Targets */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-900">
                  Quick Barcode Test Samples (Click to Scan)
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Test optical scanner</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <button
                onClick={() => { setActiveTab('scan'); simulateScan('CRG-BIO-089', 'Subglacial Ice Core (-80°C Cryo)'); }}
                className="p-3 rounded-xl bg-cyan-50/50 hover:bg-cyan-50 border border-cyan-200 text-left transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-cyan-800 font-bold text-[11px]">
                  <span>CRG-BIO-089</span>
                  <QrCode className="w-3.5 h-3.5 text-cyan-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-slate-800 font-semibold text-[11px]">Subglacial Ice Core</div>
                <div className="text-[9px] text-slate-500">-80°C Cryogenic Specimen</div>
              </button>

              <button
                onClick={() => { setActiveTab('scan'); simulateScan('CRG-FUEL-044', 'Polar Jet A-1 Fuel Bladder'); }}
                className="p-3 rounded-xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200 text-left transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-amber-800 font-bold text-[11px]">
                  <span>CRG-FUEL-044</span>
                  <QrCode className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-slate-800 font-semibold text-[11px]">Jet A-1 Fuel Drum</div>
                <div className="text-[9px] text-slate-500">Hazard Class 3 Bulk Liquid</div>
              </button>

              <button
                onClick={() => { setActiveTab('scan'); simulateScan('CRG-MED-012', 'Polar Trauma & Hypothermia Kit'); }}
                className="p-3 rounded-xl bg-rose-50/50 hover:bg-rose-50 border border-rose-200 text-left transition space-y-1 group"
              >
                <div className="flex items-center justify-between text-rose-800 font-bold text-[11px]">
                  <span>CRG-MED-012</span>
                  <QrCode className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition" />
                </div>
                <div className="text-slate-800 font-semibold text-[11px]">Medical Trauma Kit</div>
                <div className="text-[9px] text-slate-500">Survival First Response</div>
              </button>
            </div>
          </div>

          {/* Card 3: Field Protocol & Polar Standard Operating Procedures */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-800 font-mono text-[11px] flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>FIELD OPERATOR SOP: SUB-ZERO CARGO VERIFICATION</span>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px] leading-relaxed">
              <li>Keep optical scanner clean from frost build-up using insulated lens defrosters.</li>
              <li>Scan all containers prior to transferring onto PistenBully sledges.</li>
              <li>If temperature alert triggers on cryo containers, notify Bharati Station Cryo-Lab within 15 minutes.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
