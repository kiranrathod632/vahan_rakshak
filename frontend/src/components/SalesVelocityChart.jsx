import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Award,
  Zap,
  CheckCircle2,
  Target,
  IndianRupee,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Users,
  QrCode,
  Briefcase
} from 'lucide-react';

export default function SalesVelocityChart({
  reportPeriod = 'weekly',
  setReportPeriod,
  reportsData,
  metrics = {},
  commissionRate = 100,
  monthlyTarget = 60,
  activeCustomersCount = 10,
  pendingCustomersCount = 1,
  title = "User Registrations & QR Scanners Sales Graphs",
  subtitle = "Interactive trend analysis of customer onboardings, QR scanner activations, and commission growth"
}) {
  // Metric Type: 'users' (User Registrations) | 'stickers' (QR Scanners Sold) | 'revenue' (Incentive Earned)
  const [metricType, setMetricType] = useState('users');
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [chartType, setChartType] = useState('donut'); // 'donut' | 'pie'

  // Normalize Weekly Data (Past 7 Days)
  const rawWeekly = reportsData?.weekly || [];
  const weeklyData = (rawWeekly.length === 7)
    ? rawWeekly
    : [
        { day: 'Wed', date: '2026-10-28', displayDate: '28 Oct', count: 1, commission: commissionRate },
        { day: 'Thu', date: '2026-10-29', displayDate: '29 Oct', count: 2, commission: 2 * commissionRate },
        { day: 'Fri', date: '2026-10-30', displayDate: '30 Oct', count: 0, commission: 0 },
        { day: 'Sat', date: '2026-10-31', displayDate: '31 Oct', count: 3, commission: 3 * commissionRate },
        { day: 'Sun', date: '2026-11-01', displayDate: '1 Nov', count: 0, commission: 0 },
        { day: 'Mon', date: '2026-11-02', displayDate: '2 Nov', count: 2, commission: 2 * commissionRate },
        { day: 'Tue', date: '2026-11-03', displayDate: '3 Nov', count: metrics.todaySales || 3, commission: (metrics.todaySales || 3) * commissionRate }
      ];

  // If server weekly has all 0s but metrics has sales, ensure current day reflects today's sales
  const processedWeekly = weeklyData.map((w, idx) => {
    const isToday = idx === weeklyData.length - 1;
    const finalCount = isToday && w.count === 0 && metrics.todaySales ? metrics.todaySales : w.count;
    return {
      ...w,
      count: finalCount,
      commission: finalCount * commissionRate,
      isToday
    };
  });

  // Normalize Monthly Data (4 Weeks of Month)
  const rawMonthly = reportsData?.monthly || [];
  const monthlyData = (rawMonthly.length > 0)
    ? rawMonthly.map((m, idx) => ({
        ...m,
        label: m.week || `Week ${idx + 1}`,
        target: Math.round(monthlyTarget / 4)
      }))
    : [
        { label: 'Week 1 (1-7)', week: 'Week 1 (1-7)', count: 3, commission: 3 * commissionRate, target: Math.round(monthlyTarget / 4) },
        { label: 'Week 2 (8-14)', week: 'Week 2 (8-14)', count: 4, commission: 4 * commissionRate, target: Math.round(monthlyTarget / 4) },
        { label: 'Week 3 (15-21)', week: 'Week 3 (15-21)', count: 2, commission: 2 * commissionRate, target: Math.round(monthlyTarget / 4) },
        { label: 'Week 4 (22+)', week: 'Week 4 (22+)', count: metrics.todaySales || 3, commission: (metrics.todaySales || 3) * commissionRate, target: Math.round(monthlyTarget / 4) }
      ];

  // Normalize Yearly Data (12 Months of 2026)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const rawYearly = reportsData?.yearly || [];
  const yearlyData = (rawYearly.length === 12)
    ? rawYearly.map(y => ({ ...y, target: y.target || monthlyTarget }))
    : monthNames.map((m, idx) => {
        const isCurrentMonth = idx === 10; // November (0-indexed: 10)
        const count = isCurrentMonth ? (metrics.monthSales || 12) : (idx < 10 ? Math.floor(18 + (idx * 3.2)) : 0);
        return {
          month: m,
          monthIndex: idx + 1,
          count,
          commission: count * commissionRate,
          target: monthlyTarget,
          isCurrentMonth
        };
      });

  // Determine active dataset based on selected period
  let activeList = processedWeekly;
  let periodLabel = 'Weekly Trend (Past 7 Days)';
  let xLabelKey = 'day';
  let subLabelKey = 'displayDate';
  let targetReference = null;

  if (reportPeriod === 'monthly') {
    activeList = monthlyData;
    periodLabel = 'Monthly Breakdown (4 Weeks)';
    xLabelKey = 'label';
    subLabelKey = null;
    targetReference = Math.round(monthlyTarget / 4);
  } else if (reportPeriod === 'yearly') {
    activeList = yearlyData;
    periodLabel = 'Annual Performance (12 Months 2026)';
    xLabelKey = 'month';
    subLabelKey = null;
    targetReference = monthlyTarget;
  }

  // Calculate totals and metrics for current selection
  const periodTotalCount = activeList.reduce((acc, it) => acc + (it.count || 0), 0);
  const periodTotalCommission = activeList.reduce((acc, it) => acc + (it.commission || (it.count * commissionRate)), 0);
  const periodAvg = (periodTotalCount / (activeList.length || 1)).toFixed(1);

  // Chart dimensions & scaling
  const chartW = 680;
  const chartH = 240;
  const padL = 45;
  const padR = 25;
  const padT = 30;
  const padB = 40;
  const drawW = chartW - padL - padR;
  const drawH = chartH - padT - padB;
  const zeroY = padT + drawH;

  const rawValues = activeList.map(it => metricType === 'revenue' ? (it.commission || it.count * commissionRate) : (it.count || 0));
  const maxDataVal = Math.max(...rawValues, targetReference && metricType !== 'revenue' ? targetReference : 0, 1);
  const step = metricType === 'revenue' ? Math.ceil(maxDataVal / 4) : (maxDataVal <= 5 ? 1 : Math.ceil(maxDataVal / 4));
  const maxAxisVal = Math.max(step * 4, maxDataVal * 1.15, metricType === 'revenue' ? 400 : 4);

  // Compute Coordinates for bars and points
  const colW = drawW / activeList.length;
  const barW = activeList.length <= 4 ? 40 : (activeList.length <= 7 ? 28 : 16);

  const points = activeList.map((item, idx) => {
    const val = metricType === 'revenue' ? (item.commission || item.count * commissionRate) : (item.count || 0);
    const h = (val / maxAxisVal) * drawH;
    const centerX = padL + idx * colW + colW / 2;
    const barX = centerX - barW / 2;
    const barY = zeroY - h;
    const isHighlighted = item.isToday || item.isCurrentMonth;
    return {
      item,
      val,
      centerX,
      centerY: barY,
      barX,
      barY,
      barW,
      barH: Math.max(h, 4),
      isHighlighted
    };
  });

  // Generate Smooth Spline Path for Trend Curve
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

  // Target reference line Y position
  const targetY = targetReference && metricType !== 'revenue'
    ? zeroY - (targetReference / maxAxisVal) * drawH
    : null;

  // Color scheme based on metric type
  const metricColor = metricType === 'users'
    ? {
        name: 'User Onboarding',
        badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        stroke: '#3b82f6',
        gradId: 'barGradBlue',
        gradAreaId: 'areaTrendGradBlue',
        activePill: 'bg-white dark:bg-[#25283d] text-blue-600 dark:text-blue-300 shadow-sm font-bold'
      }
    : metricType === 'stickers'
      ? {
          name: 'QR Scanners Sold',
          badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
          stroke: '#8b5cf6',
          gradId: 'barGradPurple',
          gradAreaId: 'areaTrendGradPurple',
          activePill: 'bg-white dark:bg-[#25283d] text-purple-600 dark:text-purple-300 shadow-sm font-bold'
        }
      : {
          name: 'Incentive Earned (₹)',
          badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          stroke: '#10b981',
          gradId: 'barGradEmerald',
          gradAreaId: 'areaTrendGradEmerald',
          activePill: 'bg-white dark:bg-[#25283d] text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
        };

  const activeHoverItem = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 1. TOP CONTROLS & FILTER PILL STRIP                      */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Mode Switcher (Users vs QR Scanners vs Revenue) */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#161826] p-1 border border-slate-200/80 dark:border-[#22253a]">
            <button
              type="button"
              onClick={() => setMetricType('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                metricType === 'users' ? metricColor.activePill : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View user onboarding growth graph"
            >
              <Users className="size-3.5" />
              <span>Users</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricType('stickers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                metricType === 'stickers' ? metricColor.activePill : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View QR scanner activation graph"
            >
              <QrCode className="size-3.5" />
              <span>QRs Sold</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricType('revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                metricType === 'revenue' ? metricColor.activePill : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View commission earned graph"
            >
              <IndianRupee className="size-3.5" />
              <span>Incentive</span>
            </button>
          </div>

          {/* Timeframe Filter (Weekly / Monthly / Yearly) */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#161826] p-1 border border-slate-200/80 dark:border-[#22253a]">
            <button
              type="button"
              onClick={() => setReportPeriod('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                reportPeriod === 'weekly'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="size-3.5" />
              <span>Weekly</span>
            </button>
            <button
              type="button"
              onClick={() => setReportPeriod('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                reportPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="size-3.5" />
              <span>Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => setReportPeriod('yearly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                reportPeriod === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="size-3.5" />
              <span>Yearly (2026)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN 2-COLUMN SPLIT: TREND GRAPH + DONUT RING          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: APPLICATION & SALES TRENDS (68% width on lg) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  User & QR Sales Trends
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {periodLabel} — {metricColor.name}
                </p>
              </div>

              {/* Top-Right Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold self-start sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: metricColor.stroke }} />
                  <span className="text-slate-600 dark:text-slate-300">{metricColor.name}</span>
                </div>
                {targetY && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400 font-mono">Target ({targetReference})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stat Headline */}
            <div className="mt-5 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
                {periodTotalCount}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {metricType === 'revenue' ? 'incentive units' : (metricType === 'users' ? 'users registered' : 'stickers sold')}
              </span>
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white ml-4">
                ₹{periodTotalCommission.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">earned · 91% active</span>
            </div>

            {/* SVG Spline & Bars Canvas matching ENLAZ */}
            <div className="mt-6 relative h-56 sm:h-64 w-full">
              {/* Tooltip Overlay */}
              {activeHoverItem && (
                <div
                  className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150"
                  style={{
                    left: `${(activeHoverItem.centerX / chartW) * 100}%`,
                    top: `${(activeHoverItem.centerY / chartH) * 100}%`,
                    marginTop: '-12px'
                  }}
                >
                  <div className="bg-slate-900/95 dark:bg-[#181a29]/95 text-white p-2.5 rounded-xl shadow-2xl border border-slate-700/80 dark:border-[#2f344e] text-xs backdrop-blur-md min-w-[140px]">
                    <div className="font-bold text-[11px] text-purple-300 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between">
                      <span>{activeHoverItem.item.month ? `${activeHoverItem.item.month} 2026` : (activeHoverItem.item.displayDate || activeHoverItem.item.label || activeHoverItem.item.day)}</span>
                      {activeHoverItem.isHighlighted && <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 text-[9px]">ACTIVE</span>}
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total:</span>
                        <strong className="text-white font-mono">{activeHoverItem.item.count || 0}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Incentive:</span>
                        <strong className="text-emerald-400 font-mono">₹{(activeHoverItem.item.commission || activeHoverItem.item.count * commissionRate).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="salesSplineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.30" />
                    <stop offset="60%" stopColor="#a855f7" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="barGradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="barGradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="barGradEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="areaTrendGradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="areaTrendGradPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="areaTrendGradEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis dashed horizontal grid lines */}
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
                        x={padL - 10}
                        y={yPos + 4}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 font-medium"
                      >
                        {metricType === 'revenue' ? `₹${value}` : value}
                      </text>
                    </g>
                  );
                })}

                {/* Target Baseline Reference Line */}
                {targetY && (
                  <g>
                    <line
                      x1={padL}
                      y1={targetY}
                      x2={chartW - padR}
                      y2={targetY}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                      opacity="0.8"
                    />
                    <text
                      x={chartW - padR + 5}
                      y={targetY + 3.5}
                      textAnchor="start"
                      className="text-[9px] font-mono font-bold fill-amber-500"
                    >
                      Target ({targetReference})
                    </text>
                  </g>
                )}

                {/* Smooth Spline Area Fill */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill={`url(#${metricColor.gradAreaId})`}
                    className="transition-all duration-300"
                  />
                )}

                {/* Spline Trend Line */}
                {splinePath && (
                  <path
                    d={splinePath}
                    fill="none"
                    stroke={metricColor.stroke}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    className="transition-all duration-300 drop-shadow-sm"
                  />
                )}

                {/* Vertical Gradient Bars */}
                {points.map((p, idx) => {
                  const isHovered = hoveredIdx === idx;
                  const barFill = p.isHighlighted ? 'url(#barGradActive)' : `url(#${metricColor.gradId})`;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-all duration-200"
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
                        fill={barFill}
                        opacity={isHovered ? 1 : 0.88}
                        className="transition-all duration-200"
                      />
                      <circle
                        cx={p.centerX}
                        cy={p.centerY}
                        r={isHovered ? 5.5 : 3.5}
                        fill={p.isHighlighted ? '#ec4899' : metricColor.stroke}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text
                        x={p.centerX}
                        y={zeroY + 18}
                        textAnchor="middle"
                        className={`text-[11px] font-bold ${
                          p.isHighlighted ? 'fill-purple-600 dark:fill-purple-400' : 'fill-slate-700 dark:fill-slate-300'
                        }`}
                      >
                        {p.item[xLabelKey]}
                      </text>
                      {subLabelKey && p.item[subLabelKey] && (
                        <text
                          x={p.centerX}
                          y={zeroY + 31}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500"
                        >
                          {p.item[subLabelKey]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QR SCANNER STATUS / PAYCHART (32% width on lg) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  QR Scanner Status
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Current sticker activation on field
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white block leading-tight">
                  91%
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

            {/* Clean SVG Paychart (Donut / Pie) strictly matching ENLAZ */}
            <div className="mt-5 flex flex-col items-center justify-center">
              <div className="relative size-48 shrink-0 grid place-items-center">
                {chartType === 'donut' ? (
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
                      {/* Amber Segment (Locked - 9% arc) */}
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
                        {metrics.totalTagsSold || 11}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                        stickers sold
                      </span>
                    </div>
                  </>
                ) : (
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
                    Active <strong className="text-slate-900 dark:text-white font-bold">{activeCustomersCount || 10}</strong> <span className="text-slate-400 text-[11px] font-normal">(91%)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#b45309]" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    Locked <strong className="text-slate-900 dark:text-white font-bold">{pendingCustomersCount || 1}</strong> <span className="text-slate-400 text-[11px] font-normal">(9%)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. DETAILED BREAKDOWN TILES (WEEKLY / MONTHLY / YEARLY)  */}
      {/* ========================================================= */}
      {reportPeriod === 'weekly' && (
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
              <span>Day-by-Day Sales Velocity (Past 7 Days)</span>
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Week Total: {periodTotalCount} Activated • ₹{periodTotalCommission} Earned
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {processedWeekly.map((w, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-center transition hover:shadow-xs ${
                  w.isToday
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 ring-2 ring-purple-500/20'
                    : w.count > 0
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80'
                      : 'bg-slate-50/70 dark:bg-[#161826] border-slate-200/80 dark:border-[#22253a]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>{w.day}</span>
                  {w.isToday && (
                    <span className="px-1 py-0.2 rounded text-[8px] bg-purple-600 text-white font-extrabold">
                      TODAY
                    </span>
                  )}
                </div>
                <strong className="text-xs font-mono block text-slate-900 dark:text-white">{w.displayDate}</strong>
                <div className={`mt-2 text-2xl font-display font-black font-mono ${
                  w.count > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}>
                  {w.count}
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5">
                  ₹{w.commission}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reportPeriod === 'monthly' && (
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="size-4 text-purple-600 dark:text-purple-400" />
              <span>Weekly Targets & Month Progress Breakdown</span>
            </h4>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
              Month Target: {monthlyTarget} QRs • {metrics.targetAchievedPercent || 91}% Achieved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyData.map((m, idx) => {
              const weekTarget = Math.round(monthlyTarget / 4);
              const achievedPct = Math.min(100, Math.round(((m.count || 0) / weekTarget) * 100));
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{m.label}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {achievedPct}% Target
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-display font-black text-slate-900 dark:text-white font-mono">
                        {m.count}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">/ {weekTarget} QRs</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      ₹{m.commission}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-[#1e2235] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${achievedPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reportPeriod === 'yearly' && (
        <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="size-4 text-purple-600 dark:text-purple-400" />
                <span>Annual Full 12-Month Performance Directory (2026)</span>
              </h4>
              <p className="text-xs text-slate-400">Comprehensive overview from January to December 2026</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Commission</span>
              <strong className="text-lg font-display font-black text-emerald-600 font-mono">
                ₹{periodTotalCommission.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-[#1f2333]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase text-[10px] border-b border-slate-100 dark:border-[#22253a]">
                <tr>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Monthly Quota</th>
                  <th className="py-3 px-4">Stickers Sold</th>
                  <th className="py-3 px-4">Incentive Earned</th>
                  <th className="py-3 px-4">Progress Status</th>
                  <th className="py-3 px-4 text-right">Target Achieved %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                {yearlyData.map((y, idx) => {
                  const percent = Math.min(100, Math.round(((y.count || 0) / (y.target || monthlyTarget)) * 100));
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/70 dark:hover:bg-[#161826] transition ${
                        y.isCurrentMonth ? 'bg-purple-50/40 dark:bg-purple-950/20 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{y.month} 2026</span>
                        {y.isCurrentMonth && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-600 text-white font-bold">
                            CURRENT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{y.target || monthlyTarget} QRs</td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {y.count}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                        ₹{(y.commission || y.count * commissionRate).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-28 bg-slate-100 dark:bg-[#1e2235] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent >= 80 ? 'bg-emerald-500' : (percent >= 50 ? 'bg-purple-500' : 'bg-amber-500')
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {percent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
