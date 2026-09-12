import React, { useState, useMemo } from 'react';
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
  Crosshair
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
  center: initialCenter = [-69.4075, 76.1942], // Centered near Bharati Station
  zoom: initialZoom = 3,
  height = "520px",
  tileUrl = (import.meta as any).env?.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
}) => {
  // Layer visibility toggles
  const [activeLayers, setActiveLayers] = useState({
    stations: true,
    assets: true,
    cargo: true,
    emergencies: true,
    routes: true
  });

  // Category filter
  const [statusFilter, setStatusFilter] = useState('all');

  // Sector preset coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState<number>(initialZoom);

  // Sea voyage route track 1: 44th ISEA Antarctic Sea Voyage (Goa -> Cape Town -> Bharati -> Maitri)
  const antarcticVoyageCoords: [number, number][] = [
    [15.4909, 73.8278],   // Mormugao Port, Goa, India
    [5.0000, 68.0000],    // Equatorial Indian Ocean
    [-15.0000, 58.0000],  // South-Central Indian Ocean
    [-33.9249, 18.4241],  // Cape Town Bunkering Hub, South Africa
    [-45.0000, 32.0000],  // Roaring Forties
    [-55.0000, 52.0000],  // Furious Fifties
    [-62.0000, 64.0000],  // Antarctic Convergence
    [-69.4075, 76.1942],  // Bharati Station, Larsemann Hills
    [-70.7667, 11.7333]   // Maitri Station, Schirmacher Oasis
  ];

  // Arctic Kongsfjorden Marine Transect (Tromsø -> Ny-Ålesund -> Himadri -> IndARC)
  const arcticTransectCoords: [number, number][] = [
    [69.6492, 18.9553],   // Tromsø Port, Norway
    [74.5000, 19.0000],   // Barents Sea
    [78.9235, 11.9333],   // Himadri Station, Ny-Ålesund, Svalbard
    [78.9000, 12.0000]    // IndARC Subsurface Mooring Observatory
  ];

  const flyToPreset = (coords: [number, number], zoomLevel: number) => {
    setMapCenter(coords);
    setMapZoom(zoomLevel);
  };

  // Helper to choose icon for asset type
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
    <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-cyan-900/50 shadow-2xl flex flex-col">
      {/* Top Map Control Bar */}
      <div className="px-4 py-3 bg-polar-900/95 border-b border-cyan-900/40 flex flex-wrap items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <h3 className="font-bold text-xs uppercase font-mono text-slate-100 flex items-center space-x-2">
            <span>Polar GIS Operations Center</span>
            <span className="text-[10px] text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
              OpenStreetMap Base
            </span>
          </h3>
        </div>

        {/* Sector Quick-Fly Presets */}
        <div className="flex items-center space-x-1 text-[11px] font-mono">
          <span className="text-slate-400 mr-1 hidden sm:inline">Sector:</span>
          <button
            onClick={() => flyToPreset([-69.4075, 76.1942], 4)}
            className="px-2 py-1 rounded bg-polar-850 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition"
          >
            Bharati Base
          </button>
          <button
            onClick={() => flyToPreset([-70.7667, 11.7333], 4)}
            className="px-2 py-1 rounded bg-polar-850 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition"
          >
            Maitri Base
          </button>
          <button
            onClick={() => flyToPreset([78.9235, 11.9333], 5)}
            className="px-2 py-1 rounded bg-polar-850 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition"
          >
            Arctic Himadri
          </button>
          <button
            onClick={() => flyToPreset([0, 45], 2)}
            className="px-2 py-1 rounded bg-polar-850 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition"
          >
            Global
          </button>
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <button
            onClick={() => setActiveLayers(p => ({ ...p, stations: !p.stations }))}
            className={`px-2 py-1 rounded-lg border transition flex items-center space-x-1 ${
              activeLayers.stations ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-polar-950 border-slate-800 text-slate-500'
            }`}
          >
            <span>🧊 Stations ({stations.length})</span>
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, assets: !p.assets }))}
            className={`px-2 py-1 rounded-lg border transition flex items-center space-x-1 ${
              activeLayers.assets ? 'bg-amber-950 border-amber-400 text-amber-300' : 'bg-polar-950 border-slate-800 text-slate-500'
            }`}
          >
            <span>🚢 Fleet ({assets.length})</span>
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, cargo: !p.cargo }))}
            className={`px-2 py-1 rounded-lg border transition flex items-center space-x-1 ${
              activeLayers.cargo ? 'bg-blue-950 border-blue-400 text-blue-300' : 'bg-polar-950 border-slate-800 text-slate-500'
            }`}
          >
            <span>📦 Cargo ({cargo.length})</span>
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, emergencies: !p.emergencies }))}
            className={`px-2 py-1 rounded-lg border transition flex items-center space-x-1 ${
              activeLayers.emergencies ? 'bg-rose-950 border-rose-400 text-rose-300' : 'bg-polar-950 border-slate-800 text-slate-500'
            }`}
          >
            <span>⚠️ Incidents ({emergencies.filter(e => e.status !== 'Resolved').length})</span>
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, routes: !p.routes }))}
            className={`px-2 py-1 rounded-lg border transition flex items-center space-x-1 ${
              activeLayers.routes ? 'bg-emerald-950 border-emerald-400 text-emerald-300' : 'bg-polar-950 border-slate-800 text-slate-500'
            }`}
          >
            <span>📍 Routes</span>
          </button>
        </div>
      </div>

      {/* Synthetic Demo Disclaimer Strip */}
      <div className="px-4 py-1.5 bg-cyan-950/40 border-b border-cyan-900/30 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Simulated Demo Telemetry: Mobile asset positions & waypoints generated from deterministic navigation models for mission evaluation.</span>
        </div>
        <span className="hidden md:inline text-cyan-400 font-bold">WGS-84 Coordinate Datum</span>
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

          {/* Standard OpenStreetMap Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url={tileUrl}
            maxZoom={19}
          />

          {/* Planned Antarctic & Arctic Voyage Routes */}
          {activeLayers.routes && (
            <>
              <Polyline
                positions={antarcticVoyageCoords}
                pathOptions={{ color: '#00f2fe', weight: 3, dashArray: '6, 8', opacity: 0.85 }}
              />
              <Polyline
                positions={arcticTransectCoords}
                pathOptions={{ color: '#10b981', weight: 3, dashArray: '4, 6', opacity: 0.85 }}
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
            // If cargo has direct coordinates, or resolve near origin/destination
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
      </div>
    </div>
  );
};
