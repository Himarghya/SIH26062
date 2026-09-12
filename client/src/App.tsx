import React, { useState, useEffect } from 'react';
import { 
  Station, 
  Vessel, 
  Expedition, 
  CargoItem, 
  InventoryItem, 
  Personnel, 
  FieldSortie, 
  EmergencyIncident, 
  BlizzardAlertLevel, 
  QueuedMutation 
} from './types';
import { api } from './services/api';
import { offlineStorage } from './services/offlineDb';

// Components & Modals
import { Navbar } from './components/Navbar';
import { BlizzardModal } from './components/BlizzardModal';
import { QRScannerModal } from './components/QRScannerModal';
import { FuelOptimizerModal } from './components/FuelOptimizerModal';
import { SatelliteSyncModal } from './components/SatelliteSyncModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ExpeditionsPage } from './pages/ExpeditionsPage';
import { CargoPage } from './pages/CargoPage';
import { InventoryPage } from './pages/InventoryPage';
import { PersonnelPage } from './pages/PersonnelPage';
import { SortiesPage } from './pages/SortiesPage';
import { EmergencySARPage } from './pages/EmergencySARPage';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStationId, setSelectedStationId] = useState('all');

  // Core Data Stores
  const [stations, setStations] = useState<Station[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [cargo, setCargo] = useState<CargoItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [sorties, setSorties] = useState<FieldSortie[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>([]);

  // System & Offline State
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [syncQueue, setSyncQueue] = useState<QueuedMutation[]>(offlineStorage.getQueue());
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveToast, setLiveToast] = useState<{ message: string; type: 'info' | 'warning' | 'danger' } | null>(null);

  // Modals
  const [isBlizzardModalOpen, setIsBlizzardModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Show temporary toast
  const showToast = (message: string, type: 'info' | 'warning' | 'danger' = 'info') => {
    setLiveToast({ message, type });
    setTimeout(() => setLiveToast(null), 5000);
  };

  // Initial State Hydration
  const loadState = async () => {
    try {
      const data = await api.getState();
      setStations(data.stations);
      setVessels(data.vessels);
      setExpeditions(data.expeditions);
      setCargo(data.cargo);
      setInventory(data.inventory);
      setPersonnel(data.personnel);
      setSorties(data.sorties);
      setEmergencies(data.emergencies);
      offlineStorage.saveCachedState(data);
    } catch (e) {
      console.warn('Network offline or backend unreachable, loading local cached state:', e);
      const cached = offlineStorage.getCachedState();
      if (cached) {
        setStations(cached.stations || []);
        setVessels(cached.vessels || []);
        setExpeditions(cached.expeditions || []);
        setCargo(cached.cargo || []);
        setInventory(cached.inventory || []);
        setPersonnel(cached.personnel || []);
        setSorties(cached.sorties || []);
        setEmergencies(cached.emergencies || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  // WebSocket Live Telemetry Subscriber
  useEffect(() => {
    if (isSimulatedOffline) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.type === 'TELEMETRY_UPDATE') {
            setStations(packet.data.stations);
            setVessels(packet.data.vessels);
            if (Array.isArray(packet.data.cargo)) {
              setCargo(prev => {
                const updatedList = packet.data.cargo as CargoItem[];
                const map = new Map<string, CargoItem>(updatedList.map(item => [item.id, item]));
                return prev.map(c => {
                  const match = map.get(c.id);
                  return match ? { ...c, ...match } : c;
                });
              });
            }
          } else if (packet.type === 'BLIZZARD_ALERT') {
            showToast(`🚨 Blizzard Alert at ${packet.data.station.name}: ${packet.data.level}`, 'danger');
            setStations(prev => prev.map(s => s.id === packet.data.station.id ? packet.data.station : s));
          } else if (packet.type === 'EMERGENCY_SOS_TRIGGERED') {
            showToast(`⚠️ SOS Distress Broadcast: ${packet.data.title}`, 'danger');
            setEmergencies(prev => [packet.data, ...prev]);
          } else if (packet.type === 'CARGO_STATUS_CHANGED') {
            setCargo(prev => prev.map(c => c.id === packet.data.id ? packet.data : c));
          } else if (packet.type === 'MUSTER_UPDATE') {
            setPersonnel(prev => prev.map(p => p.id === packet.data.id ? packet.data : p));
          } else if (packet.type === 'INVENTORY_ADJUSTED') {
            setInventory(prev => prev.map(i => i.id === packet.data.id ? packet.data : i));
          } else if (packet.type === 'SORTIE_STATUS_CHANGED') {
            setSorties(prev => prev.map(s => s.id === packet.data.id ? packet.data : s));
          }
        } catch (e) {
          console.error('Error handling WS packet:', e);
        }
      };
    } catch (e) {
      console.warn('WS connection failed:', e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [isSimulatedOffline]);

  // Satellite Delta Sync Action
  const handleTriggerSatelliteSync = async () => {
    setIsSyncing(true);
    try {
      const queue = offlineStorage.getQueue();
      const lastSync = offlineStorage.getLastSyncTimestamp();
      const response = await api.syncDelta(lastSync, queue);

      if (response.syncSuccess) {
        offlineStorage.clearQueue();
        setSyncQueue([]);
        offlineStorage.setLastSyncTimestamp(response.serverTimestamp);
        await loadState();
        showToast('Satellite Delta Sync completed successfully!', 'info');
      }
    } catch (e) {
      showToast('Satellite sync failed. Will retry on next orbital window.', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  // Mutations Handlers with Offline-first fallback
  const handleTriggerLockdown = async (stationId: string, level: BlizzardAlertLevel) => {
    if (isSimulatedOffline) {
      offlineStorage.enqueueMutation({
        id: stationId,
        entity: 'emergencies',
        type: 'LOCKDOWN',
        data: { level }
      });
      setSyncQueue(offlineStorage.getQueue());
      setStations(prev => prev.map(s => s.id === stationId ? {
        ...s,
        weather: { ...s.weather, blizzardLevel: level }
      } : s));
      showToast('Queued lockdown locally (Satellite Offline Mode)', 'warning');
      return;
    }
    await api.setBlizzardLevel(stationId, level);
  };

  const handleTriggerSOS = async (incident: Partial<EmergencyIncident>) => {
    if (isSimulatedOffline) {
      const offlineInc: EmergencyIncident = {
        id: 'inc-' + Date.now(),
        incidentCode: 'SOS-' + Math.floor(1000 + Math.random() * 9000),
        title: incident.title || 'Emergency',
        stationId: incident.stationId || 'stn-bharati',
        type: incident.type || 'Blizzard Lockdown',
        severity: incident.severity || 'Critical (Life Threat)',
        status: 'Triggered',
        reportedAt: new Date().toISOString(),
        reportedBy: 'Field Officer',
        details: incident.details || '',
        actionLog: [{ timestamp: new Date().toISOString(), note: 'Triggered in offline mode', operator: 'Field Officer' }]
      };
      offlineStorage.enqueueMutation({
        id: offlineInc.id,
        entity: 'emergencies',
        type: 'TRIGGER_SOS',
        data: offlineInc
      });
      setSyncQueue(offlineStorage.getQueue());
      setEmergencies(prev => [offlineInc, ...prev]);
      showToast('SOS recorded to local buffer. Will broadcast on satellite link restoration.', 'warning');
      return;
    }
    const created = await api.triggerSOS(incident);
    setEmergencies(prev => [created, ...prev]);
  };

  const handleUpdateCargoStatus = async (id: string, newStatus: CargoItem['status'], scannedBy: string) => {
    if (isSimulatedOffline) {
      offlineStorage.enqueueMutation({
        id,
        entity: 'cargo',
        type: 'STATUS_UPDATE',
        data: { status: newStatus, scannedBy }
      });
      setSyncQueue(offlineStorage.getQueue());
      setCargo(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, lastScannedBy: scannedBy, lastScannedAt: new Date().toISOString() } : c));
      showToast('Cargo scan queued locally in offline storage', 'info');
      return;
    }
    const updated = await api.updateCargoStatus(id, newStatus, scannedBy);
    setCargo(prev => prev.map(c => c.id === id ? updated : c));
  };

  const handleAdjustInventory = async (id: string, deltaQty: number) => {
    if (isSimulatedOffline) {
      offlineStorage.enqueueMutation({
        id,
        entity: 'inventory',
        type: 'ADJUST',
        data: { deltaQty }
      });
      setSyncQueue(offlineStorage.getQueue());
      setInventory(prev => prev.map(i => i.id === id ? { ...i, currentStock: Math.max(0, i.currentStock + deltaQty) } : i));
      showToast('Stock adjustment queued locally', 'info');
      return;
    }
    const updated = await api.adjustInventory(id, deltaQty);
    setInventory(prev => prev.map(i => i.id === id ? updated : i));
  };

  const handleMusterCheckIn = async (id: string, passed: boolean) => {
    if (isSimulatedOffline) {
      offlineStorage.enqueueMutation({
        id,
        entity: 'personnel',
        type: 'MUSTER',
        data: { passed }
      });
      setSyncQueue(offlineStorage.getQueue());
      setPersonnel(prev => prev.map(p => p.id === id ? { ...p, biometricMusterPassed: passed, lastMusterTimestamp: new Date().toISOString() } : p));
      showToast('Biometric muster logged in local store', 'info');
      return;
    }
    const updated = await api.musterCheckIn(id, passed);
    setPersonnel(prev => prev.map(p => p.id === id ? updated : p));
  };

  const handleCreateSortie = async (sortie: Partial<FieldSortie>) => {
    const created = await api.createSortie(sortie);
    setSorties(prev => [created, ...prev]);
    showToast(`Sortie authorized: ${created.title}`, 'info');
  };

  const handleUpdateSortieStatus = async (id: string, status: FieldSortie['status']) => {
    const updated = await api.updateSortieStatus(id, status);
    setSorties(prev => prev.map(s => s.id === id ? updated : s));
  };

  const handleCreateExpedition = async (exp: Partial<Expedition>) => {
    const created = await api.createExpedition(exp);
    setExpeditions(prev => [created, ...prev]);
    showToast(`Expedition charter confirmed: ${created.expeditionCode}`, 'info');
  };

  const handleUpdateEmergencyStatus = async (id: string, status: EmergencyIncident['status'], note?: string) => {
    const updated = await api.updateEmergencyStatus(id, status, note);
    setEmergencies(prev => prev.map(e => e.id === id ? updated : e));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-polar-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-cyan-300 text-sm tracking-widest uppercase animate-pulse">
          Establishing Secure Polar Satellite Link...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-polar-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stations={stations}
        selectedStationId={selectedStationId}
        setSelectedStationId={setSelectedStationId}
        isSimulatedOffline={isSimulatedOffline}
        setIsSimulatedOffline={setIsSimulatedOffline}
        queuedMutationsCount={syncQueue.length}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenBlizzardModal={() => setIsBlizzardModalOpen(true)}
        onOpenScannerModal={() => setIsScannerModalOpen(true)}
        onOpenFuelModal={() => setIsFuelModalOpen(true)}
      />

      {/* Live Toast Notification Banner */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-mono font-bold flex items-center space-x-2 ${
            liveToast.type === 'danger' ? 'bg-rose-950 border-rose-500 text-rose-200' :
            liveToast.type === 'warning' ? 'bg-amber-950 border-amber-500 text-amber-200' :
            'bg-cyan-950 border-cyan-500 text-cyan-200'
          }`}>
            <span>{liveToast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardPage
            stations={stations}
            vessels={vessels}
            cargo={cargo}
            personnel={personnel}
            sorties={sorties}
            emergencies={emergencies}
            selectedStationId={selectedStationId}
            onSelectStation={setSelectedStationId}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onOpenFuelModal={() => setIsFuelModalOpen(true)}
            onOpenBlizzardModal={() => setIsBlizzardModalOpen(true)}
          />
        )}

        {activeTab === 'expeditions' && (
          <ExpeditionsPage
            expeditions={expeditions}
            stations={stations}
            onCreateExpedition={handleCreateExpedition}
          />
        )}

        {activeTab === 'cargo' && (
          <CargoPage
            cargo={cargo}
            stations={stations}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onUpdateStatus={handleUpdateCargoStatus}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryPage
            inventory={inventory}
            stations={stations}
            selectedStationId={selectedStationId}
            onAdjustStock={handleAdjustInventory}
            onOpenFuelModal={() => setIsFuelModalOpen(true)}
          />
        )}

        {activeTab === 'personnel' && (
          <PersonnelPage
            personnel={personnel}
            stations={stations}
            selectedStationId={selectedStationId}
            onMusterCheckIn={handleMusterCheckIn}
          />
        )}

        {activeTab === 'sorties' && (
          <SortiesPage
            sorties={sorties}
            personnel={personnel}
            stations={stations}
            onCreateSortie={handleCreateSortie}
            onUpdateStatus={handleUpdateSortieStatus}
          />
        )}

        {activeTab === 'sar' && (
          <EmergencySARPage
            emergencies={emergencies}
            stations={stations}
            onTriggerSOS={handleTriggerSOS}
            onUpdateStatus={handleUpdateEmergencyStatus}
            onOpenBlizzardModal={() => setIsBlizzardModalOpen(true)}
          />
        )}
      </main>

      {/* Global Modals */}
      <BlizzardModal
        isOpen={isBlizzardModalOpen}
        onClose={() => setIsBlizzardModalOpen(false)}
        stations={stations}
        onTriggerLockdown={handleTriggerLockdown}
        onTriggerSOS={handleTriggerSOS}
      />

      <QRScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        cargoList={cargo}
        onUpdateStatus={handleUpdateCargoStatus}
      />

      <FuelOptimizerModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        stations={stations}
      />

      <SatelliteSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        queue={syncQueue}
        onTriggerSync={handleTriggerSatelliteSync}
        isSyncing={isSyncing}
      />
    </div>
  );
}

export default App;
