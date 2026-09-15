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
  HardDrive
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { offlineStorage } from '../services/offlineDb';

export const FieldPwaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'checkin' | 'cryo' | 'muster'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState('Bharati Research Station (Antarctica)');
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const [musterRoll, setMusterRoll] = useState([
    { id: 'EXP-101', name: 'Dr. Aarav Sharma', role: 'Chief Glaciologist', status: 'MUSTERED', time: '14:22 UTC' },
    { id: 'EXP-102', name: 'Capt. Rajesh Nair', role: 'Station Logistics Lead', status: 'MUSTERED', time: '14:20 UTC' },
    { id: 'EXP-103', name: 'Dr. Sneha Paul', role: 'Meteorologist', status: 'PENDING', time: '--' },
    { id: 'EXP-104', name: 'Tenzing Norbu', role: 'Traverse Cat Operator', status: 'MUSTERED', time: '14:15 UTC' },
  ]);
  const [isOffline, setIsOffline] = useState(false);
  const [queuedMutations, setQueuedMutations] = useState(offlineStorage.getQueue().length);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult('CRG-BIO-089 (Subglacial Ice Core -80°C Verified)');
      offlineStorage.enqueueMutation({
        entity: 'cargo',
        type: 'CARGO_SCANNED',
        data: { barcode: 'POL88491023', location: selectedStation }
      });
      setQueuedMutations(offlineStorage.getQueue().length);
    }, 1200);
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-3 sm:p-6 font-sans">
      {/* Top Mobile PWA Header */}
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-3xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
        
        {/* Device Status Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-700/80 pb-3">
          <Link to="/dashboard" className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Command Center</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>94%</span>
            </div>
            <button 
              onClick={() => setIsOffline(!isOffline)}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold text-[10px] border transition ${
                isOffline ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              }`}
            >
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span>{isOffline ? 'Offline Buffer' : '2.4 kbps Sat'}</span>
            </button>
          </div>
        </div>

        {/* PWA Brand & Title */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black font-mono tracking-wider text-white">POLARIS PWA</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                v2.6 Field Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Rugged Field Operator Cross-Check-in</p>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400">
            <div>Queued: <strong className="text-cyan-400 font-bold">{queuedMutations}</strong></div>
            <div className="text-emerald-400 font-bold">● GPS Fix Active</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab('scan')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
              activeTab === 'scan' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span className="text-[10px]">QR Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
              activeTab === 'checkin' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-[10px]">Field Check</span>
          </button>
          <button
            onClick={() => setActiveTab('cryo')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
              activeTab === 'cryo' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span className="text-[10px]">-80°C Cryo</span>
          </button>
          <button
            onClick={() => setActiveTab('muster')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition ${
              activeTab === 'muster' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px]">Muster Roll</span>
          </button>
        </div>

        {/* TAB 1: QR & RFID SCANNER */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-black/60 rounded-2xl border-2 border-dashed border-cyan-500/60 flex flex-col items-center justify-center overflow-hidden p-6 text-center">
              {isScanning ? (
                <div className="space-y-3">
                  <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                  <p className="font-mono text-xs text-cyan-300">Decoding 2D Datamatrix & RFID Tag...</p>
                </div>
              ) : scanResult ? (
                <div className="space-y-3 bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="font-mono font-bold text-xs text-emerald-200">{scanResult}</div>
                  <button
                    onClick={() => setScanResult(null)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg"
                  >
                    Scan Another Container
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="font-mono text-xs text-slate-400">Position 2D Barcode or NFC / RFID Token in Viewfinder</p>
                </div>
              )}
            </div>

            <button
              onClick={simulateScan}
              disabled={isScanning}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition"
            >
              {isScanning ? 'Acquiring optical lock...' : '⚡ Trigger Optical / RFID Scanner'}
            </button>
          </div>
        )}

        {/* TAB 2: GPS FIELD CHECK-IN */}
        {activeTab === 'checkin' && (
          <form onSubmit={handleFieldCheckin} className="space-y-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Current Station Base:</span>
                <span className="text-cyan-400 font-bold">Bharati (Larsemann Hills)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">GPS Coords:</span>
                <span className="text-slate-200">69°24′28″ S, 76°11′14″ E</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Ambient Temp:</span>
                <span className="text-rose-400 font-bold">-28.5°C (Wind Chill -42°C)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300">Station / Traverse Location:</label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200"
              >
                <option>Bharati Research Station (Antarctica)</option>
                <option>Maitri Research Station (Antarctica)</option>
                <option>Himadri Arctic Base (Ny-Ålesund, Svalbard)</option>
                <option>Dalk Glacier Traverse Outpost (Sector 4)</option>
              </select>
            </div>

            {checkinSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Field check-in recorded to local buffer & queued for Iridium SBD sync.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg transition"
            >
              📍 Submit GPS Field Check-In
            </button>
          </form>
        )}

        {/* TAB 3: -80°C CRYO PROBE TELEMETRY */}
        {activeTab === 'cryo' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-indigo-950/50 border border-indigo-500/40 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-300">CRG-BIO-089 (Subglacial Core)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[10px]">
                  STABLE
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-white">-79.8°C</span>
                <span className="text-[11px] text-slate-400">Safe Band: -85°C to -70°C</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-3/4 rounded-full" />
              </div>
            </div>

            <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-rose-300">CRG-REAG-012 (Enzyme Cryo)</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px]">
                  ADVISORY
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black text-rose-400">-71.2°C</span>
                <span className="text-[11px] text-rose-300 font-bold">18m Thermal Excursion</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BIOMETRIC MUSTER ROLL */}
        {activeTab === 'muster' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center px-1 text-slate-400">
              <span>Muster Roll Status:</span>
              <span className="text-emerald-400 font-bold">3 / 4 Accounted</span>
            </div>

            <div className="space-y-2">
              {musterRoll.map((m) => (
                <div key={m.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">{m.name}</div>
                    <div className="text-[10px] text-slate-400">{m.role} • {m.id}</div>
                  </div>
                  {m.status === 'MUSTERED' ? (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-[10px]">
                      ✓ {m.time}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMusterIndividual(m.id)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[10px]"
                    >
                      Muster Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency SOS Banner */}
        <div className="pt-2 border-t border-slate-800">
          <Link
            to="/emergency"
            className="w-full py-2.5 bg-rose-700/80 hover:bg-rose-600 text-white font-mono font-bold text-xs uppercase flex items-center justify-center space-x-2 rounded-xl border border-rose-500 shadow-md"
          >
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            <span>Emergency SAR & Blizzard Lockdown</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
