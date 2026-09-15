import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { DigitalTwinModal } from '../simulation/DigitalTwinModal';
import { CargoQrModal } from '../cargo/CargoQrModal';
import { BlizzardModal } from '../BlizzardModal';
import { SatelliteSyncModal } from '../SatelliteSyncModal';
import { MlCommandConsoleModal } from '../ml/MlCommandConsoleModal';
import { offlineStorage } from '../../services/offlineDb';
import { QueuedMutation } from '../../types';
import { ChevronRight, Home } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDigitalTwin, setShowDigitalTwin] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showBlizzardSOS, setShowBlizzardSOS] = useState(false);
  const [showSatelliteSync, setShowSatelliteSync] = useState(false);
  const [showMlConsole, setShowMlConsole] = useState(false);


  // Offline-first operation state
  const [isOffline, setIsOffline] = useState<boolean>(() => offlineStorage.isOfflineMode());
  const [offlineQueue, setOfflineQueue] = useState<QueuedMutation[]>(() => offlineStorage.getQueue());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleQueueUpdate = () => {
      setOfflineQueue(offlineStorage.getQueue());
    };
    const handleOfflineModeChange = (e: any) => {
      setIsOffline(e.detail.offline);
    };

    window.addEventListener('polaris-queue-updated', handleQueueUpdate);
    window.addEventListener('polaris-offline-mode-changed', handleOfflineModeChange);
    return () => {
      window.removeEventListener('polaris-queue-updated', handleQueueUpdate);
      window.removeEventListener('polaris-offline-mode-changed', handleOfflineModeChange);
    };
  }, []);

  const handleToggleOffline = (offline: boolean) => {
    offlineStorage.setOfflineMode(offline);
    setIsOffline(offline);
  };

  const handleTriggerSatelliteSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate transmitting batches of queued packets via Iridium SBD
      await new Promise(resolve => setTimeout(resolve, 1400));
      offlineStorage.clearQueue();
      offlineStorage.setLastSyncTimestamp(new Date().toISOString());
      setOfflineQueue([]);
    } finally {
      setIsSyncing(false);
    }
  };

  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <TopNav
          onOpenDigitalTwin={() => setShowDigitalTwin(true)}
          onOpenQrScanner={() => setShowQrScanner(true)}
          onOpenBlizzardSOS={() => setShowBlizzardSOS(true)}
          onOpenSatelliteSync={() => setShowSatelliteSync(true)}
          onOpenMlConsole={() => setShowMlConsole(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
          isOffline={isOffline}
          pendingQueueCount={offlineQueue.length}
        />

        {/* Offline Banner when in isolated mode */}
        {isOffline && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-800 font-mono shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>
                <strong>POLAR EDGE OFFLINE MODE:</strong> Operating on local cached database. {offlineQueue.length} pending mutations queued for satellite burst uplink.
              </span>
            </div>
            <button
              onClick={() => setShowSatelliteSync(true)}
              className="underline hover:text-amber-950 font-bold"
            >
              Inspect Queue & Force Uplink →
            </button>
          </div>
        )}

        {/* Breadcrumb strip */}
        <div className="px-6 py-2 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <Link to="/dashboard" className="hover:text-emerald-700 flex items-center space-x-1 font-bold text-slate-700">
            <Home className="w-3.5 h-3.5" />
            <span>POLARIS</span>
          </Link>
          {pathParts.map((part, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="capitalize text-slate-700 font-semibold">{part}</span>
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

      <SatelliteSyncModal
        isOpen={showSatelliteSync}
        onClose={() => setShowSatelliteSync(false)}
        queue={offlineQueue}
        onTriggerSync={handleTriggerSatelliteSync}
        isSyncing={isSyncing}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
      />

      <MlCommandConsoleModal
        isOpen={showMlConsole}
        onClose={() => setShowMlConsole(false)}
      />
    </div>
  );
};


