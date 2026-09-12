import React, { useState } from 'react';
import { Station, Vessel, FieldSortie } from '../types';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Wind, 
  Thermometer, 
  Anchor, 
  Flame, 
  Users, 
  Layers,
  Crosshair,
  Maximize2
} from 'lucide-react';

interface PolarMapProps {
  stations: Station[];
  vessels: Vessel[];
  sorties: FieldSortie[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
}

export const PolarMap: React.FC<PolarMapProps> = ({
  stations,
  vessels,
  sorties,
  selectedStationId,
  onSelectStation
}) => {
  const [viewHemisphere, setViewHemisphere] = useState<'Antarctica' | 'Arctic'>('Antarctica');
  const [activeLayer, setActiveLayer] = useState<'hybrid' | 'radar' | 'crevasses'>('hybrid');
  const [selectedPin, setSelectedPin] = useState<{ type: 'station' | 'vessel' | 'sortie'; data: any } | null>(null);

  // Filter stations/vessels based on selected hemisphere
  const activeStations = stations.filter(s => 
    viewHemisphere === 'Antarctica' ? s.region === 'Antarctica' : s.region === 'Arctic'
  );

  return (
    <div className="relative w-full rounded-xl overflow-hidden glass-panel border border-cyan-900/40 bg-gradient-to-b from-polar-950 to-polar-900 shadow-2xl">
      {/* Map Control Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-polar-900/80 border-b border-cyan-900/30 gap-2">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <h3 className="font-bold text-sm tracking-wide text-slate-100 uppercase font-mono">
            Polar Operations Geospatial Projection ({viewHemisphere})
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Hemisphere Switcher */}
          <div className="flex bg-polar-950 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setViewHemisphere('Antarctica')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewHemisphere === 'Antarctica' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇦🇶 Antarctica (South Pole)
            </button>
            <button
              onClick={() => setViewHemisphere('Arctic')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewHemisphere === 'Arctic' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ❄️ Arctic (North Pole)
            </button>
          </div>

          {/* Map Layer Overlays */}
          <div className="hidden sm:flex bg-polar-950 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveLayer('hybrid')}
              className={`px-2.5 py-1 rounded-md transition ${activeLayer === 'hybrid' ? 'bg-slate-700 text-cyan-300 font-semibold' : 'text-slate-400'}`}
            >
              Satellite + Tracks
            </button>
            <button
              onClick={() => setActiveLayer('radar')}
              className={`px-2.5 py-1 rounded-md transition ${activeLayer === 'radar' ? 'bg-slate-700 text-cyan-300 font-semibold' : 'text-slate-400'}`}
            >
              Katabatic Winds
            </button>
            <button
              onClick={() => setActiveLayer('crevasses')}
              className={`px-2.5 py-1 rounded-md transition ${activeLayer === 'crevasses' ? 'bg-slate-700 text-rose-300 font-semibold' : 'text-slate-400'}`}
            >
              Crevasse Hazards
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative w-full h-[460px] bg-[#050b14] overflow-hidden flex items-center justify-center select-none">
        {/* Polar Grid Circles & Lat/Lng Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
          <div className="w-[420px] h-[420px] rounded-full border border-cyan-500/40 border-dashed" />
          <div className="w-[300px] h-[300px] rounded-full border border-cyan-400/50" />
          <div className="w-[180px] h-[180px] rounded-full border border-cyan-300/60 border-dashed" />
          <div className="w-[60px] h-[60px] rounded-full border border-cyan-200/80" />
          
          {/* Crosshair Lines */}
          <div className="absolute w-full h-[1px] bg-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/20" />
        </div>

        {/* Radar Sweep Effect */}
        <div className="absolute w-[420px] h-[420px] rounded-full pointer-events-none overflow-hidden opacity-20">
          <div className="w-full h-full animate-radar origin-center bg-gradient-to-tr from-cyan-400/40 via-transparent to-transparent" />
        </div>

        {/* SVG Landmass & Coastline Render */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600">
          <defs>
            <radialGradient id="antarcticaGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#0f2642" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#081424" stopOpacity="0.1" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {viewHemisphere === 'Antarctica' ? (
            /* Antarctica Landmass Outline */
            <g>
              {/* Sea Ice Shelf Extent */}
              <path
                d="M 280,300 C 260,180 340,110 500,100 C 660,110 760,190 780,310 C 800,430 700,520 500,530 C 320,530 290,440 280,300 Z"
                fill="none"
                stroke="#00f2fe"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.35"
              />
              
              {/* Continental Landmass */}
              <path
                d="M 310,290 C 290,200 370,140 500,130 C 630,130 720,200 740,300 C 760,400 670,490 500,490 C 350,490 320,410 310,290 Z"
                fill="url(#antarcticaGrad)"
                stroke="#38bdf8"
                strokeWidth="2"
                opacity="0.85"
              />

              {/* Antarctic Peninsula Spur */}
              <path
                d="M 340,220 C 300,180 270,130 250,80 C 260,75 275,80 295,120 C 315,160 340,190 350,210 Z"
                fill="#1e3a5f"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.8"
              />

              {/* Sea Route Voyage Line: Goa/Cape Town to Larsemann Hills (Bharati) */}
              <path
                d="M 500,20 C 580,100 660,180 670,260"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                className="animate-pulse"
              />

              {/* Inter-Station Traverse: Bharati to Maitri */}
              <path
                d="M 670,260 Q 520,220 370,210"
                fill="none"
                stroke="#00f2fe"
                strokeWidth="1.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Crevasse Hazard Zone */}
              {activeLayer === 'crevasses' && (
                <g>
                  <polygon
                    points="680,270 710,290 690,320 660,300"
                    fill="rgba(244, 63, 94, 0.3)"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <text x="690" y="305" fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    ⚠️ Dalk Glacial Crevasses
                  </text>
                </g>
              )}

              {/* Katabatic Wind Overlay */}
              {activeLayer === 'radar' && (
                <g opacity="0.7">
                  <path d="M 500,300 L 650,260" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 500,300 L 380,220" stroke="#38bdf8" strokeWidth="2" />
                  <text x="500" y="320" fill="#38bdf8" fontSize="11" textAnchor="middle" fontFamily="monospace">
                    Katabatic Continental Flow (~65 km/h)
                  </text>
                </g>
              )}
            </g>
          ) : (
            /* Arctic Svalbard / Kongsfjorden Outline */
            <g>
              <path
                d="M 400,200 C 420,150 480,140 550,160 C 620,180 650,240 640,320 C 620,400 540,440 460,420 C 390,390 380,260 400,200 Z"
                fill="url(#antarcticaGrad)"
                stroke="#38bdf8"
                strokeWidth="2"
                opacity="0.85"
              />
              <path
                d="M 440,250 C 470,240 500,250 510,270 C 500,290 460,280 440,250 Z"
                fill="#070e1b"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Station Markers */}
        {activeStations.map((station) => {
          // Calculate screen coordinates based on mock coordinates
          const isBharati = station.id === 'stn-bharati';
          const isMaitri = station.id === 'stn-maitri';
          const isHimadri = station.id === 'stn-himadri';
          const isIndArc = station.id === 'stn-indarc';

          let x = 50;
          let y = 50;
          if (isBharati) { x = 67; y = 43; }
          else if (isMaitri) { x = 37; y = 35; }
          else if (isHimadri) { x = 48; y = 45; }
          else if (isIndArc) { x = 54; y = 48; }

          const isSelected = selectedStationId === station.id;
          const isLockdown = station.weather.blizzardLevel === 'STAGE_3_WHITEOUT_LOCKDOWN';
          const isAdvisory = station.weather.blizzardLevel === 'STAGE_1_ADVISORY' || station.weather.blizzardLevel === 'STAGE_2_WARNING';

          return (
            <div
              key={station.id}
              onClick={() => {
                onSelectStation(station.id);
                setSelectedPin({ type: 'station', data: station });
              }}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              {/* Pulsing ring indicator */}
              <div className={`absolute -inset-2 rounded-full opacity-75 ${
                isLockdown ? 'bg-rose-500 animate-ping' :
                isAdvisory ? 'bg-amber-500 animate-pulse' :
                'bg-cyan-500/40 animate-pulse-slow'
              }`} />

              <div className={`relative flex items-center space-x-1.5 px-2 py-1 rounded-md border shadow-lg transition-transform transform group-hover:scale-110 ${
                isSelected ? 'bg-cyan-900/90 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400' :
                isLockdown ? 'bg-rose-950/90 border-rose-500 text-rose-200' :
                isAdvisory ? 'bg-amber-950/90 border-amber-500 text-amber-200' :
                'bg-polar-900/90 border-slate-600 text-slate-200'
              }`}>
                <MapPin className={`w-3.5 h-3.5 ${
                  isLockdown ? 'text-rose-400' : isAdvisory ? 'text-amber-400' : 'text-cyan-400'
                }`} />
                <span className="font-bold text-xs font-mono">{station.code}</span>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover:block z-30 pointer-events-none">
                <div className="glass-panel px-3 py-1.5 rounded text-[11px] whitespace-nowrap shadow-xl border border-cyan-500/40 text-slate-200">
                  <div className="font-bold text-cyan-300">{station.name}</div>
                  <div className="text-slate-400">{station.weather.temperatureC}°C | {station.weather.windSpeedKmh} km/h</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Vessel Markers (MV Vasiliy Golovnin / ORV Sagar Kanya) */}
        {viewHemisphere === 'Antarctica' && vessels.map((vessel) => {
          const isVasiliy = vessel.id === 'vsl-vasiliy';
          const isHelo = vessel.type === 'Support Helicopter';
          const x = isVasiliy ? 61 : isHelo ? 68 : 55;
          const y = isVasiliy ? 28 : isHelo ? 41 : 18;

          return (
            <div
              key={vessel.id}
              onClick={() => setSelectedPin({ type: 'vessel', data: vessel })}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              <div className="relative flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/80 text-amber-200 shadow-lg text-[11px] group-hover:scale-110 transition">
                {isHelo ? (
                  <Navigation className="w-3 h-3 text-cyan-400 animate-spin-slow" />
                ) : (
                  <Anchor className="w-3 h-3 text-amber-400" />
                )}
                <span className="font-mono font-semibold">{vessel.name.split(' ')[0]}</span>
                <span className="text-[10px] text-amber-400">{vessel.speedKnots} kn</span>
              </div>
            </div>
          );
        })}

        {/* Active Field Sortie Markers */}
        {viewHemisphere === 'Antarctica' && sorties.filter(s => s.status === 'Active In Field').map(s => (
          <div
            key={s.id}
            onClick={() => setSelectedPin({ type: 'sortie', data: s })}
            style={{ left: '69%', top: '46%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          >
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-purple-950/90 border border-purple-400 text-purple-200 text-[10px] font-mono shadow-lg animate-pulse">
              <span>🛷 Sortie: Dalk Glac.</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Entity Inspector Card (Bottom Tray) */}
      {selectedPin && (
        <div className="p-3.5 bg-polar-900/95 border-t border-cyan-900/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          {selectedPin.type === 'station' && (
            <>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-bold">
                  {selectedPin.data.code}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{selectedPin.data.name}</h4>
                  <p className="text-slate-400">{selectedPin.data.locationName} ({selectedPin.data.latitude}°, {selectedPin.data.longitude}°)</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-slate-300">
                <div className="flex items-center space-x-1">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedPin.data.weather.temperatureC}°C (Chill: {selectedPin.data.weather.windChillC}°C)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wind className="w-3.5 h-3.5 text-blue-400" />
                  <span>{selectedPin.data.weather.windSpeedKmh} km/h {selectedPin.data.weather.windDirection}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{(selectedPin.data.resources.polarDieselLiters / 1000).toFixed(0)}k L D-10</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedPin.data.activePersonnel}/{selectedPin.data.capacity} Winterers</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </>
          )}

          {selectedPin.type === 'vessel' && (
            <>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-950 border border-amber-800/60 text-amber-300 font-bold">
                  🚢
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{selectedPin.data.name}</h4>
                  <p className="text-slate-400">Class: {selectedPin.data.iceClass} • Heading: {selectedPin.data.headingDeg}° @ {selectedPin.data.speedKnots} knots</p>
                </div>
              </div>
              <div className="text-slate-300">
                <span>Voyage: <strong className="text-cyan-300">{selectedPin.data.origin}</strong> ➔ <strong className="text-cyan-300">{selectedPin.data.destination}</strong></span>
              </div>
              <button onClick={() => setSelectedPin(null)} className="text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800">
                Close
              </button>
            </>
          )}

          {selectedPin.type === 'sortie' && (
            <>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-950 border border-purple-800/60 text-purple-300 font-bold">
                  🛷
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{selectedPin.data.title}</h4>
                  <p className="text-slate-400">Target: {selectedPin.data.destinationName} • Vehicle: {selectedPin.data.vehicleType}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPin(null)} className="text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800">
                Close
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
