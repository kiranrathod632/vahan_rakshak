import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Phone, Lock, ChevronRight, Sun, Moon, KeyRound, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const [phone, setPhone] = useState('9823000000');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(phone, password);
      if (res.success) {
        const userRole = res.user?.user?.role || res.user?.role || 'user';
        if (userRole === 'admin' || userRole === 'superadmin') {
          navigate('/admin');
        } else {
          // If a standard user tries to log in through admin portal, allow them to view or notify
          navigate('/admin');
        }
      } else {
        setError(res.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      setError('Authentication error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setPhone('9823000000');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 bg-slate-50 dark:bg-[#0b0d14] text-slate-900 dark:text-slate-100 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/25">
            <Shield className="size-5.5" />
          </div>
          <div>
            <span className="font-display font-extrabold text-base tracking-tight text-ink dark:text-white">
              GadiRaksha
            </span>
            <span className="text-[10px] text-brand-600 dark:text-cyan-400 block font-bold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
        </button>
      </header>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="card p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200/90 dark:border-[#1f2333] relative">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-cyan-400 grid place-items-center mx-auto shadow-sm">
              <KeyRound className="size-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
              <Sparkles className="size-3" />
              <span>Admin & Master Console</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-ink">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with your master administrator credentials to access the GadiRaksha Fleet Command Center.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/60">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Mobile / Username
              </label>
              <div className="relative">
                <Phone className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9823000000"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs font-mono text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Demo Auto-fill Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-brand-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>⚡ Fill Demo Admin Login</span>
              </button>
              <span className="text-[11px] text-slate-400 font-mono">9823000000</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 text-xs font-bold shadow-md shadow-brand-500/25"
            >
              <span>{loading ? 'Verifying Admin Security...' : 'Enter Admin Control Panel'}</span>
              <ChevronRight className="size-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-[#1f2333] text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <div>
              Looking for Customer / Vehicle Owner Login?{' '}
              <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                User Sign In
              </Link>
            </div>
            <div>
              Sales Representative?{' '}
              <Link to="/sales" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
                Sales Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-3">
        © 2026 GadiRaksha Smart Vehicle Safety Network. Administrator security protocol active.
      </footer>
    </div>
  );
}
