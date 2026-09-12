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
  const [newBadge, setNewBadge] = useState(`NCPOR-POL-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newName, setNewName] = useState('Dr. Ananya Roy');
  const [newRole, setNewRole] = useState('Paleoclimatologist & Ice Core Analyst');
  const [newBlood, setNewBlood] = useState('O+ve');
  const [newOrg, setNewOrg] = useState('National Centre for Polar and Ocean Research (NCPOR)');
  const [newMedical, setNewMedical] = useState('Class-1 Polar Cleared (Valid 2026)');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [newCallsign, setNewCallsign] = useState('TAC-19');
  const [newShelter, setNewShelter] = useState('Main Habitation Pod Sector A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchPersonnelData = async () => {
    try {
      const [prs, stns] = await Promise.all([
        polarisApi.getPersonnelList(),
        polarisApi.getStations()
      ]);
      setPersonnel(prs);
      setStations(stns);
      if (stns && stns.length > 0 && !selectedStation) {
        setSelectedStation(stns[0].id);
      }
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
    if (propStations && propStations.length > 0) {
      setStations(propStations);
      if (!selectedStation) setSelectedStation(propStations[0].id);
    }
  }, [propPersonnel, propStations]);

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
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const assignedStnId = selectedStation || (stations.length > 0 ? stations[0].id : null);
      const payload = {
        personnel_code: newBadge.trim(),
        badge_number: newBadge.trim(),
        name: newName.trim(),
        full_name: newName.trim(),
        role: newRole.trim(),
        organization: newOrg.trim(),
        blood_group: newBlood.trim(),
        fitness_status: newMedical.trim(),
        medical_clearance: newMedical.trim(),
        assigned_station_id: assignedStnId,
        station_id: assignedStnId,
        assigned_shelter: newShelter.trim(),
        radio_id: newCallsign.trim(),
        tactical_callsign: newCallsign.trim(),
        current_status: 'On Station',
        status: 'On Station',
        survival_trained: true,
        biometric_muster_passed: true,
        availability: 'Deployed'
      };
      const created = await polarisApi.createPersonnel(payload);
      setPersonnel(prev => [created, ...prev]);
      setShowAddModal(false);
      setNewBadge(`NCPOR-POL-2026-${Math.floor(100 + Math.random() * 900)}`);
      setSubmitError(null);
    } catch (err: any) {
      console.error("Failed to create personnel:", err);
      const errMsg = err?.response?.data?.detail 
        ? (typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail))
        : (err?.message || 'Failed to enroll personnel');
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
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
  const missingMusterCount = totalMusterCount - passedMusterCount;
  const musterPercent = totalMusterCount > 0 ? Math.round((passedMusterCount / totalMusterCount) * 100) : 100;

  const handleEscalateToSAR = () => {
    const missingCrewNames = filteredPersonnel
      .filter(p => !(p.biometric_muster_passed ?? p.biometricMusterPassed))
      .map(p => p.full_name || p.name)
      .join(', ');

    // Store urgent SAR trigger draft
    localStorage.setItem('polaris_draft_sar_incident', JSON.stringify({
      title: `Unaccounted Station Personnel (${missingMusterCount} Crew Missing)`,
      details: `Automated Muster Roll Trigger: ${missingMusterCount} personnel failed mandatory station check-in during severe weather alert. Missing individuals: ${missingCrewNames}.`,
      severity: 'Critical (Life Threat)',
      type: 'Lost Contact with Sortie'
    }));

    window.location.href = '/emergency';
  };

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
            Muster roll verification, medical fitness statuses, and cross-module SAR accountability
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

      {/* Critical Unaccounted Personnel Cross-Module Alert Banner */}
      {missingMusterCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/80 flex flex-wrap items-center justify-between gap-3 text-xs animate-pulse shadow-lg shadow-rose-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white font-bold font-mono">
              ⚠ UNACCOUNTED: {missingMusterCount}
            </div>
            <div>
              <div className="font-bold text-slate-100 uppercase font-mono">
                Personnel Accountability Breach Detected
              </div>
              <div className="text-rose-200 text-[11px] mt-0.5">
                {missingMusterCount} crew member(s) have not reported for scheduled station biometric roll call.
              </div>
            </div>
          </div>

          <button
            onClick={handleEscalateToSAR}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs flex items-center space-x-2 shadow-lg transition"
          >
            <span>🚨 Escalate to SAR Emergency Dispatch</span>
          </button>
        </div>
      )}

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
            className="bg-polar-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">All Bases & Ships ({personnel.length} Total)</option>
            {stations.map(st => {
              const count = personnel.filter(p => (p.assigned_station_id || p.station_id || p.stationId) === st.id).length;
              return (
                <option key={st.id} value={st.id}>
                  {st.name} ({count === 0 ? 'Unmanned • 0 crew' : `${count} crew`})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Personnel Roster Grid */}
      {filteredPersonnel.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersonnel.map((person) => {
            const stnId = person.assigned_station_id || person.station_id || person.stationId;
            const station = stations.find(s => s.id === stnId);
            const fullName = person.name || person.full_name || 'Polar Crew Member';
            const badge = person.personnel_code || person.badge_number || person.badgeNumber || 'NCPOR-POL';
            const musterPassed = person.biometric_muster_passed ?? person.biometricMusterPassed;
            const role = person.role || 'Expedition Specialist';
            const org = person.organization || 'NCPOR';
            const fitness = person.fitness_status || person.medical_clearance || person.fitnessStatus || 'Class-1 Polar Cleared';
            const blood = person.blood_group || person.bloodGroup || 'O+ve';
            const shelter = person.assigned_shelter || person.shelter || 'Main Habitation Pod';
            const radio = person.radio_id || person.tactical_callsign || person.satelliteRadioId || 'TAC-1';
            const statusText = person.current_status || person.status || 'On Station';

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
                      <p className="text-xs text-cyan-400 font-medium">{role}</p>
                      <p className="text-[10px] text-slate-400">{org} • <span className="font-mono text-cyan-300/80">{badge}</span></p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {statusText}
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
                      {fitness}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-polar-900/80 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      <span>Blood Group</span>
                    </div>
                    <div className="font-mono font-bold text-rose-300 mt-0.5 text-[11px]">
                      {blood}
                    </div>
                  </div>
                </div>

                {/* Callsign, Shelter & Location */}
                <div className="text-xs text-slate-400 space-y-1 pt-1">
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <Home className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{station?.name || 'Base Quarters'} • {shelter}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-mono text-slate-300">TAC Callsign: {radio}</span>
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
      ) : (
        <div className="p-8 rounded-2xl bg-polar-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-200 font-mono uppercase">
              {filterStation !== 'all'
                ? `No Personnel Stationed at ${stations.find(s => s.id === filterStation)?.name || 'Selected Base'}`
                : searchQuery
                ? `No Search Results for "${searchQuery}"`
                : 'No Personnel Records Found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {stations.find(s => s.id === filterStation)?.code === 'ARC-OBS-01' || stations.find(s => s.id === filterStation)?.name?.includes('IndARC')
                ? 'IndARC Mooring Observatory is an automated, unmanned subsurface mooring array in Kongsfjorden (78°N). Real-time telemetry is recorded via oceanographic sensors without permanent resident crew.'
                : filterStation !== 'all'
                ? 'There are currently 0 active personnel assigned to this facility. You can deploy personnel here or view all polar crew.'
                : 'Try adjusting your search terms or filters to locate personnel records.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {filterStation !== 'all' && (
              <button
                onClick={() => setFilterStation('all')}
                className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold transition"
              >
                View All Bases & Ships ({personnel.length} Total)
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-polar-800 hover:bg-polar-750 border border-slate-700 text-slate-300 font-mono text-xs transition"
              >
                Clear Search Query
              </button>
            )}
            <button
              onClick={() => {
                if (filterStation !== 'all') setSelectedStation(filterStation);
                setShowAddModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Personnel Here</span>
            </button>
          </div>
        </div>
      )}

      {/* Deploy Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-polar-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-100 font-mono uppercase flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Enroll & Deploy Polar Mission Crew</span>
            </h3>

            {submitError && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs font-mono">
                ⚠ {submitError}
              </div>
            )}

            <form onSubmit={handleCreatePersonnel} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Badge / Personnel Code</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Blood Group</label>
                  <select
                    value={newBlood}
                    onChange={(e) => setNewBlood(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                  >
                    <option value="O+ve">O+ve</option>
                    <option value="A+ve">A+ve</option>
                    <option value="B+ve">B+ve</option>
                    <option value="AB+ve">AB+ve</option>
                    <option value="O-ve">O-ve</option>
                    <option value="A-ve">A-ve</option>
                    <option value="B-ve">B-ve</option>
                    <option value="AB-ve">AB-ve</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Assigned Station / Base</label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Role & Specialization</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Organization / Institute</label>
                  <input
                    type="text"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Medical / Fitness Clearance</label>
                  <input
                    type="text"
                    value={newMedical}
                    onChange={(e) => setNewMedical(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Radio Callsign (TAC)</label>
                  <input
                    type="text"
                    value={newCallsign}
                    onChange={(e) => setNewCallsign(e.target.value)}
                    className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Shelter / Habitation Sector</label>
                <input
                  type="text"
                  value={newShelter}
                  onChange={(e) => setNewShelter(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-polar-800 text-slate-300 hover:bg-polar-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold transition flex items-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <span>Enrolling...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Confirm Enrollment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
