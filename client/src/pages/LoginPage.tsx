import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Radio, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@polaris.gov.in');
  const [password, setPassword] = useState('Polaris2026!');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemoLogin = async (accountEmail: string) => {
    setErrorMessage('');
    try {
      await login(accountEmail, 'Polaris2026!');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage('Could not sign in with demo credentials.');
    }
  };

  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'super_admin': return 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400';
      case 'expedition_manager': return 'border-indigo-300 text-indigo-800 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400';
      case 'logistics_officer': return 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 hover:border-amber-400';
      case 'station_manager': return 'border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100 hover:border-teal-400';
      case 'emergency_coordinator': return 'border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100 hover:border-rose-400';
      default: return 'border-slate-200 text-slate-800 bg-slate-50 hover:bg-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Aurora Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] animate-aurora" />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] animate-aurora" style={{ animationDelay: '4s' }} />
      </div>

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-xl shadow-emerald-500/25 mx-auto text-3xl">
            🧊
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-900 uppercase font-mono gradient-text-aurora">
            POLARIS COMMAND ACCESS
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            National Centre for Polar & Ocean Research • Ministry of Earth Sciences
          </p>
        </div>

        {/* Main Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6 bg-white/90">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-mono animate-fadeIn font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-mono uppercase text-[11px] mb-1.5 font-bold">
                Official Identifier / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono text-xs shadow-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-mono uppercase text-[11px] mb-1.5 font-bold">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 focus:bg-white shadow-sm transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-xl shadow-emerald-600/25 transition transform hover:-translate-y-0.5"
            >
              <span>{isLoading ? "Authenticating Session..." : "Sign In to Command Center"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Role Login Selector for Evaluators & Presentation */}
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[11px] font-mono uppercase text-emerald-800 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Evaluator 1-Click Demo Personas:</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Password: Polaris2026!</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc.email)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between shadow-sm hover:shadow ${getRoleTheme(acc.role)}`}
                >
                  <div className="font-bold text-[11px]">{acc.label}</div>
                  <div className="text-[10px] opacity-80 truncate font-mono mt-0.5">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <div className="text-center text-[10px] text-slate-500 font-mono flex items-center justify-center space-x-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Restricted Government of India Polar Tactical Network • 256-Bit TLS</span>
        </div>
      </div>
    </div>
  );
};

