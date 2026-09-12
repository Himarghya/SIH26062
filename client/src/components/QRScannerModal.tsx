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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-polar-950 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl polar-glow">
        {/* Header */}
        <div className="bg-gradient-to-r from-polar-900 to-polar-850 px-6 py-4 flex items-center justify-between border-b border-cyan-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-600/20 border border-cyan-500/50 text-cyan-300">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 uppercase font-mono tracking-wide">
                Digital Cargo & Cold-Chain Scanner
              </h2>
              <p className="text-xs text-slate-400">
                RFID / 2D DataMatrix / Barcode Verification Gateway
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-polar-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Barcode Simulator Buttons */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
              Select Sample Manifest Tag to Simulate Optical Scanner:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cargoList.slice(0, 4).map(c => (
                <button
                  key={c.id}
                  onClick={() => handleScanOrLookup(c.barcode)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition ${
                    selectedItem?.id === c.id 
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400' 
                      : 'bg-polar-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-mono font-bold text-cyan-400 flex items-center justify-between">
                    <span>{c.trackingCode}</span>
                    {c.isColdChain && <span className="text-[10px] text-blue-400 bg-blue-950 px-1 rounded">Cold-Chain</span>}
                  </div>
                  <div className="truncate text-slate-400 mt-0.5">{c.name}</div>
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
                className="w-full bg-polar-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Scanned Cargo Details Card */}
          {selectedItem ? (
            <div className="p-4 rounded-xl bg-polar-900/90 border border-cyan-800/50 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-extrabold text-cyan-300 text-sm">{selectedItem.trackingCode}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {selectedItem.barcode}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm mt-1">{selectedItem.name}</h3>
                  <p className="text-xs text-slate-400">{selectedItem.category} • Container: {selectedItem.containerId}</p>
                </div>

                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  selectedItem.priority === 'Mission Critical' ? 'bg-rose-950 text-rose-300 border border-rose-700/50' : 'bg-blue-950 text-blue-300 border border-blue-700/50'
                }`}>
                  {selectedItem.priority}
                </span>
              </div>

              {/* Cold Chain IoT Sensor Status */}
              {selectedItem.isColdChain && selectedItem.temperatureSensor && (
                <div className={`p-3 rounded-lg border flex items-center justify-between ${
                  selectedItem.temperatureSensor.isViolated
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                    : 'bg-blue-950/80 border-blue-600/60 text-blue-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="font-bold text-xs">
                        Current Core Temp: {selectedItem.temperatureSensor.currentC}°C
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Safe Envelope: {selectedItem.temperatureSensor.requiredMinC}°C to {selectedItem.temperatureSensor.requiredMaxC}°C
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs">
                    <Battery className="w-4 h-4 text-emerald-400" />
                    <span>{selectedItem.temperatureSensor.batteryPct}% IoT Battery</span>
                  </div>
                </div>
              )}

              {/* Weight, Volume, Hazard */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-polar-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Net Weight</div>
                  <div className="font-bold text-slate-200">{selectedItem.weightKg} kg</div>
                </div>
                <div className="p-2 rounded bg-polar-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Volume</div>
                  <div className="font-bold text-slate-200">{selectedItem.volumeM3} m³</div>
                </div>
                <div className="p-2 rounded bg-polar-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Hazard Class</div>
                  <div className="font-bold text-amber-400">{selectedItem.hazardType}</div>
                </div>
              </div>

              {/* Status Transition Action */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Update Stage:</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as CargoItem['status'])}
                    className="bg-polar-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-medium focus:outline-none focus:border-cyan-500"
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
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-600/30 transition"
                >
                  <span>Apply Transfer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {updateSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Cargo manifest state updated and broadcast to all stations.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
              Point scanner or click any sample manifest barcode above to inspect payload details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
