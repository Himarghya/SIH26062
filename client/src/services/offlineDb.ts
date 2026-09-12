import { QueuedMutation } from '../types';

const QUEUE_STORAGE_KEY = 'polaris_offline_mutation_queue';
const CACHE_STORAGE_KEY = 'polaris_offline_state_cache';
const LAST_SYNC_KEY = 'polaris_last_sync_timestamp';
const OFFLINE_MODE_KEY = 'polaris_simulated_offline_mode';
const SYNC_HISTORY_KEY = 'polaris_sync_history_log';

export interface SyncHistoryEntry {
  id: string;
  timestamp: string;
  operationsSynced: number;
  dataTransferredKb: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  satelliteLink: string;
  durationMs: number;
}

export const offlineStorage = {
  // Check if simulated offline mode is enabled
  isOfflineMode: (): boolean => {
    return localStorage.getItem(OFFLINE_MODE_KEY) === 'true';
  },

  setOfflineMode: (offline: boolean) => {
    localStorage.setItem(OFFLINE_MODE_KEY, offline ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('polaris-offline-mode-changed', { detail: { offline } }));
  },

  // Get queued offline mutations
  getQueue: (): QueuedMutation[] => {
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Add mutation to queue
  enqueueMutation: (mutation: Omit<QueuedMutation, 'id' | 'timestamp'>) => {
    const queue = offlineStorage.getQueue();
    const item: QueuedMutation = {
      id: `MUT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...mutation,
      timestamp: new Date().toISOString()
    };
    queue.push(item);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('polaris-queue-updated', { detail: { count: queue.length } }));
    return item;
  },

  // Remove specific mutation by id
  removeMutation: (id: string) => {
    const queue = offlineStorage.getQueue().filter(item => item.id !== id);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('polaris-queue-updated', { detail: { count: queue.length } }));
  },

  // Clear queued mutations
  clearQueue: () => {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('polaris-queue-updated', { detail: { count: 0 } }));
  },

  // Save cached snapshot of state
  saveCachedState: (state: any) => {
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch (e) {
      console.warn('Could not cache full state locally:', e);
    }
  },

  // Load cached snapshot
  getCachedState: () => {
    try {
      const data = localStorage.getItem(CACHE_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Get last sync timestamp
  getLastSyncTimestamp: (): string => {
    return localStorage.getItem(LAST_SYNC_KEY) || new Date(Date.now() - 120000).toISOString();
  },

  setLastSyncTimestamp: (ts: string) => {
    localStorage.setItem(LAST_SYNC_KEY, ts);
  },

  // Sync history
  getSyncHistory: (): SyncHistoryEntry[] => {
    try {
      const data = localStorage.getItem(SYNC_HISTORY_KEY);
      if (data) return JSON.parse(data);
    } catch {}
    return [
      {
        id: 'SYNC-101',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        operationsSynced: 8,
        dataTransferredKb: 14.2,
        status: 'SUCCESS',
        satelliteLink: 'Iridium SBD-9602 (Bharati Earth Station)',
        durationMs: 420
      },
      {
        id: 'SYNC-100',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        operationsSynced: 3,
        dataTransferredKb: 5.6,
        status: 'SUCCESS',
        satelliteLink: 'Inmarsat FleetBroadband (MV Vasiliy Golovnin)',
        durationMs: 310
      }
    ];
  },

  addSyncHistoryEntry: (entry: SyncHistoryEntry) => {
    const history = offlineStorage.getSyncHistory();
    history.unshift(entry);
    if (history.length > 20) history.pop();
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
  }
};

