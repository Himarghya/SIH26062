import { QueuedMutation } from '../types';

const QUEUE_STORAGE_KEY = 'polaris_offline_mutation_queue';
const CACHE_STORAGE_KEY = 'polaris_offline_state_cache';
const LAST_SYNC_KEY = 'polaris_last_sync_timestamp';

export const offlineStorage = {
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
  enqueueMutation: (mutation: Omit<QueuedMutation, 'timestamp'>) => {
    const queue = offlineStorage.getQueue();
    const item: QueuedMutation = {
      ...mutation,
      timestamp: new Date().toISOString()
    };
    queue.push(item);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return item;
  },

  // Clear queued mutations
  clearQueue: () => {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
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
    return localStorage.getItem(LAST_SYNC_KEY) || new Date(Date.now() - 86400000).toISOString();
  },

  setLastSyncTimestamp: (ts: string) => {
    localStorage.setItem(LAST_SYNC_KEY, ts);
  }
};
