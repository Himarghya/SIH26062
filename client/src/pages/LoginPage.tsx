import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Radio } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-polar-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white shadow-xl shadow-cyan-500/25 mx-auto text-xl">
            🧊
          </div>
          <h1 className="text-2xl font-black tracking-wider text-slate-100 uppercase font-mono bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            POLARIS COMMAND ACCESS
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            National Centre for Polar & Ocean Research • MoES
          </p>
        </div>

        {/* Main Login Card */}
        <div className="glass-panel p-6 rounded-2xl shadow-2xl border border-cyan-800/40 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-mono uppercase mb-1">Official ID / Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-mono uppercase mb-1">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-polar-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/30 transition"
            >
              <span>{isLoading ? "Authenticating..." : "Sign In to Command Center"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Role Login Selector for Evaluators & Presentation */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-cyan-400 font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Quick-Access Demo Role Accounts (1-Click):</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc.email)}
                  className="p-2 rounded-xl bg-polar-900 hover:bg-polar-850 border border-slate-800 hover:border-cyan-500/50 text-left text-[11px] transition"
                >
                  <div className="font-semibold text-slate-200">{acc.label}</div>
                  <div className="text-[9px] text-slate-500 truncate font-mono">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <div className="text-center text-[10px] text-slate-500 font-mono flex items-center justify-center space-x-1">
          <Radio className="w-3 h-3 text-cyan-600" />
          <span>Restricted Government of India Operational Network</span>
        </div>
      </div>
    </div>
  );
};
