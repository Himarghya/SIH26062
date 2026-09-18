import React, { useState, useEffect } from 'react';
import { polarisApi } from '../../api/services';
import { QrCode, Search, CheckCircle2, X, ArrowRight, ShieldCheck, Thermometer, Battery } from 'lucide-react';

interface CargoQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoItem?: any;
  onStatusUpdated?: () => void;
}

export const CargoQrModal: React.FC<CargoQrModalProps> = ({ isOpen, onClose, cargoItem, onStatusUpdated }) => {
  if (!isOpen) return null;

  const [inputCode, setInputCode] = useState(cargoItem?.barcode || '');
  const [scannedItem, setScannedItem] = useState<any>(cargoItem || null);
  const [newStatus, setNewStatus] = useState<string>('Received at Station');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (cargoItem) {
      setScannedItem(cargoItem);
      setInputCode(cargoItem.barcode || '');
    }
  }, [cargoItem]);

  const sampleBarcodes = [
    { code: '890126062001', name: 'Multi-Channel Ice Core Drill Unit' },
    { code: '890126062002', name: 'Antarctic Cryophilic Bacterial Strains (-80°C)' },
    { code: '890126062003', name: 'Special Polar Diesel (D-10 / 45,000L)' },
  ];

  const handleLookup = async (code: string) => {
    setInputCode(code);
    setLoading(true);
    try {
      const data = await polarisApi.getCargoByBarcode(code);
      setScannedItem(data);
      setSuccess(false);
    } catch (e) {
      setScannedItem(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!scannedItem) return;
    setLoading(true);
    try {
      const updated = await polarisApi.updateCargo(scannedItem.id, {
        status: newStatus,
        current_location: newStatus === 'Delivered' ? 'Station Vault' : 'Field Transit Bay'
      });
      setScannedItem(updated);
      setSuccess(true);
      if (onStatusUpdated) onStatusUpdated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase font-mono tracking-wide">
                Digital Cargo QR / RFID Optical Gateway
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Authorized scanning, cold-chain validation, and status transfer ledger
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-white border border-slate-200 shadow-sm transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Select Buttons */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-700 font-bold mb-2">
              Optical 2D DataMatrix Simulation Tags:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sampleBarcodes.map((s) => (
                <button
                  key={s.code}
                  onClick={() => handleLookup(s.code)}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-left text-xs transition shadow-sm"
                >
                  <div className="font-mono font-bold text-emerald-800">{s.code}</div>
                  <div className="text-[10px] text-slate-600 truncate mt-0.5 font-medium">{s.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Search / Scan Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter or scan Barcode (e.g. 890126062002)..."
              value={inputCode}
              onChange={(e) => handleLookup(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white shadow-sm"
            />
          </div>

          {/* Scanned Result */}
          {scannedItem ? (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-emerald-800 text-sm">{scannedItem.cargo_code || scannedItem.trackingCode}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold">
                      Barcode: {scannedItem.barcode}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{scannedItem.name}</h4>
                  <p className="text-xs text-slate-600">{scannedItem.category} • {scannedItem.weight_kg ?? scannedItem.weightKg} kg</p>
                </div>

                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-xs font-bold">
                  {scannedItem.status}
                </span>
              </div>

              {/* Cold chain details if active */}
              {(scannedItem.is_cold_chain || scannedItem.isColdChain) && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs shadow-sm ${
                  scannedItem.is_temp_violated ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                }`}>
                  <div className="flex items-center space-x-2 font-medium">
                    <Thermometer className="w-4 h-4 text-indigo-600" />
                    <span>Core Temp: <strong>{scannedItem.current_temp_c ?? -78.5}°C</strong> (Limit: {scannedItem.temp_min_c ?? -85}°C to {scannedItem.temp_max_c ?? -70}°C)</span>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold"> Sensor Battery 94%</span>
                </div>
              )}

              {/* Status Update Actions */}
              <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-700 font-bold">Transfer Status:</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium shadow-sm"
                  >
                    <option value="Ready for Dispatch">Ready for Dispatch</option>
                    <option value="In Transit">In Transit (Vessel / Helo)</option>
                    <option value="At Port">At Port Staging</option>
                    <option value="At Station">At Station Vault</option>
                    <option value="Delivered">Delivered & Restocked</option>
                  </select>
                </div>

                <button
                  onClick={handleUpdateStatus}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-slate-900   hover: hover: text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <span>Apply Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {success && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cargo status updated & recorded to tracking event ledger.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
              Select any sample barcode above or scan cargo manifest tag to verify payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
