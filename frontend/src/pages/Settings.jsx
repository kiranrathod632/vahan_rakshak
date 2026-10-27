import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Shield, Bell, Lock, Check, Sun, Moon } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [maskPlate, setMaskPlate] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsAppAlerts, setWhatsAppAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink">Account & Privacy Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure theme appearance, vehicle number masking, privacy protections, and dispatch channels.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        {/* Appearance Mode Section */}
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            {isDark ? <Moon className="size-4.5 text-indigo-400" /> : <Sun className="size-4.5 text-amber-500" />}
            <span>Theme & Display Appearance</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose between Dark Mode and Light Mode for optimal day & night readability.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-ink block">
                Current Mode: <strong className="text-brand-600 dark:text-cyan-400 capitalize">{theme} Mode</strong>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Toggle your preferred contrast across the entire app
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="btn-secondary !py-2 !px-4 text-xs font-bold flex items-center gap-2"
            >
              {isDark ? (
                <>
                  <Sun className="size-4 text-amber-400" />
                  <span>Switch to Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="size-4 text-indigo-600" />
                  <span>Switch to Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-[#1f2333] pt-6">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Shield className="size-4.5 text-brand-600 dark:text-cyan-400" />
            <span>Privacy Guard Settings</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Control what bystanders see when they scan your vehicle sticker.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-ink block">Mask Vehicle Plate on Scan</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Displays your plate as <strong>MH19 ** 1234</strong> instead of full number
                </span>
              </div>
              <input
                type="checkbox"
                checked={maskPlate}
                onChange={(e) => setMaskPlate(e.target.checked)}
                className="size-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-ink block">Mask Owner Phone Number</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Protected by default. Calls & SMS are routed through virtual masking line.
                </span>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="size-4 rounded text-brand-600 cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-[#1f2333] pt-6">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Bell className="size-4.5 text-brand-600 dark:text-cyan-400" />
            <span>Incident Alert Notification Channels</span>
          </h2>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-ink block">WhatsApp Incident Alerts</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Sends automated WhatsApp notifications to you and family members
                </span>
              </div>
              <input
                type="checkbox"
                checked={whatsAppAlerts}
                onChange={(e) => setWhatsAppAlerts(e.target.checked)}
                className="size-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] cursor-pointer">
              <div>
                <span className="text-xs font-bold text-ink block">SMS Text Alerts</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Instant SMS with location coordinates in areas with low mobile internet
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="size-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#1f2333]">
          {saved ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <Check className="size-4" /> Preferences saved!
            </span>
          ) : <span />}

          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
