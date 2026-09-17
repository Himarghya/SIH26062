import React, { useState } from 'react';
import { polarisApi } from '../../api/services';
import { Anchor, Plus, Minus, ArrowRightLeft, ShieldCheck, X } from 'lucide-react';

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSuccess: () => void;
}

export const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess
}) => {
  if (!isOpen || !item) return null;

  const [transactionType, setTransactionType] = useState('Stock In');
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState('Routine station restock');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await polarisApi.createInventoryTransaction(item.id, {
        transaction_type: transactionType,
        quantity: Number(quantity),
        reason
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900    px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Anchor className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 font-mono uppercase">Record Stock Movement</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1 font-mono uppercase text-[11px]">Target Item</label>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-900">
              {item.name} ({item.item_code}) — Current Stock: <span className="text-emerald-700">{item.quantity} {item.unit}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 font-mono uppercase text-[11px]">Movement Type</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white"
            >
              <option value="Stock In">Stock In (Restock / Delivery)</option>
              <option value="Stock Out">Stock Out (Consumption / Sortie)</option>
              <option value="Stock Transfer">Stock Transfer (Inter-Bay / Camp)</option>
              <option value="Stock Adjustment">Stock Adjustment (Audit Correction)</option>
              <option value="Stock Reservation">Stock Reservation (Emergency Buffer)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 font-mono uppercase text-[11px]">Quantity ({item.unit})</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="0.1"
              step="any"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 font-mono uppercase text-[11px]">Operational Reason / Log</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Scheduled resupply from Goa container"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-slate-900   hover: hover: disabled:opacity-50 text-white font-bold shadow-md shadow-emerald-600/20 transition"
            >
              {loading ? "Recording..." : "Record Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
