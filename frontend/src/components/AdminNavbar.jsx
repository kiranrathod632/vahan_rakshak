import React, { useState } from 'react';
import { Menu, QrCode, Shield, ExternalLink, Sun, Moon, Sparkles, Bell, Users, Briefcase } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AdminNavbar({ onOpenMobileMenu }) {
  const { isConnected, recentAlerts } = useSocket();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuth();
  const [quickCode, setQuickCode] = useState('');
  const [showQuickModal, setShowQuickModal] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'users';
  const currentPortal = searchParams.get('portal') || (currentTab === 'team' ? 'sales' : 'users');

  const handleTestScan = (e) => {
    e.preventDefault();
    const code = quickCode.trim().toUpperCase() || 'MH-1001';
    setShowQuickModal(false);
    navigate(`/scan/${code}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-[#1c1f2e] bg-white/95 dark:bg-[#0e1017]/95 px-4 md:px-8 backdrop-blur transition-colors duration-200">
        {/* Left: Mobile menu button & breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#1a1c27] lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              {/* <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider text-[10px]">
                <Sparkles className="size-3" />
                Root Admin Panel
              </span> */}
              <span className="text-slate-400 dark:text-slate-600">•</span>
              {/* <span className="text-slate-600 dark:text-slate-300 font-semibold hidden md:inline">
                Fleet & Team Command Center
              </span> */}
            </div>
          </div>
        </div>

        {/* Center: 2-Portal Master Switcher */}
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-[#151722] border border-slate-200/90 dark:border-[#1f2333]">
          <button
            type="button"
            onClick={() => navigate('/admin?portal=users&tab=users')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              currentPortal === 'users'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            <Users className="size-3.5" />
            <span>User Portal</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin?portal=sales&tab=team')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              currentPortal === 'sales'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            <Briefcase className="size-3.5" />
            <span>Sales Team</span>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Real-time Socket status indicator */}
      

          {/* Test Scanner Code */}
      
          {/* Global Dark / Light Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Test QR Tag modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="size-5 text-brand-600 dark:text-cyan-400" />
              <h3 className="font-bold text-base text-ink">Simulate Bystander Scan</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter any pre-printed or active sticker code to test public scan bystander view:
            </p>
            <form onSubmit={handleTestScan} className="space-y-3">
              <input
                type="text"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="e.g. MH-1001"
                className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-ink focus:border-brand-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="btn-secondary flex-1 !py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 !py-2 text-xs font-bold"
                >
                  Open Scan Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
