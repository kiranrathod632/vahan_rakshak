import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Car,
  Briefcase,
  KeyRound,
  ArrowRight,
  Sparkles,
  QrCode,
  Users,
  CheckCircle2,
  Calendar,
  DollarSign,
  Sun,
  Moon,
  ExternalLink,
  Globe
} from 'lucide-react';

export default function PortalsHub() {
  const { theme, toggleTheme, isDark } = useTheme();

  const portals = [
    {
      id: 'user',
      title: 'Customer & Vehicle Owner Portal',
      hindiTitle: 'Vehicle Owner & Customer Portal',
      description: 'Dedicated garage for vehicle owners, 24x7 bystander QR safety scanning, and instant emergency family dispatch.',
      icon: Car,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/60',
      badge: 'Vehicle Owners & Public',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
      accentBorder: 'hover:border-blue-500 dark:hover:border-blue-500',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      link: '/',
      linkAlt: '/app',
      features: [
        '24x7 Bystander QR Scanning & Privacy Calling',
        'Accident SOS with Live Google Maps GPS',
        'Add Vehicle Info & 3–4 Family Contacts',
        'PUC & Insurance Document Expiry Alerts'
      ]
    },
    {
      id: 'sales',
      title: 'Sales Team & Partner Portal',
      hindiTitle: 'Sales Team & Field Portal',
      description: 'Dedicated workspace for field sales executives, duty attendance calendar, QR sales tracker, and commissions ledger.',
      icon: Briefcase,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60',
      badge: 'Field Agents & Sales Staff',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
      accentBorder: 'hover:border-emerald-500 dark:hover:border-emerald-500',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      link: '/sales',
      linkAlt: '/sales',
      features: [
        'Daily Duty Attendance & Working Days Calendar',
        'Physical Sticker Sales & Monthly Targets',
        'Per-Scanner Incentives Ledger & Payout Status',
        'Direct Customer Onboarding & Vehicle Binding'
      ]
    },
    {
      id: 'admin',
      title: 'Master Admin Control Center',
      hindiTitle: 'Master Admin Control Center',
      description: 'Master management console for physical sticker generation, team payroll, customer active/blocked audit, and emergency logs.',
      icon: KeyRound,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900/60',
      badge: 'Super Admin & Operations',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
      accentBorder: 'hover:border-purple-500 dark:hover:border-purple-500',
      btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
      link: '/admin',
      linkAlt: '/admin/login',
      features: [
        'Batch QR Code Generator for Printing (Prefix & Sequential)',
        'Master User & Vehicle Management (Active/Blocked)',
        'Employee Base Salary & Per-QR Incentive Config',
        'Live Accident SOS & Towing Incident Resolution'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0e1017]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1c1f2e] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white grid place-items-center shadow-md shadow-brand-500/20">
            <Shield className="size-5" />
          </div>
          <div>
            <span className="font-display font-extrabold text-base tracking-tight text-ink dark:text-white block leading-tight">
              GadiRaksha
            </span>
            <span className="text-[10px] text-brand-600 dark:text-cyan-400 font-bold uppercase tracking-wider block">
              Multi-Portal Architecture
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
          </button>

          <Link
            to="/"
            className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-cyan-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1f2333] transition"
          >
            Main Website
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-cyan-400 text-xs font-bold shadow-xs">
          <Globe className="size-3.5" />
          <span>Independent Portals Gateway</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-ink dark:text-white tracking-tight">
          Choose Your Dedicated Portal
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          GadiRaksha provides separated, isolated workspaces for vehicle owners, on-ground sales teams, and master administrators. Select your access portal below:
        </p>
      </div>

      {/* 3 Portal Cards Grid */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`card p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#12141e] border-2 border-slate-200/90 dark:border-[#1f2333] shadow-lg flex flex-col justify-between space-y-6 transition-all duration-200 ${p.accentBorder}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`size-12 rounded-2xl border ${p.iconBg} ${p.iconColor} grid place-items-center shadow-xs`}>
                      <Icon className="size-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold font-display text-ink dark:text-white">
                      {p.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                      {p.hindiTitle}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Key Features List */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#1f2333]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Key Capabilities:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Launch Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#1f2333]">
                  <Link
                    to={p.link}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${p.btnBg}`}
                  >
                    <span>Launch {p.title.split('&')[0].trim()}</span>
                    <ArrowRight className="size-4" />
                  </Link>

                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-mono text-slate-400">
                      Dedicated URL: <strong className="text-slate-700 dark:text-slate-300">{p.link}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subdomain Architecture Note */}
        <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#12141e] border border-slate-200/90 dark:border-[#1f2333] shadow-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
            <Globe className="size-4 text-brand-600 dark:text-cyan-400" />
            <span>Dedicated Website / Subdomain Access</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            In teeno portals ko aap alag-alag independent domain ya subdomain par bhi chala sakte hain. Hamara routing system automatically hostname ko detect karke respective portal kholta hai:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block">User Website</span>
              <code className="text-xs font-mono font-bold text-slate-900 dark:text-white block mt-0.5">https://vahan-rakshak-omega.vercel.app/</code>
              <span className="text-[10px] text-slate-500 block mt-1">Vehicle Garage, Public Scan & SOS</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Sales Team Website</span>
              <code className="text-xs font-mono font-bold text-slate-900 dark:text-white block mt-0.5">https://vahan-rakshak-omega.vercel.app/sales</code>
              <span className="text-[10px] text-slate-500 block mt-1">Or subdomain: <code>sales-*.vercel.app</code></span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">Master Admin Website</span>
              <code className="text-xs font-mono font-bold text-slate-900 dark:text-white block mt-0.5">https://vahan-rakshak-omega.vercel.app/admin</code>
              <span className="text-[10px] text-slate-500 block mt-1">Or subdomain: <code>admin-*.vercel.app</code></span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200/80 dark:border-[#1f2333]">
        © 2026 GadiRaksha / SurakshaQR Smart Vehicle Safety Network. All rights reserved.
      </footer>
    </div>
  );
}
