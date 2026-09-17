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
        <div className="h-8 w-72 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-[640px] bg-white border border-slate-200 animate-pulse rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs text-emerald-700 font-bold">Loading Geospatial Layer Telemetry...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono flex items-center space-x-2">
            <Map className="w-6 h-6 text-emerald-600" />
            <span>Polar Geospatial Intelligence & GIS Operations Center</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Real-time positioning across Antarctic (Bharati, Maitri) and Arctic (Himadri, IndARC) sectors
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs font-mono font-bold flex items-center space-x-2 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh GPS Feeds</span>
        </button>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-base"></div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 font-medium">TRACKED BASES</div>
            <div className="text-base font-bold font-mono text-slate-900">{stations.length} Stations</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-base"></div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 font-medium">FLEET ASSETS</div>
            <div className="text-base font-bold font-mono text-amber-700">{assets.length} Units</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-base"></div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 font-medium">ACTIVE CONSIGNMENTS</div>
            <div className="text-base font-bold font-mono text-indigo-700">{cargo.length} Shipments</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-base">️</div>
          <div>
            <div className="text-[10px] font-mono text-slate-500 font-medium">ACTIVE SAR DISTRESS</div>
            <div className="text-base font-bold font-mono text-rose-700">
              {emergencies.filter(e => e.status !== 'Resolved').length} Incidents
            </div>
          </div>
        </div>
      </div>

      {/* Full GIS Interactive Map Component */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <PolarLeafletMap
          stations={stations}
          assets={assets}
          cargo={cargo}
          emergencies={emergencies}
          height="620px"
        />
      </div>
    </div>
  );
};

