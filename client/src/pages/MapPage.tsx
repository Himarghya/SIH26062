import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
import { PolarLeafletMap } from '../components/maps/PolarLeafletMap';
import { Map, Compass, Layers, ShieldAlert, Anchor, MapPin } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGisData = async () => {
      try {
        const [stns, asts, emgs] = await Promise.all([
          polarisApi.getStations(),
          polarisApi.getAssets(),
          polarisApi.getIncidents()
        ]);
        setStations(stns);
        setAssets(asts);
        setEmergencies(emgs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadGisData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase font-mono flex items-center space-x-2">
            <Map className="w-6 h-6 text-cyan-400" />
            <span>Polar Geospatial Intelligence & GIS Operations Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time positioning across Antarctic (Bharati, Maitri) and Arctic (Himadri, IndARC) sectors
          </p>
        </div>
      </div>

      {/* Full-Screen Map Container */}
      <PolarLeafletMap
        stations={stations}
        assets={assets}
        emergencies={emergencies}
        height="640px"
      />
    </div>
  );
};
