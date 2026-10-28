import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  ExternalLink,
  QrCode,
  ShieldAlert,
  Users,
  Briefcase,
  Layers,
  X
} from 'lucide-react';

export default function AdminNavbar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Ctrl+K shortcut to open command search palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchPaletteOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navActions = [
    { label: 'Dashboard Overview', desc: 'Main command metrics & activity', tab: 'overview', icon: Layers },
    { label: 'All Users List', desc: 'Browse and manage vehicle users', tab: 'users', extra: 'sub=users', icon: Users },
    { label: 'All Vehicles List', desc: 'Fleet vehicle models & plate numbers', tab: 'users', extra: 'sub=vehicles', icon: Layers },
    { label: 'Sales & Field Team', desc: 'Staff directory, targets & salaries', tab: 'team', icon: Briefcase },
    { label: 'QR Stickers Inventory', desc: 'Batch generator & blank stickers', tab: 'scanners', icon: QrCode },
    { label: 'Emergency SOS Logs', desc: 'Active incident fleet alerts', tab: 'emergencies', icon: ShieldAlert },
  ];

  const filteredNavActions = navActions.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectNav = (tab, extra = '') => {
    const portal = tab === 'team' ? 'sales' : 'users';
    const extraStr = extra ? `&${extra}` : '';
    navigate(`/admin?portal=${portal}&tab=${tab}${extraStr}`);
    setSearchPaletteOpen(false);
    setSearchQuery('');
  };

  // Get user initials for avatar badge
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'KR';

  const displayName = user?.name || 'Kiran Rathod';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/90 dark:border-[#181b28] bg-white/95 dark:bg-[#0b0d14]/95 px-4 md:px-8 backdrop-blur transition-colors">
        
        {/* Left: Mobile Toggle & Quick Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#151724] lg:hidden"
            aria-label="Open mobile menu"
          >
            <Menu className="size-5" />
          </button>

          {/* Search Bar matching both screenshots */}
          <div
            onClick={() => setSearchPaletteOpen(true)}
            className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#121420] border border-slate-200 dark:border-[#202438] text-slate-400 hover:border-purple-500/50 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <Search className="size-4 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400 select-none">Search menu, pages...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-white dark:bg-[#1c2033] border border-slate-200 dark:border-[#2a2e47] text-[10px] font-mono text-slate-500 dark:text-slate-300 font-semibold shadow-xs">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right: Theme Toggle & Admin Profile Pill */}
        <div className="flex items-center gap-3">
          
          {/* Light / Dark Mode Toggle Pill matching both images */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`relative flex items-center justify-center size-8 sm:w-12 sm:h-7 rounded-full transition shadow-xs ${
              isDark
                ? 'bg-[#271442] border border-purple-500/40 text-purple-300 hover:bg-[#341b59]'
                : 'bg-[#fef3c7] border border-amber-300 text-amber-800 hover:bg-[#fde68a]'
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <div className="flex items-center gap-1">
                <Moon className="size-3.5 fill-purple-300 text-purple-300" />
                <span className="hidden sm:inline-block size-1 rounded-full bg-purple-200" />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Sun className="size-3.5 fill-amber-500 text-amber-600" />
                <span className="hidden sm:inline-block size-1 rounded-full bg-amber-400" />
              </div>
            )}
          </button>

          {/* Admin Profile Pill matching both images */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 py-1 px-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#151724] border border-transparent hover:border-slate-200 dark:hover:border-[#22263b] transition"
            >
              {/* Avatar initials badge: black in light mode, white in dark mode */}
              <div className="size-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black font-extrabold text-xs grid place-items-center shadow-xs select-none">
                {initials}
              </div>

              <span className="text-xs font-bold text-slate-800 dark:text-white hidden sm:inline-block">
                {displayName}
              </span>

              <ChevronDown className="size-3.5 text-slate-400 hidden sm:inline-block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#121420] border border-slate-200 dark:border-[#22263d] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-700 dark:text-slate-200"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-[#1c2033]">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider">
                    {user?.role === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                  </p>
                </div>

                <div className="py-1">
                  <a
                    href="/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1d2e] hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Customer App View</span>
                    <ExternalLink className="size-3.5 text-slate-400" />
                  </a>

                  <a
                    href="/sales"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1d2e] hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Sales Portal View</span>
                    <ExternalLink className="size-3.5 text-slate-400" />
                  </a>
                </div>

                <div className="border-t border-slate-100 dark:border-[#1c2033] pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Global Command Search Palette (Ctrl + K) */}
      {searchPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#121420] border border-slate-200 dark:border-[#24283d] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[#1e2236]">
              <Search className="size-4 text-purple-600 dark:text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menus, features, or jump to section..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchPaletteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1c2032]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-2 max-h-72 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Admin Navigation
              </div>

              {filteredNavActions.length > 0 ? (
                filteredNavActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectNav(item.tab, item.extra)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-[#1a1d2e] group transition"
                    >
                      <div className="size-8 rounded-lg bg-slate-100 dark:bg-[#181b2b] group-hover:bg-purple-100 dark:group-hover:bg-purple-600/20 text-slate-500 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 grid place-items-center transition">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 truncate">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching admin sections found
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0e1018] border-t border-slate-100 dark:border-[#1e2236] flex items-center justify-between text-[11px] text-slate-400">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#1c2032] text-slate-700 dark:text-slate-300 font-mono text-[10px]">Esc</kbd> to close</span>
              <span>GadiRaksha Admin</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}