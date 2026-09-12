import { apiClient } from './client';

export const polarisApi = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },

  // Dashboard
  getDashboardSummary: async () => {
    const res = await apiClient.get('/dashboard/summary');
    return res.data;
  },
  getActivityFeed: async () => {
    const res = await apiClient.get('/dashboard/activity');
    return res.data;
  },
  getDashboardAlerts: async () => {
    const res = await apiClient.get('/dashboard/alerts');
    return res.data;
  },

  // Stations
  getStations: async () => {
    const res = await apiClient.get('/stations');
    return res.data;
  },
  getStationById: async (id: string) => {
    const res = await apiClient.get(`/stations/${id}`);
    return res.data;
  },
  setBlizzardLevel: async (stationId: string, level: string) => {
    const res = await apiClient.post(`/stations/${stationId}/blizzard-level?level=${encodeURIComponent(level)}`);
    return res.data;
  },

  // Expeditions
  getExpeditions: async (params?: { region?: string; status_filter?: string }) => {
    const res = await apiClient.get('/expeditions', { params });
    return res.data;
  },
  getExpeditionById: async (id: string) => {
    const res = await apiClient.get(`/expeditions/${id}`);
    return res.data;
  },
  createExpedition: async (payload: any) => {
    const res = await apiClient.post('/expeditions', payload);
    return res.data;
  },
  updateExpedition: async (id: string, payload: any) => {
    const res = await apiClient.patch(`/expeditions/${id}`, payload);
    return res.data;
  },
  deleteExpedition: async (id: string) => {
    const res = await apiClient.delete(`/expeditions/${id}`);
    return res.data;
  },

  // Cargo
  getCargoList: async (params?: { category?: string; status_filter?: string; is_cold_chain?: boolean }) => {
    const res = await apiClient.get('/cargo', { params });
    return res.data;
  },
  getCargoById: async (id: string) => {
    const res = await apiClient.get(`/cargo/${id}`);
    return res.data;
  },
  getCargoByBarcode: async (barcode: string) => {
    const res = await apiClient.get(`/cargo/barcode/${encodeURIComponent(barcode)}`);
    return res.data;
  },
  createCargo: async (payload: any) => {
    const res = await apiClient.post('/cargo', payload);
    return res.data;
  },
  updateCargo: async (id: string, payload: any) => {
    const res = await apiClient.patch(`/cargo/${id}`, payload);
    return res.data;
  },
  addCargoTrackingEvent: async (id: string, payload: any) => {
    const res = await apiClient.post(`/cargo/${id}/tracking-events`, payload);
    return res.data;
  },

  // Inventory
  getInventory: async (params?: { station_id?: string; category?: string }) => {
    const res = await apiClient.get('/inventory', { params });
    return res.data;
  },
  getInventoryItemById: async (id: string) => {
    const res = await apiClient.get(`/inventory/${id}`);
    return res.data;
  },
  createInventoryItem: async (payload: any) => {
    const res = await apiClient.post('/inventory', payload);
    return res.data;
  },
  getInventoryAlerts: async () => {
    const res = await apiClient.get('/inventory/alerts');
    return res.data;
  },
  getInventoryForecast: async (id: string) => {
    const res = await apiClient.get(`/inventory/forecast/${id}`);
    return res.data;
  },
  createInventoryTransaction: async (id: string, payload: any) => {
    const res = await apiClient.post(`/inventory/${id}/transactions`, payload);
    return res.data;
  },

  // Personnel
  getPersonnelList: async (params?: { station_id?: string; expedition_id?: string; status_filter?: string }) => {
    const res = await apiClient.get('/personnel', { params });
    return res.data;
  },
  getPersonnelById: async (id: string) => {
    const res = await apiClient.get(`/personnel/${id}`);
    return res.data;
  },
  createPersonnel: async (payload: any) => {
    const res = await apiClient.post('/personnel', payload);
    return res.data;
  },
  recordBiometricMuster: async (id: string, passed: boolean) => {
    const res = await apiClient.post(`/personnel/${id}/muster?passed=${passed}`);
    return res.data;
  },
  recordPersonnelMovement: async (id: string, payload: any) => {
    const res = await apiClient.post(`/personnel/${id}/movements`, payload);
    return res.data;
  },

  // Assets
  getAssets: async (params?: { asset_type?: string; status_filter?: string; expedition_id?: string }) => {
    const res = await apiClient.get('/assets', { params });
    return res.data;
  },
  getAssetById: async (id: string) => {
    const res = await apiClient.get(`/assets/${id}`);
    return res.data;
  },
  createAsset: async (payload: any) => {
    const res = await apiClient.post('/assets', payload);
    return res.data;
  },
  recordAssetMaintenance: async (id: string, payload: any) => {
    const res = await apiClient.post(`/assets/${id}/maintenance`, payload);
    return res.data;
  },

  // Emergency
  getIncidents: async (params?: { severity?: string; status_filter?: string; station_id?: string }) => {
    const res = await apiClient.get('/emergency/incidents', { params });
    return res.data;
  },
  getIncidentById: async (id: string) => {
    const res = await apiClient.get(`/emergency/incidents/${id}`);
    return res.data;
  },
  createIncident: async (payload: any) => {
    const res = await apiClient.post('/emergency/incidents', payload);
    return res.data;
  },
  updateIncident: async (id: string, payload: any) => {
    const res = await apiClient.patch(`/emergency/incidents/${id}`, payload);
    return res.data;
  },
  assignIncidentResource: async (id: string, payload: any) => {
    const res = await apiClient.post(`/emergency/incidents/${id}/assignments`, payload);
    return res.data;
  },
  addIncidentUpdate: async (id: string, payload: any) => {
    const res = await apiClient.post(`/emergency/incidents/${id}/updates`, payload);
    return res.data;
  },

  // Analytics
  getAnalyticsSummary: async () => {
    const res = await apiClient.get('/analytics/summary');
    return res.data;
  },

  // Notifications
  getNotifications: async (unread_only?: boolean) => {
    const res = await apiClient.get('/notifications', { params: { unread_only } });
    return res.data;
  },
  markNotificationRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await apiClient.post('/notifications/read-all');
    return res.data;
  },

  // Digital Twin Simulation
  triggerSimulationStep: async (stepId: number) => {
    const res = await apiClient.post(`/simulation/step/${stepId}`);
    return res.data;
  }
};
