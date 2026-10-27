import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Bell,
  Car,
  QrCode,
  FileText,
  ShoppingBag,
  Users,
  History,
  ShieldAlert,
  User,
  Settings,
  LogOut,
  X,
  Shield,
  Briefcase,
  Sun,
  Moon
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { recentAlerts } = useSocket();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
        {
          to: '/app/notifications',
          label: 'Notifications',
          icon: Bell,
          badge: recentAlerts.length > 0 ? recentAlerts.length : null
        }
      ]
    },
    {
      title: 'My garage',
      items: [
        { to: '/app/vehicles', label: 'My vehicles', icon: Car },
        { to: '/app/scanners', label: 'QR scanners', icon: QrCode },
        { to: '/app/documents', label: 'Documents', icon: FileText },
        { to: '/app/purchase', label: 'Purchase scanner', icon: ShoppingBag }
      ]
    },
    {
      title: 'Safety',
      items: [
        { to: '/app/family', label: 'Family contacts', icon: Users },
        { to: '/app/scan-history', label: 'Scan history', icon: History },
        { to: '/app/emergencies', label: 'Emergency history', icon: ShieldAlert }
      ]
    },
    {
      title: 'Administration',
      items: [
        { to: '/admin', label: 'Admin dashboard', icon: Shield },
        { to: '/sales', label: 'Sales team portal', icon: Briefcase }
      ]
    },
    {
      title: 'Account',
      items: [
        { to: '/app/profile', label: 'My profile', icon: User },
        { to: '/app/settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  // User initials
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GR';

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSales = user?.role === 'sales';

  // Only show Administration to Admins or Sales staff; hide completely from standard vehicle users
  const visibleNavGroups = navGroups.filter(g => {
    if (g.title === 'Administration') {
      return isAdmin || isSales;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 dark:border-[#1c1f2e] bg-white dark:bg-[#0e1017] transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1c1f2e] px-5 py-4">
          <NavLink to="/app" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/25 group-hover:bg-brand-700 transition">
              <Shield className="size-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-lg text-ink dark:text-white">GadiRaksha</span>
                <span className="text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800/60">
                  गाडीरक्षा
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
                Smart Vehicle Safety & SOS
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1c27] lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {visibleNavGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-[#656d82]">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-brand-50 dark:bg-[#1a1c27] text-brand-700 dark:text-white font-semibold shadow-xs border border-transparent dark:border-purple-500/20'
                              : 'text-slate-600 dark:text-[#8c94a8] hover:bg-slate-100/80 dark:hover:bg-[#141622] hover:text-ink dark:hover:text-white'
                          }`
                        }
                      >
                        <Icon className="size-4.5 shrink-0" strokeWidth={2} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer User Profile, Theme Switcher & Logout */}
        <div className="border-t border-slate-100 dark:border-[#1c1f2e] p-3.5 bg-slate-50/50 dark:bg-[#0b0d14] space-y-2.5">
          {/* Theme switcher */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Appearance</span>
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

          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-[#12141e] border border-slate-200/80 dark:border-[#1f2333]">
            <NavLink to="/app/profile" className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="size-9 rounded-lg object-cover border border-slate-200 dark:border-[#272b3f]"
                />
              ) : (
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 font-bold text-xs">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-ink dark:text-white leading-tight">
                  {user?.name || 'Sambhaji Patil'}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {user?.phone || '9823000000'}
                </p>
              </div>
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
