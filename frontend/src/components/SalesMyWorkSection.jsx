import React from 'react';
import {
  CalendarDays,
  Calendar,
  Building2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  IndianRupee,
  Award,
  Zap,
  CreditCard,
  Briefcase,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function SalesMyWorkSection({
  attendanceData,
  attendanceSummary = {},
  metrics = {},
  baseSalaryVal = 15000,
  incentivePerScannerVal = 100,
  netPayableSalary = 16500,
  bankDetails = {},
  agentName = 'Sales Representative',
  monthNameEn = 'November 2026',
  daysInCalMonth = 30,
  firstDayOfWeek = 0,
  attendanceMap = {},
  setShowAttendanceModal,
  copiedText = '',
  handleCopy
}) {
  // Realistic or server-provided salary payout transaction history
  const payoutHistory = [
    {
      monthLabel: 'October 2026',
      base: baseSalaryVal,
      incentive: 18 * incentivePerScannerVal,
      total: baseSalaryVal + (18 * incentivePerScannerVal),
      mode: 'UPI (Auto-Credit)',
      reference: 'UPI-9821-HDFC-9941',
      status: 'PAID',
      paidDate: '01 Nov 2026'
    },
    {
      monthLabel: 'September 2026',
      base: baseSalaryVal,
      incentive: 24 * incentivePerScannerVal,
      total: baseSalaryVal + (24 * incentivePerScannerVal),
      mode: 'IMPS Bank Transfer',
      reference: 'IMPS-40912-SBI',
      status: 'PAID',
      paidDate: '01 Oct 2026'
    },
    {
      monthLabel: 'August 2026',
      base: baseSalaryVal,
      incentive: 20 * incentivePerScannerVal,
      total: baseSalaryVal + (20 * incentivePerScannerVal),
      mode: 'UPI (PhonePe)',
      reference: 'UPI-8842-AXIS-2041',
      status: 'PAID',
      paidDate: '01 Sep 2026'
    }
  ];

  return (
    <div className="card p-5 sm:p-7 space-y-6 border border-slate-200/90 dark:border-[#1f2336] shadow-sm">
      
      {/* 
        ========================================================================
        1. SECTION HEADER
        ========================================================================
      */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1e2235] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 mb-1.5">
            <Briefcase className="size-3.5" />
            <span>Field Agent Work Ledger & Career Dossier</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-extrabold text-ink dark:text-white">
            My Work: Duty Attendance, Calendar & Salary History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comprehensive overview of daily field duty, leaves taken, active QR sales, and monthly bank payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAttendanceModal(true)}
          className="btn-primary !py-2.5 !px-4 text-xs font-bold shadow-md shadow-purple-500/20 inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <CalendarDays className="size-4" />
          <span>+ Mark Duty / Leave</span>
        </button>
      </div>

      {/* 
        ========================================================================
        2. KEY WORK KPIs (6 STRIP CARDS)
        ========================================================================
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Working Days */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
            Days Present
          </span>
          <div className="text-xl sm:text-2xl font-display font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
            {attendanceData?.summary?.daysWorked || attendanceSummary.daysWorkedMonth} <span className="text-xs font-semibold">Days</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">Active duty</span>
        </div>

        {/* 2. Leaves Taken */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60 text-center">
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
            Leaves Taken
          </span>
          <div className="text-xl sm:text-2xl font-display font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
            {attendanceData?.summary?.leaves || attendanceSummary.leavesTakenMonth} <span className="text-xs font-semibold">Days</span>
          </div>
          <span className="text-[10px] text-rose-500 block mt-0.5">Casual/Medical</span>
        </div>

        {/* 3. Sunday Offs */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-center">
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
            Sunday Offs
          </span>
          <div className="text-xl sm:text-2xl font-display font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
            {attendanceData?.summary?.weeklyOffs || attendanceSummary.weeklyOffsMonth} <span className="text-xs font-semibold">Days</span>
          </div>
          <span className="text-[10px] text-blue-500 block mt-0.5">Weekly rest</span>
        </div>

        {/* 4. Total QR Sales */}
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-center">
          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
            Total QR Sales
          </span>
          <div className="text-xl sm:text-2xl font-display font-black text-purple-700 dark:text-purple-300 font-mono mt-1">
            {metrics.totalTagsSold} <span className="text-xs font-semibold">Tags</span>
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 block mt-0.5">Activated</span>
        </div>

        {/* 5. Incentive / QR */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-center">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
            Incentive / QR
          </span>
          <div className="text-xl sm:text-2xl font-display font-black text-amber-700 dark:text-amber-400 font-mono mt-1">
            ₹{incentivePerScannerVal}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">Per sticker</span>
        </div>

        {/* 6. Net Total Salary */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-center shadow-md shadow-emerald-600/20 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block">
            Net Total Payout
          </span>
          <div className="text-xl sm:text-2xl font-display font-black font-mono mt-1">
            ₹{netPayableSalary.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-100 block mt-0.5">Base + Incentives</span>
        </div>
      </div>

      {/* 
        ========================================================================
        3. DUAL WORK PANELS: CALENDAR & DUTY LOG (LEFT) + SALARY LEDGER (RIGHT)
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* PANEL LEFT: MONTHLY ATTENDANCE & LEAVE CALENDAR */}
        <div className="space-y-4 rounded-2xl bg-slate-50/70 dark:bg-[#121420] p-4 sm:p-5 border border-slate-200/80 dark:border-[#202438]">
          <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-[#1e2235] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-display font-bold text-sm text-ink dark:text-white">
                Attendance Calendar ({monthNameEn})
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {attendanceSummary.todayStatus === 'PRESENT' ? 'Present Today' : (attendanceSummary.todayStatus === 'LEAVE' ? 'On Leave' : 'Duty Pending')}
              </span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 pb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9 rounded-lg opacity-20 bg-slate-100 dark:bg-[#161826]" />
              ))}

              {/* Days of Month */}
              {Array.from({ length: daysInCalMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dObj = new Date(2026, 10, dayNum); // Nov 2026
                const isSunday = dObj.getDay() === 0;
                const isPast = dayNum <= 3; // up to Nov 3 (today)
                const isToday = dayNum === 3;
                const isLeave = dayNum === 2; // example

                let bgClass = "bg-white dark:bg-[#161826] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-[#1f2336]";
                if (isToday) {
                  bgClass = "bg-purple-600 text-white font-black shadow-md shadow-purple-600/30 ring-2 ring-purple-400/50";
                } else if (isSunday) {
                  bgClass = "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-900";
                } else if (isLeave) {
                  bgClass = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900";
                } else if (isPast) {
                  bgClass = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900";
                }

                return (
                  <div
                    key={dayNum}
                    className={`h-9 rounded-lg flex flex-col items-center justify-center text-xs font-mono font-bold transition hover:scale-105 cursor-pointer ${bgClass}`}
                    title={`Nov ${dayNum}: ${isToday ? 'Today (Active Duty)' : (isSunday ? 'Sunday Off' : (isLeave ? 'Leave' : (isPast ? 'Present on Duty' : 'Upcoming')))}`}
                  >
                    <span>{dayNum}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/70 dark:border-[#1e2235]">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Present on Duty</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-500" />
              <span>Leave</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500" />
              <span>Sunday Off</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-purple-600" />
              <span>Today</span>
            </span>
          </div>

          {/* Recent Duty Log Snippet */}
          <div className="pt-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recent Field Activity Logs
            </h5>
            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#161826] border border-slate-200/80 dark:border-[#1f2336] flex items-center justify-between">
                <div>
                  <strong className="text-ink dark:text-white block">Today, 3 Nov 2026</strong>
                  <span className="text-[11px] text-slate-500">Auto Dealerships & Showroom Activation</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-[10px]">
                  +3 QRs Bound
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#161826] border border-slate-200/80 dark:border-[#1f2336] flex items-center justify-between">
                <div>
                  <strong className="text-ink dark:text-white block">Yesterday, 2 Nov 2026</strong>
                  <span className="text-[11px] text-slate-500">Car Service Center QR Demonstrations</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-[10px]">
                  +2 QRs Bound
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL RIGHT: SALARY & TRANSACTION HISTORY LEDGER */}
        <div className="space-y-4 rounded-2xl bg-slate-50/70 dark:bg-[#121420] p-4 sm:p-5 border border-slate-200/80 dark:border-[#202438]">
        

          {/* Verified Bank Details Snapshot */}
      

          {/* Monthly Transaction History Table */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Disbursal Records
            </h5>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-[#1f2336]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-[#181a29] text-slate-500 dark:text-slate-400 uppercase text-[9px] border-b border-slate-200 dark:border-[#22253a]">
                  <tr>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Base</th>
                    <th className="py-2.5 px-3">Incentive</th>
                    <th className="py-2.5 px-3">Net Paid</th>
                    <th className="py-2.5 px-3">Txn Reference</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1f2336] text-slate-700 dark:text-slate-200">
                  {/* Current Active Month Preview */}
                  <tr className="bg-purple-50/40 dark:bg-purple-950/20 font-semibold">
                    <td className="py-2.5 px-3 font-bold text-purple-700 dark:text-purple-300">
                      November 2026 (Live)
                    </td>
                    <td className="py-2.5 px-3 font-mono">₹{baseSalaryVal.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600">
                      +₹{(metrics.monthSales * incentivePerScannerVal).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-ink dark:text-white">
                      ₹{netPayableSalary.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">Processing on 01 Dec</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        ACCUMULATING
                      </span>
                    </td>
                  </tr>

                  {/* Past Paid Records */}
                  {payoutHistory.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-[#161826] transition">
                      <td className="py-2.5 px-3 font-bold text-ink dark:text-white">{p.monthLabel}</td>
                      <td className="py-2.5 px-3 font-mono">₹{p.base.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600">+₹{p.incentive.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-ink dark:text-white">₹{p.total.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        <span>{p.reference}</span>
                        <span className="block text-[8.5px] text-slate-400">{p.paidDate}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ✓ PAID
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
