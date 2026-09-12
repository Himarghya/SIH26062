import { Router, Request, Response } from 'express';
import { db } from '../store.js';
import { telemetrySimulator } from '../simulators/telemetrySimulator.js';

export const apiRouter = Router();

// Full initial state for fast hydration
apiRouter.get('/state', (req: Request, res: Response) => {
  res.json(db.getFullState());
});

// Stations
apiRouter.get('/stations', (req: Request, res: Response) => {
  res.json(db.getStations());
});

apiRouter.post('/stations/:id/blizzard-level', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { level } = req.body;
  const updated = db.updateStationBlizzard(id, level);
  if (!updated) {
    return res.status(404).json({ error: 'Station not found' });
  }
  telemetrySimulator.broadcast('BLIZZARD_ALERT', { station: updated, level });
  res.json(updated);
});

// Vessels
apiRouter.get('/vessels', (req: Request, res: Response) => {
  res.json(db.getVessels());
});

// Expeditions
apiRouter.get('/expeditions', (req: Request, res: Response) => {
  res.json(db.getExpeditions());
});

apiRouter.post('/expeditions', (req: Request, res: Response) => {
  const expedition = req.body;
  if (!expedition.id) expedition.id = 'exp-' + Date.now();
  const created = db.addExpedition(expedition);
  telemetrySimulator.broadcast('EXPEDITION_CREATED', created);
  res.status(201).json(created);
});

apiRouter.put('/expeditions/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const updated = db.updateExpedition(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Expedition not found' });
  telemetrySimulator.broadcast('EXPEDITION_UPDATED', updated);
  res.json(updated);
});

// Cargo
apiRouter.get('/cargo', (req: Request, res: Response) => {
  res.json(db.getCargo());
});

apiRouter.get('/cargo/scan/:code', (req: Request, res: Response) => {
  const code = String(req.params.code);
  const item = db.getCargoByBarcode(code);
  if (!item) {
    return res.status(404).json({ error: 'No cargo found matching barcode/tag: ' + code });
  }
  res.json(item);
});

apiRouter.post('/cargo', (req: Request, res: Response) => {
  const item = req.body;
  if (!item.id) item.id = 'crg-' + Date.now();
  const created = db.addCargo(item);
  telemetrySimulator.broadcast('CARGO_CREATED', created);
  res.status(201).json(created);
});

apiRouter.put('/cargo/:id/status', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status, scannedBy } = req.body;
  const updated = db.updateCargoStatus(id, status, scannedBy || 'Field Operator');
  if (!updated) return res.status(404).json({ error: 'Cargo item not found' });
  telemetrySimulator.broadcast('CARGO_STATUS_CHANGED', updated);
  res.json(updated);
});

apiRouter.put('/cargo/:id/temperature', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { temperature } = req.body;
  const updated = db.updateColdChainTemp(id, Number(temperature));
  if (!updated) return res.status(404).json({ error: 'Cargo item or sensor not found' });
  telemetrySimulator.broadcast('COLD_CHAIN_TEMP_ALERT', updated);
  res.json(updated);
});

// Inventory
apiRouter.get('/inventory', (req: Request, res: Response) => {
  res.json(db.getInventory());
});

apiRouter.post('/inventory/:id/adjust', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { deltaQty } = req.body;
  const updated = db.updateInventoryStock(id, Number(deltaQty));
  if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
  telemetrySimulator.broadcast('INVENTORY_ADJUSTED', updated);
  res.json(updated);
});

// Personnel & Muster
apiRouter.get('/personnel', (req: Request, res: Response) => {
  res.json(db.getPersonnel());
});

apiRouter.post('/personnel/:id/muster', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { passed } = req.body;
  const updated = db.musterCheckIn(id, passed ?? true);
  if (!updated) return res.status(404).json({ error: 'Personnel not found' });
  telemetrySimulator.broadcast('MUSTER_UPDATE', updated);
  res.json(updated);
});

// Sorties
apiRouter.get('/sorties', (req: Request, res: Response) => {
  res.json(db.getSorties());
});

apiRouter.post('/sorties', (req: Request, res: Response) => {
  const sortie = req.body;
  if (!sortie.id) sortie.id = 'srt-' + Date.now();
  const created = db.addSortie(sortie);
  telemetrySimulator.broadcast('SORTIE_CREATED', created);
  res.status(201).json(created);
});

apiRouter.put('/sorties/:id/status', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;
  const updated = db.updateSortieStatus(id, status);
  if (!updated) return res.status(404).json({ error: 'Sortie not found' });
  telemetrySimulator.broadcast('SORTIE_STATUS_CHANGED', updated);
  res.json(updated);
});

// Emergencies & SOS
apiRouter.get('/emergencies', (req: Request, res: Response) => {
  res.json(db.getEmergencies());
});

apiRouter.post('/emergencies/sos', (req: Request, res: Response) => {
  const incident = req.body;
  if (!incident.id) incident.id = 'inc-' + Date.now();
  if (!incident.incidentCode) incident.incidentCode = 'SOS-' + Math.floor(1000 + Math.random() * 9000);
  incident.reportedAt = new Date().toISOString();
  if (!incident.actionLog) {
    incident.actionLog = [{
      timestamp: new Date().toISOString(),
      note: 'Emergency SOS Broadcasted to Antarctic Operations Command',
      operator: incident.reportedBy || 'SAR Controller'
    }];
  }
  const created = db.createEmergency(incident);
  telemetrySimulator.broadcast('EMERGENCY_SOS_TRIGGERED', created);
  res.status(201).json(created);
});

apiRouter.put('/emergencies/:id/status', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status, note, operator } = req.body;
  const updated = db.updateEmergencyStatus(id, status, note, operator);
  if (!updated) return res.status(404).json({ error: 'Emergency incident not found' });
  telemetrySimulator.broadcast('EMERGENCY_STATUS_CHANGED', updated);
  res.json(updated);
});

// Resilient Satellite Delta Sync Protocol
apiRouter.post('/sync/delta', (req: Request, res: Response) => {
  const { clientLastSyncTimestamp, clientQueue } = req.body;
  
  const processedResults: any[] = [];
  if (Array.isArray(clientQueue)) {
    for (const mutation of clientQueue) {
      if (mutation.entity === 'cargo' && mutation.type === 'STATUS_UPDATE') {
        const item = db.updateCargoStatus(mutation.id, mutation.data.status, mutation.data.scannedBy);
        processedResults.push({ id: mutation.id, success: !!item });
      } else if (mutation.entity === 'personnel' && mutation.type === 'MUSTER') {
        const p = db.musterCheckIn(mutation.id, mutation.data.passed);
        processedResults.push({ id: mutation.id, success: !!p });
      } else if (mutation.entity === 'inventory' && mutation.type === 'ADJUST') {
        const inv = db.updateInventoryStock(mutation.id, mutation.data.deltaQty);
        processedResults.push({ id: mutation.id, success: !!inv });
      }
    }
  }

  const serverChanges = clientLastSyncTimestamp ? db.getChangesSince(clientLastSyncTimestamp) : [];

  res.json({
    syncSuccess: true,
    serverTimestamp: new Date().toISOString(),
    processedCount: processedResults.length,
    serverChanges,
    fullState: !clientLastSyncTimestamp ? db.getFullState() : undefined
  });
});

// Smart AI Fuel Predictor
apiRouter.post('/ai/fuel-forecast', (req: Request, res: Response) => {
  const { stationId, avgWinterTempC, generatorCount, blizzardDaysEstimated } = req.body;
  const station = db.getStationById(stationId || 'stn-bharati');
  if (!station) return res.status(404).json({ error: 'Station not found' });

  const temp = avgWinterTempC ?? station.weather.temperatureC;
  const gens = generatorCount ?? 2;
  const blizzardDays = blizzardDaysEstimated ?? 25;

  const coldExcess = Math.max(0, -15 - temp);
  const thermalMultiplier = 1.0 + (coldExcess * 0.018);
  const blizzardMultiplier = 1.0 + (blizzardDays / 365.0 * 0.15);

  const dailyFuelBurnLiters = Math.round(gens * 240 * thermalMultiplier * blizzardMultiplier);
  const currentReserves = station.resources.polarDieselLiters;
  const projectedDaysAutonomous = Math.floor(currentReserves / dailyFuelBurnLiters);

  res.json({
    stationName: station.name,
    currentStockLiters: currentReserves,
    projectedDailyBurnLiters: dailyFuelBurnLiters,
    projectedDaysAutonomous,
    recommendedResupplyWindowDays: Math.max(30, projectedDaysAutonomous - 60),
    safetyStatus: projectedDaysAutonomous > 240 ? 'SAFE_AUTONOMOUS' : projectedDaysAutonomous > 120 ? 'MONITOR_CLOSELY' : 'CRITICAL_SHORTAGE_RISK'
  });
});
