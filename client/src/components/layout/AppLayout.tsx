import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { DigitalTwinModal } from '../simulation/DigitalTwinModal';
import { CargoQrModal } from '../cargo/CargoQrModal';
import { BlizzardModal } from '../BlizzardModal';
import { ChevronRight, Home } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showBlizzardSOS, setShowBlizzardSOS] = useState(false);

  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-polar-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <TopNav
          onOpenDigitalTwin={() => setShowDigitalTwin(true)}
          onOpenQrScanner={() => setShowQrScanner(true)}
          onOpenBlizzardSOS={() => setShowBlizzardSOS(true)}
        />

        {/* Breadcrumb strip */}
        <div className="px-6 py-2 border-b border-slate-900 bg-polar-950/40 flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <Link to="/dashboard" className="hover:text-cyan-300 flex items-center space-x-1">
            <Home className="w-3.5 h-3.5" />
            <span>POLARIS</span>
          </Link>
          {pathParts.map((part, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="capitalize text-slate-300">{part}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Page Outlet */}
        <main className="flex-1 p-4 md:p-6 pb-20 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Interactive Modals */}
      <DigitalTwinModal
        isOpen={showDigitalTwin}
        onClose={() => setShowDigitalTwin(false)}
      />

      <CargoQrModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
      />

      <BlizzardModal
        isOpen={showBlizzardSOS}
        onClose={() => setShowBlizzardSOS(false)}
        stations={[]}
        onTriggerLockdown={() => {}}
        onTriggerSOS={() => {}}
      />
    </div>
  );
};
