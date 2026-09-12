export type BlizzardAlertLevel = 'NORMAL' | 'STAGE_1_ADVISORY' | 'STAGE_2_WARNING' | 'STAGE_3_WHITEOUT_LOCKDOWN';

export interface Station {
  id: string;
  name: string;
  code: string;
  region: 'Antarctica' | 'Arctic' | 'Himalayas' | 'Oceanic Vessel';
  locationName: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  activePersonnel: number;
  capacity: number;
  status: 'Operational' | 'Wintering' | 'Seasonal Closure' | 'High Alert';
  weather: {
    temperatureC: number;
    windSpeedKmh: number;
    windDirection: string;
    windChillC: number;
    visibilityKm: number;
    barometricPressureHpa: number;
    blizzardLevel: BlizzardAlertLevel;
    lastUpdated: string;
  };
  resources: {
    polarDieselLiters: number;
    polarDieselMaxLiters: number;
    jetA1Liters: number;
    jetA1MaxLiters: number;
    rationDaysRemaining: number;
    waterLiters: number;
    medicalOxygenCylinders: number;
  };
  satelliteUplink: {
    status: 'Online' | 'Intermittent' | 'Offline';
    latencyMs: number;
    bandwidthKbps: number;
    provider: 'Iridium Certus' | 'Inmarsat FleetBroadband' | 'Starlink Polar';
    lastSync: string;
  };
}

export interface Vessel {
  id: string;
  name: string;
  type: 'Icebreaker' | 'Polar Research Vessel' | 'Support Helicopter' | 'PistenBully Snowcat';
  callSign: string;
  iceClass: string;
  latitude: number;
  longitude: number;
  headingDeg: number;
  speedKnots: number;
  status: 'Underway' | 'Icebreaking' | 'Moored at Sea Ice' | 'At Anchorage' | 'Maintenance';
  origin: string;
  destination: string;
  eta: string;
  capacityTons: number;
  currentCargoTons: number;
  fuelPct: number;
  crewCount: number;
  lastTelemetry: string;
}

export interface Expedition {
  id: string;
  expeditionCode: string;
  title: string;
  theme: string;
  season: '2025-2026' | '2026-2027';
  leader: {
    name: string;
    designation: string;
    organization: string;
    email: string;
    satellitePhone: string;
  };
  stationsCovered: string[];
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Mobilizing' | 'Active In-Field' | 'Demobilizing' | 'Completed';
  totalPersonnel: number;
  allocatedBudgetCrores: number;
  cargoQuotaTons: number;
  scientificObjectives: string[];
  riskIndex: number;
}

export type CargoCategory = 
  | 'Scientific Equipment'
  | 'Cold-Chain Biological Samples'
  | 'Polar Survival Gear'
  | 'Station Machinery Spares'
  | 'Fuel & Cryogenics'
  | 'Food & Provisions'
  | 'Medical Supplies';

export interface CargoItem {
  id: string;
  trackingCode: string;
  containerId: string;
  barcode: string;
  name: string;
  category: CargoCategory;
  origin: string;
  destinationStationId: string;
  weightKg: number;
  volumeM3: number;
  status: 'Staged at Port' | 'Vessel Hold' | 'Helicopter Transit' | 'Received at Station' | 'Deployed at Field Site';
  isColdChain: boolean;
  temperatureSensor?: {
    requiredMinC: number;
    requiredMaxC: number;
    currentC: number;
    batteryPct: number;
    isViolated: boolean;
    lastChecked: string;
  };
  hazardType: 'None' | 'Class 3 Flammable' | 'Class 9 Lithium-Ion' | 'Cryogenic' | 'Bio-Preserved';
  assignedVesselId?: string;
  priority: 'Routine' | 'High' | 'Mission Critical';
  lastScannedAt: string;
  lastScannedBy: string;
}

export interface InventoryItem {
  id: string;
  stationId: string;
  sku: string;
  name: string;
  category: 'Polar Fuel' | 'Survival Food' | 'Generator Spares' | 'Medical' | 'Scientific Consumables' | 'Extreme Cold Gear';
  currentStock: number;
  unit: 'Liters' | 'kg' | 'Packs' | 'Units' | 'Cylinders' | 'Sets';
  minSafetyThreshold: number;
  burnRatePerDay: number;
  daysRemaining: number;
  storageLocation: string;
  expiryDate?: string;
  condition: 'Optimal' | 'Inspection Due' | 'Low Stock' | 'Critical Shortage';
}

export interface Personnel {
  id: string;
  name: string;
  role: 'Expedition Leader' | 'Station Commander' | 'Logistics Officer' | 'Station Medic' | 'Senior Meteorologist' | 'Glaciologist' | 'Mechanical Engineer' | 'Communications Specialist' | 'Helo Pilot';
  stationId: string;
  organization: string;
  bloodGroup: string;
  fitnessStatus: 'Class-1 Polar Cleared' | 'Pending Altitude Test' | 'Temporary Grounded';
  survivalTrainingCertDate: string;
  status: 'On Station' | 'Field Sortie' | 'In Transit' | 'Medical Bay';
  assignedShelter: string;
  satelliteRadioId: string;
  lastMusterTimestamp: string;
  biometricMusterPassed: boolean;
}

export interface FieldSortie {
  id: string;
  title: string;
  stationId: string;
  leadPersonnelId: string;
  teamPersonnelIds: string[];
  vehicleType: 'PistenBully Snowcat' | 'Skidoo Snowmobile' | 'Helicopter' | 'Foot Traverse';
  destinationName: string;
  coordinates: { lat: number; lng: number }[];
  departureTime: string;
  estimatedReturnTime: string;
  actualReturnTime?: string;
  status: 'Planned' | 'Active In Field' | 'Overdue' | 'Safe Return' | 'Emergency Halted';
  hazardLevel: 'Low' | 'Crevasse Danger' | 'Katabatic Wind Threat' | 'Whiteout High Risk';
  radioCheckFrequencyMins: number;
  lastCheckInTime: string;
}

export interface EmergencyIncident {
  id: string;
  incidentCode: string;
  title: string;
  stationId: string;
  type: 'Blizzard Lockdown' | 'Crevasse Rescue' | 'Generator Total Failure' | 'Medical Evac' | 'Fuel Leakage' | 'Lost Contact with Sortie';
  severity: 'Advisory' | 'Moderate' | 'Critical (Life Threat)';
  status: 'Triggered' | 'SAR Deployed' | 'Contained' | 'Resolved';
  reportedAt: string;
  reportedBy: string;
  details: string;
  sarTeamAssigned?: string[];
  actionLog: { timestamp: string; note: string; operator: string }[];
}

export interface QueuedMutation {
  id: string;
  entity: 'cargo' | 'personnel' | 'inventory' | 'sorties' | 'emergencies';
  type: string;
  data: any;
  timestamp: string;
}
