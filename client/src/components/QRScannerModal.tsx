import React, { useState } from 'react';
import { CargoItem } from '../types';
import { QrCode, Search, CheckCircle, AlertOctagon, Thermometer, Battery, ShieldAlert, X, ArrowRight } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoList: CargoItem[];
  onUpdateStatus: (id: string, newStatus: CargoItem['status'], scannedBy: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  cargoList,
  onUpdateStatus
}) => {
  if (!isOpen) return null;

  const [scannedCode, setScannedCode] = useState('');
  const [selectedItem, setSelectedItem] = useState<CargoItem | null>(null);
  const [operatorName, setOperatorName] = useState('Lt Cdr S. Nair (Helo Logistics)');
  const [newStatus, setNewStatus] = useState<CargoItem['status']>('Received at Station');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleScanOrLookup = (code: string) => {
    setScannedCode(code);
    const found = cargoList.find(c => 
      c.barcode === code || 
      c.trackingCode.toLowerCase() === code.toLowerCase() ||
      c.containerId.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      setSelectedItem(found);
      setUpdateSuccess(false);
    } else {
      setSelectedItem(null);
    }
  };

  const handleApplyUpdate = () => {
    if (!selectedItem) return;
    onUpdateStatus(selectedItem.id, newStatus, operatorName);
    setUpdateSuccess(true);
    setTimeout(() => {
      setUpdateSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900    px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase font-mono tracking-wide">
                Digital Cargo & Cold-Chain Scanner
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                RFID / 2D DataMatrix / Barcode Verification Gateway
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-white border border-slate-200 shadow-sm transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Barcode Simulator Buttons */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-700 font-bold mb-2">
              Select Sample Manifest Tag to Simulate Optical Scanner:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cargoList.slice(0, 4).map(c => (
                <button
                  key={c.id}
                  onClick={() => handleScanOrLookup(c.barcode)}
                  className={`p-3 rounded-2xl border text-left text-xs transition shadow-sm ${
                    selectedItem?.id === c.id 
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-400/40' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="font-mono font-bold text-emerald-800 flex items-center justify-between">
                    <span>{c.trackingCode}</span>
                    {c.isColdChain && <span className="text-[10px] text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded font-bold">Cold-Chain</span>}
                  </div>
                  <div className="truncate text-slate-600 mt-0.5 font-medium">{c.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Scan Barcode / Enter Tracking Code (e.g. 890126062002)..."
                value={scannedCode}
                onChange={(e) => handleScanOrLookup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono focus:bg-white shadow-sm transition"
              />
            </div>
          </div>

          {/* Scanned Cargo Details Card */}
          {selectedItem ? (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-emerald-800 text-sm">{selectedItem.trackingCode}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold">
                      {selectedItem.barcode}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">{selectedItem.name}</h3>
                  <p className="text-xs text-slate-600">{selectedItem.category} • Container: {selectedItem.containerId}</p>
                </div>

                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  selectedItem.priority === 'Mission Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                }`}>
                  {selectedItem.priority}
                </span>
              </div>

              {/* Cold Chain IoT Sensor Status */}
              {selectedItem.isColdChain && selectedItem.temperatureSensor && (
                <div className={`p-3.5 rounded-xl border flex items-center justify-between shadow-sm ${
                  selectedItem.temperatureSensor.isViolated
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-950'
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <Thermometer className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="font-bold text-xs">
                        Current Core Temp: {selectedItem.temperatureSensor.currentC}°C
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Safe Envelope: {selectedItem.temperatureSensor.requiredMinC}°C to {selectedItem.temperatureSensor.requiredMaxC}°C
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    <span>{selectedItem.temperatureSensor.batteryPct}% IoT Battery</span>
                  </div>
                </div>
              )}

              {/* Weight, Volume, Hazard */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-semibold">Net Weight</div>
                  <div className="font-bold text-slate-900">{selectedItem.weightKg} kg</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-semibold">Volume</div>
                  <div className="font-bold text-slate-900">{selectedItem.volumeM3} m³</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="text-slate-500 text-[10px] font-semibold">Hazard Class</div>
                  <div className="font-bold text-amber-700">{selectedItem.hazardType}</div>
                </div>
              </div>

              {/* Status Transition Action */}
              <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-700 font-bold">Update Stage:</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as CargoItem['status'])}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-emerald-500 shadow-sm"
                  >
                    <option value="Staged at Port">Staged at Port (Goa/Cape Town)</option>
                    <option value="Vessel Hold">Vessel Hold (Icebreaker)</option>
                    <option value="Helicopter Transit">Helicopter Transit (Airlift)</option>
                    <option value="Received at Station">Received at Station (Base)</option>
                    <option value="Deployed at Field Site">Deployed at Field Site</option>
                  </select>
                </div>

                <button
                  onClick={handleApplyUpdate}
                  className="px-5 py-2 rounded-xl bg-slate-900   hover: hover: text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <span>Apply Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {updateSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Cargo manifest state updated and broadcast to all stations.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
              Point scanner or click any sample manifest barcode above to inspect payload details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
