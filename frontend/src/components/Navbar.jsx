import React, { useState } from 'react';
import { Menu, QrCode, Wifi, WifiOff, ExternalLink, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onOpenMobileMenu }) {
  const { isConnected } = useSocket();
  const { theme, toggleTheme, isDark } = useTheme();
  const [quickCode, setQuickCode] = useState('');
  const [showQuickModal, setShowQuickModal] = useState(false);
  const navigate = useNavigate();

  const handleTestScan = (e) => {
    e.preventDefault();
    const code = quickCode.trim().toUpperCase() || 'MH-1001';
    setShowQuickModal(false);
    navigate(`/scan/${code}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-[#1c1f2e] bg-white/90 dark:bg-[#0e1017]/90 px-4 md:px-8 backdrop-blur transition-colors duration-200">
        {/* Left: Mobile menu toggle & page breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#1a1c27] lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="size-4 text-brand-600 dark:text-cyan-400" />
            <span className="font-medium text-slate-700 dark:text-slate-200">Pre-Printed QR Scanner & Emergency SOS Network</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Socket status badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
            }`}
            title={isConnected ? 'Live Socket.io Real-time alerts connected' : 'Connecting to real-time alerts...'}
          >
            <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="hidden sm:inline">{isConnected ? 'Live Alerts Connected' : 'Connecting...'}</span>
          </div>

          {/* Quick bystander scan simulator */}
          <button
            onClick={() => setShowQuickModal(true)}
            className="btn-secondary !py-1.5 !px-3 text-xs"
          >
            <QrCode className="size-3.5 text-brand-600 dark:text-cyan-400" />
            <span>Test QR Scan</span>
          </button>

          {/* Global Dark / Light Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => navigate('/app/purchase')}
            className="btn-primary !py-1.5 !px-3 text-xs"
          >
            + Get Sticker
          </button>
        </div>
      </header>

      {/* Quick Scan Test Modal */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 dark:bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333]">
            <h3 className="text-base font-bold text-ink dark:text-white">Bystander Scan Simulation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter any pre-printed sticker code (e.g. <strong className="font-mono text-brand-700 dark:text-brand-400">MH-1001</strong>) to view what a bystander sees when scanning the vehicle QR.
            </p>

            <form onSubmit={handleTestScan} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sticker Code
                </label>
                <input
                  type="text"
                  value={quickCode}
                  onChange={(e) => setQuickCode(e.target.value)}
                  placeholder="e.g. MH-1001"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-sm font-mono uppercase text-ink dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
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
