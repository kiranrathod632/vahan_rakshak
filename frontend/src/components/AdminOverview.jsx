import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  QrCode,
  ShieldAlert,
  Car,
  Briefcase,
  IndianRupee,
  Building2,
  Flag,
  ChevronRight,
  ArrowRight,
  Activity,
  PhoneCall,
  MessageSquare,
  Eye,
} from 'lucide-react';

export default function AdminOverview({
  user,
  stats,
  users = [],
  team = [],
  scanners = [],
  emergencies = [],
  setActiveTab
}) {
  const [period, setPeriod] = useState('monthly');
  const [activityTab, setActivityTab] = useState('users');
  const [latestTab, setLatestTab] = useState('users');

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Morning' : (hour < 17 ? 'Afternoon' : 'Evening');
  const adminName = user?.name || 'Kiran Rathod';

  const totalUserCount = stats?.summary?.totalUsers || (users.length > 0 ? users.length : 93100);
  const totalVehicles = stats?.summary?.totalVehicles || 412;
  const totalScannersCount = scanners.length > 0 ? scanners.length : 1007;
  const totalEmergenciesCount = emergencies.length > 0 ? emergencies.length : 167;
  const unclaimedScanners = scanners.filter(s => s.status === 'UNCLAIMED').length;
  const pendingEmergencies = emergencies.filter(e => e.status !== 'RESOLVED').length || 3;
  const totalStaffCount = team.length > 0 ? team.length : 12;

  const formatCompact = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formattedUserTotal = totalUserCount >= 1000 ? formatCompact(totalUserCount) : `${totalUserCount}`;

  const handleStartTriage = () => {
    if (pendingEmergencies > 0) {
      setActiveTab('emergencies');
    } else {
      setActiveTab('scanners');
    }
  };

  const barChartHeights = [
    15, 25, 10, 80, 20, 100, 15, 40, 95, 30, 10, 15, 100, 10, 50, 10, 25, 60, 20, 10, 15, 75, 20, 10, 30, 90, 15, 20, 45, 10, 25
  ];

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div onClick={() => setActiveTab('scanners')} className="rounded-2xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-4 sm:p-5 hover:border-purple-400 dark:hover:border-purple-500/40 cursor-pointer transition group shadow-xs hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total User</span>
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-[#1c2033] text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 grid place-items-center">
              <QrCode className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
              {totalScannersCount.toLocaleString()}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">-59%</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div onClick={() => setActiveTab('users')} className="rounded-2xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-4 sm:p-5 hover:border-purple-400 dark:hover:border-purple-500/40 cursor-pointer transition group shadow-xs hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total QR </span>
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-[#1c2033] text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 grid place-items-center">
              <Car className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">{totalVehicles}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">+42%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div onClick={() => setActiveTab('emergencies')} className="rounded-2xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-4 sm:p-5 hover:border-purple-400 dark:hover:border-purple-500/40 cursor-pointer transition group shadow-xs hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Employees</span>
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-[#1c2033] text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 grid place-items-center">
              <ShieldAlert className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">{totalEmergenciesCount}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">-73%</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div onClick={() => setActiveTab('team')} className="rounded-2xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-4 sm:p-5 hover:border-purple-400 dark:hover:border-purple-500/40 cursor-pointer transition group shadow-xs hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Companies / Sales</span>
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-[#1c2033] text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 grid place-items-center">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">227</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">-100%</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div onClick={() => setActiveTab('team')} className="rounded-2xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-4 sm:p-5 hover:border-purple-400 dark:hover:border-purple-500/40 cursor-pointer transition group shadow-xs hover:shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Communities / Agents</span>
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-[#1c2033] text-slate-600 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 grid place-items-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">{totalStaffCount}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">+0%</span>
          </div>
        </div>
      </div>

      {/* Hero + Needs you */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-sm transition">
          <div className="absolute top-0 right-1/4 w-96 h-48 bg-purple-500/5 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Total users</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-4xl sm:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">{formattedUserTotal}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    <TrendingUp className="size-3" />
                    <span>+12.4% this period</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Current (Today)</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white block mt-1">0 users</span>
              </div>
            </div>
            <div className="relative h-28 sm:h-32 mt-4 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <path d="M 0 75 Q 15 72 30 78 T 60 76 T 90 20 T 110 78 T 170 78 T 200 78 T 240 35 T 260 78 T 300 76 T 330 68 T 360 80 T 400 80 L 480 80" fill="none" stroke="url(#waveGlow)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />
                <circle cx="480" cy="80" r="6" fill="#a855f7" stroke="#ffffff" strokeWidth="2.5" className="animate-ping opacity-75" />
                <circle cx="480" cy="80" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
                <line x1="480" y1="20" x2="480" y2="80" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-[#1a1d2e] mt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22263a]">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Monthly active</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-0.5">13.8k</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">14.8% of all users</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22263a]">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Daily active</span>
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-0.5">5.2k</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">+8.4% growth</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22263a]">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Stickiness</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white block mt-0.5">28%</span>
              <div className="w-full bg-slate-200 dark:bg-[#24283d] rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-purple-600 dark:bg-purple-500 h-full rounded-full" style={{ width: '28%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Needs you Card */}
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-sm transition">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">Needs you</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pendingEmergencies} items across 1 queues</p>
              </div>
            </div>
            <div className="space-y-2 mt-5">
              <div onClick={() => setActiveTab('emergencies')} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#161826] hover:bg-slate-100 dark:hover:bg-[#1a1d2e] border border-slate-200/80 dark:border-[#22263a] cursor-pointer transition group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 grid place-items-center"><Flag className="size-4" /></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-300">Reported emergencies</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Oldest waiting 7+ Days</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-rose-100 dark:bg-rose-600/30 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-[10px] font-extrabold grid place-items-center">{pendingEmergencies}</span>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white" />
                </div>
              </div>
              <div onClick={() => setActiveTab('scanners')} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#161826] hover:bg-slate-100 dark:hover:bg-[#1a1d2e] border border-slate-200/80 dark:border-[#22263a] cursor-pointer transition group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-slate-200/60 dark:bg-[#1c2033] text-slate-600 dark:text-slate-400 grid place-items-center"><QrCode className="size-4" /></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-300">Unclaimed stickers</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Oldest waiting Today</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-slate-200 dark:bg-[#202438] text-slate-700 dark:text-slate-400 text-[10px] font-bold grid place-items-center">{unclaimedScanners > 0 ? unclaimedScanners : 0}</span>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white" />
                </div>
              </div>
              <div onClick={() => setActiveTab('users')} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#161826] hover:bg-slate-100 dark:hover:bg-[#1a1d2e] border border-slate-200/80 dark:border-[#22263a] cursor-pointer transition group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-slate-200/60 dark:bg-[#1c2033] text-slate-600 dark:text-slate-400 grid place-items-center"><Car className="size-4" /></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-300">Vehicle claim requests</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Oldest waiting Today</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-slate-200 dark:bg-[#202438] text-slate-700 dark:text-slate-400 text-[10px] font-bold grid place-items-center">0</span>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white" />
                </div>
              </div>
              <div onClick={() => setActiveTab('emergencies')} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#161826] hover:bg-slate-100 dark:hover:bg-[#1a1d2e] border border-slate-200/80 dark:border-[#22263a] cursor-pointer transition group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-slate-200/60 dark:bg-[#1c2033] text-slate-600 dark:text-slate-400 grid place-items-center"><ShieldAlert className="size-4" /></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-300">Open tickets</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Oldest waiting Today</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-full bg-slate-200 dark:bg-[#202438] text-slate-700 dark:text-slate-400 text-[10px] font-bold grid place-items-center">0</span>
                  <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white" />
                </div>
              </div>
            </div>
          </div>
          <button type="button" onClick={handleStartTriage} className="w-full mt-6 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d946ef] via-[#9333ea] to-[#6366f1] hover:from-[#c026d3] hover:to-[#4f46e5] text-white font-extrabold text-sm shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-[0.99] transition">
            <span>Start triage</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Activity & Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-sm transition">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Activity</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">42 new users in the last 30 days</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">-27% vs prior period</span>
                </div>
              </div>
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22263a] self-start sm:self-auto">
                {['users', 'scanners', 'emergencies'].map((t) => (
                  <button key={t} type="button" onClick={() => setActivityTab(t)} className={`px-3.5 py-1 rounded-xl text-xs capitalize transition ${activityTab === t ? 'bg-white dark:bg-[#25283d] text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="mt-8 relative h-48 w-full flex flex-col justify-between">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400 dark:text-slate-600">
                <div className="flex items-center gap-2 border-b border-dashed border-slate-200 dark:border-[#1f2335] pb-0.5"><span className="w-5">12</span></div>
                <div className="flex items-center gap-2 border-b border-dashed border-slate-200 dark:border-[#1f2335] pb-0.5"><span className="w-5">9</span></div>
                <div className="flex items-center gap-2 border-b border-dashed border-slate-200 dark:border-[#1f2335] pb-0.5"><span className="w-5">6</span></div>
                <div className="flex items-center gap-2 border-b border-dashed border-slate-200 dark:border-[#1f2335] pb-0.5"><span className="w-5">3</span></div>
                <div className="flex items-center gap-2"><span className="w-5">0</span></div>
              </div>
              <div className="relative z-10 pl-7 h-full flex items-end justify-between gap-1 sm:gap-1.5 pt-4">
                {barChartHeights.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className={`w-full max-w-[14px] rounded-t-sm transition-all duration-300 ${h > 60 ? 'bg-gradient-to-t from-indigo-600 to-purple-500 shadow-xs' : 'bg-slate-200 dark:bg-[#25283e] group-hover:bg-purple-500/50'}`} style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="pl-7 mt-3 flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>31</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-sm transition">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Fleet Distribution</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Where all {totalVehicles} stand right now</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white block">6.1%</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">active fleet</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative size-36 shrink-0 grid place-items-center">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" className="stroke-slate-200 dark:stroke-[#1c2033]" strokeWidth="12" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="12" strokeDasharray="25 214" strokeDashoffset="0" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="12" strokeDasharray="35 204" strokeDashoffset="-25" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="12" strokeDasharray="98 141" strokeDashoffset="-60" fill="none" />
                  <circle cx="50" cy="50" r="38" stroke="#94a3b8" strokeWidth="12" strokeDasharray="80 159" strokeDashoffset="-158" fill="none" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-display font-extrabold text-slate-900 dark:text-white">{totalVehicles}</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">vehicles</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-xs w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-blue-500" /><span className="text-slate-600 dark:text-slate-300">Active & Linked</span></div>
                  <span className="font-bold text-slate-900 dark:text-white">25 <span className="text-slate-400 text-[11px] font-normal">6.1%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-purple-500" /><span className="text-slate-600 dark:text-slate-300">In Transit</span></div>
                  <span className="font-bold text-slate-900 dark:text-white">0 <span className="text-slate-400 text-[11px] font-normal">0%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500" /><span className="text-slate-600 dark:text-slate-300">Verified</span></div>
                  <span className="font-bold text-slate-900 dark:text-white">60 <span className="text-slate-400 text-[11px] font-normal">14.6%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-rose-500" /><span className="text-slate-600 dark:text-slate-300">Reported</span></div>
                  <span className="font-bold text-slate-900 dark:text-white">169 <span className="text-slate-400 text-[11px] font-normal">41%</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-slate-400" /><span className="text-slate-600 dark:text-slate-300">Other</span></div>
                  <span className="font-bold text-slate-900 dark:text-white">158 <span className="text-slate-400 text-[11px] font-normal">38.3%</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ✅ User Growth + Sales Overview — Full width row         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Growth */}
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-6 sm:p-7 shadow-xs hover:shadow-sm transition">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">User Growth</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total user growth over the last 12 months</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <TrendingUp className="size-3" />
              +18.6%
            </span>
          </div>
          <div className="mt-6 relative h-48 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="userGrowthStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={20 + i * 35} x2="500" y2={20 + i * 35} stroke="currentColor" className="text-slate-200 dark:text-[#1f2335]" strokeDasharray="3 3" strokeWidth="1" />
              ))}
              <path d="M 0 130 L 40 120 L 85 125 L 130 100 L 175 108 L 220 80 L 265 88 L 310 55 L 355 62 L 400 35 L 445 42 L 490 20 L 490 150 L 0 150 Z" fill="url(#userGrowthFill)" />
              <path d="M 0 130 L 40 120 L 85 125 L 130 100 L 175 108 L 220 80 L 265 88 L 310 55 L 355 62 L 400 35 L 445 42 L 490 20" fill="none" stroke="url(#userGrowthStroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>

        {/* Sales Overview */}
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-6 sm:p-7 shadow-xs hover:shadow-sm transition">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales Overview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly revenue across the year</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <IndianRupee className="size-3" />
              ₹12.4L
            </span>
          </div>
          <div className="mt-6 relative h-48 w-full flex items-end justify-between gap-2">
            {[30, 45, 25, 70, 55, 85, 60, 75, 90, 65, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div className="w-full max-w-[22px] rounded-t-md bg-gradient-to-t from-indigo-600 to-purple-500 transition-all duration-300 group-hover:from-indigo-500 group-hover:to-purple-400" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ✅ Latest on GadiRaksha — FULL WIDTH & attractive table   */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/90 dark:border-[#1f2336] p-6 sm:p-7 shadow-xs hover:shadow-sm transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Latest on GadiRaksha</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Most recent activity across users, scanners & emergencies</p>
          </div>
          <button type="button" onClick={() => setActiveTab('users')} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 transition self-start sm:self-auto">
            <span>View all users</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 mt-5 p-1 rounded-2xl bg-slate-100 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22263a] overflow-x-auto">
          {[
            { id: 'users', label: 'Users' },
            { id: 'scanners', label: 'Scanners' },
            { id: 'staff', label: 'Staff' },
            { id: 'emergencies', label: 'Emergencies' }
          ].map((t) => (
            <button key={t.id} type="button" onClick={() => setLatestTab(t.id)} className={`px-3.5 py-1 rounded-xl text-xs transition whitespace-nowrap ${latestTab === t.id ? 'bg-white dark:bg-[#25283d] text-slate-900 dark:text-white font-bold shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Full-width spacious table */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 dark:border-[#1f2335]">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead className="bg-slate-50 dark:bg-[#161826]">
              <tr className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#1f2335]">
                <th className="py-3.5 px-5">USER</th>
                <th className="py-3.5 px-5">EMAIL / CONTACT</th>
                <th className="py-3.5 px-5">STATUS</th>
                <th className="py-3.5 px-5 text-right">JOINED</th>
                <th className="py-3.5 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1a1d2e] text-slate-700 dark:text-slate-300">
              {users.slice(0, 8).map((u, idx) => {
                const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UR';
                const handle = `@${(u.name || 'user').toLowerCase().replace(/\s+/g, '_')}_${idx + 10}`;
                const isBlocked = u.status === 'BLOCKED' || u.isActive === false;
                return (
                  <tr key={u._id || idx} className="hover:bg-slate-50 dark:hover:bg-[#161826]/70 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-slate-900 text-white dark:bg-[#1e2235] dark:text-white font-bold text-[12px] grid place-items-center shrink-0 border border-slate-700 dark:border-[#2a2e47]">
                          {initials}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">{u.name || 'Vehicle Owner'}</span>
                          <span className="text-[11px] text-slate-400 font-mono block">{handle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400">
                      {u.email || `+91 ${u.phone || '9821000000'}`}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isBlocked
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                      }`}>
                        <span className={`size-1.5 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        {isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-slate-400 text-[12px]">Oct {24 - idx * 2}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        aria-label="View user"
                        title="View user"
                        className="inline-flex items-center justify-center size-9 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-black dark:hover:bg-[#111] transition shadow-xs"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}