import React, { createContext, useContext, useState, useEffect } from 'react';
import { polarisApi } from '../api/services';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'expedition_manager' | 'logistics_officer' | 'station_manager' | 'emergency_coordinator' | 'viewer';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (roleName: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS = [
  { role: 'super_admin', label: 'Super Admin', email: 'admin@polaris.gov.in', name: 'Dr. Arvind Swaminathan (Director NCPOR)' },
  { role: 'expedition_manager', label: 'Expedition Manager', email: 'expedition@polaris.gov.in', name: 'Dr. Meera Nambiar' },
  { role: 'logistics_officer', label: 'Logistics Officer', email: 'logistics@polaris.gov.in', name: 'Wg Cdr Tarun Jaswal' },
  { role: 'station_manager', label: 'Station Manager', email: 'station@polaris.gov.in', name: 'Er. Sandeep Bopche' },
  { role: 'emergency_coordinator', label: 'Emergency Coordinator', email: 'emergency@polaris.gov.in', name: 'Capt. R. Deshmukh' },
  { role: 'viewer', label: 'Viewer / Analyst', email: 'viewer@polaris.gov.in', name: 'Aditi Sharma (MoES Analyst)' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('polaris_user_info');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('polaris_jwt_token');
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string = 'Polaris2026!') => {
    setIsLoading(true);
    try {
      const data = await polarisApi.login(email, password);
      setToken(data.access_token);
      const userProfile: UserProfile = {
        id: data.user_id,
        name: data.name,
        email: data.email,
        role: data.role as any
      };
      setUser(userProfile);
      localStorage.setItem('polaris_jwt_token', data.access_token);
      localStorage.setItem('polaris_user_info', JSON.stringify(userProfile));
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (roleName: string) => {
    const account = DEMO_ACCOUNTS.find(a => a.role === roleName) || DEMO_ACCOUNTS[0];
    await login(account.email, 'Polaris2026!');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('polaris_jwt_token');
    localStorage.removeItem('polaris_user_info');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchDemoRole,
        isAuthenticated: !!user && !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
