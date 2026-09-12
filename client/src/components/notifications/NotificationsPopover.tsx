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
    <div className="absolute right-0 mt-2 w-80 sm:w-[440px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h4 className="font-bold text-xs uppercase font-mono text-slate-900">
            Mission Operations Alert Center
          </h4>
          {unacknowledgedCount > 0 && (
            <span className="px-2 py-0.5 bg-rose-100 border border-rose-300 text-rose-800 font-mono text-[10px] font-bold rounded-full">
              {unacknowledgedCount} Pending
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllRead}
            className="text-[10px] text-emerald-700 hover:text-emerald-800 font-mono font-bold flex items-center space-x-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Acknowledge All</span>
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-medium">No active alerts. All polar stations normal.</div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition space-y-2 ${
                alert.severity === 'critical'
                  ? 'bg-rose-50/70 border-rose-200'
                  : alert.severity === 'warning'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Alert Meta Banner */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                    alert.severity === 'critical'
                      ? 'bg-rose-600 text-white'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {alert.severity === 'critical' ? '🔴 CRITICAL' : alert.severity === 'warning' ? '🟠 WARNING' : '🟢 INFO'}
                  </span>
                  <span className="text-slate-700 font-bold">[{alert.station}]</span>
                  <span className="text-slate-500">• {alert.source}</span>
                </div>
                <span className="text-slate-500 font-medium">
                  {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Title & Message */}
              <div>
                <h5 className="font-bold text-xs text-slate-900">{alert.title}</h5>
                <p className="text-slate-700 text-[11px] font-medium leading-relaxed mt-0.5">{alert.message}</p>
              </div>

              {/* Required Action Box */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1.5 shadow-2xs">
                <div className="text-[10px] uppercase font-mono text-emerald-800 font-bold">
                  Required Action ({alert.assignedRole}):
                </div>
                <div className="text-slate-800 text-[10px] font-medium">{alert.requiredAction}</div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => handleActionClick(alert.actionLink)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs transition"
                  >
                    <span>{alert.actionLabel}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>

                  <button
                    onClick={(e) => handleAcknowledge(alert.id, e)}
                    disabled={alert.is_acknowledged}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1 transition ${
                      alert.is_acknowledged
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {alert.is_acknowledged ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-700" />
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


