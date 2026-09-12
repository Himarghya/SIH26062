import { 
  Station, Vessel, Expedition, CargoItem, InventoryItem, Personnel, FieldSortie, EmergencyIncident, BlizzardAlertLevel 
} from './types.js';
import { 
  INITIAL_STATIONS, INITIAL_VESSELS, INITIAL_EXPEDITIONS, INITIAL_CARGO, 
  INITIAL_INVENTORY, INITIAL_PERSONNEL, INITIAL_SORTIES, INITIAL_EMERGENCIES 
} from './mockData.js';

class DataStore {
  stations: Station[] = JSON.parse(JSON.stringify(INITIAL_STATIONS));
  vessels: Vessel[] = JSON.parse(JSON.stringify(INITIAL_VESSELS));
  expeditions: Expedition[] = JSON.parse(JSON.stringify(INITIAL_EXPEDITIONS));
  cargo: CargoItem[] = JSON.parse(JSON.stringify(INITIAL_CARGO));
  inventory: InventoryItem[] = JSON.parse(JSON.stringify(INITIAL_INVENTORY));
  personnel: Personnel[] = JSON.parse(JSON.stringify(INITIAL_PERSONNEL));
  sorties: FieldSortie[] = JSON.parse(JSON.stringify(INITIAL_SORTIES));
  emergencies: EmergencyIncident[] = JSON.parse(JSON.stringify(INITIAL_EMERGENCIES));
  
  private changeLog: Array<{ timestamp: string; entity: string; action: string; data: any }> = [];

  recordChange(entity: string, action: string, data: any) {
    this.changeLog.push({
      timestamp: new Date().toISOString(),
      entity,
      action,
      data
    });
    // Keep changelog bounded
    if (this.changeLog.length > 500) {
      this.changeLog.shift();
    }
  }

  // Stations
  getStations() { return this.stations; }
  getStationById(id: string) { return this.stations.find(s => s.id === id); }
  updateStationBlizzard(id: string, level: BlizzardAlertLevel) {
    const station = this.stations.find(s => s.id === id);
    if (station) {
      station.weather.blizzardLevel = level;
      station.weather.lastUpdated = new Date().toISOString();
      if (level === 'STAGE_3_WHITEOUT_LOCKDOWN') {
        station.status = 'High Alert';
      } else if (station.status === 'High Alert' && level === 'NORMAL') {
        station.status = 'Operational';
      }
      this.recordChange('stations', 'UPDATE_BLIZZARD', station);
    }
    return station;
  }

  // Vessels
  getVessels() { return this.vessels; }
  getVesselById(id: string) { return this.vessels.find(v => v.id === id); }
  updateVesselPosition(id: string, lat: number, lng: number, heading: number, speed: number) {
    const vessel = this.vessels.find(v => v.id === id);
    if (vessel) {
      vessel.latitude = lat;
      vessel.longitude = lng;
      vessel.headingDeg = heading;
      vessel.speedKnots = speed;
      vessel.lastTelemetry = new Date().toISOString();
      this.recordChange('vessels', 'UPDATE_POSITION', vessel);
    }
    return vessel;
  }

  // Expeditions
  getExpeditions() { return this.expeditions; }
  addExpedition(expedition: Expedition) {
    this.expeditions.unshift(expedition);
    this.recordChange('expeditions', 'ADD', expedition);
    return expedition;
  }
  updateExpedition(id: string, updates: Partial<Expedition>) {
    const index = this.expeditions.findIndex(e => e.id === id);
    if (index !== -1) {
      this.expeditions[index] = { ...this.expeditions[index], ...updates };
      this.recordChange('expeditions', 'UPDATE', this.expeditions[index]);
      return this.expeditions[index];
    }
    return null;
  }

  // Cargo
  getCargo() { return this.cargo; }
  getCargoById(id: string) { return this.cargo.find(c => c.id === id); }
  getCargoByBarcode(code: string) {
    return this.cargo.find(c => c.barcode === code || c.trackingCode.toLowerCase() === code.toLowerCase());
  }
  addCargo(item: CargoItem) {
    this.cargo.unshift(item);
    this.recordChange('cargo', 'ADD', item);
    return item;
  }
  updateCargoStatus(id: string, status: CargoItem['status'], scannedBy: string) {
    const item = this.cargo.find(c => c.id === id);
    if (item) {
      item.status = status;
      item.lastScannedAt = new Date().toISOString();
      item.lastScannedBy = scannedBy;
      this.recordChange('cargo', 'UPDATE_STATUS', item);
    }
    return item;
  }
  updateColdChainTemp(id: string, currentTemp: number) {
    const item = this.cargo.find(c => c.id === id);
    if (item && item.temperatureSensor) {
      item.temperatureSensor.currentC = currentTemp;
      item.temperatureSensor.lastChecked = new Date().toISOString();
      item.temperatureSensor.isViolated = 
        currentTemp < item.temperatureSensor.requiredMinC || 
        currentTemp > item.temperatureSensor.requiredMaxC;
      this.recordChange('cargo', 'UPDATE_TEMP', item);
    }
    return item;
  }

  // Inventory
  getInventory() { return this.inventory; }
  updateInventoryStock(id: string, deltaQty: number) {
    const item = this.inventory.find(i => i.id === id);
    if (item) {
      item.currentStock = Math.max(0, item.currentStock + deltaQty);
      if (item.burnRatePerDay > 0) {
        item.daysRemaining = Math.floor(item.currentStock / item.burnRatePerDay);
      }
      if (item.currentStock <= item.minSafetyThreshold * 0.5) {
        item.condition = 'Critical Shortage';
      } else if (item.currentStock <= item.minSafetyThreshold) {
        item.condition = 'Low Stock';
      } else {
        item.condition = 'Optimal';
      }
      this.recordChange('inventory', 'UPDATE_STOCK', item);
    }
    return item;
  }

  // Personnel
  getPersonnel() { return this.personnel; }
  musterCheckIn(id: string, passed: boolean = true) {
    const person = this.personnel.find(p => p.id === id);
    if (person) {
      person.biometricMusterPassed = passed;
      person.lastMusterTimestamp = new Date().toISOString();
      this.recordChange('personnel', 'MUSTER', person);
    }
    return person;
  }
  updatePersonnelStatus(id: string, status: Personnel['status']) {
    const person = this.personnel.find(p => p.id === id);
    if (person) {
      person.status = status;
      this.recordChange('personnel', 'UPDATE_STATUS', person);
    }
    return person;
  }

  // Sorties
  getSorties() { return this.sorties; }
  addSortie(sortie: FieldSortie) {
    this.sorties.unshift(sortie);
    this.recordChange('sorties', 'ADD', sortie);
    return sortie;
  }
  updateSortieStatus(id: string, status: FieldSortie['status']) {
    const sortie = this.sorties.find(s => s.id === id);
    if (sortie) {
      sortie.status = status;
      if (status === 'Safe Return') {
        sortie.actualReturnTime = new Date().toISOString();
      }
      this.recordChange('sorties', 'UPDATE_STATUS', sortie);
    }
    return sortie;
  }

  // Emergencies
  getEmergencies() { return this.emergencies; }
  createEmergency(incident: EmergencyIncident) {
    this.emergencies.unshift(incident);
    this.recordChange('emergencies', 'TRIGGER_SOS', incident);
    return incident;
  }
  updateEmergencyStatus(id: string, status: EmergencyIncident['status'], note?: string, operator?: string) {
    const incident = this.emergencies.find(e => e.id === id);
    if (incident) {
      incident.status = status;
      if (note) {
        incident.actionLog.unshift({
          timestamp: new Date().toISOString(),
          note,
          operator: operator || 'Operations Watch Officer'
        });
      }
      this.recordChange('emergencies', 'UPDATE_STATUS', incident);
    }
    return incident;
  }

  // Delta Sync handler for Offline-first satellite sync
  getChangesSince(sinceIso: string) {
    const sinceTime = new Date(sinceIso).getTime();
    return this.changeLog.filter(c => new Date(c.timestamp).getTime() > sinceTime);
  }

  getFullState() {
    return {
      stations: this.stations,
      vessels: this.vessels,
      expeditions: this.expeditions,
      cargo: this.cargo,
      inventory: this.inventory,
      personnel: this.personnel,
      sorties: this.sorties,
      emergencies: this.emergencies,
      serverTime: new Date().toISOString()
    };
  }
}

export const db = new DataStore();
