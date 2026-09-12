import { 
  Station, Vessel, Expedition, CargoItem, InventoryItem, Personnel, FieldSortie, EmergencyIncident, BlizzardAlertLevel 
} from '../types';

const API_BASE = '/api';

export const api = {
  // State
  getState: async () => {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error('Failed to fetch state');
    return res.json();
  },

  // Stations
  getStations: async (): Promise<Station[]> => {
    const res = await fetch(`${API_BASE}/stations`);
    return res.json();
  },
  setBlizzardLevel: async (stationId: string, level: BlizzardAlertLevel) => {
    const res = await fetch(`${API_BASE}/stations/${stationId}/blizzard-level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level })
    });
    return res.json();
  },

  // Vessels
  getVessels: async (): Promise<Vessel[]> => {
    const res = await fetch(`${API_BASE}/vessels`);
    return res.json();
  },

  // Expeditions
  getExpeditions: async (): Promise<Expedition[]> => {
    const res = await fetch(`${API_BASE}/expeditions`);
    return res.json();
  },
  createExpedition: async (expedition: Partial<Expedition>) => {
    const res = await fetch(`${API_BASE}/expeditions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expedition)
    });
    return res.json();
  },
  updateExpedition: async (id: string, updates: Partial<Expedition>) => {
    const res = await fetch(`${API_BASE}/expeditions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Cargo
  getCargo: async (): Promise<CargoItem[]> => {
    const res = await fetch(`${API_BASE}/cargo`);
    return res.json();
  },
  scanCargo: async (code: string): Promise<CargoItem> => {
    const res = await fetch(`${API_BASE}/cargo/scan/${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error('Cargo not found');
    return res.json();
  },
  updateCargoStatus: async (id: string, status: CargoItem['status'], scannedBy: string) => {
    const res = await fetch(`${API_BASE}/cargo/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, scannedBy })
    });
    return res.json();
  },

  // Inventory
  getInventory: async (): Promise<InventoryItem[]> => {
    const res = await fetch(`${API_BASE}/inventory`);
    return res.json();
  },
  adjustInventory: async (id: string, deltaQty: number) => {
    const res = await fetch(`${API_BASE}/inventory/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deltaQty })
    });
    return res.json();
  },

  // Personnel & Muster
  getPersonnel: async (): Promise<Personnel[]> => {
    const res = await fetch(`${API_BASE}/personnel`);
    return res.json();
  },
  musterCheckIn: async (id: string, passed: boolean = true) => {
    const res = await fetch(`${API_BASE}/personnel/${id}/muster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passed })
    });
    return res.json();
  },

  // Sorties
  getSorties: async (): Promise<FieldSortie[]> => {
    const res = await fetch(`${API_BASE}/sorties`);
    return res.json();
  },
  createSortie: async (sortie: Partial<FieldSortie>) => {
    const res = await fetch(`${API_BASE}/sorties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sortie)
    });
    return res.json();
  },
  updateSortieStatus: async (id: string, status: FieldSortie['status']) => {
    const res = await fetch(`${API_BASE}/sorties/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Emergencies
  getEmergencies: async (): Promise<EmergencyIncident[]> => {
    const res = await fetch(`${API_BASE}/emergencies`);
    return res.json();
  },
  triggerSOS: async (incident: Partial<EmergencyIncident>) => {
    const res = await fetch(`${API_BASE}/emergencies/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incident)
    });
    return res.json();
  },
  updateEmergencyStatus: async (id: string, status: EmergencyIncident['status'], note?: string) => {
    const res = await fetch(`${API_BASE}/emergencies/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    });
    return res.json();
  },

  // Satellite Delta Sync
  syncDelta: async (clientLastSyncTimestamp: string, clientQueue: any[]) => {
    const res = await fetch(`${API_BASE}/sync/delta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientLastSyncTimestamp, clientQueue })
    });
    return res.json();
  },

  // AI Fuel Prediction
  getFuelForecast: async (params: { stationId: string; avgWinterTempC: number; generatorCount: number; blizzardDaysEstimated: number }) => {
    const res = await fetch(`${API_BASE}/ai/fuel-forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  }
};
