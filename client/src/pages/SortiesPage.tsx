import React, { useState } from 'react';
import { FieldSortie, Personnel, Station } from '../types';
import { 
  Navigation, 
  Plus, 
  Compass, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Users,
  ShieldAlert
} from 'lucide-react';

interface SortiesPageProps {
  sorties: FieldSortie[];
  personnel: Personnel[];
  stations: Station[];
  onCreateSortie: (sortie: Partial<FieldSortie>) => void;
  onUpdateStatus: (id: string, status: FieldSortie['status']) => void;
}

export const SortiesPage: React.FC<SortiesPageProps> = ({
  sorties,
  personnel,
  stations,
  onCreateSortie,
  onUpdateStatus
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create sortie form
  const [title, setTitle] = useState('Dalk Glacier Cryo-Core Seismic Traverse');
  const [destination, setDestination] = useState('Dalk Glacial Dome Sector 4 (18km SE)');
  const [vehicle, setVehicle] = useState<FieldSortie['vehicleType']>('Skidoo Snowmobile');
  const [hazard, setHazard] = useState<FieldSortie['hazardLevel']>('Crevasse Danger');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSortie({
      title,
      stationId: 'stn-bharati',
      leadPersonnelId: personnel[0]?.id || 'prs-001',
      teamPersonnelIds: [personnel[0]?.id || 'prs-001'],
      vehicleType: vehicle,
      destinationName: destination,
      coordinates: [
        { lat: -69.4075, lng: 76.1942 },
        { lat: -69.4820, lng: 76.3200 }
      ],
      departureTime: new Date().toISOString(),
      estimatedReturnTime: new Date(Date.now() + 3600000 * 5).toISOString(),
      status: 'Active In Field',
      hazardLevel: hazard,
      radioCheckFrequencyMins: 60,
      lastCheckInTime: new Date().toISOString()
    });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase font-mono flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-emerald-600" />
            <span>Field Sorties & Polar Traverse Mission Control</span>
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Real-time outdoor scientist tracking, PistenBully routes, crevasse hazard alerts & hourly radio muster
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Field Sortie</span>
        </button>
      </div>

      {/* Sorties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorties.map((sortie) => {
          const leadPerson = personnel.find(p => p.id === sortie.leadPersonnelId);
          const station = stations.find(s => s.id === sortie.stationId);
          const isActive = sortie.status === 'Active In Field';

          return (
            <div
              key={sortie.id}
              className={`p-5 rounded-2xl space-y-4 border transition ${
                isActive 
                  ? 'bg-white border-purple-400 ring-2 ring-purple-400/20 shadow-md' 
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {sortie.vehicleType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 font-semibold px-1.5 py-0.5 rounded bg-slate-100">
                      Base: {station?.name}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1.5">{sortie.title}</h3>
                  <p className="text-xs text-slate-600 font-medium flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{sortie.destinationName}</span>
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  sortie.status === 'Active In Field' ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse' :
                  sortie.status === 'Safe Return' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  {sortie.status}
                </span>
              </div>

              {/* Hazard & Radio Channel */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`p-2.5 rounded-xl border ${
                  sortie.hazardLevel === 'Crevasse Danger' 
                    ? 'bg-rose-50 border-rose-200 text-rose-800 font-semibold' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center space-x-1">
                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                    <span>Terrain Hazard</span>
                  </div>
                  <div className="font-mono font-bold mt-0.5">{sortie.hazardLevel}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center space-x-1">
                    <Radio className="w-3 h-3 text-emerald-600" />
                    <span>Radio Frequency</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-700 mt-0.5">
                    Every {sortie.radioCheckFrequencyMins} mins
                  </div>
                </div>
              </div>

              {/* Leader & Times */}
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lead: <strong className="text-slate-900">{leadPerson?.name || 'Dr. Scientist'}</strong></span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>ETA Return: {new Date(sortie.estimatedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Actions */}
              {isActive && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onUpdateStatus(sortie.id, 'Safe Return')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Log Safe Base Return</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dispatch Sortie Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 font-mono uppercase">Dispatch Field Sortie Permit</h3>
            
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Sortie Mission Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Destination & Coordinates</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Vehicle Type</label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:border-emerald-500 font-medium"
                  >
                    <option value="Skidoo Snowmobile">Skidoo Snowmobile</option>
                    <option value="PistenBully Heavy Snowcat">PistenBully Heavy Snowcat</option>
                    <option value="Helicopter">Kamov Ka-32 Helicopter</option>
                    <option value="Foot Traverse">Foot Traverse with Ropes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Terrain Hazard</label>
                  <select
                    value={hazard}
                    onChange={(e) => setHazard(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:bg-white focus:border-emerald-500 font-medium"
                  >
                    <option value="Low">Low (Marked Flag Trail)</option>
                    <option value="Crevasse Danger">Crevasse Danger Zone</option>
                    <option value="Katabatic Wind Threat">Katabatic Wind Threat</option>
                    <option value="Whiteout High Risk">Whiteout High Risk</option>
                  </select>
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
                  Authorize Sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

