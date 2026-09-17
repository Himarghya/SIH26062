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
    return <div className="p-8 text-center text-slate-500 font-medium">Loading cargo dossier...</div>;
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/cargo"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {cargo.cargo_code}
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">Barcode: {cargo.barcode}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1">{cargo.name}</h1>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-800 font-mono text-xs font-bold shadow-xs">
          {cargo.status}
        </span>
      </div>

      {/* Cold chain card if applicable */}
      {cargo.is_cold_chain && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
          cargo.is_temp_violated ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-teal-50 border-teal-300 text-teal-900'
        }`}>
          <div className="flex items-center space-x-3">
            <Thermometer className="w-6 h-6 text-teal-600" />
            <div>
              <div className="font-bold text-sm">Core Cryo-Sensor: {cargo.current_temp_c}°C</div>
              <div className="text-xs text-slate-600 font-medium">Safe Envelope: {cargo.temp_min_c}°C to {cargo.temp_max_c}°C</div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-700"> Sensor Battery 94%</span>
        </div>
      )}

      {/* Shipment Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs shadow-xs">
          <div className="text-slate-500 font-mono font-medium">WEIGHT</div>
          <div className="text-lg font-black text-slate-900 mt-1 font-mono">{cargo.weight_kg} kg</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs shadow-xs">
          <div className="text-slate-500 font-mono font-medium">VOLUME</div>
          <div className="text-lg font-black text-slate-900 mt-1 font-mono">{cargo.volume_m3} m³</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs shadow-xs">
          <div className="text-slate-500 font-mono font-medium">ORIGIN</div>
          <div className="text-slate-900 font-bold mt-1 truncate">{cargo.origin}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs shadow-xs">
          <div className="text-slate-500 font-mono font-medium">CURRENT LOCATION</div>
          <div className="text-emerald-700 font-bold mt-1 truncate">{cargo.current_location}</div>
        </div>
      </div>

      {/* 9-Stage Multimodal Polar Cold-Chain Stepper */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-xs font-mono uppercase text-slate-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>9-Stage Polar Multimodal Cold-Chain Route (Goa → Antarctica)</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-bold">
            Live Milestone Stepper
          </span>
        </div>

        {/* Stepper Graphic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 pt-2">
          {[
            { step: 1, title: 'Goa NCPOR Hub', desc: 'Pre-chill & Packaging', icon: '' },
            { step: 2, title: 'Mormugao Berth', desc: 'Customs & Port Load', icon: '' },
            { step: 3, title: 'Indian Ocean', desc: 'Reefer Monitoring', icon: '' },
            { step: 4, title: 'Southern Ocean', desc: 'Roaring 40s Crossing', icon: '' },
            { step: 5, title: 'Fast-Ice Mooring', desc: 'Larsemann Coast', icon: '' },
            { step: 6, title: 'Helicopter Lift', desc: 'Kamov Ka-32 Sling', icon: '' },
            { step: 7, title: 'Traverse Sled', desc: 'PistenBully Snow Convoy', icon: '' },
            { step: 8, title: 'Station Dock', desc: 'De-icing Air Lock', icon: '' },
            { step: 9, title: '-80°C Vault', desc: 'Deep Cryo Storage', icon: '️' },
          ].map((stage) => {
            const isPassed = stage.step <= 3;
            const isCurrent = stage.step === 3;

            return (
              <div
                key={stage.step}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-400/30'
                    : isPassed
                    ? 'bg-slate-50 border-emerald-300 text-slate-700'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="text-xl mb-1">{stage.icon}</div>
                <div className="text-[10px] font-mono font-bold text-slate-800">
                  {stage.step}. {stage.title}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
                  {stage.desc}
                </div>
                <div className="mt-2">
                  {isCurrent ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono text-[9px] font-bold animate-pulse">
                      CURRENT
                    </span>
                  ) : isPassed ? (
                    <span className="text-emerald-600 font-mono text-[9px] font-bold">
                       DONE
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono text-[9px]">
                      QUEUED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
        <h3 className="font-bold text-xs font-mono uppercase text-slate-900 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Custody & Transport Event Ledger</span>
        </h3>

        <div className="space-y-3">
          {cargo.tracking_events?.map((evt: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{evt.status}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">at {evt.location}</span>
                </div>
                <div className="text-slate-600 text-[11px] font-medium">{evt.notes}</div>
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

