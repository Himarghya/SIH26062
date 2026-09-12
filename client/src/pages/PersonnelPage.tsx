import React, { useState } from 'react';
import { Personnel, Station } from '../types';
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
  Activity
} from 'lucide-react';

interface PersonnelPageProps {
  personnel: Personnel[];
  stations: Station[];
  selectedStationId: string;
  onMusterCheckIn: (id: string, passed: boolean) => void;
}

export const PersonnelPage: React.FC<PersonnelPageProps> = ({
  personnel,
  stations,
  selectedStationId,
  onMusterCheckIn
}) => {
  const [filterStation, setFilterStation] = useState<string>(selectedStationId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPersonnel = personnel.filter(p => {
    const matchesStation = filterStation === 'all' || p.stationId === filterStation;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStation && matchesSearch;
  });

  const totalMusterCount = filteredPersonnel.length;
  const passedMusterCount = filteredPersonnel.filter(p => p.biometricMusterPassed).length;
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

        {/* Muster Roll Headcount Bar */}
        <div className="glass-panel px-4 py-2.5 rounded-xl border border-cyan-500/40 flex items-center space-x-4">
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
          const station = stations.find(s => s.id === person.stationId);

          return (
            <div
              key={person.id}
              className="glass-panel p-4 rounded-xl space-y-3 relative group hover:border-cyan-500/40 transition"
            >
              {/* Profile Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-900 to-blue-800 border border-cyan-500/40 flex items-center justify-center font-bold font-mono text-cyan-200">
                    {person.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{person.name}</h4>
                    <p className="text-xs text-cyan-400 font-medium">{person.role}</p>
                    <p className="text-[10px] text-slate-400">{person.organization}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  person.status === 'On Station' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  person.status === 'Field Sortie' ? 'bg-purple-950 text-purple-300 border border-purple-800 animate-pulse' :
                  'bg-blue-950 text-blue-300 border border-blue-800'
                }`}>
                  {person.status}
                </span>
              </div>

              {/* Medical & Survival Clearances */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-polar-900/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Medical Cert</span>
                  </div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5 text-[11px] truncate">
                    {person.fitnessStatus}
                  </div>
                </div>

                <div className="p-2 rounded bg-polar-900/80 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span>Blood Group</span>
                  </div>
                  <div className="font-mono font-bold text-rose-300 mt-0.5 text-[11px]">
                    {person.bloodGroup}
                  </div>
                </div>
              </div>

              {/* Radio & Shelter Info */}
              <div className="text-xs text-slate-400 space-y-1 pt-1">
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <Home className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{person.assignedShelter}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono text-slate-300">TAC Radio: {person.satelliteRadioId}</span>
                </div>
              </div>

              {/* Muster Action & Verification Button */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Muster: {person.biometricMusterPassed ? 'Verified' : 'Pending'}
                </span>

                <button
                  onClick={() => onMusterCheckIn(person.id, !person.biometricMusterPassed)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition ${
                    person.biometricMusterPassed
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 hover:bg-emerald-900'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-600/60 hover:bg-amber-900 animate-pulse'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{person.biometricMusterPassed ? 'Check-in Verified' : 'Confirm Muster'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
