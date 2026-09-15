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
import { FieldPwaPage } from '../pages/FieldPwaPage';

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

const RoleRoute: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const currentRole = user?.role || 'viewer';

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing, PWA Standalone & Authentication */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pwa" element={<FieldPwaPage />} />

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
        <Route path="pwa" element={<FieldPwaPage />} />
        <Route path="field-pwa" element={<FieldPwaPage />} />
        
        {/* Role Protected Subsystems */}
        <Route 
          path="expeditions" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'expedition_manager', 'viewer']}>
              <ExpeditionsPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="expeditions/:id" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'expedition_manager', 'viewer']}>
              <ExpeditionDetailsPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="cargo" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'logistics_officer']}>
              <CargoPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="cargo/:id" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'logistics_officer']}>
              <CargoDetailsPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="inventory" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'logistics_officer', 'station_manager']}>
              <InventoryPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="personnel" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'expedition_manager', 'station_manager', 'emergency_coordinator']}>
              <PersonnelPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="assets" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'logistics_officer', 'emergency_coordinator']}>
              <AssetsPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="emergency" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'emergency_coordinator', 'station_manager']}>
              <EmergencySARPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="map" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'expedition_manager', 'station_manager', 'emergency_coordinator', 'viewer']}>
              <MapPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <RoleRoute allowedRoles={['super_admin', 'expedition_manager', 'logistics_officer', 'viewer']}>
              <AnalyticsPage />
            </RoleRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <RoleRoute allowedRoles={['super_admin']}>
              <SettingsPage />
            </RoleRoute>
          } 
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
