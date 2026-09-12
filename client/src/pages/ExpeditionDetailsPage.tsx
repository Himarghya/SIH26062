import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { polarisApi } from '../api/services';
import { 
  Layers, 
  Calendar, 
  DollarSign, 
  Target, 
  User, 
  Shield, 
  Box, 
  Users, 
  Truck, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const ExpeditionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [expedition, setExpedition] = useState<any>(null);
  const [cargoList, setCargoList] = useState<any[]>([]);
  const [personnelList, setPersonnelList] = useState<any[]>([]);
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchExp = async () => {
      try {
        const [exp, crg, prs, ast] = await Promise.all([
          polarisApi.getExpeditionById(id),
          polarisApi.getCargoList({}),
          polarisApi.getPersonnelList({ expedition_id: id }),
          polarisApi.getAssets({ expedition_id: id })
        ]);
        setExpedition(exp);
        setCargoList(crg.filter((c: any) => c.expedition_id === id));
        setPersonnelList(prs);
        setAssetsList(ast);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchExp();
  }, [id]);

  if (loading || !expedition) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading expedition dossier...</div>;
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/expeditions"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {expedition.expedition_code}
              </span>
              <span className="text-xs text-slate-500 font-medium">{expedition.region}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1">{expedition.name}</h1>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold shadow-xs">
          Status: {expedition.status}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono font-medium">MISSION BUDGET</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">₹ {expedition.budget_crores} Cr</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono font-medium">CARGO ALLOCATION</div>
          <div className="text-xl font-bold font-mono text-indigo-700 mt-1">{expedition.cargo_quota_tons} Tons</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono font-medium">DEPLOYED PERSONNEL</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{personnelList.length} Scientists</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="text-[10px] text-slate-500 font-mono font-medium">ASSIGNED ASSETS</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">{assetsList.length} Units</div>
        </div>
      </div>

      {/* Overview Description */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2">
        <h3 className="font-bold text-xs font-mono uppercase text-slate-700">Scientific Scope & Theme</h3>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">{expedition.description}</p>
      </div>

      {/* Cargo Manifest Table */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
        <h3 className="font-bold text-xs font-mono uppercase text-slate-900 flex items-center space-x-2">
          <Box className="w-4 h-4 text-emerald-600" />
          <span>Assigned Cargo Manifest ({cargoList.length} shipments)</span>
        </h3>

        {cargoList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl">
            No cargo manifests linked to this expedition.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cargoList.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-emerald-700">{c.cargo_code}</span> — <span className="font-bold text-slate-900">{c.name}</span>
                  <div className="text-[10px] text-slate-500 font-medium">{c.category} • {c.weight_kg} kg</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[10px] font-bold">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

