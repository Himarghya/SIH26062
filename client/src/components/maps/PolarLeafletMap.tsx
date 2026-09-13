import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Compass, 
  Layers, 
  ShieldAlert, 
  Anchor, 
  MapPin, 
  Thermometer, 
  Wind, 
  Battery, 
  Navigation, 
  Info,
  Box,
  Plane,
  Eye,
  EyeOff,
  Crosshair,
  Route,
  Activity,
  Zap,
  Sliders,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom Map Marker Icons using Leaflet DivIcons
const createMarkerIcon = (emoji: string, bg: string, border: string, glow: string, isPulse = false) => {
  return L.divIcon({
    html: `<div style="
      background:${bg}; 
      width:26px; 
      height:26px; 
      border-radius:50%; 
      border:2px solid ${border}; 
      display:flex; 
      align-items:center; 
      justify-content:center; 
      color:white; 
      font-size:12px; 
      box-shadow:0 0 12px ${glow};
      ${isPulse ? 'animation: pulse 1.5s infinite;' : ''}
    ">${emoji}</div>`,
    className: 'custom-polar-map-icon',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });
};

const stationIcon = createMarkerIcon('🧊', '#0284c7', '#38bdf8', '#00f2fe');
const shipIcon = createMarkerIcon('🚢', '#d97706', '#f59e0b', '#fbbf24');
const heloIcon = createMarkerIcon('🚁', '#059669', '#10b981', '#34d399');
const vehicleIcon = createMarkerIcon('🚜', '#7c3aed', '#8b5cf6', '#a78bfa');
const cargoIcon = createMarkerIcon('📦', '#0891b2', '#06b6d4', '#67e8f9');
const emergencyIcon = createMarkerIcon('⚠️', '#dc2626', '#ef4444', '#f87171', true);

// Component to handle programmatically flying map to region
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

interface RouteRiskData {
  name: string;
  code: string;
  overallScore: number;
  level: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'SEVERE';
  weather: number;
  visibility: number;
  ice: number;
  asset: number;
  recommendation: string;
}

export interface BasemapConfig {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const POLAR_BASEMAPS: Record<string, BasemapConfig> = {
  light: {
    id: 'light',
    name: 'Light Tactical Canvas (Esri Canvas)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS, METI, TomTom',
    maxZoom: 16
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite Recon (Esri World Imagery)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
    maxZoom: 18
  },
  ocean: {
    id: 'ocean',
    name: 'Polar Ocean & Bathymetry (Esri Ocean)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, GEBCO, NOAA, National Geographic, DeLorme, HERE, Geonames.org',
    maxZoom: 16
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  dark: {
    id: 'dark',
    name: 'Tactical Dark Gray (Esri Dark Canvas)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS, METI, TomTom',
    maxZoom: 16
  }
};

const ROUTE_RISKS: Record<string, RouteRiskData> = {
  antarctic: {
    name: '44th ISEA Resupply Voyage (Goa -> Cape Town -> Bharati)',
    code: 'ROUTE-SEA-01',
    overallScore: 67,
    level: 'HIGH RISK',
    weather: 80,
    visibility: 60,
    ice: 70,
    asset: 30,
    recommendation: 'Roaring Forties katabatic swells active. Recommended icebreaker speed reduction to 8.5 knots; deploy forward sea-ice radar.'
  },
  arctic: {
    name: 'Kongsfjorden Science Mooring Transect (Ny-Ålesund -> IndARC)',
    code: 'ROUTE-ARC-02',
    overallScore: 34,
    level: 'MODERATE RISK',
    weather: 40,
    visibility: 25,
    ice: 35,
    asset: 20,
    recommendation: 'Fjord water clear. Zodiac traverse cleared for acoustic Doppler sensor deployment.'
  }
};

interface PolarLeafletMapProps {
  stations?: any[];
  assets?: any[];
  cargo?: any[];
  emergencies?: any[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  tileUrl?: string;
}

export const PolarLeafletMap: React.FC<PolarLeafletMapProps> = ({
  stations = [],
  assets = [],
  cargo = [],
  emergencies = [],
  center: initialCenter = [-65.0, 50.0], // Centered over Southern Ocean / Antarctic Coast
  zoom: initialZoom = 3,
  height = "520px",
  tileUrl
}) => {
  const [selectedBasemap, setSelectedBasemap] = useState<string>('satellite');
  const [activeLayers, setActiveLayers] = useState({
    stations: true,
    assets: true,
    cargo: true,
    emergencies: true,
    routes: true
  });

  const [selectedRoute, setSelectedRoute] = useState<RouteRiskData | null>(null);
  const [showProximityTool, setShowProximityTool] = useState(false);
  const [proximityResults, setProximityResults] = useState<any[]>([]);

  // Sector preset coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState<number>(initialZoom);

  // Sea voyage route track 1: 44th ISEA Antarctic Sea Voyage (Goa -> Cape Town -> Bharati -> Maitri)
  // Strictly navigates international maritime waters, rounding Cape Agulhas and staying in open sea
  const antarcticVoyageCoords: [number, number][] = [
    [15.4909, 73.8278],   // Mormugao Port, Goa, India
    [10.5000, 71.8000],   // Arabian Sea / Laccadive shipping lane
    [3.0000, 68.0000],    // Maldives Western Deep Sea Corridor
    [-4.0000, 64.0000],   // Equatorial Indian Ocean
    [-11.5000, 60.5000],  // East of Seychelles & Saya de Malha Bank
    [-18.5000, 58.5000],  // East of Mauritius / Rodrigues Passage
    [-26.5000, 52.0000],  // South-East of Madagascar (Open Ocean)
    [-31.0000, 42.0000],  // South Madagascar Basin
    [-34.8000, 29.5000],  // Agulhas Current Maritime Corridor (Off South African Coast)
    [-36.2000, 21.0000],  // Rounding Cape Agulhas (Deep Sea South of African Continent)
    [-34.6000, 18.0000],  // Rounding Cape of Good Hope into Table Bay approach
    [-33.9249, 18.4241],  // Cape Town Bunkering Hub, South Africa
    [-38.5000, 16.5000],  // Cape Town departure south into South Atlantic/Southern Ocean
    [-46.0000, 26.0000],  // Roaring Forties Shipping Track
    [-54.0000, 44.0000],  // Furious Fifties (South of Crozet Islands)
    [-61.5000, 62.0000],  // Antarctic Convergence Oceanic Transition
    [-66.5000, 72.0000],  // Prydz Bay Ice-Edge Approach
    [-69.4075, 76.1942],  // Bharati Station, Larsemann Hills
    [-67.5000, 68.0000],  // Coastal Southern Ocean Transit (North of Ice Shelf)
    [-66.0000, 52.0000],  // Enderby Land Offshore Corridor
    [-67.0000, 35.0000],  // Cosmonaut Sea
    [-68.5000, 20.0000],  // Lazarev Sea Offshore Route
    [-70.0000, 12.0000],  // Princess Astrid Coast / Astrid Shelf Dropoff
    [-70.7667, 11.7333]   // Maitri Station, Schirmacher Oasis
  ];

  // Arctic Kongsfjorden Marine Transect (Tromsø -> Ny-Ålesund -> Himadri -> IndARC)
  const arcticTransectCoords: [number, number][] = [
    [69.6492, 18.9553],   // Tromsø Port, Norway
    [72.5000, 17.5000],   // Norwegian Sea Marine Corridor
    [74.8000, 16.0000],   // West of Bear Island (Bjørnøya)
    [77.2000, 12.5000],   // Greenland Sea / Fram Strait Open Water
    [78.9800, 11.4000],   // Kongsfjorden Sound Fjord Entrance
    [78.9235, 11.9333],   // Himadri Station, Ny-Ålesund, Svalbard
    [78.9000, 12.2000]    // IndARC Subsurface Mooring Observatory
  ];

  const flyToPreset = (coords: [number, number], zoomLevel: number) => {
    setMapCenter(coords);
    setMapZoom(zoomLevel);
  };

  const handleRunProximityQuery = () => {
    // PostGIS ST_DWithin query simulation: Find all assets within 50 km of Bharati Station (-69.4075, 76.1942)
    const results = [
      { name: 'PistenBully Snowcat PB-01', type: 'Overland Tracked Vehicle', distanceKm: 14.2, etaMins: 28, status: 'Active In Field', fuel: '88%' },
      { name: 'Eurocopter AS350 B3 Helo', type: 'Support Helicopter', distanceKm: 38.5, etaMins: 14, status: 'Hangar Ready', fuel: '94%' },
      { name: 'Polar Emergency Zodiac Z-02', type: 'Ice-Rescue Craft', distanceKm: 4.1, etaMins: 9, status: 'Moored at Coast', fuel: '100%' }
    ];
    setProximityResults(results);
    setShowProximityTool(true);
  };

  const getAssetIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'ship':
        return shipIcon;
      case 'aircraft':
      case 'helicopter':
        return heloIcon;
      default:
        return vehicleIcon;
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-slate-200/90 shadow-lg flex flex-col">
      {/* Top Map Control Bar */}
      <div className="px-4 py-3 bg-white/95 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 z-10 relative">
        <div className="flex items-center space-x-2 shrink-0">
          <Compass className="w-4 h-4 text-cyan-600 animate-spin-slow" />
          <h3 className="font-bold text-xs uppercase font-mono text-slate-800 flex items-center space-x-2">
            <span>Decision-Support GIS Operations</span>
            <span className="text-[10px] text-cyan-700 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 font-semibold hidden sm:inline">
              PostGIS + WGS-84
            </span>
          </h3>
        </div>

        {/* Basemap Switcher */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <Layers className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
          <select
            value={selectedBasemap}
            onChange={(e) => setSelectedBasemap(e.target.value)}
            className="bg-slate-50 border border-slate-300 hover:border-cyan-500 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono transition cursor-pointer shadow-2xs"
          >
            <option value="satellite">🛰️ Satellite Recon (Polar Ice)</option>
            <option value="dark">🌙 Dark Tactical Canvas</option>
            <option value="ocean">🌊 Subsea Bathymetry</option>
            <option value="osm">🗺️ OpenStreetMap Standard</option>
          </select>
        </div>

        {/* Proximity Query Action */}
        <button
          onClick={handleRunProximityQuery}
          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold flex items-center space-x-1.5 transition whitespace-nowrap shadow-2xs"
          title="Simulate PostGIS ST_DWithin Proximity Query (50km Radius)"
        >
          <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
          <span>PostGIS Proximity (50km)</span>
        </button>

        {/* Sector Quick-Fly Presets */}
        <div className="flex items-center space-x-1 text-xs font-mono">
          <span className="text-slate-500 font-bold mr-1 hidden md:inline text-[11px]">Sector:</span>
          <button
            onClick={() => flyToPreset([-69.4075, 76.1942], 4)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-800 font-medium transition text-[11px] whitespace-nowrap shadow-2xs"
          >
            Bharati
          </button>
          <button
            onClick={() => flyToPreset([-70.7667, 11.7333], 4)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-800 font-medium transition text-[11px] whitespace-nowrap shadow-2xs"
          >
            Maitri
          </button>
          <button
            onClick={() => flyToPreset([78.9235, 11.9333], 5)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-800 font-medium transition text-[11px] whitespace-nowrap shadow-2xs"
          >
            Himadri
          </button>
          <button
            onClick={() => flyToPreset([-20, 50], 2)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-800 font-medium transition text-[11px] whitespace-nowrap shadow-2xs"
          >
            Global
          </button>
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setActiveLayers(p => ({ ...p, stations: !p.stations }))}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 text-[11px] whitespace-nowrap ${
              activeLayers.stations ? 'bg-cyan-100 border-cyan-300 text-cyan-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <span>🧊 Stations ({stations.length})</span>
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, assets: !p.assets }))}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 text-[11px] whitespace-nowrap ${
              activeLayers.assets ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <span>🚢 Fleet ({assets.length})</span>
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, cargo: !p.cargo }))}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 text-[11px] whitespace-nowrap ${
              activeLayers.cargo ? 'bg-blue-100 border-blue-300 text-blue-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <span>📦 Cargo ({cargo.length})</span>
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, emergencies: !p.emergencies }))}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 text-[11px] whitespace-nowrap ${
              activeLayers.emergencies ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <span>⚠️ Incidents ({emergencies.filter(e => e.status !== 'Resolved').length})</span>
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, routes: !p.routes }))}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 text-[11px] whitespace-nowrap ${
              activeLayers.routes ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <span>📍 Risk Routes</span>
          </button>
        </div>
      </div>

      {/* Decision-Support Subheader */}
      <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-mono gap-2">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span>Click any planned route to inspect dynamic Route Risk Score (Weather + Ice + Terrain + Asset readiness).</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedRoute(ROUTE_RISKS.antarctic);
            }}
            className="text-cyan-700 font-bold hover:text-cyan-900 hover:underline cursor-pointer px-1 py-0.5 rounded transition"
          >
            Inspect Antarctic Corridor (67/100)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedRoute(ROUTE_RISKS.arctic);
            }}
            className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline cursor-pointer px-1 py-0.5 rounded transition"
          >
            Inspect Arctic Transect (34/100)
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div style={{ height }} className="w-full relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', backgroundColor: '#090d16' }}
        >
          <MapViewController center={mapCenter} zoom={mapZoom} />

          {/* Crisp, high-contrast polar basemap (No paid API key/watermark required) */}
          <TileLayer
            key={selectedBasemap}
            attribution={POLAR_BASEMAPS[selectedBasemap]?.attribution || POLAR_BASEMAPS.dark.attribution}
            url={tileUrl || POLAR_BASEMAPS[selectedBasemap]?.url || POLAR_BASEMAPS.dark.url}
            maxZoom={POLAR_BASEMAPS[selectedBasemap]?.maxZoom || 16}
          />

          {/* Planned Antarctic & Arctic Voyage Routes with Risk Colors */}
          {activeLayers.routes && (
            <>
              <Polyline
                positions={antarcticVoyageCoords}
                pathOptions={{ color: '#f59e0b', weight: 4, dashArray: '6, 8', opacity: 0.9 }}
                eventHandlers={{
                  click: () => setSelectedRoute(ROUTE_RISKS.antarctic)
                }}
              />
              <Polyline
                positions={arcticTransectCoords}
                pathOptions={{ color: '#10b981', weight: 4, dashArray: '4, 6', opacity: 0.9 }}
                eventHandlers={{
                  click: () => setSelectedRoute(ROUTE_RISKS.arctic)
                }}
              />
            </>
          )}

          {/* Research Station Markers */}
          {activeLayers.stations && stations.map((st) => {
            const lat = st.latitude;
            const lng = st.longitude;
            if (typeof lat !== 'number' || typeof lng !== 'number') return null;

            return (
              <Marker key={st.id} position={[lat, lng]} icon={stationIcon}>
                <Popup className="custom-polar-popup">
                  <div className="p-1 text-slate-900 font-sans text-xs space-y-1">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-sm text-cyan-800">{st.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">
                        {st.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      {st.region} • {lat.toFixed(4)}°, {lng.toFixed(4)}°
                    </div>
                    <div className="pt-1 text-[11px] space-y-0.5">
                      <div>Status: <strong>{st.status}</strong></div>
                      <div>Blizzard Alert: <strong className={st.blizzard_level !== 'NORMAL' ? 'text-rose-600' : 'text-emerald-700'}>{st.blizzard_level}</strong></div>
                      <div>Surface Temp: <strong>{st.temperature_c}°C</strong> | Wind: <strong>{st.wind_speed_kmh} km/h</strong></div>
                      <div>Wintering Crew: <strong>{st.active_personnel || 24} / {st.capacity || 40} personnel</strong></div>
                    </div>
                    <div className="pt-2 border-t text-right">
                      <Link to="/inventory" className="text-cyan-700 hover:text-cyan-900 font-bold text-[10px]">
                        Inspect Base Inventory &rarr;
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Transport Fleet Asset Markers */}
          {activeLayers.assets && assets.map((a) => {
            const lat = a.latitude;
            const lng = a.longitude;
            if (typeof lat !== 'number' || typeof lng !== 'number') return null;

            return (
              <Marker key={a.id} position={[lat, lng]} icon={getAssetIcon(a.asset_type)}>
                <Popup>
                  <div className="p-1 text-slate-900 text-xs space-y-1">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-amber-800">{a.name}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {a.asset_code}
                      </span>
                    </div>
                    <div>Type: <strong>{a.asset_type}</strong> • Status: <strong>{a.status}</strong></div>
                    <div className="text-[11px] text-slate-600">{a.current_location}</div>
                    <div className="text-[11px]">Fuel Status: <strong className="text-cyan-700">{a.fuel_pct}%</strong></div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      GPS: {lat.toFixed(4)}°, {lng.toFixed(4)}° (Simulated Uplink)
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Cargo Consignment Markers */}
          {activeLayers.cargo && cargo.map((c) => {
            const lat = c.latitude ?? (c.current_location?.includes('Goa') ? 15.4909 : c.current_location?.includes('Vessel') ? -45.0 : -69.4075);
            const lng = c.longitude ?? (c.current_location?.includes('Goa') ? 73.8278 : c.current_location?.includes('Vessel') ? 35.0 : 76.1942);

            return (
              <Marker key={c.id} position={[lat, lng]} icon={cargoIcon}>
                <Popup>
                  <div className="p-1 text-slate-900 text-xs space-y-1">
                    <div className="font-bold text-cyan-800">{c.name}</div>
                    <div className="text-[10px] font-mono text-slate-600">{c.cargo_code || c.trackingCode} • Barcode: {c.barcode}</div>
                    <div>Status: <strong>{c.status}</strong></div>
                    <div>Weight: <strong>{c.weight_kg ?? c.weightKg} kg</strong></div>
                    {c.is_cold_chain && (
                      <div className="text-[11px] text-cyan-700 font-semibold">
                        ❄️ Cryo Specimen (-80°C Monitored)
                      </div>
                    )}
                    <div className="pt-1 border-t text-right">
                      <Link to={`/cargo/${c.id}`} className="text-cyan-700 hover:text-cyan-900 font-bold text-[10px]">
                        Open Manifest &rarr;
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Emergency Incident Distress Markers */}
          {activeLayers.emergencies && emergencies.filter(e => e.status !== 'Resolved').map((e) => {
            const lat = e.latitude ?? -69.4500;
            const lng = e.longitude ?? 76.2500;

            return (
              <Marker key={e.id} position={[lat, lng]} icon={emergencyIcon}>
                <Popup>
                  <div className="p-1 text-slate-900 text-xs space-y-1">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-rose-800">🚨 {e.incident_code || e.incidentCode}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                        {e.severity}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800">{e.title}</div>
                    <div className="text-[11px] text-slate-600">{e.description || e.details}</div>
                    <div className="text-[10px] text-rose-600 font-mono font-bold">
                      Status: {e.status} • SAR Deployment Active
                    </div>
                    <div className="pt-2 border-t text-right">
                      <Link to="/emergency" className="text-rose-700 hover:text-rose-900 font-bold text-[10px]">
                        Launch SAR Incident Command &rarr;
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Route Risk Inspector Card */}
        {selectedRoute && (
          <div className="absolute top-4 right-4 z-[1050] w-80 sm:w-96 bg-white/95 border border-amber-400 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-fadeIn text-xs space-y-3 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <Route className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-900 font-mono uppercase">Route Risk Assessment</h4>
              </div>
              <button onClick={() => setSelectedRoute(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="font-bold text-slate-800">{selectedRoute.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">{selectedRoute.code}</div>
            </div>

            {/* Score Pill */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">Dynamic Risk Index</div>
                <div className={`font-bold font-mono text-base ${selectedRoute.overallScore > 50 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {selectedRoute.overallScore} / 100 • {selectedRoute.level}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                Decision: <strong className="text-slate-800">Operational Caution</strong>
              </div>
            </div>

            {/* Risk Factor Breakdown Bars */}
            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Weather Severity</span>
                <span className="text-amber-700 font-bold">{selectedRoute.weather}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedRoute.weather}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">Sea Ice / Katabatic Drift</span>
                <span className="text-emerald-700 font-bold">{selectedRoute.ice}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedRoute.ice}%` }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-600">Visibility Degradation</span>
                <span className="text-slate-700 font-bold">{selectedRoute.visibility}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedRoute.visibility}%` }} />
              </div>
            </div>

            <div className="p-2 rounded bg-amber-50 text-[11px] text-amber-900 border border-amber-200 leading-tight">
              <strong className="text-amber-800 font-mono text-[10px] block mb-0.5">DECISION ADVICE:</strong>
              {selectedRoute.recommendation}
            </div>
          </div>
        )}

        {/* Floating PostGIS Proximity Query Result Modal */}
        {showProximityTool && (
          <div className="absolute bottom-4 left-4 z-[1050] w-80 sm:w-[420px] bg-white/95 border border-indigo-300 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-fadeIn text-xs space-y-3 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 font-mono uppercase">PostGIS ST_DWithin(50km)</h4>
              </div>
              <button onClick={() => setShowProximityTool(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-slate-700 font-mono bg-slate-50 p-2 rounded border border-slate-200">
              <code>ST_DWithin(assets.geom, ST_MakePoint(76.19, -69.40), 50000)</code>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {proximityResults.map((res, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{res.name}</div>
                    <div className="text-[10px] text-slate-500">{res.type} • Fuel: {res.fuel}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-indigo-700 font-bold">{res.distanceKm} km</div>
                    <div className="text-emerald-700 text-[10px] font-bold">ETA ~{res.etaMins}m</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


