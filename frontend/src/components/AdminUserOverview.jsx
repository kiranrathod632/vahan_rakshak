import React, { useState } from 'react';
import {
  Users,
  Car,
  UserCheck,
  UserX,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Eye,
  Plus,
  Search,
  PieChart as PieIcon
} from 'lucide-react';

export default function AdminUserOverview({
  users = [],
  vehicles = [],
  stats,
  onSwitchSubTab,
  onAddUser
}) {
  const [chartType, setChartType] = useState('donut'); // 'donut' | 'pie'
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(3);

  const totalUsersCount = users.length > 0 ? users.length : 382;
  const activeUsersCount = users.filter(u => u.status === 'ACTIVE' || u.isActive !== false).length || Math.round(totalUsersCount * 0.98);
  const blockedUsersCount = totalUsersCount - activeUsersCount;
  const totalVehiclesCount = vehicles.length > 0 ? vehicles.length : 412;
  const activeRate = Math.round((activeUsersCount / totalUsersCount) * 100) || 98;

  // 4 Top KPI Cards strictly matching ENLAZ SaaS aesthetic
  const kpiCards = [
    {
      id: 'total_users',
      title: 'Total Users Registered',
      value: `${totalUsersCount}`,
      change: '+45.5%',
      isPositive: true,
      subtitle: 'Vehicle owners on platform',
      icon: Users,
      iconBoxBg: 'bg-purple-100/70 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/30'
    },
    {
      id: 'active_users',
      title: 'Active Vehicle Owners',
      value: `${activeUsersCount}`,
      change: '+42.1%',
      isPositive: true,
      subtitle: `${activeRate}% active accounts`,
      icon: UserCheck,
      iconBoxBg: 'bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/30'
    },
    {
      id: 'fleet',
      title: 'Protected Fleet Vehicles',
      value: `${totalVehiclesCount}`,
      change: '+18.4%',
      isPositive: true,
      subtitle: 'Cars & bikes linked with QR',
      icon: Car,
      iconBoxBg: 'bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30'
    },
    {
      id: 'emergency_verified',
      title: 'Emergency Contact Verified',
      value: '100%',
      change: '+0.0%',
      isPositive: true,
      subtitle: 'Ready for emergency SOS dispatch',
      icon: ShieldCheck,
      iconBoxBg: 'bg-amber-100/70 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/30'
    }
  ];

  // 6-Month User & Fleet Growth Trends Data (May to October)
  const growthTrends = [
    { month: 'May', users: 15, vehicles: 18, x: 55, yUser: 182, yVeh: 178 },
    { month: 'Jun', users: 32, vehicles: 35, x: 155, yUser: 168, yVeh: 162 },
    { month: 'Jul', users: 48, vehicles: 54, x: 255, yUser: 155, yVeh: 148 },
    { month: 'Aug', users: 185, vehicles: 198, x: 355, yUser: 35, yVeh: 25 },
    { month: 'Sep', users: 64, vehicles: 69, x: 455, yUser: 142, yVeh: 135 },
    { month: 'Oct', users: 38, vehicles: 42, x: 555, yUser: 164, yVeh: 158 }
  ];

  // Spline Path Generator
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
  const vehLineSplineD = generateSplinePath(growthTrends, 'yVeh');

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans">
      
      {/* ========================================================= */}
      {/* 1. TOP ROW: 4 ENLAZ-STYLE KPI CARDS                      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {kpi.title}
                </span>
                <div className={`size-11 rounded-2xl grid place-items-center ${kpi.iconBoxBg}`}>
                  <Icon className="size-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {kpi.value}
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
      {/* 2. MAIN 2-COLUMN SPLIT: USER GROWTH TRENDS + PAYCHART     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: USER & FLEET GROWTH TRENDS (68% width on lg) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  User & Vehicle Fleet Growth Trends
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Monthly registered vehicle owners & on-road fleet onboarding (last 6 months)
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold self-start sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#8b5cf6]" />
                  <span className="text-slate-600 dark:text-slate-300">Registered Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#3b82f6]" />
                  <span className="text-slate-600 dark:text-slate-300">Fleet Vehicles</span>
                </div>
              </div>
            </div>

            {/* Stat Headline */}
            <div className="mt-5 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
                {totalUsersCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">registered users</span>
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white ml-4">
                {totalVehiclesCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">vehicles · {activeRate}% active</span>
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
                        <span className="text-slate-400">Users Onboarded:</span>
                        <strong className="text-purple-300">{growthTrends[hoveredMonthIdx].users}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">Vehicles Added:</span>
                        <strong className="text-blue-400">{growthTrends[hoveredMonthIdx].vehicles}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis dashed grid lines & labels */}
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

                {/* Spline Area Fill */}
                <path d={userAreaSplineD} fill="url(#userGrowthGrad)" className="transition-all duration-300" />

                {/* Smooth User Purple Line */}
                <path
                  d={userLineSplineD}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-sm transition-all duration-300"
                />

                {/* Smooth Vehicle Blue Line */}
                <path
                  d={vehLineSplineD}
                  fill="none"
                  stroke="#3b82f6"
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
                      <circle cx={pt.x} cy={pt.yUser} r="20" fill="transparent" />
                      <circle
                        cx={pt.x}
                        cy={pt.yUser}
                        r={isHovered ? 6 : (isPeak ? 5 : 4)}
                        fill="#8b5cf6"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="transition-all duration-200 drop-shadow-sm"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.yVeh}
                        r={isHovered ? 5 : 3.5}
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-200"
                      />
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

        {/* RIGHT COLUMN: USER & FLEET STATUS PAYCHART (32% width on lg) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  User Account Status
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Platform access & standing
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white block leading-tight">
                  {activeRate}%
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                  active standing
                </span>
              </div>
            </div>

            {/* Toggle Switch between Donut and Solid Pie */}
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

            {/* Clean SVG Paychart */}
            <div className="mt-5 flex flex-col items-center justify-center">
              <div className="relative size-48 shrink-0 grid place-items-center">
                {chartType === 'donut' ? (
                  <>
                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="37"
                        className="stroke-slate-100 dark:stroke-[#1b1e2e]"
                        strokeWidth="13"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="37"
                        stroke="#15803d"
                        strokeWidth="13"
                        strokeDasharray="227 232"
                        strokeDashoffset="0"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="37"
                        stroke="#dc2626"
                        strokeWidth="13"
                        strokeDasharray="5 232"
                        strokeDashoffset="-227"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">
                        {totalUsersCount}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                        users
                      </span>
                    </div>
                  </>
                ) : (
                  <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                    <path
                      d="M 50 50 L 50 5 A 45 45 0 1 1 45 5.3 Z"
                      fill="#15803d"
                      className="hover:opacity-90 transition-opacity"
                    />
                    <path
                      d="M 50 50 L 45 5.3 A 45 45 0 0 1 50 5 Z"
                      fill="#dc2626"
                      className="hover:opacity-90 transition-opacity"
                    />
                  </svg>
                )}
              </div>

              {/* Bottom Dot Legend */}
              <div className="mt-8 flex items-center justify-center gap-6 text-xs w-full">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#15803d]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    Active <strong className="text-slate-900 dark:text-white font-bold">{activeUsersCount}</strong>{' '}
                    <span className="text-slate-400 text-[11px] font-normal">({activeRate}%)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#dc2626]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    Blocked <strong className="text-slate-900 dark:text-white font-bold">{blockedUsersCount}</strong>{' '}
                    <span className="text-slate-400 text-[11px] font-normal">({100 - activeRate}%)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. QUICK NAVIGATION TILES                                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onSwitchSubTab('users')}
          className="p-5 rounded-2xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] hover:border-purple-300 dark:hover:border-purple-500/40 text-left transition group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 grid place-items-center">
              <Users className="size-4" />
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white block">
            All Users Directory
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Browse {totalUsersCount} registered user accounts
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSwitchSubTab('vehicles')}
          className="p-5 rounded-2xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] hover:border-purple-300 dark:hover:border-purple-500/40 text-left transition group shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 grid place-items-center">
              <Car className="size-4" />
            </div>
            <ArrowRight className="size-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white block">
            All Vehicles Fleet
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Inspect {totalVehiclesCount} QR-protected vehicles
          </span>
        </button>

        <button
          type="button"
          onClick={onAddUser}
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-left transition group shadow-md shadow-purple-600/20 hover:opacity-95"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="size-9 rounded-xl bg-white/20 text-white grid place-items-center">
              <Plus className="size-5" />
            </div>
            <ArrowRight className="size-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </div>
          <span className="font-bold text-sm block">
            Register New User
          </span>
          <span className="text-xs text-purple-100 mt-0.5 block">
            Onboard user and bind pre-printed QR sticker
          </span>
        </button>
      </div>

    </div>
  );
}
