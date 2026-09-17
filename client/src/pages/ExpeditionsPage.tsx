import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  Calendar, 
  Target, 
  User, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

export const ExpeditionsPage: React.FC<{
  expeditions?: any[];
  stations?: any[];
  onCreateExpedition?: (exp: any) => void;
}> = ({ expeditions: propExpeditions, stations: propStations, onCreateExpedition: propOnCreate }) => {
  const [expeditions, setExpeditions] = useState<any[]>(propExpeditions || []);
  const [stations, setStations] = useState<any[]>(propStations || []);
  const [selectedExpedition, setSelectedExpedition] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Form state
  const [newExpCode, setNewExpCode] = useState('ISEA-45');
  const [newName, setNewName] = useState('45th Indian Scientific Expedition to Antarctica');
  const [newDesc, setNewDesc] = useState('Ice Sheet Mass Balance & Subglacial Lake Exploration');
  const [newRegion, setNewRegion] = useState('Antarctica');
  const [newLeader, setNewLeader] = useState('Dr. Rajeshwar Rao');
  const [newBudget, setNewBudget] = useState(92.0);
  const [newQuota, setNewQuota] = useState(4500);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exps, stns] = await Promise.all([
        polarisApi.getExpeditions(),
        polarisApi.getStations()
      ]);
      setExpeditions(exps);
      setStations(stns);
      if (exps.length > 0) setSelectedExpedition(exps[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propExpeditions || propExpeditions.length === 0) {
      fetchData();
    } else {
      setExpeditions(propExpeditions);
      if (propExpeditions.length > 0) setSelectedExpedition(propExpeditions[0]);
    }
  }, [propExpeditions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      expedition_code: newExpCode,
      name: newName,
      region: newRegion,
      description: newDesc,
      leader_name: newLeader,
      start_date: '2026-11-01T00:00:00Z',
      end_date: '2027-12-15T00:00:00Z',
      budget_crores: newBudget,
      cargo_quota_tons: newQuota,
      status: 'Planning'
    };

    if (propOnCreate) {
      propOnCreate(payload);
    } else {
      try {
        const created = await polarisApi.createExpedition(payload);
        setExpeditions(prev => [created, ...prev]);
        setSelectedExpedition(created);
      } catch (err) {
        console.error(err);
      }
    }
    setShowCreateModal(false);
  };

  const filtered = expeditions.filter(exp => {
    const title = exp.name || exp.title || '';
    const code = exp.expedition_code || exp.expeditionCode || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === 'all' || exp.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono flex items-center space-x-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>National Polar Expedition Programs (MoES / NCPOR)</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            End-to-End Mission Lifecycles: Planning $\rightarrow$ Mobilization $\rightarrow$ Overwintering $\rightarrow$ Demobilization
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Charter New Expedition</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expedition by code or name (e.g. ISEA-44)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
          />
        </div>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
        >
          <option value="all">All Polar Sectors</option>
          <option value="Antarctica">Antarctica (Larsemann Hills / Schirmacher)</option>
          <option value="Arctic">Arctic (Ny-Ålesund, Svalbard)</option>
          <option value="Southern Ocean">Southern Ocean Expedition</option>
        </select>
      </div>

      {/* Expeditions List & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Expedition Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-700 uppercase">Active & Scheduled Missions</h3>
          {filtered.map((exp) => {
            const isSelected = selectedExpedition?.id === exp.id;
            const code = exp.expedition_code || exp.expeditionCode;
            const title = exp.name || exp.title;
            const status = exp.status;

            return (
              <div
                key={exp.id}
                onClick={() => setSelectedExpedition(exp)}
                className={`p-4 rounded-xl cursor-pointer transition border ${
                  isSelected
                    ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-emerald-700 text-sm">{code}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    status === 'Active In-Field' || status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    status === 'Planning' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                    'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mt-2">{title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">{exp.description || exp.theme}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>{exp.region || 'Antarctica'}</span>
                  <span className="text-emerald-700 font-bold font-mono">₹ {exp.budget_crores || exp.allocatedBudgetCrores} Cr</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Selected Expedition Full Dossier */}
        {selectedExpedition && (
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                    {selectedExpedition.expedition_code || selectedExpedition.expeditionCode}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">{selectedExpedition.region}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedExpedition.name || selectedExpedition.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{selectedExpedition.description || selectedExpedition.theme}</p>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs text-slate-500 font-medium">Approved Mission Budget</div>
                <div className="text-xl font-black text-emerald-700">
                  ₹ {selectedExpedition.budget_crores || selectedExpedition.allocatedBudgetCrores} Crores
                </div>
              </div>
            </div>

            {/* Key Mission Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-500 flex items-center space-x-1 font-medium">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mission Leader</span>
                </div>
                <div className="font-bold text-slate-900 mt-1">
                  {selectedExpedition.leader_name || (selectedExpedition.leader && selectedExpedition.leader.name) || 'Dr. N. P. Kurian'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">NCPOR / MoES</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-500 flex items-center space-x-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Duration</span>
                </div>
                <div className="font-bold text-slate-900 mt-1">
                  {selectedExpedition.start_date ? new Date(selectedExpedition.start_date).toLocaleDateString() : 'Nov 2025'}
                </div>
                <div className="text-[10px] text-slate-500">
                  to {selectedExpedition.end_date ? new Date(selectedExpedition.end_date).toLocaleDateString() : 'Dec 2026'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-500 flex items-center space-x-1 font-medium">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>Cargo Quota</span>
                </div>
                <div className="font-bold text-slate-900 mt-1">
                  {selectedExpedition.cargo_quota_tons || selectedExpedition.cargoQuotaTons || 5000} Tons
                </div>
                <div className="text-[10px] text-slate-500">Multimodal Sea/Air</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="text-slate-500 flex items-center space-x-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-rose-600" />
                  <span>Risk Score</span>
                </div>
                <div className="font-black text-rose-700 mt-1">
                  {selectedExpedition.risk_index || selectedExpedition.riskIndex || 6} / 10
                </div>
                <div className="text-[10px] text-slate-500">Sub-Zero Extreme</div>
              </div>
            </div>

            {/* Link to Full Dossier */}
            <div className="flex justify-end pt-2">
              <Link
                to={`/expeditions/${selectedExpedition.id}`}
                className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs flex items-center space-x-2 transition shadow-xs"
              >
                <span>View Full Manifest & Crew Dossier</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Charter New Expedition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 font-mono uppercase">Charter New Polar Scientific Expedition</h3>
            
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1 font-mono uppercase">Expedition Code</label>
                  <input
                    type="text"
                    value={newExpCode}
                    onChange={(e) => setNewExpCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1 font-mono uppercase">Target Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:border-emerald-500 font-medium"
                  >
                    <option value="Antarctica">Antarctica</option>
                    <option value="Arctic">Arctic</option>
                    <option value="Southern Ocean">Southern Ocean</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1 font-mono uppercase">Expedition Title</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1 font-mono uppercase">Theme / Scope</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1 font-mono uppercase">Leader Name</label>
                  <input
                    type="text"
                    value={newLeader}
                    onChange={(e) => setNewLeader(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1 font-mono uppercase">Budget (₹ Cr)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1 font-mono uppercase">Quota (Tons)</label>
                  <input
                    type="number"
                    value={newQuota}
                    onChange={(e) => setNewQuota(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
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

