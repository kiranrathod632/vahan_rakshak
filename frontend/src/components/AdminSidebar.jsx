import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Layers,
  ChevronDown,
  ChevronRight,
  Car,
  PanelLeftClose,
  PanelLeft,
  Banknote,
  Plus
} from 'lucide-react';

export default function AdminSidebar({ isOpen, onClose, collapsed = false, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'overview';
  const currentSub = searchParams.get('sub') || (currentTab === 'users' ? 'users' : '');
  const currentStatus = searchParams.get('status') || 'ALL';
  const currentVStatus = searchParams.get('vstatus') || 'ALL';
  const currentTStatus = searchParams.get('tstatus') || 'ALL';

  // Collapsible accordions state
  const [openSections, setOpenSections] = useState({
    master: true,
    userMgmt: true,
    teamMgmt: true
  });

  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleNav = (tab, extraParams = {}) => {
    const portal = tab === 'team' ? 'sales' : 'users';
    const params = new URLSearchParams({ portal, tab, ...extraParams });
    navigate(`/admin?${params.toString()}`);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Admin Sidebar Container (Dual Light & Dark Theme) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-[#0b0d14] border-r border-slate-200/90 dark:border-[#181b28] text-slate-700 dark:text-slate-300 transition-all duration-300 lg:static ${
          collapsed ? 'lg:w-[76px]' : 'lg:w-64'
        } w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-[#181b28]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 text-white shadow-md shadow-purple-600/20">
              <Shield className="size-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-display font-extrabold text-base tracking-tight text-slate-900 dark:text-white block truncate">
                  GADIRAKSHA
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold tracking-wider uppercase block">
                  ADMIN CONSOLE
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-[#1f2335]">
          
          {/* Section: OVERVIEW */}
          <div>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                OVERVIEW
              </div>
            )}
            <button
              type="button"
              onClick={() => handleNav('overview')}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
              } rounded-xl text-xs font-semibold transition-all group relative ${
                currentTab === 'overview'
                  ? 'bg-purple-50 dark:bg-[#181926] text-purple-700 dark:text-white border border-purple-200 dark:border-[#2a2d42] shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121420] hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Dashboard"
            >
              <div className="flex items-center gap-2.5">
                <div className={`grid size-6 place-items-center rounded-lg ${
                  currentTab === 'overview' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 group-hover:text-purple-600'
                }`}>
                  <LayoutDashboard className="size-4" />
                </div>
                {!collapsed && <span>Dashboard</span>}
              </div>

              {/* Hover Popover Tooltip for Collapsed Mode */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-[#181b28] border border-slate-700 dark:border-[#282c40] text-[11px] font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  Dashboard
                </div>
              )}
            </button>
          </div>

          {/* Section: MASTER MANAGEMENT */}
          <div>
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleSection('master')}
                className="w-full flex items-center justify-between px-3 mb-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white transition group"
              >
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-slate-400 group-hover:text-purple-600" />
                  <span>Master Management</span>
                </div>
                {openSections.master ? (
                  <ChevronDown className="size-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="size-3.5 text-slate-400" />
                )}
              </button>
            )}

            {collapsed ? (
              <button
                type="button"
                onClick={() => handleNav('scanners')}
                className="w-full flex justify-center p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121420] hover:text-slate-900 dark:hover:text-white transition group relative"
                title="Master Management"
              >
                <Layers className="size-4 text-slate-400 group-hover:text-purple-600" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-[#181b28] border border-slate-700 dark:border-[#282c40] text-[11px] font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  Master Management
                </div>
              </button>
            ) : openSections.master && (
              <div className="pl-6 space-y-0.5 mt-1 border-l border-slate-200 dark:border-[#1c2032] ml-4">
                <button
                  type="button"
                  onClick={() => handleNav('scanners')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    currentTab === 'scanners'
                      ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-[#141624]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  <span>QR Generate & Stickers</span>
                  <QrCode className="size-3.5 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('scanners', { sub: 'incentives' })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    currentTab === 'scanners' && currentSub === 'incentives'
                      ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-[#141624]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  <span>Salary & Incentives (Per QR)</span>
                  <Banknote className="size-3.5 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('emergencies')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    currentTab === 'emergencies'
                      ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-[#141624]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  <span>Emergency Protocols</span>
                  <ShieldAlert className="size-3.5 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('growth')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    currentTab === 'growth'
                      ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-[#141624]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  <span>Pricing & Growth Plans</span>
                  <TrendingUp className="size-3.5 opacity-60" />
                </button>
              </div>
            )}
          </div>

          {/* Section: USER MANAGEMENT */}
          <div>
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleSection('userMgmt')}
                className="w-full flex items-center justify-between px-3 mb-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white transition group"
              >
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-slate-400 group-hover:text-purple-600" />
                  <span>User Management</span>
                </div>
                {openSections.userMgmt ? (
                  <ChevronDown className="size-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="size-3.5 text-slate-400" />
                )}
              </button>
            )}

            {collapsed ? (
              <button
                type="button"
                onClick={() => handleNav('users')}
                className="w-full flex justify-center p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121420] hover:text-slate-900 dark:hover:text-white transition group relative"
                title="User Management"
              >
                <Users className="size-4 text-slate-400 group-hover:text-purple-600" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-[#181b28] border border-slate-700 dark:border-[#282c40] text-[11px] font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  User Management
                </div>
              </button>
            ) : openSections.userMgmt && (
              <div className="pl-6 space-y-0.5 mt-1 border-l border-slate-200 dark:border-[#1c2032] ml-4">
                <button
                  type="button"
                  onClick={() => handleNav('users', { sub: 'users', status: 'ALL' })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    currentTab === 'users' && currentSub === 'users' && currentStatus === 'ALL'
                      ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-[#141624]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  <span>All Users List</span>
                  <Users className="size-3.5 opacity-60" />
                </button>

                {/* <button
                  type="button"
                  onClick={() => handleNav('users', { sub: 'vehicles', vstatus: 'ALL' })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    currentTab === 'users' && currentSub === 'vehicles' && currentVStatus === 'ALL'
                      ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-[#141624]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  <span>All Vehicles List</span>
                  <Car className="size-3.5 opacity-60" />
                </button> */}

       
              </div>
            )}
          </div>

          {/* Section: TEAM MANAGEMENT */}
          <div>
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleSection('teamMgmt')}
                className="w-full flex items-center justify-between px-3 mb-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white transition group"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="size-4 text-slate-400 group-hover:text-purple-600" />
                  <span>Team Management</span>
                </div>
                {openSections.teamMgmt ? (
                  <ChevronDown className="size-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="size-3.5 text-slate-400" />
                )}
              </button>
            )}

            {collapsed ? (
              <button
                type="button"
                onClick={() => handleNav('team')}
                className="w-full flex justify-center p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121420] hover:text-slate-900 dark:hover:text-white transition group relative"
                title="Team Management"
              >
                <Briefcase className="size-4 text-slate-400 group-hover:text-purple-600" />
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-[#181b28] border border-slate-700 dark:border-[#282c40] text-[11px] font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                  Team Management
                </div>
              </button>
            ) : openSections.teamMgmt && (
              <div className="pl-6 space-y-0.5 mt-1 border-l border-slate-200 dark:border-[#1c2032] ml-4">
                <button
                  type="button"
                  onClick={() => handleNav('team', { tstatus: 'ALL' })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    currentTab === 'team' && currentTStatus === 'ALL'
                      ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-[#141624]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  <span>Employee List</span>
                  <Briefcase className="size-3.5 opacity-60" />
                </button>
{/* 
                <button
                  type="button"
                  onClick={() => handleNav('team', { action: 'add_team' })}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-[#121420] font-semibold transition flex items-center justify-between"
                >
                  <span>+ Add Employee</span>
                  <Plus className="size-3.5" />
                </button> */}

                {/* <button
                  type="button"
                  onClick={() => handleNav('team', { tstatus: 'ACTIVE' })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                    currentTab === 'team' && currentTStatus === 'ACTIVE'
                      ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  • Active Employees
                </button> */}

                {/* <button
                  type="button"
                  onClick={() => handleNav('team', { tstatus: 'BLOCKED' })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition ${
                    currentTab === 'team' && currentTStatus === 'BLOCKED'
                      ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121420]'
                  }`}
                >
                  • Deactive / Blocked
                </button> */}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Section: Collapse Sidebar & Sign Out */}
        <div className="p-3 border-t border-slate-100 dark:border-[#181b28] space-y-1">
          {/* Collapse sidebar button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`w-full hidden lg:flex items-center ${
              collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
            } rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141624] transition group relative`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="size-4 group-hover:text-purple-600" />
            ) : (
              <>
                <PanelLeftClose className="size-4 group-hover:text-purple-600" />
                <span>Collapse sidebar</span>
              </>
            )}

            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white dark:bg-[#181b28] border border-slate-700 dark:border-[#282c40] text-[11px] font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                Expand sidebar
              </div>
            )}
          </button>

          {/* Sign out button */}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'
            } rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition group relative`}
            title="Sign out"
          >
            <LogOut className="size-4 group-hover:text-rose-600" />
            {!collapsed && <span>Sign out</span>}

            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-rose-300 dark:bg-[#181b28] border border-slate-700 dark:border-[#282c40] text-[11px] font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                Sign out
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}