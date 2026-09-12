import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Layers, ShieldAlert, Anchor, MapPin } from 'lucide-react';

// Custom Map Markers
const stationIcon = L.divIcon({
  html: `<div style="background:#0284c7; width:22px; height:22px; border-radius:50%; border:2px solid #38bdf8; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold; box-shadow:0 0 10px #00f2fe;">🧊</div>`,
  className: 'custom-station-icon',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const vesselIcon = L.divIcon({
  html: `<div style="background:#f59e0b; width:22px; height:22px; border-radius:50%; border:2px solid #fbbf24; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; box-shadow:0 0 10px #f59e0b;">🚢</div>`,
  className: 'custom-vessel-icon',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const emergencyIcon = L.divIcon({
  html: `<div style="background:#e11d48; width:24px; height:24px; border-radius:50%; border:2px solid #f43f5e; display:flex; align-items:center; justify-content:center; color:white; font-size:11px; animation:pulse 1s infinite; box-shadow:0 0 15px #f43f5e;">⚠️</div>`,
  className: 'custom-emergency-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

interface PolarLeafletMapProps {
  stations: any[];
  assets: any[];
  emergencies: any[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export const PolarLeafletMap: React.FC<PolarLeafletMapProps> = ({
  stations = [],
  assets = [],
  emergencies = [],
  center = [-69.4075, 76.1942], // Centered near Bharati Station
  zoom = 3,
  height = "480px"
}) => {
  const [activeLayers, setActiveLayers] = useState({
    stations: true,
    assets: true,
    emergencies: true,
    routes: true
  });

  // Sea voyage route track from Cape Town to Bharati Larsemann Hills
  const vesselRouteCoords: [number, number][] = [
    [-33.9249, 18.4241], // Cape Town
    [-45.0000, 35.0000],
    [-55.0000, 52.0000],
    [-62.0000, 64.0000],
    [-69.4075, 76.1942]  // Bharati Base
  ];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-cyan-900/50 shadow-2xl">
      {/* Map Filter & Layer Header */}
      <div className="px-4 py-2.5 bg-polar-900/90 border-b border-cyan-900/40 flex flex-wrap items-center justify-between gap-2 z-10 relative">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-xs uppercase font-mono text-slate-100">
            Polar Operations GIS & Asset Positioning
          </h3>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center space-x-1.5 text-[11px] font-mono">
          <button
            onClick={() => setActiveLayers(p => ({ ...p, stations: !p.stations }))}
            className={`px-2.5 py-1 rounded-lg border transition ${
              activeLayers.stations ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-polar-950 border-slate-800 text-slate-500'
            }`}
          >
            🧊 Bases ({stations.length})
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, assets: !p.assets }))}
            className={`px-2.5 py-1 rounded-lg border transition ${
              activeLayers.assets ? 'bg-amber-950 border-amber-400 text-amber-300' : 'bg-polar-950 border-slate-800 text-slate-500'
            }`}
          >
            🚢 Vessels & Air ({assets.length})
          </button>
          <button
            onClick={() => setActiveLayers(p => ({ ...p, emergencies: !p.emergencies }))}
            className={`px-2.5 py-1 rounded-lg border transition ${
              activeLayers.emergencies ? 'bg-rose-950 border-rose-400 text-rose-300' : 'bg-polar-950 border-slate-800 text-slate-500'
            }`}
          >
            ⚠️ Incidents ({emergencies.filter(e => e.status !== 'Resolved').length})
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div style={{ height }} className="w-full relative z-0">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', backgroundColor: '#060d19' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Planned Voyage Route */}
          {activeLayers.routes && (
            <Polyline
              positions={vesselRouteCoords}
              pathOptions={{ color: '#00f2fe', weight: 2.5, dashArray: '6, 8', opacity: 0.8 }}
            />
          )}

          {/* Research Station Markers */}
          {activeLayers.stations && stations.map((st) => (
            <Marker key={st.id} position={[st.latitude, st.longitude]} icon={stationIcon}>
              <Popup className="custom-polar-popup">
                <div className="p-1 text-slate-900 font-sans text-xs">
                  <div className="font-bold text-sm text-cyan-800">{st.name}</div>
                  <div className="text-[11px] text-slate-600 font-mono">{st.code} • {st.region}</div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                    <div>Status: <strong>{st.status}</strong></div>
                    <div>Temp: <strong>{st.temperature_c}°C</strong> | Wind: <strong>{st.wind_speed_kmh} km/h</strong></div>
                    <div>Personnel: <strong>{st.active_personnel}/{st.capacity} Winterers</strong></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Asset Markers */}
          {activeLayers.assets && assets.map((a) => {
            if (!a.latitude || !a.longitude) return null;
            return (
              <Marker key={a.id} position={[a.latitude, a.longitude]} icon={vesselIcon}>
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <div className="font-bold text-amber-800">{a.name}</div>
                    <div>Type: <strong>{a.asset_type}</strong> • Status: <strong>{a.status}</strong></div>
                    <div className="text-[11px] text-slate-600">{a.current_location}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Emergency Incident Markers */}
          {activeLayers.emergencies && emergencies.filter(e => e.status !== 'Resolved').map((e) => {
            if (!e.latitude || !e.longitude) return null;
            return (
              <Marker key={e.id} position={[e.latitude, e.longitude]} icon={emergencyIcon}>
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <div className="font-bold text-rose-800">🚨 {e.incident_code}</div>
                    <div className="font-semibold">{e.title}</div>
                    <div>Severity: <strong className="text-rose-600">{e.severity}</strong></div>
                    <div className="text-[11px] text-slate-600 mt-1">{e.description}</div>
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
