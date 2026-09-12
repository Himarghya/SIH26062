import React, { useState, useEffect } from 'react';
import { polarisApi } from '../../api/services';
import { Bell, CheckCheck, X, AlertTriangle, Box, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationsPopoverProps {
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await polarisApi.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await polarisApi.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-polar-950 border border-cyan-800/60 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
      <div className="p-3.5 bg-polar-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-xs uppercase font-mono text-slate-100">Polar Dispatch Alerts</h4>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllRead}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
          >
            <CheckCheck className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No new notifications.</div>
        ) : (
          notifications.map((notif) => (
            <Link
              key={notif.id}
              to={notif.link || '#'}
              onClick={onClose}
              className={`block p-3 rounded-xl hover:bg-polar-900 transition text-xs space-y-1 ${
                !notif.is_read ? 'bg-cyan-950/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${
                  notif.severity === 'danger' ? 'text-rose-400' :
                  notif.severity === 'warning' ? 'text-amber-400' :
                  'text-cyan-300'
                }`}>
                  {notif.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] line-clamp-2">{notif.message}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
