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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-polar-950 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl polar-glow">
        <div className="bg-polar-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Anchor className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100 font-mono uppercase">Record Stock Movement</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Target Item</label>
            <div className="p-2.5 rounded-xl bg-polar-900 border border-slate-800 font-semibold text-slate-200">
              {item.name} ({item.item_code}) — Current Stock: {item.quantity} {item.unit}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Movement Type</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full bg-polar-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Stock In">Stock In (Restock / Delivery)</option>
              <option value="Stock Out">Stock Out (Consumption / Sortie)</option>
              <option value="Stock Transfer">Stock Transfer (Inter-Bay / Camp)</option>
              <option value="Stock Adjustment">Stock Adjustment (Audit Correction)</option>
              <option value="Stock Reservation">Stock Reservation (Emergency Buffer)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Quantity ({item.unit})</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="0.1"
              step="any"
              className="w-full bg-polar-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Operational Reason / Log</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-polar-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-polar-900 text-slate-300 hover:bg-polar-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold"
            >
              {loading ? "Recording..." : "Record Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
