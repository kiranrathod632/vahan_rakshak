import React from 'react';
import { NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  QrCode,
  ShieldAlert,
  TrendingUp,
  LogOut,
  X,
  Shield,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  Car
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'users';
  const currentPortal = searchParams.get('portal') || (currentTab === 'team' ? 'sales' : 'users');

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNavClick = (tab) => {
    const portal = tab === 'team' ? 'sales' : 'users';
    navigate(`/admin?portal=${portal}&tab=${tab}`);
    if (onClose) onClose();
  };

  const handlePortalSwitch = (portal) => {
    if (portal === 'sales') {
      navigate('/admin?portal=sales&tab=team');
    } else {
      navigate('/admin?portal=users&tab=users');
    }
    if (onClose) onClose();
  };

  const navItems = [
    {
      tab: 'overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      tab: 'users',
      label: 'Vehicle Users Hub',
      icon: Users,
      desc: 'Owners, vehicles, emergency contacts'
    },
    {
      tab: 'team',
      label: 'Sales & Staff Portal',
      icon: Briefcase,
      desc: 'Hiring, targets, sales & bank info',
      badge: 'Team',
      badgeColor: 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
    },
    {
      tab: 'scanners',
      label: 'QR Stickers Inventory',
      icon: QrCode,
      desc: 'Pre-printed batches & tags'
    },
    {
      tab: 'emergencies',
      label: 'Emergency SOS Logs',
      icon: ShieldAlert,
      desc: 'Live incident fleet alerts'
    },
    {
      tab: 'growth',
      label: 'Growth & Analytics',
      icon: TrendingUp,
      desc: 'Registration & MoM growth'
    }
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-[#0e1017] border-r border-slate-200 dark:border-[#1a1d2c] transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-[#1a1d2c]">
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-md shadow-brand-500/20">
              <Shield className="size-5.5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-ink dark:text-white">
                GadiRaksha
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-brand-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-ink dark:hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Admin Role Status Card */}
        {/* 2-Option Portal Selector in Sidebar */}
        <div className="px-4 pt-3">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#151722] border border-slate-200/80 dark:border-[#1f2333]">
            <button
              type="button"
              onClick={() => handlePortalSwitch('users')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
                currentPortal === 'users'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white'
              }`}
            >
              <Users className="size-3.5" />
              <span>User Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('sales')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
                currentPortal === 'sales'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white'
              }`}
            >
              <Briefcase className="size-3.5" />
              <span>Sales Team</span>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Command Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;

            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => handleNavClick(item.tab)}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161824]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`size-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span className="truncate text-left">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#1a1d2c]">
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              External Portals
            </div>

            <NavLink
              to="/sales"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161824] transition"
            >
              {/* <div className="flex items-center gap-3">
                <Briefcase className="size-4 text-emerald-500" />
                <span>Sales Staff Portal</span>
              </div> */}
            </NavLink>

            <NavLink
              to="/app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161824] transition"
            >
              <div className="flex items-center gap-3">
                <Car className="size-4 text-blue-500" />
                <span>Customer App View</span>
              </div>
              <ExternalLink className="size-3.5 text-slate-400" />
            </NavLink>
          </div>
        </div>

        {/* Bottom User Profile & Theme Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-[#1a1d2c] space-y-3">
          {/* Theme switcher */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Appearance</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#1a1d2c] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#25283d] transition"
            >
              {isDark ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-indigo-500" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* Admin Account & Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#151722] border border-slate-200/80 dark:border-[#1f2333]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white font-bold text-xs shrink-0 shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink dark:text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                  {user?.role === 'superadmin' ? 'SUPER ADMIN' : 'ADMINISTRATOR'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
              title="Logout from Admin Panel"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
