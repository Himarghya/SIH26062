import React, { useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  PlayCircle, 
  User, 
  LogOut, 
  Radio, 
  QrCode, 
  Sparkles,
  ChevronDown,
  Wifi,
  Info
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { NotificationsPopover } from '../notifications/NotificationsPopover';

interface TopNavProps {
  onOpenDigitalTwin: () => void;
  onOpenQrScanner: () => void;
  onOpenBlizzardSOS: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenDigitalTwin,
  onOpenQrScanner,
  onOpenBlizzardSOS
}) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-polar-950/80 backdrop-blur-md border-b border-cyan-900/30 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Operational Mode & Transparency Pill */}
      <div className="flex items-center space-x-3">
        {/* Simulation Transparency Label */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-[11px] font-mono">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">Simulation Mode — Demonstration Data</span>
        </div>

        {/* Satellite Sync Status Indicator */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-polar-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Iridium Sat-Link: <strong className="text-emerald-400 font-normal">Active</strong> (Delta Sync: 2m ago)</span>
        </div>

        {/* Scenario Simulation Launcher */}
        <button
          onClick={onOpenDigitalTwin}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border border-blue-500/40 text-cyan-200 font-mono text-xs shadow-md transition"
          title="Launch Deterministic Scenario Simulation"
        >
          <PlayCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-bold">Scenario Simulation</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Urgent Blizzard SOS Trigger */}
        <button
          onClick={onOpenBlizzardSOS}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-200 font-bold text-xs shadow transition animate-pulse"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>BLIZZARD SOS</span>
        </button>

        {/* In-App Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-polar-900 hover:bg-polar-850 border border-slate-800 text-slate-300 hover:text-cyan-300 relative transition"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </button>

          {showNotifications && (
            <NotificationsPopover onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-polar-900 hover:bg-polar-850 border border-cyan-800/50 text-slate-200 text-xs transition"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/60 flex items-center justify-center font-bold text-[10px] text-cyan-300">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="font-bold text-slate-100 text-[11px] truncate max-w-[130px]">{user?.name}</div>
              <div className="text-[9px] text-cyan-400 uppercase font-mono">{user?.role.replace('_', ' ')}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-polar-950 border border-cyan-800/60 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-800 text-xs">
                <div className="font-mono text-[10px] text-slate-400 uppercase">Switch Active Demo Role:</div>
              </div>
              
              <div className="py-1 space-y-0.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => {
                      switchDemoRole(acc.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      user?.role === acc.role
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-polar-900 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{acc.label}</div>
                      <div className="text-[10px] text-slate-400">{acc.name}</div>
                    </div>
                    {user?.role === acc.role && <span className="text-cyan-400 text-xs">●</span>}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 mt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/60 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
