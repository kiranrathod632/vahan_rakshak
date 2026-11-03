import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  QrCode,
  TrendingUp,
  IndianRupee,
  Calendar,
  BarChart3,
  Briefcase,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Flame,
  Target
} from 'lucide-react';

export default function AdminTeamDashboard({
  displayTeam = [],
  totalStaffCount = 12,
  activeStaffCount = 11,
  blockedStaffCount = 1,
  totalStaffSales = 482,
  totalStaffCommission = 48200,
  onAddStaff
}) {
  const [period, setPeriod] = useState('weekly'); // 'weekly' | 'monthly' | 'yearly'
  const [metricMode, setMetricMode] = useState('sales'); // 'sales' | 'commission'
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [chartType, setChartType] = useState('donut'); // 'donut' | 'pie'

  const activeRate = Math.round((activeStaffCount / (totalStaffCount || 1)) * 100) || 92;

  // 1. Weekly Data (Past 7 Days across team)
  const weeklyData = [
    { label: 'Wed', date: '28 Oct', sales: 14, commission: 1400 },
    { label: 'Thu', date: '29 Oct', sales: 22, commission: 2200 },
    { label: 'Fri', date: '30 Oct', sales: 18, commission: 1800 },
    { label: 'Sat', date: '31 Oct', sales: 35, commission: 3500 },
    { label: 'Sun', date: '1 Nov', sales: 8, commission: 800 },
    { label: 'Mon', date: '2 Nov', sales: 26, commission: 2600 },
    { label: 'Tue', date: '3 Nov', sales: 31, commission: 3100, isToday: true }
  ];

  // 2. Monthly Data (4 Weeks of Current Month)
  const monthlyData = [
    { label: 'Week 1', date: '1-7 Oct', sales: 98, commission: 9800, target: 120 },
    { label: 'Week 2', date: '8-14 Oct', sales: 125, commission: 12500, target: 120 },
    { label: 'Week 3', date: '15-21 Oct', sales: 110, commission: 11000, target: 120 },
    { label: 'Week 4', date: '22-31 Oct', sales: 149, commission: 14900, target: 120, isCurrent: true }
  ];

  // 3. Yearly Data (12 Months of 2026)
  const yearlyData = [
    { label: 'Jan', sales: 180, commission: 18000 },
    { label: 'Feb', sales: 210, commission: 21000 },
    { label: 'Mar', sales: 245, commission: 24500 },
    { label: 'Apr', sales: 290, commission: 29000 },
    { label: 'May', sales: 320, commission: 32000 },
    { label: 'Jun', sales: 380, commission: 38000 },
    { label: 'Jul', sales: 410, commission: 41000 },
    { label: 'Aug', sales: 520, commission: 52000 },
    { label: 'Sep', sales: 460, commission: 46000 },
    { label: 'Oct', sales: 482, commission: 48200, isCurrent: true },
    { label: 'Nov', sales: 0, commission: 0 },
    { label: 'Dec', sales: 0, commission: 0 }
  ];

  // Selected dataset
  let activeList = weeklyData;
  let periodTitle = 'Past 7 Days Daily Team Sales';
  if (period === 'monthly') {
    activeList = monthlyData;
    periodTitle = 'Monthly 4-Week Breakdown';
  } else if (period === 'yearly') {
    activeList = yearlyData.slice(0, 10); // Jan to Oct
    periodTitle = '12 Months Annual Performance';
  }

  const periodTotalSales = activeList.reduce((acc, it) => acc + (it.sales || 0), 0);
  const periodTotalCommission = activeList.reduce((acc, it) => acc + (it.commission || 0), 0);

  // SVG Chart Dimensions
  const chartW = 600;
  const chartH = 220;
  const padL = 40;
  const padR = 25;
  const padT = 25;
  const padB = 35;
  const drawW = chartW - padL - padR;
  const drawH = chartH - padT - padB;
  const zeroY = padT + drawH;

  const rawValues = activeList.map(it => metricMode === 'commission' ? it.commission : it.sales);
  const maxVal = Math.max(...rawValues, 1);
  const maxAxisVal = Math.max(Math.ceil(maxVal * 1.2), 10);

  const colW = drawW / (activeList.length || 1);
  const points = activeList.map((item, idx) => {
    const val = metricMode === 'commission' ? item.commission : item.sales;
    const h = (val / maxAxisVal) * drawH;
    const centerX = padL + idx * colW + colW / 2;
    const centerY = zeroY - h;
    return {
      item,
      val,
      centerX,
      centerY,
      barX: centerX - 14,
      barY: centerY,
      barW: 28,
      barH: Math.max(h, 4),
      isHighlighted: item.isToday || item.isCurrent
    };
  });

  // Spline Path
  const splinePath = points.length > 1
    ? points.reduce((acc, p, i, arr) => {
        if (i === 0) return `M ${p.centerX} ${p.centerY}`;
        const prev = arr[i - 1];
        const cpX1 = prev.centerX + (p.centerX - prev.centerX) / 2;
        const cpY1 = prev.centerY;
        const cpX2 = prev.centerX + (p.centerX - prev.centerX) / 2;
        const cpY2 = p.centerY;
        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.centerX} ${p.centerY}`;
      }, '')
    : null;

  const areaPath = splinePath && points.length > 1
    ? `${splinePath} L ${points[points.length - 1].centerX} ${zeroY} L ${points[0].centerX} ${zeroY} Z`
    : null;

  const activeHoverItem = hoveredIdx !== null ? points[hoveredIdx] : null;

  // Top 3 Performing Agents from displayTeam
  const topAgents = [...displayTeam]
    .sort((a, b) => (b.totalSalesCount || 0) - (a.totalSalesCount || 0))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 1. TOP ROW: 4 ENLAZ-STYLE KPI CARDS FOR TEAM             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Staff */}
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Total Staff Members
            </span>
            <div className="size-11 rounded-2xl grid place-items-center bg-purple-100/70 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/30">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                {totalStaffCount}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                +{activeStaffCount} Active
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
              Sales, support & field operations
            </p>
          </div>
        </div>

        {/* Card 2: Active Field Agents */}
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Active Field Staff
            </span>
            <div className="size-11 rounded-2xl grid place-items-center bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/30">
              <UserCheck className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {activeStaffCount}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                {activeRate}% On Duty
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
              Staff actively onboarding users
            </p>
          </div>
        </div>

        {/* Card 3: Total Team QR Sales */}
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Total Team QR Sales
            </span>
            <div className="size-11 rounded-2xl grid place-items-center bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30">
              <QrCode className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                {totalStaffSales || 482}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                +18.5% Growth
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
              Stickers activated by sales team
            </p>
          </div>
        </div>

        {/* Card 4: Total Commission Disbursed */}
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Team Incentive Disbursed
            </span>
            <div className="size-11 rounded-2xl grid place-items-center bg-amber-100/70 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/30">
              <IndianRupee className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                ₹{(totalStaffCommission || 48200).toLocaleString('en-IN')}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                ₹100/QR Avg
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
              Total commission paid to staff
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN SPLIT: TEAM SALES GRAPH + DUTY PAYCHART  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: TEAM SALES GROWTH TREND GRAPH (68% width on lg) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  Team Sales & Growth Trends
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {periodTitle} across {totalStaffCount} staff members
                </p>
              </div>

              {/* Time Switcher Pills */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22263a] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPeriod('weekly')}
                    className={`px-3 py-1 rounded-lg transition ${
                      period === 'weekly'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('monthly')}
                    className={`px-3 py-1 rounded-lg transition ${
                      period === 'monthly'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('yearly')}
                    className={`px-3 py-1 rounded-lg transition ${
                      period === 'yearly'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Yearly
                  </button>
                </div>

                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22263a] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMetricMode('sales')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      metricMode === 'sales'
                        ? 'bg-white dark:bg-[#25283d] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    QRs
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricMode('commission')}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      metricMode === 'commission'
                        ? 'bg-white dark:bg-[#25283d] text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    ₹
                  </button>
                </div>
              </div>
            </div>

            {/* Stat Headline */}
            <div className="mt-5 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
                {periodTotalSales}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">QR scanners sold</span>
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white ml-4">
                ₹{periodTotalCommission.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">incentive earned · 92% active</span>
            </div>

            {/* Spline Area Chart Canvas */}
            <div className="mt-6 relative h-60 sm:h-64 w-full">
              
              {/* Tooltip Overlay */}
              {activeHoverItem && (
                <div
                  className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
                  style={{
                    left: `${(activeHoverItem.centerX / chartW) * 100}%`,
                    top: `${(activeHoverItem.centerY / chartH) * 100}%`,
                    marginTop: '-10px'
                  }}
                >
                  <div className="bg-slate-900/95 dark:bg-[#181a29]/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/80 text-xs backdrop-blur-md whitespace-nowrap">
                    <div className="font-bold text-purple-300 border-b border-slate-700 pb-1 mb-1">
                      {activeHoverItem.item.label} {activeHoverItem.item.date ? `(${activeHoverItem.item.date})` : '2026'}:
                    </div>
                    <div className="space-y-0.5 font-mono text-[11px]">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Team QR Sales:</span>
                        <strong className="text-purple-300">{activeHoverItem.item.sales} QRs</strong>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Commission:</span>
                        <strong className="text-emerald-400">₹{(activeHoverItem.item.commission || 0).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="teamSplineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.32" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="teamBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>

                {/* Y-Axis dashed grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const yPos = zeroY - ratio * drawH;
                  const value = Math.round(ratio * maxAxisVal);
                  return (
                    <g key={idx}>
                      <line
                        x1={padL}
                        y1={yPos}
                        x2={chartW - padR}
                        y2={yPos}
                        stroke="currentColor"
                        className="text-slate-100 dark:text-[#1e2235]"
                        strokeDasharray={ratio === 0 ? "none" : "4 4"}
                        strokeWidth="1"
                      />
                      <text
                        x={padL - 8}
                        y={yPos + 4}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-medium"
                      >
                        {metricMode === 'commission' ? `₹${value}` : value}
                      </text>
                    </g>
                  );
                })}

                {/* Smooth Spline Area Fill */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill="url(#teamSplineGrad)"
                    className="transition-all duration-300"
                  />
                )}

                {/* Smooth Spline Line */}
                {splinePath && (
                  <path
                    d={splinePath}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="transition-all duration-300 drop-shadow-sm"
                  />
                )}

                {/* Points and Bars */}
                {points.map((p, idx) => {
                  const isHovered = hoveredIdx === idx;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <rect
                        x={padL + idx * colW}
                        y={padT}
                        width={colW}
                        height={drawH + padB}
                        fill="transparent"
                      />
                      <rect
                        x={p.barX}
                        y={p.barY}
                        width={p.barW}
                        height={p.barH}
                        rx="6"
                        ry="6"
                        fill="url(#teamBarGrad)"
                        opacity={isHovered ? 1 : 0.8}
                        className="transition-all duration-200"
                      />
                      <circle
                        cx={p.centerX}
                        cy={p.centerY}
                        r={isHovered ? 5.5 : 3.5}
                        fill="#8b5cf6"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={p.centerX}
                        y={zeroY + 16}
                        textAnchor="middle"
                        className={`text-[11px] font-bold ${
                          p.isHighlighted ? 'fill-purple-600 dark:fill-purple-400' : 'fill-slate-600 dark:fill-slate-400'
                        }`}
                      >
                        {p.item.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TEAM DUTY STATUS PAYCHART / PIE CHART (32% width on lg) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  Team Duty Status
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Current staff presence & activity
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white block leading-tight">
                  {activeRate}%
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                  on duty now
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
              <div className="relative size-44 shrink-0 grid place-items-center">
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
                        strokeDasharray="213 232"
                        strokeDashoffset="0"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="37"
                        stroke="#b45309"
                        strokeWidth="13"
                        strokeDasharray="19 232"
                        strokeDashoffset="-213"
                        fill="none"
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-3xl font-display font-black text-slate-900 dark:text-white leading-none">
                        {totalStaffCount}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                        team members
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                      <path
                        d="M 50 50 L 50 5 A 45 45 0 1 1 25.7 87.8 Z"
                        fill="#15803d"
                        className="hover:opacity-90 transition-opacity"
                      />
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
              <div className="mt-6 flex items-center justify-center gap-6 text-xs w-full">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#15803d]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    Active <strong className="text-slate-900 dark:text-white font-bold">{activeStaffCount}</strong> ({activeRate}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#b45309]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    Leave <strong className="text-slate-900 dark:text-white font-bold">{blockedStaffCount || 1}</strong> ({100 - activeRate}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. TOP PERFORMING FIELD AGENTS MINI STRIP                 */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="size-5 text-amber-500" />
            <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Top Performing Field Sales Agents
            </h4>
          </div>
          <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
            Leading Sales & QR Conversions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topAgents.map((ag, idx) => {
            const initials = ag.name ? ag.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AG';
            return (
              <div
                key={ag._id || idx}
                className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] flex items-center justify-between transition hover:border-purple-300"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-bold text-xs grid place-items-center shadow-xs">
                    {initials}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {ag.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {ag.department || 'Field Sales'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400 block">
                    {ag.totalSalesCount || 18} QRs
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ₹{((ag.totalSalesCount || 18) * 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
