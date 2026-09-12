import React, { useState } from 'react';
import { Expedition, Station } from '../types';
import { Layers, Plus, Calendar, DollarSign, Target, User, Shield, CheckCircle2, ChevronRight } from 'lucide-react';

interface ExpeditionsPageProps {
  expeditions: Expedition[];
  stations: Station[];
  onCreateExpedition: (exp: Partial<Expedition>) => void;
}

export const ExpeditionsPage: React.FC<ExpeditionsPageProps> = ({
  expeditions,
  stations,
  onCreateExpedition
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition>(expeditions[0]);
  
  // New expedition form state
  const [newExpCode, setNewExpCode] = useState('ISEA-45');
  const [newTitle, setNewTitle] = useState('45th Indian Scientific Expedition to Antarctica');
  const [newTheme, setNewTheme] = useState('Ice Sheet Mass Balance & Subglacial Lake Exploration');
  const [newLeaderName, setNewLeaderName] = useState('Dr. Rajeshwar Rao');
  const [newLeaderOrg, setNewLeaderOrg] = useState('National Centre for Polar and Ocean Research (NCPOR)');
  const [newBudget, setNewBudget] = useState(92.0);
  const [newCargoQuota, setNewCargoQuota] = useState(4500);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateExpedition({
      expeditionCode: newExpCode,
      title: newTitle,
      theme: newTheme,
      season: '2026-2027',
      leader: {
        name: newLeaderName,
        designation: 'Scientist-G & Mission Leader',
        organization: newLeaderOrg,
        email: 'r.rao@ncpor.res.in',
        satellitePhone: '+8816-9210-4411'
      },
      stationsCovered: ['stn-bharati', 'stn-maitri'],
      startDate: '2026-11-01',
      endDate: '2027-12-15',
      status: 'Planning',
      totalPersonnel: 48,
      allocatedBudgetCrores: newBudget,
      cargoQuotaTons: newCargoQuota,
      scientificObjectives: [
        'Deploy Deep Subglacial Lake Autonomous Probe',
        'Long-term Atmospheric Greenhouse Gas Profiling at Larsemann Hills',
        'Maitri Modernization & Green Renewable Energy Pilot Installation'
      ],
      riskIndex: 6
    });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase font-mono flex items-center space-x-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>National Polar Expedition Programs (MoES / NCPOR)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-End Mission Lifecycles: Planning $\rightarrow$ Mobilization $\rightarrow$ Overwintering $\rightarrow$ Demobilization
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Charter New Expedition</span>
        </button>
      </div>

      {/* Expeditions List & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Expedition Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">Active & Scheduled Missions</h3>
          {expeditions.map((exp) => {
            const isSelected = selectedExpedition?.id === exp.id;
            return (
              <div
                key={exp.id}
                onClick={() => setSelectedExpedition(exp)}
                className={`p-4 rounded-xl cursor-pointer transition border ${
                  isSelected
                    ? 'bg-polar-850 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'glass-panel hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-cyan-400 text-sm">{exp.expeditionCode}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    exp.status === 'Active In-Field' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' :
                    exp.status === 'Planning' ? 'bg-blue-950 text-blue-300 border border-blue-700/60' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {exp.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-100 text-sm mt-2">{exp.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{exp.theme}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Season {exp.season}</span>
                  <span>{exp.totalPersonnel} Personnel</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Selected Expedition Full Dossier */}
        {selectedExpedition && (
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-cyan-900/40 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                    {selectedExpedition.expeditionCode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Season {selectedExpedition.season}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-2">{selectedExpedition.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedExpedition.theme}</p>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">Approved Mission Budget</div>
                <div className="text-xl font-bold text-emerald-400">₹ {selectedExpedition.allocatedBudgetCrores} Crores</div>
              </div>
            </div>

            {/* Key Mission Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-polar-900 border border-slate-800 text-xs">
                <div className="text-slate-400 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mission Leader</span>
                </div>
                <div className="font-bold text-slate-200 mt-1">{selectedExpedition.leader.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{selectedExpedition.leader.organization}</div>
              </div>

              <div className="p-3 rounded-xl bg-polar-900 border border-slate-800 text-xs">
                <div className="text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Duration</span>
                </div>
                <div className="font-bold text-slate-200 mt-1">
                  {new Date(selectedExpedition.startDate).toLocaleDateString()}
                </div>
                <div className="text-[10px] text-slate-500">to {new Date(selectedExpedition.endDate).toLocaleDateString()}</div>
              </div>

              <div className="p-3 rounded-xl bg-polar-900 border border-slate-800 text-xs">
                <div className="text-slate-400 flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cargo Quota</span>
                </div>
                <div className="font-bold text-slate-200 mt-1">{selectedExpedition.cargoQuotaTons} Tons</div>
                <div className="text-[10px] text-slate-500">Multimodal Sea/Air</div>
              </div>

              <div className="p-3 rounded-xl bg-polar-900 border border-slate-800 text-xs">
                <div className="text-slate-400 flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span>Risk Score</span>
                </div>
                <div className="font-bold text-amber-400 mt-1">{selectedExpedition.riskIndex} / 10</div>
                <div className="text-[10px] text-slate-500">Extreme Polar Environment</div>
              </div>
            </div>

            {/* Scientific Objectives Checklist */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Primary Scientific & Logistical Deliverables</span>
              </h4>

              <div className="space-y-2">
                {selectedExpedition.scientificObjectives.map((obj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-polar-900/80 border border-slate-800 text-xs flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bases & Staging Hubs Covered */}
            <div className="p-4 rounded-xl bg-polar-900/40 border border-cyan-900/30 flex items-center justify-between text-xs">
              <span className="text-slate-400">Expedition Bases Assigned:</span>
              <div className="flex items-center space-x-2">
                {selectedExpedition.stationsCovered.map((stnId) => {
                  const st = stations.find(s => s.id === stnId);
                  return (
                    <span key={stnId} className="px-2.5 py-1 rounded bg-polar-850 text-cyan-300 border border-slate-700 font-mono">
                      {st?.name || stnId}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charter New Expedition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-polar-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-mono uppercase">Charter New Polar Scientific Expedition</h3>
            
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Expedition Code</label>
                <input
                  type="text"
                  value={newExpCode}
                  onChange={(e) => setNewExpCode(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Theme / Scientific Scope</label>
                <input
                  type="text"
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mission Director / Leader</label>
                  <input
                    type="text"
                    value={newLeaderName}
                    onChange={(e) => setNewLeaderName(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Budget (₹ Crores)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded bg-polar-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Confirm Charter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
