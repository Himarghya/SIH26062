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
  Radio,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();

  const ROLE_NAV_PERMISSIONS: Record<string, string[]> = {
    super_admin: [
      '/dashboard', '/expeditions', '/cargo', '/inventory', 
      '/personnel', '/assets', '/map', '/emergency', '/analytics', '/settings'
    ],
    expedition_manager: [
      '/dashboard', '/expeditions', '/personnel', '/map', '/analytics'
    ],
    logistics_officer: [
      '/dashboard', '/cargo', '/inventory', '/assets', '/analytics'
    ],
    station_manager: [
      '/dashboard', '/inventory', '/personnel', '/map', '/emergency'
    ],
    emergency_coordinator: [
      '/dashboard', '/emergency', '/assets', '/map', '/personnel'
    ],
    viewer: [
      '/dashboard', '/map', '/analytics', '/expeditions'
    ],
  };

  const allNavigationItems = [
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

  const userRole = user?.role || 'viewer';
  const allowedPaths = ROLE_NAV_PERMISSIONS[userRole] || ROLE_NAV_PERMISSIONS.viewer;
  const navigationItems = allNavigationItems.filter(item => allowedPaths.includes(item.path));

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white/95 backdrop-blur-xl border-r border-slate-300 flex flex-col shadow-xs ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-300 bg-slate-50/90">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-700 to-indigo-700 flex items-center justify-center font-black text-white shadow-sm text-sm">
              🧊
            </div>
            <div>
              <span className="font-black text-sm tracking-wider text-slate-900">
                POLARIS
              </span>
              <span className="block text-[8.5px] text-cyan-800 font-mono uppercase tracking-widest font-bold">
                NCPOR • MoES (Goa)
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-700 to-indigo-700 flex items-center justify-center font-black text-white shadow-sm text-sm">
            🧊
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition shadow-2xs hidden md:block"
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
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-800 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                item.alert ? 'text-rose-600 animate-pulse' : 'group-hover:text-emerald-600 text-slate-500'
              }`} />
              {!collapsed && (
                <span className="truncate tracking-wide">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Role Card & Uplink status */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70">
        {!collapsed ? (
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-wider font-bold truncate max-w-[130px]">
                {user?.role.replace('_', ' ')}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="font-bold text-xs text-slate-800 truncate">{user?.name}</div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-1 pt-0.5 font-mono">
              <Radio className="w-3 h-3 text-emerald-600" />
              <span>Iridium SBD Active</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center font-bold font-mono text-emerald-700 text-xs mx-auto shadow-sm" title={user?.name}>
            {user?.name?.[0] || 'U'}
          </div>
        )}
      </div>
    </aside>
  );
};

