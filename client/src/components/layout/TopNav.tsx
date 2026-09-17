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
  Info,
  Cpu,
  Menu
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';
import { NotificationsPopover } from '../notifications/NotificationsPopover';

interface TopNavProps {
  onOpenDigitalTwin: () => void;
  onOpenQrScanner: () => void;
  onOpenBlizzardSOS: () => void;
  onOpenSatelliteSync: () => void;
  onOpenMlConsole?: () => void;
  onToggleMobileSidebar?: () => void;
  isOffline: boolean;
  pendingQueueCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenDigitalTwin,
  onOpenQrScanner,
  onOpenBlizzardSOS,
  onOpenSatelliteSync,
  onOpenMlConsole,
  onToggleMobileSidebar,
  isOffline,
  pendingQueueCount
}) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white/95  border-b border-slate-300 px-3 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Hamburger & Operational Mode */}
      <div className="flex items-center space-x-2 md:space-x-2.5 overflow-x-auto no-scrollbar">
        {/* Mobile Hamburger Menu Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition shadow-2xs md:hidden shrink-0"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Simulation Transparency Label */}
        <div className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono whitespace-nowrap shrink-0 shadow-2xs">
          <Info className="w-3.5 h-3.5 text-cyan-700" />
          <span className="font-bold hidden sm:inline">Simulation Demo</span>
          <span className="font-bold sm:hidden">Sim</span>
        </div>

        {/* Satellite Sync Status Indicator */}
        <button
          onClick={onOpenSatelliteSync}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition whitespace-nowrap shrink-0 shadow-2xs ${
            isOffline
              ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
              : 'bg-slate-100 hover:bg-slate-200/90 border-slate-300 text-slate-800'
          }`}
          title="Open Satellite Delta Sync Console"
        >
          <Wifi className={`w-3.5 h-3.5 ${isOffline ? 'text-amber-600' : 'text-emerald-700 animate-pulse'}`} />
          <span>
            {isOffline ? (
              <strong className="text-amber-800">Offline</strong>
            ) : (
              <>Sat-Link: <strong className="text-emerald-800 font-bold">Active</strong></>
            )}
          </span>
          {pendingQueueCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white font-bold text-[10px]">
              {pendingQueueCount}
            </span>
          )}
        </button>

        {/* Scenario Simulation Launcher (Super Admin & Emergency Commander) */}
        {(user?.role === 'super_admin' || user?.role === 'emergency_coordinator') && (
          <button
            onClick={onOpenDigitalTwin}
            className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold shadow-xs transition whitespace-nowrap shrink-0 border border-slate-900"
            title="Launch Deterministic Scenario Simulation"
          >
            <PlayCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Scenario Sim</span>
          </button>
        )}

        {/* AI ML Engine Console Launcher (Super Admin, Expedition Manager, Station Manager) */}
        {onOpenMlConsole && (user?.role === 'super_admin' || user?.role === 'expedition_manager' || user?.role === 'station_manager') && (
          <button
            onClick={onOpenMlConsole}
            className="hidden lg:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-mono text-xs font-bold shadow-xs transition whitespace-nowrap shrink-0 border border-cyan-800"
            title="Open POLARIS ML Predictive Command Console"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
            <span>ML Engine</span>
          </button>
        )}

        {/* QR Scanner Tool (Super Admin & Logistics Officer) */}
        {(user?.role === 'super_admin' || user?.role === 'logistics_officer') && onOpenQrScanner && (
          <button
            onClick={onOpenQrScanner}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-xs font-bold shadow-2xs transition whitespace-nowrap shrink-0"
            title="Open Cargo QR Scanner"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
            <span>QR Scanner</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Urgent Blizzard SOS Trigger (Super Admin, Emergency Coordinator, Station Commander) */}
        {(user?.role === 'super_admin' || user?.role === 'emergency_coordinator' || user?.role === 'station_manager') && (
          <button
            onClick={onOpenBlizzardSOS}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs shadow-2xs transition whitespace-nowrap"
            title="Trigger Blizzard Emergency SOS"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-700 animate-pulse" />
            <span className="hidden sm:inline">BLIZZARD SOS</span>
            <span className="sm:hidden font-mono text-[11px]">SOS</span>
          </button>
        )}

        {/* In-App Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 hover:text-slate-950 relative transition shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-600 animate-ping" />
          </button>

          {showNotifications && (
            <NotificationsPopover onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-xs transition shadow-2xs"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="text-left hidden xl:block">
              <div className="font-bold text-slate-900 text-[11px] truncate max-w-[120px]">{user?.name}</div>
              <div className="text-[9px] text-cyan-800 uppercase font-mono font-bold">{user?.role.replace('_', ' ')}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white border border-slate-300 rounded-2xl shadow-xl p-2 z-50 animate-fadeIn text-slate-900">
              <div className="px-3 py-2 border-b border-slate-200 text-xs">
                <div className="font-mono text-[10px] text-slate-600 uppercase font-bold">Switch Active Demo Role:</div>
              </div>
              
              <div className="py-1 space-y-0.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => {
                      switchDemoRole(acc.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                      user?.role === acc.role
                        ? 'bg-cyan-50 text-cyan-900 font-bold border border-cyan-300'
                        : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{acc.label}</div>
                      <div className="text-[10px] text-slate-600">{acc.name}</div>
                    </div>
                    {user?.role === acc.role && <span className="text-cyan-700 text-xs font-bold">●</span>}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 mt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 transition font-bold"
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

