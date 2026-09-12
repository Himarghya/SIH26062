import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  Layers, 
  Box, 
  Anchor, 
  Users, 
  Truck, 
  Map, 
  ShieldAlert, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Compass },
    { name: 'Expeditions', path: '/expeditions', icon: Layers },
    { name: 'Cargo Tracking', path: '/cargo', icon: Box },
    { name: 'Station Inventory', path: '/inventory', icon: Anchor },
    { name: 'Personnel & Muster', path: '/personnel', icon: Users },
    { name: 'Asset Management', path: '/assets', icon: Truck },
    { name: 'Polar Map & GIS', path: '/map', icon: Map },
    { name: 'Emergency Command', path: '/emergency', icon: ShieldAlert, alert: true },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-polar-950/95 backdrop-blur-md border-r border-cyan-900/40 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-cyan-900/40 bg-polar-900/60">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-cyan-500/20 text-sm">
              🧊
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider text-slate-100 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                POLARIS
              </span>
              <span className="block text-[9px] text-cyan-400 font-mono uppercase tracking-widest">
                NCPOR • MoES
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white shadow-lg text-sm">
            🧊
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-polar-850 hover:bg-polar-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition hidden md:block"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-polar-900 border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition group-hover:text-cyan-400 ${item.alert ? 'text-rose-400' : ''}`} />
              {!collapsed && (
                <span className="truncate tracking-wide">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Role Card & Uplink status */}
      <div className="p-3 border-t border-cyan-900/40 bg-polar-900/40">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-polar-950 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                {user?.role.replace('_', ' ')}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="font-semibold text-xs text-slate-200 truncate">{user?.name}</div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-1 pt-0.5">
              <Radio className="w-3 h-3 text-cyan-500" />
              <span>Iridium Polar Sync Active</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-bold font-mono text-cyan-300 text-xs mx-auto" title={user?.name}>
            {user?.name?.[0] || 'U'}
          </div>
        )}
      </div>
    </aside>
  );
};
