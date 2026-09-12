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
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Personnel Tracking, Health Records & Muster Roll</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Muster roll verification, medical fitness statuses, and cross-module SAR accountability
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Deploy Personnel</span>
          </button>

          {/* Muster Roll Headcount Bar */}
          <div className="glass-panel px-4 py-2 rounded-2xl border border-emerald-200 bg-white shadow-sm flex items-center space-x-4">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Biometric Muster Headcount</div>
              <div className="font-mono font-bold text-sm text-emerald-700">
                {passedMusterCount} / {totalMusterCount} Accounted For ({musterPercent}%)
              </div>
            </div>
            <div className="w-24 h-2.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${musterPercent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${musterPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Unaccounted Personnel Cross-Module Alert Banner */}
      {missingMusterCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white font-bold font-mono shadow-sm">
              ⚠ UNACCOUNTED: {missingMusterCount}
            </div>
            <div>
              <div className="font-bold text-rose-950 uppercase font-mono">
                Personnel Accountability Breach Detected
              </div>
              <div className="text-rose-700 text-[11px] mt-0.5 font-medium">
                {missingMusterCount} crew member(s) have not reported for scheduled station biometric roll call.
              </div>
            </div>
          </div>

          <button
            onClick={handleEscalateToSAR}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs flex items-center space-x-2 shadow-md transition"
          >
            <span>🚨 Escalate to SAR Emergency Dispatch</span>
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search personnel by name, role, or affiliation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStation}
            onChange={(e) => setFilterStation(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
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
                className="glass-panel p-5 rounded-2xl space-y-3.5 relative group hover:border-emerald-400 transition shadow-sm hover:shadow"
              >
                {/* Profile Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center font-black font-mono text-emerald-800 text-sm shadow-sm">
                      {fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{fullName}</h4>
                      <p className="text-xs text-emerald-700 font-bold">{role}</p>
                      <p className="text-[10px] text-slate-500">{org} • <span className="font-mono text-emerald-700 font-bold">{badge}</span></p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {statusText}
                  </span>
                </div>

                {/* Medical & Blood Group */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Clearance</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5 text-[11px] truncate">
                      {fitness}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-semibold flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-rose-600" />
                      <span>Blood Group</span>
                    </div>
                    <div className="font-mono font-black text-rose-700 mt-0.5 text-[11px]">
                      {blood}
                    </div>
                  </div>
                </div>

                {/* Callsign, Shelter & Location */}
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <Home className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">{station?.name || 'Base Quarters'} • {shelter}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <Radio className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-mono text-slate-700 font-semibold">TAC Callsign: {radio}</span>
                  </div>
                </div>

                {/* Muster Action & Verification Button */}
                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    Muster: <strong className={musterPassed ? 'text-emerald-700' : 'text-amber-700'}>{musterPassed ? 'Verified' : 'Pending'}</strong>
                  </span>

                  <button
                    onClick={() => handleMuster(person.id, musterPassed)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition shadow-sm ${
                      musterPassed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 animate-pulse'
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
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
              {filterStation !== 'all'
                ? `No Personnel Stationed at ${stations.find(s => s.id === filterStation)?.name || 'Selected Base'}`
                : searchQuery
                ? `No Search Results for "${searchQuery}"`
                : 'No Personnel Records Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
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
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-mono text-xs font-bold transition shadow-sm"
              >
                View All Bases & Ships ({personnel.length} Total)
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-mono text-xs transition shadow-sm"
              >
                Clear Search Query
              </button>
            )}
            <button
              onClick={() => {
                if (filterStation !== 'all') setSelectedStation(filterStation);
                setShowAddModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Personnel Here</span>
            </button>
          </div>
        </div>
      )}

      {/* Deploy Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 font-mono uppercase flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Enroll & Deploy Polar Mission Crew</span>
            </h3>

            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-mono font-semibold">
                ⚠ {submitError}
              </div>
            )}

            <form onSubmit={handleCreatePersonnel} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Badge / Personnel Code</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Blood Group</label>
                  <select
                    value={newBlood}
                    onChange={(e) => setNewBlood(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Assigned Station / Base</label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {stations.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Role & Specialization</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Organization / Institute</label>
                  <input
                    type="text"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Medical / Fitness Clearance</label>
                  <input
                    type="text"
                    value={newMedical}
                    onChange={(e) => setNewMedical(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Radio Callsign (TAC)</label>
                  <input
                    type="text"
                    value={newCallsign}
                    onChange={(e) => setNewCallsign(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-mono uppercase text-[11px] font-bold">Shelter / Habitation Sector</label>
                <input
                  type="text"
                  value={newShelter}
                  onChange={(e) => setNewShelter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
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
