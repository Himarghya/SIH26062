import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ExpeditionsPage } from '../pages/ExpeditionsPage';
import { ExpeditionDetailsPage } from '../pages/ExpeditionDetailsPage';
import { CargoPage } from '../pages/CargoPage';
import { CargoDetailsPage } from '../pages/CargoDetailsPage';
import { InventoryPage } from '../pages/InventoryPage';
import { PersonnelPage } from '../pages/PersonnelPage';
import { AssetsPage } from '../pages/AssetsPage';
import { EmergencySARPage } from '../pages/EmergencySARPage';
import { MapPage } from '../pages/MapPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { SettingsPage } from '../pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-polar-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-cyan-300 text-xs tracking-widest uppercase">Verifying Polar Link Security...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Authentication */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Application Command Center */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="expeditions" element={<ExpeditionsPage />} />
        <Route path="expeditions/:id" element={<ExpeditionDetailsPage />} />
        <Route path="cargo" element={<CargoPage />} />
        <Route path="cargo/:id" element={<CargoDetailsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="personnel" element={<PersonnelPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="emergency" element={<EmergencySARPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
