import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Anchor, 
  Plane, 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  ShieldAlert 
} from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    try {
      const data = await polarisApi.getAssets();
      setAssets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.asset_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || a.asset_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono flex items-center space-x-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            <span>Operational Assets & Transport Fleet</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Research vessels, polar aircraft, heavy PistenBully snowcats, skidoos & station power generators
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset by name or code (e.g. VSL-VASILIY)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono focus:bg-white transition"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
        >
          <option value="all">All Asset Types</option>
          <option value="Ship">Research Vessels / Icebreakers</option>
          <option value="Aircraft">Polar Aircraft / Helicopters</option>
          <option value="Vehicle">PistenBully Snowcats / Skidoos</option>
          <option value="Generator">Station Power Generators</option>
        </select>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="glass-panel p-5 rounded-2xl space-y-3 relative group hover:border-emerald-400 transition shadow-sm hover:shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-emerald-700">{asset.asset_code}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                    {asset.asset_type}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{asset.name}</h3>
                <p className="text-[11px] text-slate-500">{asset.owner_organization}</p>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                asset.status === 'Operational' || asset.status === 'Available' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                asset.status === 'In Transit' ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' :
                'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {asset.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Current Location:</span>
                <span className="font-bold text-slate-900 truncate max-w-[140px]">{asset.current_location}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fuel Level:</span>
                <span className="font-mono font-bold text-emerald-700">{asset.fuel_pct}%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payload Capacity:</span>
                <span className="font-mono font-bold text-slate-900">{asset.capacity_tons} Tons</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1">
                <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next Service: <strong className="text-slate-800 font-mono">{asset.next_maintenance_date || 'Winter 2026'}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
