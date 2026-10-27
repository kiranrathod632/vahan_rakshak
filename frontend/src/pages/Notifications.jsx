import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, ShieldAlert, AlertTriangle, FileText, CheckCheck } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function Notifications() {
  const { recentAlerts } = useSocket();
  const [cleared, setCleared] = useState(false);

  const defaultNotifications = [
    {
      id: 'n1',
      title: 'No-Parking Alert Dispatched',
      description: 'A bystander reported vehicle MH19 AB 1234 obstructing a pathway.',
      type: 'NO_PARKING',
      time: '15m ago'
    },
    {
      id: 'n2',
      title: 'Pollution (PUC) Certificate Valid',
      description: 'Your PUC certificate is verified and active for the next 320 days.',
      type: 'VALID',
      time: '2h ago'
    },
    {
      id: 'n3',
      title: 'Welcome to GadiRaksha QR Network',
      description: 'Your physical pre-printed sticker MH-1001 is now permanently active.',
      type: 'ACTIVE',
      time: '1d ago'
    }
  ];

  const list = cleared ? [] : (recentAlerts.length > 0 ? recentAlerts : defaultNotifications);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Notifications</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live system updates, parking notices, and emergency alerts</p>
        </div>
        <button
          onClick={() => setCleared(true)}
          className="btn-secondary !py-1.5 !px-3 text-xs"
        >
          <CheckCheck className="size-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-[#1f2333] overflow-hidden">
        {list.length > 0 ? (
          list.map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
              <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 shrink-0">
                <Bell className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-ink">{item.title || 'Vehicle Notice'}</h3>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{item.time || 'Recent'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {item.description || item.scannerNote || 'Notification delivered.'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            No unread notifications at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
