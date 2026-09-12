import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
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
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StockTransactionModal } from '../components/inventory/StockTransactionModal';
import { FuelOptimizerModal } from '../components/FuelOptimizerModal';

export const InventoryPage: React.FC<{
  inventory?: any[];
  stations?: any[];
  selectedStationId?: string;
  onAdjustStock?: (id: string, deltaQty: number) => void;
  onOpenFuelModal?: () => void;
}> = ({ 
  inventory: propInventory, 
  stations: propStations, 
  selectedStationId: propSelectedStationId = 'all', 
  onAdjustStock, 
  onOpenFuelModal 
}) => {
  const [inventory, setInventory] = useState<any[]>(propInventory || []);
  const [stations, setStations] = useState<any[]>(propStations || []);
  const [filterStation, setFilterStation] = useState<string>(propSelectedStationId);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItemForTx, setSelectedItemForTx] = useState<any>(null);
  const [showFuelOptimizer, setShowFuelOptimizer] = useState(false);

  const fetchInventoryData = async () => {
    try {
      const [inv, stns] = await Promise.all([
        polarisApi.getInventory(),
        polarisApi.getStations()
      ]);
      setInventory(inv);
      setStations(stns);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!propInventory || propInventory.length === 0) {
      fetchInventoryData();
    } else {
      setInventory(propInventory);
    }
  }, [propInventory]);

  const filteredInventory = inventory.filter(item => {
    const stnId = item.station_id || item.stationId;
    const sku = item.sku || '';
    const name = item.name || '';
    const matchesStation = filterStation === 'all' || stnId === filterStation;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || sku.toLowerCase().includes(searchQuery.toLowerCase());
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
          onClick={() => {
            if (onOpenFuelModal) onOpenFuelModal();
            else setShowFuelOptimizer(true);
          }}
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
            <option value="Fuel">Polar Fuel (D-10 / ATF)</option>
            <option value="Food">Survival Food (MREs)</option>
            <option value="Equipment">Machinery Spares</option>
            <option value="Medical">Medical & Oxygen</option>
            <option value="Scientific">Scientific Spares</option>
          </select>
        </div>
      </div>

      {/* Inventory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => {
          const stnId = item.station_id || item.stationId;
          const station = stations.find(s => s.id === stnId);
          const currentQty = item.quantity ?? item.currentStock ?? 0;
          const minThreshold = item.min_threshold ?? item.minSafetyThreshold ?? 100;
          const stockPercent = Math.min(100, Math.round((currentQty / (minThreshold * 2)) * 100));
          const isLow = currentQty < minThreshold;

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
                      {station?.name || 'Base Store'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{item.name}</h4>
                  <p className="text-[11px] text-slate-400">{item.storage_location || item.storageLocation || 'Main Warehouse'}</p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  !isLow ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                }`}>
                  {!isLow ? 'Optimal' : 'Low Stock'}
                </span>
              </div>

              {/* Stock Quantity & Days Remaining */}
              <div className="p-3 rounded-lg bg-polar-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">CURRENT STOCK</div>
                  <div className="text-lg font-black font-mono text-slate-100">
                    {currentQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">MIN SAFETY REQ</div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {minThreshold.toLocaleString()} {item.unit}
                  </div>
                </div>
              </div>

              {/* Progress Bar towards Min Threshold */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Stock Buffer</span>
                  <span>{stockPercent}% capacity</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stockPercent > 50 ? 'bg-emerald-500' :
                      stockPercent > 20 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
              </div>

              {/* Interactive Stock Ledger Trigger Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Ledger Action:</span>
                <button
                  onClick={() => {
                    setSelectedItemForTx(item);
                    setShowStockModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-polar-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Movement / Restock</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Transaction Ledger Modal */}
      <StockTransactionModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        item={selectedItemForTx}
        onSuccess={() => fetchInventoryData()}
      />

      {/* AI Fuel Optimizer Modal */}
      <FuelOptimizerModal
        isOpen={showFuelOptimizer}
        onClose={() => setShowFuelOptimizer(false)}
        stations={stations}
      />
    </div>
  );
};
