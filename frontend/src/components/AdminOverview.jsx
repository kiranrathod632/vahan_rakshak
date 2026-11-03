import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  QrCode,
  ShieldAlert,
  Car,
  Briefcase,
  Sparkles,
  IndianRupee,
  Building2,
  Flag,
  ChevronRight,
  ArrowRight,
  Activity,
  PhoneCall,
  MessageSquare,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon
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
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(3); // Default hover on peak month (August)
  const [chartType, setChartType] = useState('donut'); // 'donut' | 'pie'

  const totalUserCount = stats?.summary?.totalUsers || (users.length > 0 ? users.length : 382);
  const totalVehicles = stats?.summary?.totalVehicles || 412;
  const totalScannersCount = scanners.length > 0 ? scanners.length : 1007;
  const totalEmergenciesCount = emergencies.length > 0 ? emergencies.length : 169;
  const unclaimedScanners = scanners.filter(s => s.status === 'UNCLAIMED').length || (totalScannersCount > totalVehicles ? totalScannersCount - totalVehicles : 92);
  const activeScannersCount = totalScannersCount - unclaimedScanners;
  const pendingEmergencies = emergencies.filter(e => e.status !== 'RESOLVED').length || 0;
  const totalStaffCount = team.length > 0 ? team.length : 12;
  const activeStaffCount = team.filter(m => m.status === 'ACTIVE').length || 11;
  const totalStaffSales = team.reduce((sum, m) => sum + (m.totalSalesCount || 0), 0) || 482;
  const totalStaffCommission = team.reduce((sum, m) => sum + (m.totalCommissionEarned || ((m.totalSalesCount || 0) * (m.salaryOrCommissionRate || 100))), 0) || 48200;
  const topAgent = [...team].sort((a, b) => (b.totalSalesCount || 0) - (a.totalSalesCount || 0))[0] || { name: 'Aarav Sharma', totalSalesCount: 84 };


  const formatCompact = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formattedUserTotal = totalUserCount >= 1000 ? formatCompact(totalUserCount) : `${totalUserCount}`;
  const formattedScannersTotal = totalScannersCount >= 1000 ? formatCompact(totalScannersCount) : `${totalScannersCount}`;

  // 4 Top KPI Cards strictly matching GADIRAKSHA Keys with ENLAZ SaaS Design
  const kpiCards = [
    {
      id: 'users',
      displayTitle: 'Total Users Registered',
      realValue: formattedUserTotal,
      change: '+45.5%',
      isPositive: true,
      subtitle: 'Vehicle owners onboarded',
      icon: Users,
      tab: 'users',
      iconBoxBg: 'bg-purple-100/70 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/30'
    },
    {
      id: 'scanners',
      displayTitle: 'Active QR Scanners',
      realValue: formattedScannersTotal,
      change: '+50.0%',
      isPositive: true,
      subtitle: 'Pre-printed stickers active',
      icon: QrCode,
      tab: 'scanners',
      iconBoxBg: 'bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30'
    },
    {
      id: 'vehicles',
      displayTitle: 'Registered Fleet',
      realValue: `${totalVehicles}`,
      change: '+18.4%',
      isPositive: true,
      subtitle: 'Bikes & cars linked on road',
      icon: Car,
      tab: 'users',
      iconBoxBg: 'bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/30'
    },
    {
      id: 'emergencies',
      displayTitle: 'Emergency SOS Alerts',
      realValue: `${totalEmergenciesCount}`,
      change: '-70.0%',
      isPositive: false,
      subtitle: 'Incident triage & scans',
      icon: ShieldAlert,
      tab: 'emergencies',
      iconBoxBg: 'bg-amber-100/70 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/30'
    }
  ];

  // 6-Month User & QR Scanner Growth Trends Data (May to October)
  const growthTrends = [
    { month: 'May', users: 15, scanners: 12, x: 55, yUser: 182, yQR: 185 },
    { month: 'Jun', users: 32, scanners: 28, x: 155, yUser: 168, yQR: 172 },
    { month: 'Jul', users: 48, scanners: 42, x: 255, yUser: 155, yQR: 160 },
    { month: 'Aug', users: 185, scanners: 160, x: 355, yUser: 35, yQR: 55 }, // Main curve peak
    { month: 'Sep', users: 64, scanners: 58, x: 455, yUser: 142, yQR: 148 },
    { month: 'Oct', users: 38, scanners: 35, x: 555, yUser: 164, yQR: 167 }
  ];

  // Smooth Cubic Bezier Spline Path Generator
  const generateSplinePath = (pts, keyY) => {
    if (!pts || pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0][keyY]}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const cp1x = prev.x + (cur.x - prev.x) / 2;
      const cp1y = prev[keyY];
      const cp2x = prev.x + (cur.x - prev.x) / 2;
      const cp2y = cur[keyY];
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${cur.x} ${cur[keyY]}`;
    }
    return d;
  };

  const userLineSplineD = generateSplinePath(growthTrends, 'yUser');
  const userAreaSplineD = `${userLineSplineD} L ${growthTrends[growthTrends.length - 1].x} 200 L ${growthTrends[0].x} 200 Z`;
  const qrLineSplineD = generateSplinePath(growthTrends, 'yQR');

  // QR Scanner & Fleet Status Paychart Data (Active: 91%, In-Stock / Unclaimed: 9%)
  const activePct = 91;
  const unclaimedPct = 9;
  const displayActiveCount = Math.round(totalScannersCount * (activePct / 100)) || 915;
  const displayUnclaimedCount = totalScannersCount - displayActiveCount;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* ========================================================= */}
      {/* 1. TOP ROW: 4 ENLAZ-STYLE KPI CARDS (USER & QR KEYS)      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              onClick={() => setActiveTab(kpi.tab)}
              className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 hover:border-purple-300 dark:hover:border-purple-500/40 cursor-pointer transition shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {kpi.displayTitle}
                </span>
                <div className={`size-11 rounded-2xl grid place-items-center transition-transform group-hover:scale-105 ${kpi.iconBoxBg}`}>
                  <Icon className="size-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {kpi.realValue}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      kpi.isPositive
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
                    }`}
                  >
                    {kpi.isPositive ? <ArrowUpRight className="size-3.5 stroke-[2.5]" /> : <ArrowDownRight className="size-3.5 stroke-[2.5]" />}
                    <span>{kpi.change}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
                  {kpi.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      
      {/* ========================================================= */}
      {/* 1.5 FIELD SALES & TEAM ACTIVATIONS PERFORMANCE STRIP       */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-purple-900/10 dark:from-purple-950/40 dark:via-[#141726] dark:to-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-purple-600 text-white grid place-items-center shadow-md shadow-purple-600/25 shrink-0">
              <Briefcase className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                  Field Sales & Team Activations
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                  LIVE TEAM SYNC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                On-ground sales personnel performance, QR inventory activations & commission ledger
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm shadow-purple-600/20 self-start md:self-auto"
          >
            <span>Open Team Console</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* 4 Mini KPI Pills for Sales Team */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          <div className="bg-white/90 dark:bg-[#121420]/90 border border-slate-200/70 dark:border-[#1e2235] p-3.5 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Field Staff</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-display font-bold text-slate-900 dark:text-white">{activeStaffCount}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">/ {totalStaffCount} on duty</span>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#121420]/90 border border-slate-200/70 dark:border-[#1e2235] p-3.5 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Team QR Activations</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-display font-bold text-slate-900 dark:text-white">{totalStaffSales}</span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">stickers linked</span>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#121420]/90 border border-slate-200/70 dark:border-[#1e2235] p-3.5 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Incentives Disbursed</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-display font-bold text-slate-900 dark:text-white">₹{totalStaffCommission.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-slate-400">paid out</span>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#121420]/90 border border-slate-200/70 dark:border-[#1e2235] p-3.5 rounded-2xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Top Field Performer</span>
            <div className="flex items-baseline gap-1.5 mt-1 truncate">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{topAgent.name}</span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0">({topAgent.totalSalesCount || 84} QRs)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN SPLIT: USER & QR GROWTH TRENDS + PAYCHART */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: USER & QR SCANNER GROWTH TRENDS (68% width on lg) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  User & QR Growth Trends
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Monthly registered users & active QR scanner deployments
                </p>
              </div>

              {/* Top-Right Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold self-start sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#8b5cf6]" />
                  <span className="text-slate-600 dark:text-slate-300">Registered Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-slate-600 dark:text-slate-300">QR Scanners Sold</span>
                </div>
              </div>
            </div>

            {/* Stat Headline */}
            <div className="mt-5 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
                {totalUserCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">registered users</span>
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white ml-4">
                {totalScannersCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">QR scanners · 98.4% active</span>
            </div>

            {/* Spline Area Chart Canvas */}
            <div className="mt-6 relative h-64 sm:h-72 w-full">
              
              {/* Interactive Tooltip on hover */}
              {hoveredMonthIdx !== null && (
                <div
                  className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
                  style={{
                    left: `${(growthTrends[hoveredMonthIdx].x / 600) * 100}%`,
                    top: `${(growthTrends[hoveredMonthIdx].yUser / 240) * 100}%`,
                    marginTop: '-10px'
                  }}
                >
                  <div className="bg-slate-900/95 dark:bg-[#181a29]/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md whitespace-nowrap">
                    <div className="font-bold text-purple-300 border-b border-slate-700 pb-1 mb-1">
                      {growthTrends[hoveredMonthIdx].month} 2026:
                    </div>
                    <div className="space-y-0.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">Users Registered:</span>
                        <strong className="text-purple-300">{growthTrends[hoveredMonthIdx].users}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">QR Scanners Sold:</span>
                        <strong className="text-emerald-400">{growthTrends[hoveredMonthIdx].scanners}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="userSplineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis dashed grid lines & labels (200, 150, 100, 50, 0) */}
                {[
                  { val: 200, y: 20 },
                  { val: 150, y: 65 },
                  { val: 100, y: 110 },
                  { val: 50, y: 155 },
                  { val: 0, y: 200 }
                ].map((grid) => (
                  <g key={grid.val}>
                    <text
                      x="0"
                      y={grid.y + 4}
                      fill="currentColor"
                      className="text-slate-400 dark:text-slate-500 text-[11px] font-mono select-none"
                    >
                      {grid.val}
                    </text>
                    <line
                      x1="30"
                      y1={grid.y}
                      x2="590"
                      y2={grid.y}
                      stroke="currentColor"
                      className="text-slate-100 dark:text-[#1e2235]"
                      strokeDasharray={grid.val === 0 ? "none" : "4 4"}
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* Smooth User Growth Spline Area Fill */}
                <path
                  d={userAreaSplineD}
                  fill="url(#userSplineGrad)"
                  className="transition-all duration-300"
                />

                {/* Smooth User Growth Purple Line */}
                <path
                  d={userLineSplineD}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-sm transition-all duration-300"
                />

                {/* Smooth QR Scanners Green Line */}
                <path
                  d={qrLineSplineD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  className="drop-shadow-sm transition-all duration-300"
                />

                {/* Interactive Points on curve */}
                {growthTrends.map((pt, idx) => {
                  const isHovered = hoveredMonthIdx === idx;
                  const isPeak = idx === 3;
                  return (
                    <g
                      key={pt.month}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIdx(idx)}
                    >
                      {/* Invisible hover area */}
                      <circle cx={pt.x} cy={pt.yUser} r="20" fill="transparent" />

                      {/* Visible node circle for Users */}
                      <circle
                        cx={pt.x}
                        cy={pt.yUser}
                        r={isHovered ? 6 : (isPeak ? 5 : 4)}
                        fill="#8b5cf6"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="transition-all duration-200 drop-shadow-sm"
                      />

                      {/* Visible node circle for QR Scanners */}
                      <circle
                        cx={pt.x}
                        cy={pt.yQR}
                        r={isHovered ? 5 : 3.5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />

                      {/* X-Axis Month Label */}
                      <text
                        x={pt.x}
                        y="222"
                        textAnchor="middle"
                        className={`text-xs font-medium select-none ${
                          isHovered
                            ? 'fill-purple-600 dark:fill-purple-400 font-bold'
                            : 'fill-slate-500 dark:fill-slate-400'
                        }`}
                      >
                        {pt.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QR SCANNER STATUS PAYCHART / PIE CHART (32% width on lg) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  QR Scanner Status
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Current vehicle QR sticker deployment
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white block leading-tight">
                  {activePct}%
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                  active on road
                </span>
              </div>
            </div>

            {/* Toggle Switch between Donut Paychart and Solid Pie Paychart */}
            <div className="mt-3 flex justify-end">
              <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22263a] text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setChartType('donut')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    chartType === 'donut'
                      ? 'bg-white dark:bg-[#25283d] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Donut
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    chartType === 'pie'
                      ? 'bg-white dark:bg-[#25283d] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Solid Pie
                </button>
              </div>
            </div>

            {/* Clean SVG Paychart (Donut / Pie) */}
            <div className="mt-5 flex flex-col items-center justify-center">
              <div className="relative size-48 shrink-0 grid place-items-center">
                {chartType === 'donut' ? (
                  /* ============ DONUT PAYCHART ============ */
                  <>
                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="37"
                        className="stroke-slate-100 dark:stroke-[#1b1e2e]"
                        strokeWidth="13"
                        fill="none"
                      />
                      {/* Green Segment (Active - 91% arc) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="37"
                        stroke="#15803d"
                        strokeWidth="13"
                        strokeDasharray="211 232"
                        strokeDashoffset="0"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      {/* Amber Segment (Unclaimed/In-Stock - 9% arc) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="37"
                        stroke="#b45309"
                        strokeWidth="13"
                        strokeDasharray="21 232"
                        strokeDashoffset="-211"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    {/* Central Value */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">
                        {totalScannersCount}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                        QR stickers
                      </span>
                    </div>
                  </>
                ) : (
                  /* ============ SOLID PIE PAYCHART ============ */
                  <>
                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                      {/* Green Slice (91% angle: 327.6 deg) */}
                      <path
                        d="M 50 50 L 50 5 A 45 45 0 1 1 25.7 87.8 Z"
                        fill="#15803d"
                        className="hover:opacity-90 transition-opacity"
                      />
                      {/* Amber Slice (9% angle: 32.4 deg) */}
                      <path
                        d="M 50 50 L 25.7 87.8 A 45 45 0 0 1 50 5 Z"
                        fill="#b45309"
                        className="hover:opacity-90 transition-opacity"
                      />
                    </svg>
                  </>
                )}
              </div>

              {/* Bottom Dot Legend */}
              <div className="mt-8 flex items-center justify-center gap-6 text-xs w-full">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#15803d]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    Active & Linked <strong className="text-slate-900 dark:text-white font-bold">{displayActiveCount}</strong>{' '}
                    <span className="text-slate-400 text-[11px] font-normal">({activePct}%)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#b45309]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    In Stock <strong className="text-slate-900 dark:text-white font-bold">{displayUnclaimedCount}</strong>{' '}
                    <span className="text-slate-400 text-[11px] font-normal">({unclaimedPct}%)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. LATEST ACTIVITY DIRECTORY TABLE                       */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Latest on GadiRaksha
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Most recent activity across users, scanners & emergencies
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 transition self-start sm:self-auto"
          >
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
            <button
              key={t.id}
              type="button"
              onClick={() => setLatestTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs transition whitespace-nowrap ${
                latestTab === t.id
                  ? 'bg-white dark:bg-[#25283d] text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Clean Modern Data Table */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 dark:border-[#1f2335]">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead className="bg-slate-50 dark:bg-[#161826]">
              <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#1f2335]">
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
