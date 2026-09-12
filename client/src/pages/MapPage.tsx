import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
import { PolarLeafletMap } from '../components/maps/PolarLeafletMap';
import { Map, Compass, Layers, ShieldAlert, Anchor, MapPin, Box, RefreshCw } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [cargo, setCargo] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGisData = async () => {
    try {
      const [stns, asts, crg, emgs] = await Promise.all([
        polarisApi.getStations(),
        polarisApi.getAssets(),
        polarisApi.getCargoList(),
        polarisApi.getIncidents()
      ]);
      setStations(stns);
      setAssets(asts);
      setCargo(crg);
      setEmergencies(emgs);
    } catch (e) {
      console.error('Error fetching GIS telemetry data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGisData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadGisData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-72 bg-polar-900 animate-pulse rounded-lg" />
        <div className="h-[640px] bg-polar-900 animate-pulse rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs text-cyan-400">Loading Geospatial Layer Telemetry...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase font-mono flex items-center space-x-2">
            <Map className="w-6 h-6 text-cyan-400" />
            <span>Polar Geospatial Intelligence & GIS Operations Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time positioning across Antarctic (Bharati, Maitri) and Arctic (Himadri, IndARC) sectors
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-polar-900 hover:bg-polar-850 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-mono font-bold flex items-center space-x-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh GPS Feeds</span>
        </button>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-3 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">🧊</div>
          <div>
            <div className="text-[10px] font-mono text-slate-400">TRACKED BASES</div>
            <div className="text-base font-bold font-mono text-slate-100">{stations.length} Stations</div>
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-950 border border-amber-800 text-amber-300 font-bold">🚢</div>
          <div>
            <div className="text-[10px] font-mono text-slate-400">FLEET ASSETS</div>
            <div className="text-base font-bold font-mono text-amber-300">{assets.length} Units</div>
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-300 font-bold">📦</div>
          <div>
            <div className="text-[10px] font-mono text-slate-400">ACTIVE CONSIGNMENTS</div>
            <div className="text-base font-bold font-mono text-cyan-300">{cargo.length} Shipments</div>
          </div>
        </div>

        <div className="glass-panel p-3 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 font-bold">⚠️</div>
          <div>
            <div className="text-[10px] font-mono text-slate-400">ACTIVE SAR DISTRESS</div>
            <div className="text-base font-bold font-mono text-rose-400">
              {emergencies.filter(e => e.status !== 'Resolved').length} Incidents
            </div>
          </div>
        </div>
      </div>

      {/* Full GIS Interactive Map Component */}
      <PolarLeafletMap
        stations={stations}
        assets={assets}
        cargo={cargo}
        emergencies={emergencies}
        height="620px"
      />
    </div>
  );
};
