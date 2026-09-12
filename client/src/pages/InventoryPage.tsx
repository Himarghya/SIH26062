import React, { useState } from 'react';
import { InventoryItem, Station } from '../types';
import { 
  Anchor, 
  Flame, 
  ShieldAlert, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Cpu 
} from 'lucide-react';

interface InventoryPageProps {
  inventory: InventoryItem[];
  stations: Station[];
  selectedStationId: string;
  onAdjustStock: (id: string, deltaQty: number) => void;
  onOpenFuelModal: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  inventory,
  stations,
  selectedStationId,
  onAdjustStock,
  onOpenFuelModal
}) => {
  const [filterStation, setFilterStation] = useState<string>(selectedStationId);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInventory = inventory.filter(item => {
    const matchesStation = filterStation === 'all' || item.stationId === filterStation;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStation && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase font-mono flex items-center space-x-2">
            <Anchor className="w-6 h-6 text-cyan-400" />
            <span>Polar Multi-Station Critical Inventory & Survival Reserves</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tracking Fuel Farms, MRE Rations, Cummins Spares, and Medical Oxygen across Antarctic & Arctic Bases
          </p>
        </div>

        <button
          onClick={onOpenFuelModal}
          className="px-4 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-cyan-500/50 text-cyan-300 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/15 transition"
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Launch AI Fuel Burn Optimizer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU or item name (e.g. POL-DSL-D10, MRE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-polar-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStation}
            onChange={(e) => setFilterStation(e.target.value)}
            className="bg-polar-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Stations</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-polar-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="Polar Fuel">Polar Fuel (D-10 / ATF)</option>
            <option value="Survival Food">Survival Food (MREs)</option>
            <option value="Generator Spares">Generator Spares</option>
            <option value="Medical">Medical & Oxygen</option>
            <option value="Extreme Cold Gear">Extreme Cold Gear</option>
          </select>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const station = stations.find(s => s.id === item.stationId);
          const isFuel = item.category === 'Polar Fuel';
          const stockPercent = Math.min(100, Math.round((item.currentStock / (item.minSafetyThreshold * 2.2)) * 100));
          const isLow = item.condition === 'Low Stock' || item.condition === 'Critical Shortage';

          return (
            <div
              key={item.id}
              className={`glass-panel p-4 rounded-xl space-y-3 relative group transition border ${
                isLow ? 'border-amber-500/60 bg-amber-950/20' : 'hover:border-cyan-500/40'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-400 text-xs">{item.sku}</span>
                    <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-polar-900">
                      {station?.name || 'Base'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{item.name}</h4>
                  <p className="text-[11px] text-slate-400">{item.storageLocation}</p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  item.condition === 'Optimal' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  item.condition === 'Low Stock' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                  'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {item.condition}
                </span>
              </div>

              {/* Stock Quantity & Days Remaining */}
              <div className="p-3 rounded-lg bg-polar-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">CURRENT LEVEL</div>
                  <div className="text-lg font-black font-mono text-slate-100">
                    {item.currentStock.toLocaleString()} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">AUTONOMY BUFFER</div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {item.daysRemaining > 900 ? 'Permanent' : `~${item.daysRemaining} Days`}
                  </div>
                </div>
              </div>

              {/* Progress Bar towards Min Threshold */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Safety Margin</span>
                  <span>Min Threshold: {item.minSafetyThreshold.toLocaleString()} {item.unit}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stockPercent > 60 ? 'bg-emerald-500' :
                      stockPercent > 30 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
              </div>

              {/* Interactive Stock Adjustment Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Log Consumption / Restock:</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onAdjustStock(item.id, isFuel ? -500 : -1)}
                    className="p-1.5 rounded-lg bg-polar-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition"
                    title={`Log consumption (${isFuel ? '-500 L' : '-1 unit'})`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onAdjustStock(item.id, isFuel ? 1000 : 5)}
                    className="p-1.5 rounded-lg bg-polar-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 transition"
                    title={`Log restock (${isFuel ? '+1,000 L' : '+5 units'})`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
