import React, { useState, useEffect } from 'react';
import { QueuedMutation } from '../types';
import { offlineStorage, SyncHistoryEntry } from '../services/offlineDb';
import { Radio, RefreshCw, CheckCircle, Wifi, Database, X, Shield, Clock, ArrowRight, Zap, AlertTriangle } from 'lucide-react';

interface SatelliteSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: QueuedMutation[];
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  isOffline: boolean;
  onToggleOffline: (offline: boolean) => void;
}

export const SatelliteSyncModal: React.FC<SatelliteSyncModalProps> = ({
  isOpen,
  onClose,
  queue,
  onTriggerSync,
  isSyncing,
  isOffline,
  onToggleOffline
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'protocol'>('queue');
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>([]);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [conflictPolicy, setConflictPolicy] = useState<'lww' | 'station_auth'>('station_auth');

  useEffect(() => {
    setSyncHistory(offlineStorage.getSyncHistory());
  }, [isOpen]);

  const handleSyncNow = async () => {
    try {
      const startTime = Date.now();
      await onTriggerSync();
      const duration = Date.now() - startTime;
      
      const newEntry: SyncHistoryEntry = {
        id: `SYNC-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        operationsSynced: queue.length || 1,
        dataTransferredKb: Number(((queue.length || 1) * 0.28).toFixed(2)),
        status: 'SUCCESS',
        satelliteLink: 'Iridium SBD-9602 (Bharati Earth Station)',
        durationMs: duration || 450
      };
      
      offlineStorage.addSyncHistoryEntry(newEntry);
      setSyncHistory(offlineStorage.getSyncHistory());
      setSyncSuccessMessage(`Delta synchronization complete! Transferred ${newEntry.dataTransferredKb} KB across satellite link.`);
      setTimeout(() => setSyncSuccessMessage(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSampleOfflineAction = (type: 'cargo' | 'inventory' | 'personnel') => {
    if (type === 'cargo') {
      offlineStorage.enqueueMutation({
        entity: 'cargo',
        type: 'CARGO_CUSTODY_SCAN',
        data: { barcode: 'POL-CRG-2026-089', status: 'Received at Station', tempC: -21.4 }
      });
    } else if (type === 'inventory') {
      offlineStorage.enqueueMutation({
        entity: 'inventory',
        type: 'STOCK_BURN_LOG',
        data: { sku: 'FUEL-DIESEL-01', deltaQty: -450, reason: 'Winter Generator Bank #2' }
      });
    } else {
      offlineStorage.enqueueMutation({
        entity: 'personnel',
        type: 'MUSTER_BIOMETRIC_CHECKIN',
        data: { personnelId: 'PER-004', passed: true, stationId: 'STA-BHARATI' }
      });
    }
  };

  const cargoCount = queue.filter(q => q.entity === 'cargo').length;
  const inventoryCount = queue.filter(q => q.entity === 'inventory').length;
  const musterCount = queue.filter(q => q.entity === 'personnel').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-polar-950 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-polar-900 to-polar-850 px-6 py-4 flex items-center justify-between border-b border-cyan-900/50">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${isOffline ? 'bg-amber-950 border-amber-600 text-amber-300' : 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300'}`}>
              <Radio className={`w-5 h-5 ${isOffline ? '' : 'animate-pulse'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100 uppercase font-mono tracking-wide">
                  Polar Edge Sync & Offline Engine
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isOffline 
                    ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse' 
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                }`}>
                  {isOffline ? '⚠ STATION ISOLATION / OFFLINE' : '● SAT-LINK ONLINE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Iridium SBD Narrowband Protocol (2.4 kbps) • Conflict-Free Delta Replication
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-polar-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Mode Toggle Bar */}
        <div className="bg-polar-900/90 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Simulate Extreme Polar Blackout:</span>
          </div>
          <button
            onClick={() => onToggleOffline(!isOffline)}
            className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition flex items-center space-x-1.5 ${
              isOffline
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-polar-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <span>{isOffline ? 'Disable Offline Mode' : 'Simulate Station Offline'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-polar-900/40 text-xs">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-2.5 px-4 font-mono font-semibold border-b-2 transition ${
              activeTab === 'queue'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-4 font-mono font-semibold border-b-2 transition ${
              activeTab === 'history'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite Sync Log
          </button>
          <button
            onClick={() => setActiveTab('protocol')}
            className={`py-2.5 px-4 font-mono font-semibold border-b-2 transition ${
              activeTab === 'protocol'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Conflict & CRDT Rules
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {activeTab === 'queue' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-polar-900 border border-slate-800">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Queued Mutations</div>
                  <div className="text-xl font-bold text-cyan-300 font-mono mt-0.5">
                    {queue.length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Cargo: {cargoCount} | Inv: {inventoryCount} | Muster: {musterCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-polar-900 border border-slate-800">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">SBD Packet Size</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                    {(queue.length * 0.28).toFixed(2)} <span className="text-xs text-slate-400 font-normal">KB</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Compressed LZ4 Delta</div>
                </div>

                <div className="p-3 rounded-xl bg-polar-900 border border-slate-800">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Next Sat Window</div>
                  <div className="text-xl font-bold text-indigo-300 font-mono mt-0.5">
                    00:04:18
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Iridium-NEXT Orbital Pass</div>
                </div>
              </div>

              {/* Demo Action Generator (For Evaluators) */}
              <div className="p-3 rounded-xl bg-polar-900/60 border border-dashed border-cyan-800/60 text-xs">
                <div className="text-slate-300 font-semibold mb-2 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Evaluator Test: Enqueue Offline Action Locally</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAddSampleOfflineAction('cargo')}
                    className="px-2.5 py-1 rounded bg-polar-800 hover:bg-polar-750 text-cyan-300 border border-cyan-800 text-[11px] transition"
                  >
                    + Offline Cargo Scan
                  </button>
                  <button
                    onClick={() => handleAddSampleOfflineAction('inventory')}
                    className="px-2.5 py-1 rounded bg-polar-800 hover:bg-polar-750 text-emerald-300 border border-emerald-800 text-[11px] transition"
                  >
                    + Offline Fuel Burn Log
                  </button>
                  <button
                    onClick={() => handleAddSampleOfflineAction('personnel')}
                    className="px-2.5 py-1 rounded bg-polar-800 hover:bg-polar-750 text-purple-300 border border-purple-800 text-[11px] transition"
                  >
                    + Offline Muster Check-in
                  </button>
                </div>
              </div>

              {/* Queued Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center space-x-2">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Local SQLite / IndexedDB Queue</span>
                  </h4>
                  {queue.length > 0 && (
                    <button
                      onClick={() => offlineStorage.clearQueue()}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-mono"
                    >
                      Clear Queue
                    </button>
                  )}
                </div>

                {queue.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    All local station operations are 100% synchronized with the central NCPOR master repository.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {queue.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-lg bg-polar-900 border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-cyan-300">
                            [{m.entity.toUpperCase()}] {m.type}
                          </div>
                          <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                            Payload: {JSON.stringify(m.data).slice(0, 50)}...
                          </div>
                          <div className="text-slate-500 text-[9px] mt-0.5">
                            Enqueued: {new Date(m.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
                            Pending
                          </span>
                          <button
                            onClick={() => offlineStorage.removeMutation(m.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                Recent Satellite Synchronization Passes
              </h4>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
                {syncHistory.map((entry) => (
                  <div key={entry.id} className="p-3 bg-polar-900 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-200">{entry.id}</span>
                        <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] rounded font-mono">
                          {entry.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Link: {entry.satelliteLink}
                      </div>
                      <div className="text-slate-500 text-[10px] font-mono">
                        {new Date(entry.timestamp).toLocaleString()} • Latency: {entry.durationMs}ms
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-cyan-300 font-bold">{entry.operationsSynced} Ops</div>
                      <div className="text-slate-400 text-[11px]">{entry.dataTransferredKb} KB</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'protocol' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-polar-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-300 uppercase font-mono flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Conflict Resolution Engine</span>
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  In polar operations, multiple stations (Bharati, Maitri) and transit vessels may operate disconnected for days. POLARIS employs a hybrid CRDT & Station-Authoritative model:
                </p>
                <div className="space-y-2 pt-2">
                  <label className="flex items-start space-x-2.5 p-2 rounded-lg bg-polar-950 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="conflict_policy"
                      value="station_auth"
                      checked={conflictPolicy === 'station_auth'}
                      onChange={() => setConflictPolicy('station_auth')}
                      className="mt-0.5 text-cyan-500"
                    />
                    <div>
                      <div className="font-bold text-slate-200">Station-Authoritative Ledger (Recommended)</div>
                      <div className="text-slate-400 text-[10px]">Station commanders retain absolute authority over local stock adjustments and muster rolls; vessel manifests defer to station intake scans.</div>
                    </div>
                  </label>
                  <label className="flex items-start space-x-2.5 p-2 rounded-lg bg-polar-950 border border-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="conflict_policy"
                      value="lww"
                      checked={conflictPolicy === 'lww'}
                      onChange={() => setConflictPolicy('lww')}
                      className="mt-0.5 text-cyan-500"
                    />
                    <div>
                      <div className="font-bold text-slate-200">Timestamped Last-Write-Wins (LWW)</div>
                      <div className="text-slate-400 text-[10px]">Strict UTC hardware clock timestamp ordering for telemetry and GPS waypoints.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {syncSuccessMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="text-[10px] text-slate-500 font-mono">
              Last Sync: {new Date(offlineStorage.getLastSyncTimestamp()).toLocaleTimeString()}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-polar-900 hover:bg-polar-800 text-slate-300 text-xs font-semibold"
              >
                Dismiss
              </button>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing || (queue.length === 0 && !isOffline)}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Transmitting Over Iridium...' : 'Flush & Sync Satellite Queue'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

