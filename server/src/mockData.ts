import { Station, Vessel, Expedition, CargoItem, InventoryItem, Personnel, FieldSortie, EmergencyIncident } from './types.js';

export const INITIAL_STATIONS: Station[] = [
  {
    id: 'stn-bharati',
    name: 'Bharati Station',
    code: 'BHR-ANT',
    region: 'Antarctica',
    locationName: 'Larsemann Hills, East Antarctica',
    latitude: -69.4075,
    longitude: 76.1942,
    elevationM: 35,
    activePersonnel: 24,
    capacity: 47,
    status: 'Wintering',
    weather: {
      temperatureC: -28.4,
      windSpeedKmh: 42,
      windDirection: 'ESE (Katabatic)',
      windChillC: -41.2,
      visibilityKm: 8.5,
      barometricPressureHpa: 982.4,
      blizzardLevel: 'NORMAL',
      lastUpdated: new Date().toISOString()
    },
    resources: {
      polarDieselLiters: 184500,
      polarDieselMaxLiters: 260000,
      jetA1Liters: 42000,
      jetA1MaxLiters: 60000,
      rationDaysRemaining: 285,
      waterLiters: 34000,
      medicalOxygenCylinders: 18
    },
    satelliteUplink: {
      status: 'Online',
      latencyMs: 640,
      bandwidthKbps: 512,
      provider: 'Starlink Polar',
      lastSync: new Date().toISOString()
    }
  },
  {
    id: 'stn-maitri',
    name: 'Maitri Station',
    code: 'MTR-ANT',
    region: 'Antarctica',
    locationName: 'Schirmacher Oasis, Queen Maud Land',
    latitude: -70.7667,
    longitude: 11.7333,
    elevationM: 117,
    activePersonnel: 22,
    capacity: 40,
    status: 'Wintering',
    weather: {
      temperatureC: -32.1,
      windSpeedKmh: 68,
      windDirection: 'SE',
      windChillC: -49.6,
      visibilityKm: 3.2,
      barometricPressureHpa: 974.1,
      blizzardLevel: 'STAGE_1_ADVISORY',
      lastUpdated: new Date().toISOString()
    },
    resources: {
      polarDieselLiters: 132000,
      polarDieselMaxLiters: 220000,
      jetA1Liters: 28000,
      jetA1MaxLiters: 50000,
      rationDaysRemaining: 210,
      waterLiters: 28000,
      medicalOxygenCylinders: 14
    },
    satelliteUplink: {
      status: 'Intermittent',
      latencyMs: 980,
      bandwidthKbps: 64,
      provider: 'Iridium Certus',
      lastSync: new Date().toISOString()
    }
  },
  {
    id: 'stn-himadri',
    name: 'Himadri Research Station',
    code: 'HMD-ARC',
    region: 'Arctic',
    locationName: 'Ny-Ålesund, Spitsbergen, Svalbard',
    latitude: 78.9235,
    longitude: 11.9099,
    elevationM: 12,
    activePersonnel: 8,
    capacity: 15,
    status: 'Operational',
    weather: {
      temperatureC: -14.6,
      windSpeedKmh: 24,
      windDirection: 'NE',
      windChillC: -22.3,
      visibilityKm: 15.0,
      barometricPressureHpa: 1008.2,
      blizzardLevel: 'NORMAL',
      lastUpdated: new Date().toISOString()
    },
    resources: {
      polarDieselLiters: 65000,
      polarDieselMaxLiters: 80000,
      jetA1Liters: 15000,
      jetA1MaxLiters: 20000,
      rationDaysRemaining: 340,
      waterLiters: 18000,
      medicalOxygenCylinders: 8
    },
    satelliteUplink: {
      status: 'Online',
      latencyMs: 140,
      bandwidthKbps: 4096,
      provider: 'Starlink Polar',
      lastSync: new Date().toISOString()
    }
  },
  {
    id: 'stn-indarc',
    name: 'IndARC Underwater Mooring',
    code: 'IND-ARC',
    region: 'Arctic',
    locationName: 'Kongsfjorden Fjord, Arctic Ocean',
    latitude: 78.9812,
    longitude: 12.0124,
    elevationM: -192,
    activePersonnel: 0,
    capacity: 0,
    status: 'Operational',
    weather: {
      temperatureC: -1.2,
      windSpeedKmh: 18,
      windDirection: 'N',
      windChillC: -1.2,
      visibilityKm: 20.0,
      barometricPressureHpa: 1012.0,
      blizzardLevel: 'NORMAL',
      lastUpdated: new Date().toISOString()
    },
    resources: {
      polarDieselLiters: 0,
      polarDieselMaxLiters: 0,
      jetA1Liters: 0,
      jetA1MaxLiters: 0,
      rationDaysRemaining: 0,
      waterLiters: 0,
      medicalOxygenCylinders: 0
    },
    satelliteUplink: {
      status: 'Online',
      latencyMs: 1200,
      bandwidthKbps: 9.6,
      provider: 'Iridium Certus',
      lastSync: new Date().toISOString()
    }
  }
];

export const INITIAL_VESSELS: Vessel[] = [
  {
    id: 'vsl-vasiliy',
    name: 'MV Vasiliy Golovnin (Chartered Icebreaker)',
    type: 'Icebreaker',
    callSign: 'UBST-44',
    iceClass: 'DNV Ice-10 / Polar Class 3',
    latitude: -62.1542,
    longitude: 64.3129,
    headingDeg: 168,
    speedKnots: 11.4,
    status: 'Underway',
    origin: 'Cape Town, South Africa',
    destination: 'Larsemann Hills (Bharati Fast Ice)',
    eta: '2026-10-18T14:00:00Z',
    capacityTons: 4200,
    currentCargoTons: 3180,
    fuelPct: 82,
    crewCount: 46,
    lastTelemetry: new Date().toISOString()
  },
  {
    id: 'vsl-sagarkanya',
    name: 'ORV Sagar Kanya',
    type: 'Polar Research Vessel',
    callSign: 'VWKD-7',
    iceClass: 'Ice Class B',
    latitude: -48.3312,
    longitude: 57.2201,
    headingDeg: 194,
    speedKnots: 9.8,
    status: 'Underway',
    origin: 'Goa (Mormugao Port)',
    destination: 'Southern Ocean Core Sampling Transect',
    eta: '2026-10-24T08:30:00Z',
    capacityTons: 1500,
    currentCargoTons: 890,
    fuelPct: 74,
    crewCount: 38,
    lastTelemetry: new Date().toISOString()
  },
  {
    id: 'vsl-kamov1',
    name: 'Kamov Ka-32 Polar Helo (VT-NCP1)',
    type: 'Support Helicopter',
    callSign: 'VT-NCP1',
    iceClass: 'Extreme Cold Rotorcraft',
    latitude: -69.3980,
    longitude: 76.2100,
    headingDeg: 0,
    speedKnots: 0,
    status: 'Moored at Sea Ice',
    origin: 'Bharati Helipad',
    destination: 'Fast Ice Cargo Drop Zone 2',
    eta: '2026-10-12T16:00:00Z',
    capacityTons: 4.5,
    currentCargoTons: 0,
    fuelPct: 91,
    crewCount: 3,
    lastTelemetry: new Date().toISOString()
  }
];

export const INITIAL_EXPEDITIONS: Expedition[] = [
  {
    id: 'exp-isea44',
    expeditionCode: 'ISEA-44',
    title: '44th Indian Scientific Expedition to Antarctica',
    theme: 'Cryospheric Response to Global Warming & Deep Ice Core Paleoclimate',
    season: '2025-2026',
    leader: {
      name: 'Dr. Arvind Swaminathan',
      designation: 'Scientist-G & Mission Director',
      organization: 'National Centre for Polar and Ocean Research (NCPOR)',
      email: 'a.swaminathan@ncpor.res.in',
      satellitePhone: '+8816-3184-9021'
    },
    stationsCovered: ['stn-bharati', 'stn-maitri'],
    startDate: '2025-11-15',
    endDate: '2026-12-10',
    status: 'Active In-Field',
    totalPersonnel: 46,
    allocatedBudgetCrores: 88.5,
    cargoQuotaTons: 4100,
    scientificObjectives: [
      '500-meter shallow ice core retrieval at Princess Elizabeth Land',
      'Continuous geomagnetic pulsations recording at Maitri',
      'Microbial biodiversity genomics in subglacial lakes',
      'Radiation balance and katabatic wind dynamics monitoring'
    ],
    riskIndex: 7
  },
  {
    id: 'exp-arc2026',
    expeditionCode: 'ARC-2026-S',
    title: 'Indian Arctic Spring-Summer Campaign 2026',
    theme: 'Atmospheric Aerosols & Arctic Amplification Teleconnections',
    season: '2025-2026',
    leader: {
      name: 'Dr. Meera Nambiar',
      designation: 'Group Director (Polar Science)',
      organization: 'NCPOR / Ministry of Earth Sciences',
      email: 'm.nambiar@ncpor.res.in',
      satellitePhone: '+8816-4190-2811'
    },
    stationsCovered: ['stn-himadri', 'stn-indarc'],
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    status: 'Active In-Field',
    totalPersonnel: 12,
    allocatedBudgetCrores: 14.2,
    cargoQuotaTons: 320,
    scientificObjectives: [
      'IndARC underwater mooring data retrieval & CTD profiling',
      'Black carbon aerosol optical depth profiling over Svalbard',
      'Marine biogeochemical sampling in Kongsfjorden fjord'
    ],
    riskIndex: 4
  }
];

export const INITIAL_CARGO: CargoItem[] = [
  {
    id: 'crg-001',
    trackingCode: 'BHR-ISO-9012',
    containerId: 'CON-BHR-20',
    barcode: '890126062001',
    name: 'Sub-Zero Multi-Channel Ice Core Drill Unit (Mk-IV)',
    category: 'Scientific Equipment',
    origin: 'NCPOR Logistics Complex, Vasco da Gama, Goa',
    destinationStationId: 'stn-bharati',
    weightKg: 2850,
    volumeM3: 9.4,
    status: 'Vessel Hold',
    isColdChain: false,
    hazardType: 'None',
    assignedVesselId: 'vsl-vasiliy',
    priority: 'Mission Critical',
    lastScannedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastScannedBy: 'R. K. Sharma (Port Logistics Officer)'
  },
  {
    id: 'crg-002',
    trackingCode: 'BHR-CRYO-402',
    containerId: 'CRYO-L-04',
    barcode: '890126062002',
    name: 'Antarctic Cryophilic Bacterial Strains & Algal Cores (-80°C)',
    category: 'Cold-Chain Biological Samples',
    origin: 'Larsemann Hills Field Camp 3',
    destinationStationId: 'stn-bharati',
    weightKg: 140,
    volumeM3: 0.8,
    status: 'Received at Station',
    isColdChain: true,
    temperatureSensor: {
      requiredMinC: -85.0,
      requiredMaxC: -75.0,
      currentC: -79.4,
      batteryPct: 94,
      isViolated: false,
      lastChecked: new Date().toISOString()
    },
    hazardType: 'Bio-Preserved',
    priority: 'Mission Critical',
    lastScannedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    lastScannedBy: 'Dr. P. Deshmukh (Microbiologist)'
  },
  {
    id: 'crg-003',
    trackingCode: 'MTR-GEN-881',
    containerId: 'CON-MTR-12',
    barcode: '890126062003',
    name: 'Cummins KTA-19 Polar Diesel Generator Turbocharger Spares',
    category: 'Station Machinery Spares',
    origin: 'Cape Town Staging Depot',
    destinationStationId: 'stn-maitri',
    weightKg: 620,
    volumeM3: 2.1,
    status: 'Vessel Hold',
    isColdChain: false,
    hazardType: 'None',
    assignedVesselId: 'vsl-vasiliy',
    priority: 'High',
    lastScannedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastScannedBy: 'Vikram Negi (Chief Engineer)'
  },
  {
    id: 'crg-004',
    trackingCode: 'BHR-FUEL-108',
    containerId: 'ISO-TANK-08',
    barcode: '890126062004',
    name: 'Special Low Pour Point Polar Diesel (D-10 / -50°C Cloud Point)',
    category: 'Fuel & Cryogenics',
    origin: 'Indian Oil Corporation Ltd (Haldia/Mormugao)',
    destinationStationId: 'stn-bharati',
    weightKg: 22000,
    volumeM3: 26.0,
    status: 'Vessel Hold',
    isColdChain: false,
    hazardType: 'Class 3 Flammable',
    assignedVesselId: 'vsl-vasiliy',
    priority: 'Mission Critical',
    lastScannedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    lastScannedBy: 'S. Bhattacharya (Fuel Logistics Lead)'
  },
  {
    id: 'crg-005',
    trackingCode: 'HMD-MET-204',
    containerId: 'FLIGHT-BOX-02',
    barcode: '890126062005',
    name: 'High-Altitude LIDAR Aerosol Profiler Optics & Laser Diode',
    category: 'Scientific Equipment',
    origin: 'IMD Polar Tech Lab, New Delhi',
    destinationStationId: 'stn-himadri',
    weightKg: 85,
    volumeM3: 0.45,
    status: 'Received at Station',
    isColdChain: false,
    hazardType: 'Class 9 Lithium-Ion',
    priority: 'High',
    lastScannedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    lastScannedBy: 'Dr. K. Verma (Atmospheric Scientist)'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    stationId: 'stn-bharati',
    sku: 'POL-DSL-D10',
    name: 'Polar Special Diesel Fuel (D-10 / Anti-Freezing -50°C)',
    category: 'Polar Fuel',
    currentStock: 184500,
    unit: 'Liters',
    minSafetyThreshold: 80000,
    burnRatePerDay: 480,
    daysRemaining: 384,
    storageLocation: 'East Fuel Farm Tanks 1-4',
    condition: 'Optimal'
  },
  {
    id: 'inv-002',
    stationId: 'stn-bharati',
    sku: 'AV-JET-A1',
    name: 'Aviation Turbine Fuel (Jet A-1 for Helo Operations)',
    category: 'Polar Fuel',
    currentStock: 42000,
    unit: 'Liters',
    minSafetyThreshold: 15000,
    burnRatePerDay: 120,
    daysRemaining: 350,
    storageLocation: 'Helipad Underground Fuel Storage Vault',
    condition: 'Optimal'
  },
  {
    id: 'inv-003',
    stationId: 'stn-bharati',
    sku: 'RAT-MRE-HIGH',
    name: 'High-Calorie Freeze-Dried Survival Ration Packs (4,500 kcal)',
    category: 'Survival Food',
    currentStock: 13680,
    unit: 'Packs',
    minSafetyThreshold: 4000,
    burnRatePerDay: 48,
    daysRemaining: 285,
    storageLocation: 'Emergency Provisions Vault 2',
    expiryDate: '2028-04-30',
    condition: 'Optimal'
  },
  {
    id: 'inv-004',
    stationId: 'stn-maitri',
    sku: 'MED-O2-HIGH',
    name: 'Medical Grade Hyperbaric Oxygen Cylinders (50L)',
    category: 'Medical',
    currentStock: 14,
    unit: 'Cylinders',
    minSafetyThreshold: 10,
    burnRatePerDay: 0.1,
    daysRemaining: 140,
    storageLocation: 'Station Hospital Complex Room 3',
    condition: 'Optimal'
  },
  {
    id: 'inv-005',
    stationId: 'stn-maitri',
    sku: 'GEAR-SURV-EXT',
    name: 'Extreme Cold Weather Outer Suits (-60°C Rated Gore-Tex)',
    category: 'Extreme Cold Gear',
    currentStock: 52,
    unit: 'Sets',
    minSafetyThreshold: 40,
    burnRatePerDay: 0.0,
    daysRemaining: 999,
    storageLocation: 'Clothing Locker Sector C',
    condition: 'Optimal'
  },
  {
    id: 'inv-006',
    stationId: 'stn-maitri',
    sku: 'GEN-INJ-KTA',
    name: 'Cummins Diesel Fuel Injector Assemblies',
    category: 'Generator Spares',
    currentStock: 6,
    unit: 'Units',
    minSafetyThreshold: 8,
    burnRatePerDay: 0.05,
    daysRemaining: 120,
    storageLocation: 'Workshop Spare Rack 7',
    condition: 'Low Stock'
  }
];

export const INITIAL_PERSONNEL: Personnel[] = [
  {
    id: 'prs-001',
    name: 'Dr. Arvind Swaminathan',
    role: 'Expedition Leader',
    stationId: 'stn-bharati',
    organization: 'NCPOR / MoES',
    bloodGroup: 'O+ve',
    fitnessStatus: 'Class-1 Polar Cleared',
    survivalTrainingCertDate: '2025-09-10',
    status: 'On Station',
    assignedShelter: 'Main Module Habitation Sector A-01',
    satelliteRadioId: 'BHR-TAC-1',
    lastMusterTimestamp: new Date().toISOString(),
    biometricMusterPassed: true
  },
  {
    id: 'prs-002',
    name: 'Wg Cdr Tarun Jaswal (Retd)',
    role: 'Logistics Officer',
    stationId: 'stn-bharati',
    organization: 'Indian Air Force / NCPOR',
    bloodGroup: 'B+ve',
    fitnessStatus: 'Class-1 Polar Cleared',
    survivalTrainingCertDate: '2025-08-22',
    status: 'On Station',
    assignedShelter: 'Logistics Center Room L-02',
    satelliteRadioId: 'BHR-LOG-1',
    lastMusterTimestamp: new Date().toISOString(),
    biometricMusterPassed: true
  },
  {
    id: 'prs-003',
    name: 'Dr. Ananya Roy',
    role: 'Station Medic',
    stationId: 'stn-bharati',
    organization: 'AIIMS New Delhi',
    bloodGroup: 'A+ve',
    fitnessStatus: 'Class-1 Polar Cleared',
    survivalTrainingCertDate: '2025-09-02',
    status: 'On Station',
    assignedShelter: 'Medical Unit ICU-1',
    satelliteRadioId: 'BHR-MED-1',
    lastMusterTimestamp: new Date().toISOString(),
    biometricMusterPassed: true
  },
  {
    id: 'prs-004',
    name: 'Er. Sandeep Bopche',
    role: 'Mechanical Engineer',
    stationId: 'stn-bharati',
    organization: 'Indian Navy / NCPOR',
    bloodGroup: 'AB+ve',
    fitnessStatus: 'Class-1 Polar Cleared',
    survivalTrainingCertDate: '2025-07-15',
    status: 'Field Sortie',
    assignedShelter: 'Powerhouse Bay 2',
    satelliteRadioId: 'BHR-ENG-4',
    lastMusterTimestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    biometricMusterPassed: true
  },
  {
    id: 'prs-005',
    name: 'Dr. Priya Namboodiri',
    role: 'Glaciologist',
    stationId: 'stn-maitri',
    organization: 'Geological Survey of India',
    bloodGroup: 'O-ve',
    fitnessStatus: 'Class-1 Polar Cleared',
    survivalTrainingCertDate: '2025-09-12',
    status: 'On Station',
    assignedShelter: 'Maitri Main Block - Room 14',
    satelliteRadioId: 'MTR-SCI-2',
    lastMusterTimestamp: new Date().toISOString(),
    biometricMusterPassed: true
  },
  {
    id: 'prs-006',
    name: 'Capt. R. Deshmukh',
    role: 'Helo Pilot',
    stationId: 'stn-bharati',
    organization: 'Pawan Hans / IAF Polar Wing',
    bloodGroup: 'B+ve',
    fitnessStatus: 'Class-1 Polar Cleared',
    survivalTrainingCertDate: '2025-08-30',
    status: 'On Station',
    assignedShelter: 'Hangar Crew Quarters',
    satelliteRadioId: 'BHR-AIR-1',
    lastMusterTimestamp: new Date().toISOString(),
    biometricMusterPassed: true
  }
];

export const INITIAL_SORTIES: FieldSortie[] = [
  {
    id: 'srt-101',
    title: 'Progress Glacial Ridge Ice Velocity GPS Survey',
    stationId: 'stn-bharati',
    leadPersonnelId: 'prs-004',
    teamPersonnelIds: ['prs-004', 'prs-006'],
    vehicleType: 'Skidoo Snowmobile',
    destinationName: 'Dalk Glacier Upper Transect (14km SE)',
    coordinates: [
      { lat: -69.4075, lng: 76.1942 },
      { lat: -69.4510, lng: 76.2890 },
      { lat: -69.4890, lng: 76.3500 }
    ],
    departureTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    estimatedReturnTime: new Date(Date.now() + 3600000 * 2).toISOString(),
    status: 'Active In Field',
    hazardLevel: 'Crevasse Danger',
    radioCheckFrequencyMins: 60,
    lastCheckInTime: new Date(Date.now() - 1800000).toISOString()
  }
];

export const INITIAL_EMERGENCIES: EmergencyIncident[] = [
  {
    id: 'inc-001',
    incidentCode: 'INC-2026-08',
    title: 'Katabatic Wind Gale Spike (72 km/h) & Whiteout Warning',
    stationId: 'stn-maitri',
    type: 'Blizzard Lockdown',
    severity: 'Moderate',
    status: 'Triggered',
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    reportedBy: 'IMD Station Meteorologist',
    details: 'Sudden barometric drop to 974 hPa. Visual range restricted to under 300m. Station advisory Stage-1 active. All non-essential outdoor traverses suspended.',
    sarTeamAssigned: ['Capt. R. Deshmukh', 'Er. Sandeep Bopche'],
    actionLog: [
      { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: 'Barometric plummet detected. Automated advisory triggered.', operator: 'Auto-Weather Station' },
      { timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: 'Outdoor work permits recalled. Muster roll initiated.', operator: 'Station Commander' }
    ]
  }
];
