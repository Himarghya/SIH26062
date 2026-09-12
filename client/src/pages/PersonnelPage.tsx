import React, { useState, useEffect } from 'react';
import { polarisApi } from '../api/services';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Radio, 
  Heart, 
  Home, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Plus
} from 'lucide-react';

export const PersonnelPage: React.FC<{
  personnel?: any[];
  stations?: any[];
  selectedStationId?: string;
  onMusterCheckIn?: (id: string, passed: boolean) => void;
}> = ({ 
  personnel: propPersonnel, 
  stations: propStations, 
  selectedStationId: propSelectedStationId = 'all', 
  onMusterCheckIn 
}) => {
  const [personnel, setPersonnel] = useState<any[]>(propPersonnel || []);
  const [stations, setStations] = useState<any[]>(propStations || []);
  const [filterStation, setFilterStation] = useState<string>(propSelectedStationId);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New personnel form state
  const [newBadge, setNewBadge] = useState('NCPOR-POL-2026-99');
  const [newName, setNewName] = useState('Dr. Ananya Roy');
  const [newRole, setNewRole] = useState('Paleoclimatologist & Ice Core Analyst');
  const [newBlood, setNewBlood] = useState('O+');
  const [newOrg, setNewOrg] = useState('National Centre for Polar and Ocean Research (NCPOR)');
  const [newMedical, setNewMedical] = useState('Class-A Polar Medical Clearance (Valid till Dec 2026)');

  const fetchPersonnelData = async () => {
    try {
      const [prs, stns] = await Promise.all([
        polarisApi.getPersonnelList(),
        polarisApi.getStations()
      ]);
      setPersonnel(prs);
      setStations(stns);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!propPersonnel || propPersonnel.length === 0) {
      fetchPersonnelData();
    } else {
      setPersonnel(propPersonnel);
    }
  }, [propPersonnel]);

  const handleMuster = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (onMusterCheckIn) {
      onMusterCheckIn(id, newStatus);
    } else {
      try {
        await polarisApi.recordBiometricMuster(id, newStatus);
        setPersonnel(prev => prev.map(p => p.id === id ? { ...p, biometric_muster_passed: newStatus } : p));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreatePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        badge_number: newBadge,
        full_name: newName,
        role: newRole,
        organization: newOrg,
        blood_group: newBlood,
        medical_clearance: newMedical,
        tactical_callsign: 'TANGO-19',
        status: 'On Station',
        biometric_muster_passed: true,
        station_id: stations[0]?.id || null
      };
      const created = await polarisApi.createPersonnel(payload);
      setPersonnel(prev => [created, ...prev]);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPersonnel = personnel.filter(p => {
    const stnId = p.station_id || p.stationId;
    const name = p.full_name || p.name || '';
    const role = p.role || '';
    const matchesStation = filterStation === 'all' || stnId === filterStation;
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStation && matchesSearch;
  });

  const totalMusterCount = filteredPersonnel.length;
  const passedMusterCount = filteredPersonnel.filter(p => p.biometric_muster_passed ?? p.biometricMusterPassed).length;
  const musterPercent = totalMusterCount > 0 ? Math.round((passedMusterCount / totalMusterCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header & Headcount Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase font-mono flex items-center space-x-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Personnel Tracking, Health Records & Muster Roll</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Muster roll verification, medical fitness statuses, and tactical radio check-ins
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-polar-900 hover:bg-polar-850 border border-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Personnel</span>
          </button>

          {/* Muster Roll Headcount Bar */}
          <div className="glass-panel px-4 py-2 rounded-xl border border-cyan-500/40 flex items-center space-x-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Biometric Muster Headcount</div>
              <div className="font-mono font-bold text-sm text-cyan-300">
                {passedMusterCount} / {totalMusterCount} Accounted For ({musterPercent}%)
              </div>
            </div>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${musterPercent === 100 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${musterPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search personnel by name, role, or affiliation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-polar-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStation}
            onChange={(e) => setFilterStation(e.target.value)}
            className="bg-polar-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Bases & Ships</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personnel Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonnel.map((person) => {
          const stnId = person.station_id || person.stationId;
          const station = stations.find(s => s.id === stnId);
          const fullName = person.full_name || person.name;
          const musterPassed = person.biometric_muster_passed ?? person.biometricMusterPassed;

          return (
            <div
              key={person.id}
              className="glass-panel p-4 rounded-xl space-y-3 relative group hover:border-cyan-500/40 transition"
            >
              {/* Profile Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-900 to-blue-800 border border-cyan-500/40 flex items-center justify-center font-bold font-mono text-cyan-200">
                    {fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{fullName}</h4>
                    <p className="text-xs text-cyan-400 font-medium">{person.role}</p>
                    <p className="text-[10px] text-slate-400">{person.organization}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {person.status}
                </span>
              </div>

              {/* Medical & Blood Group */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-polar-900/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Clearance</span>
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 text-[11px] truncate">
                    {person.medical_clearance || person.fitnessStatus || 'Class-A Polar'}
                  </div>
                </div>

                <div className="p-2 rounded bg-polar-900/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span>Blood Group</span>
                  </div>
                  <div className="font-mono font-bold text-rose-300 mt-0.5 text-[11px]">
                    {person.blood_group || person.bloodGroup || 'O+'}
                  </div>
                </div>
              </div>

              {/* Callsign & Location */}
              <div className="text-xs text-slate-400 space-y-1 pt-1">
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <Home className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{station?.name || 'Base Quarters'}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono text-slate-300">TAC Callsign: {person.tactical_callsign || person.satelliteRadioId || 'TANGO-1'}</span>
                </div>
              </div>

              {/* Muster Action & Verification Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Muster: {musterPassed ? 'Verified' : 'Pending'}
                </span>

                <button
                  onClick={() => handleMuster(person.id, musterPassed)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition ${
                    musterPassed
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-600/60 hover:bg-amber-900 animate-pulse'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{musterPassed ? 'Check-in Verified' : 'Confirm Muster'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deploy Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-polar-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-mono uppercase">Enroll & Deploy Polar Mission Crew</h3>

            <form onSubmit={handleCreatePersonnel} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase">Badge Number</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase">Blood Group</label>
                  <input
                    type="text"
                    value={newBlood}
                    onChange={(e) => setNewBlood(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase">Role & Specialization</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase">Organization / Institute</label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-polar-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
