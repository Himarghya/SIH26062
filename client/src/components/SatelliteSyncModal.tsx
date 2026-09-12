import React, { useState } from 'react';
import { QueuedMutation } from '../types';
import { Radio, RefreshCw, CheckCircle, Wifi, Database, X, Zap } from 'lucide-react';

interface SatelliteSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: QueuedMutation[];
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
}

export const SatelliteSyncModal: React.FC<SatelliteSyncModalProps> = ({
  isOpen,
  onClose,
  queue,
  onTriggerSync,
  isSyncing
}) => {
  if (!isOpen) return null;

  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const handleSyncNow = async () => {
    try {
      await onTriggerSync();
      setSyncSuccessMessage('All queued delta micro-packets successfully synchronized over satellite link!');
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-polar-950 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl polar-glow">
        {/* Header */}
        <div className="bg-gradient-to-r from-polar-900 to-polar-850 px-6 py-4 flex items-center justify-between border-b border-cyan-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-600/20 border border-cyan-500/50 text-cyan-300">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 uppercase font-mono tracking-wide">
                Satellite Delta Sync Protocol
              </h2>
              <p className="text-xs text-slate-400">
                Resilient Local-First Cache for Iridium / Inmarsat Narrowband
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-polar-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-polar-900 border border-slate-800">
              <div className="text-slate-400 font-mono">LOCAL QUEUE SIZE</div>
              <div className="text-xl font-bold text-cyan-300 font-mono mt-1">
                {queue.length} <span className="text-xs text-slate-400">Mutations</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Stored in local IndexedDB / Storage</div>
            </div>

            <div className="p-3 rounded-xl bg-polar-900 border border-slate-800">
              <div className="text-slate-400 font-mono">PAYLOAD ESTIMATE</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                {(queue.length * 0.24).toFixed(2)} <span className="text-xs text-slate-400">KB Compressed</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Optimized for 9.6 kbps Iridium link</div>
            </div>
          </div>

          {/* Queued Items List */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pending Offline Transactions</span>
            </h4>

            {queue.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No pending offline mutations. Local storage is fully in sync with NCPOR polar server.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {queue.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-polar-900 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-cyan-300">
                        [{m.entity.toUpperCase()}] {m.type}
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        ID: {m.id} • {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
                      Queued
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {syncSuccessMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-polar-900 hover:bg-polar-800 text-slate-300 text-xs font-semibold"
            >
              Close
            </button>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing || queue.length === 0}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing Packets...' : 'Sync Over Satellite'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
