import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { polarisApi } from '../api/services';
import { 
  Box, 
  ArrowLeft, 
  Thermometer, 
  Battery, 
  QrCode, 
  Clock, 
  MapPin, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const CargoDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cargo, setCargo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchCargo = async () => {
      try {
        const data = await polarisApi.getCargoById(id);
        setCargo(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCargo();
  }, [id]);

  if (loading || !cargo) {
    return <div className="p-8 text-center text-slate-400">Loading cargo dossier...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/cargo"
            className="p-2 rounded-xl bg-polar-900 hover:bg-polar-850 border border-slate-800 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {cargo.cargo_code}
              </span>
              <span className="text-xs text-slate-400 font-mono">Barcode: {cargo.barcode}</span>
            </div>
            <h1 className="text-xl font-black text-slate-100 mt-1">{cargo.name}</h1>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-blue-950 border border-cyan-500 text-cyan-300 font-mono text-xs font-bold">
          {cargo.status}
        </span>
      </div>

      {/* Cold chain card if applicable */}
      {cargo.is_cold_chain && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          cargo.is_temp_violated ? 'bg-rose-950/80 border-rose-500 text-rose-200' : 'bg-blue-950/80 border-blue-600 text-blue-200'
        }`}>
          <div className="flex items-center space-x-3">
            <Thermometer className="w-6 h-6 text-cyan-400" />
            <div>
              <div className="font-bold text-sm">Core Cryo-Sensor: {cargo.current_temp_c}°C</div>
              <div className="text-xs text-slate-400">Safe Envelope: {cargo.temp_min_c}°C to {cargo.temp_max_c}°C</div>
            </div>
          </div>
          <span className="font-mono text-xs text-emerald-400">✅ Sensor Battery 94%</span>
        </div>
      )}

      {/* Shipment Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl text-xs">
          <div className="text-slate-400 font-mono">WEIGHT</div>
          <div className="text-lg font-bold text-slate-100 mt-1 font-mono">{cargo.weight_kg} kg</div>
        </div>
        <div className="glass-panel p-4 rounded-xl text-xs">
          <div className="text-slate-400 font-mono">VOLUME</div>
          <div className="text-lg font-bold text-slate-100 mt-1 font-mono">{cargo.volume_m3} m³</div>
        </div>
        <div className="glass-panel p-4 rounded-xl text-xs">
          <div className="text-slate-400 font-mono">ORIGIN</div>
          <div className="text-slate-200 font-semibold mt-1 truncate">{cargo.origin}</div>
        </div>
        <div className="glass-panel p-4 rounded-xl text-xs">
          <div className="text-slate-400 font-mono">CURRENT LOCATION</div>
          <div className="text-cyan-300 font-semibold mt-1 truncate">{cargo.current_location}</div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-xs font-mono uppercase text-slate-300 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Custody & Transport Event Ledger</span>
        </h3>

        <div className="space-y-3">
          {cargo.tracking_events?.map((evt: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-polar-900/60 border border-slate-800 text-xs flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-100">{evt.status}</span>
                  <span className="text-[10px] text-slate-400 font-mono">at {evt.location}</span>
                </div>
                <div className="text-slate-400 text-[11px]">{evt.notes}</div>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Recorded by {evt.recorded_by} • {new Date(evt.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
