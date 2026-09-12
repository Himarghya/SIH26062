import React, { useState, useEffect } from 'react';
import { polarisApi } from '../../api/services';
import { Bell, CheckCheck, X, AlertTriangle, AlertCircle, Info, ShieldAlert, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OperationsAlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  station: string;
  requiredAction: string;
  actionLink: string;
  actionLabel: string;
  assignedRole: string;
  is_read: boolean;
  is_acknowledged: boolean;
  created_at: string;
}

const DEFAULT_ALERTS: OperationsAlertItem[] = [
  {
    id: 'ALT-901',
    title: 'Bharati Fuel Autonomy Alert',
    message: 'Polar diesel reserve burn rate spiked due to generator bank #2 heating load. Autonomy down to 13.4 days (Safety Min: 20 days).',
    severity: 'critical',
    source: 'Wintering Autonomy',
    station: 'Bharati Station',
    requiredAction: 'Initiate emergency fuel rationing & resupply schedule',
    actionLink: '/inventory',
    actionLabel: 'View Inventory',
    assignedRole: 'Station Manager',
    is_read: false,
    is_acknowledged: false,
    created_at: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'ALT-902',
    title: 'Cryogenic Cold-Chain Breach',
    message: 'Biological reagent container CRG-089 temp rose to -64°C (Limit: -80°C to -70°C) for 18 minutes.',
    severity: 'critical',
    source: 'Cold-Chain IoT',
    station: 'MV Vasiliy Golovnin',
    requiredAction: 'Inspect dry ice level & verify thermal seal immediately',
    actionLink: '/cargo',
    actionLabel: 'Inspect Cargo',
    assignedRole: 'Logistics Officer',
    is_read: false,
    is_acknowledged: false,
    created_at: new Date(Date.now() - 32 * 60000).toISOString()
  },
  {
    id: 'ALT-903',
    title: 'Katabatic Wind Threat - Sortie Warning',
    message: 'Wind gusts exceeding 85 km/h detected along Larsemann Traverse. Ground visibility dropping below 500m.',
    severity: 'warning',
    source: 'Weather Engine',
    station: 'Bharati Station',
    requiredAction: 'Order PistenBully Sortie PB-02 to halt and bunker in place',
    actionLink: '/emergency',
    actionLabel: 'SAR Dispatch',
    assignedRole: 'Emergency Coordinator',
    is_read: false,
    is_acknowledged: true,
    created_at: new Date(Date.now() - 75 * 60000).toISOString()
  }
];

interface NotificationsPopoverProps {
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onClose }) => {
  const [alerts, setAlerts] = useState<OperationsAlertItem[]>(() => {
    const saved = localStorage.getItem('polaris_active_alerts');
    return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
  });
  const navigate = useNavigate();

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = alerts.map(a => a.id === id ? { ...a, is_acknowledged: true, is_read: true } : a);
    setAlerts(updated);
    localStorage.setItem('polaris_active_alerts', JSON.stringify(updated));
  };

  const handleMarkAllRead = () => {
    const updated = alerts.map(a => ({ ...a, is_read: true, is_acknowledged: true }));
    setAlerts(updated);
    localStorage.setItem('polaris_active_alerts', JSON.stringify(updated));
  };

  const handleActionClick = (link: string) => {
    onClose();
    navigate(link);
  };

  const unacknowledgedCount = alerts.filter(a => !a.is_acknowledged).length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-[440px] bg-polar-950 border border-cyan-800/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
      {/* Header */}
      <div className="p-3.5 bg-polar-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-xs uppercase font-mono text-slate-100">
            Mission Operations Alert Center
          </h4>
          {unacknowledgedCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-950 border border-rose-600 text-rose-300 font-mono text-[10px] rounded-full">
              {unacknowledgedCount} Pending
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllRead}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
          >
            <CheckCheck className="w-3 h-3" />
            <span>Acknowledge All</span>
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/80 p-2 space-y-2">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No active alerts. All polar stations normal.</div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition space-y-2 ${
                alert.severity === 'critical'
                  ? 'bg-rose-950/30 border-rose-600/40'
                  : alert.severity === 'warning'
                  ? 'bg-amber-950/20 border-amber-600/40'
                  : 'bg-polar-900/60 border-slate-800'
              }`}
            >
              {/* Alert Meta Banner */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                    alert.severity === 'critical'
                      ? 'bg-rose-600 text-white'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-cyan-600 text-white'
                  }`}>
                    {alert.severity === 'critical' ? '🔴 CRITICAL' : alert.severity === 'warning' ? '🟠 WARNING' : '🔵 INFO'}
                  </span>
                  <span className="text-slate-400">[{alert.station}]</span>
                  <span className="text-slate-500">• {alert.source}</span>
                </div>
                <span className="text-slate-500">
                  {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Title & Message */}
              <div>
                <h5 className="font-bold text-xs text-slate-100">{alert.title}</h5>
                <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">{alert.message}</p>
              </div>

              {/* Required Action Box */}
              <div className="p-2 rounded-lg bg-polar-950/80 border border-slate-800 text-[11px] space-y-1.5">
                <div className="text-[10px] uppercase font-mono text-cyan-400 font-semibold">
                  Required Action ({alert.assignedRole}):
                </div>
                <div className="text-slate-200 text-[10px]">{alert.requiredAction}</div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => handleActionClick(alert.actionLink)}
                    className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center space-x-1 shadow transition"
                  >
                    <span>{alert.actionLabel}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>

                  <button
                    onClick={(e) => handleAcknowledge(alert.id, e)}
                    disabled={alert.is_acknowledged}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono flex items-center space-x-1 transition ${
                      alert.is_acknowledged
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 cursor-default'
                        : 'bg-polar-800 hover:bg-polar-750 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {alert.is_acknowledged ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Acknowledged</span>
                      </>
                    ) : (
                      <span>Acknowledge Alert</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

