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
  ArrowRight,
  TrendingDown,
  Calculator,
  Info
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
  const [showFormulas, setShowFormulas] = useState(true);

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
    const sku = item.sku || item.item_code || '';
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
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono flex items-center space-x-2">
            <Anchor className="w-6 h-6 text-emerald-600" />
            <span>Multi-Station Inventory & Wintering Autonomy Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Predictive stockout modeling, lead-time demand, and safety stock reserves for 8-month winter isolation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-mono font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>{showFormulas ? 'Hide Formulas' : 'View Autonomy Model'}</span>
          </button>
          <button
            onClick={() => {
              if (onOpenFuelModal) onOpenFuelModal();
              else setShowFuelOptimizer(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <Cpu className="w-4 h-4" />
            <span>Launch Fuel Burn Model</span>
          </button>
        </div>
      </div>

      {/* Explicit Wintering Autonomy Mathematical Formulas Box */}
      {showFormulas && (
        <div className="glass-panel p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 text-xs font-mono space-y-2.5 animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between text-indigo-900 font-bold">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Wintering Autonomy & Stockout Forecasting Engine (Deterministic Mathematical Model)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-normal">NCPOR Standard Logistics Protocol</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1 text-[11px] text-slate-700">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-[10px] uppercase font-bold">1. Estimated Remaining Days</div>
              <div className="font-bold text-emerald-700 mt-0.5">Days = Stock / Daily Burn Rate</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-[10px] uppercase font-bold">2. Safety Stock Buffer</div>
              <div className="font-bold text-indigo-700 mt-0.5">Safety Stock = Daily Burn × 90 Days</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-[10px] uppercase font-bold">3. Reorder Point (ROP)</div>
              <div className="font-bold text-amber-700 mt-0.5">ROP = Lead-Demand + Safety Stock</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="text-slate-500 text-[10px] uppercase font-bold">4. Wintering Risk Triage</div>
              <div className="font-bold text-rose-700 mt-0.5">Days &lt; 180d → Critical Risk</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU or item name (e.g. POL-DSL-D10, MRE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStation}
            onChange={(e) => setFilterStation(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">All Stations</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
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
          const minThreshold = item.minimum_stock ?? item.min_threshold ?? item.minSafetyThreshold ?? 100;
          const burnRate = item.burn_rate_per_day || 15.0;
          const remainingDays = Math.round(currentQty / Math.max(0.1, burnRate));
          const stockPercent = Math.min(100, Math.round((currentQty / Math.max(1, minThreshold * 2.2)) * 100));
          const isCritical = remainingDays < 180 || currentQty < minThreshold;
          const isWarning = remainingDays < 270;

          return (
            <div
              key={item.id}
              className={`glass-panel p-4 rounded-xl space-y-3 relative group transition border shadow-sm hover:shadow ${
                isCritical ? 'border-rose-300 bg-rose-50/40' :
                isWarning ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-emerald-700 text-xs">{item.item_code || item.sku}</span>
                    <span className="text-[10px] font-mono text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {station?.name || 'Base Store'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{item.name}</h4>
                  <p className="text-[11px] text-slate-500">{item.storage_location || item.storageLocation || 'Main Warehouse'}</p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isCritical ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' :
                  isWarning ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {isCritical ? 'Critical Stockout Risk' : isWarning ? 'Warning Buffer' : 'Optimal Reserve'}
                </span>
              </div>

              {/* Stock Quantity & Days Remaining */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold">AVAILABLE STOCK</div>
                  <div className="text-lg font-black font-mono text-slate-900">
                    {currentQty.toLocaleString()} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-mono font-bold">AUTONOMY DURATION</div>
                  <div className={`text-base font-bold font-mono ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'}`}>
                    ~{remainingDays > 900 ? 'Permanent' : `${remainingDays} Days`}
                  </div>
                </div>
              </div>

              {/* Lead Time & Reorder Point Info */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono">
                <div>Daily Burn: <strong className="text-slate-900">{burnRate} {item.unit}/day</strong></div>
                <div>Safety Buffer: <strong className="text-emerald-700">{minThreshold} {item.unit}</strong></div>
              </div>

              {/* Progress Bar towards Min Threshold */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1 font-semibold">
                  <span>Winter Reserve Margin</span>
                  <span>{stockPercent}% of Target</span>
                </div>
                <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      !isWarning ? 'bg-emerald-500' :
                      !isCritical ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
              </div>

              {/* Interactive Stock Ledger Trigger Button */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono font-semibold">Ledger Transaction:</span>
                <button
                  onClick={() => {
                    setSelectedItemForTx(item);
                    setShowStockModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
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
