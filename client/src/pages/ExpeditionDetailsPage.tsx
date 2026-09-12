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
    return <div className="p-8 text-center text-slate-400">Loading expedition dossier...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/expeditions"
            className="p-2 rounded-xl bg-polar-900 hover:bg-polar-850 border border-slate-800 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {expedition.expedition_code}
              </span>
              <span className="text-xs text-slate-400">{expedition.region}</span>
            </div>
            <h1 className="text-xl font-black text-slate-100 mt-1">{expedition.name}</h1>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono text-xs font-bold">
          Status: {expedition.status}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 font-mono">MISSION BUDGET</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">₹ {expedition.budget_crores} Cr</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 font-mono">CARGO ALLOCATION</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{expedition.cargo_quota_tons} Tons</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 font-mono">DEPLOYED PERSONNEL</div>
          <div className="text-xl font-bold font-mono text-slate-100 mt-1">{personnelList.length} Scientists</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 font-mono">ASSIGNED ASSETS</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">{assetsList.length} Units</div>
        </div>
      </div>

      {/* Overview Description */}
      <div className="glass-panel p-5 rounded-2xl space-y-2">
        <h3 className="font-bold text-xs font-mono uppercase text-slate-300">Scientific Scope & Theme</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{expedition.description}</p>
      </div>

      {/* Cargo Manifest Table */}
      <div className="glass-panel p-5 rounded-2xl space-y-3">
        <h3 className="font-bold text-xs font-mono uppercase text-slate-300 flex items-center space-x-2">
          <Box className="w-4 h-4 text-cyan-400" />
          <span>Assigned Cargo Manifest ({cargoList.length} shipments)</span>
        </h3>

        {cargoList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No cargo manifests linked to this expedition.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {cargoList.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-cyan-300">{c.cargo_code}</span> — <span className="font-semibold text-slate-200">{c.name}</span>
                  <div className="text-[10px] text-slate-400">{c.category} • {c.weight_kg} kg</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-polar-900 border border-slate-700 text-slate-300 font-mono text-[10px]">
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
