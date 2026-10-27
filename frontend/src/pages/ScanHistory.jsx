import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PlateBadge from '../components/PlateBadge';
import { History, MapPin, ExternalLink, QrCode } from 'lucide-react';

export default function ScanHistory() {
  const { authFetch } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await authFetch('/api/alerts/my-alerts');
        const data = await res.json();
        if (data.success && data.data) {
          setHistory(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const sampleData = [
    {
      _id: 's1',
      tagCode: 'MH-1001',
      alertType: 'NO_PARKING',
      createdAt: new Date().toISOString(),
      location: { address: 'Near Pachora Railway Station', googleMapsUrl: 'https://maps.google.com/?q=20.671,75.342' },
      scannerNote: 'Vehicle parked in front of shop gate'
    },
    {
      _id: 's2',
      tagCode: 'MH-1001',
      alertType: 'ACCIDENT',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      location: { address: 'Pachora By-Pass Highway', googleMapsUrl: 'https://maps.google.com/?q=20.675,75.350' },
      scannerNote: 'Minor skid, rider assisted by bystanders'
    }
  ];

  const list = history.length > 0 ? history : sampleData;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink">Scan History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Complete log of bystander interactions, scans, and alert dispatches across your vehicles
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-[#22253a]">
              <tr>
                <th className="py-3 px-5">Time</th>
                <th className="py-3 px-5">Tag / Sticker</th>
                <th className="py-3 px-5">Alert Type</th>
                <th className="py-3 px-5">Location</th>
                <th className="py-3 px-5">Bystander Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
              {list.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                  <td className="py-3.5 px-5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-brand-700 dark:text-brand-400 whitespace-nowrap">
                    {item.tagCode}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <StatusBadge status={item.alertType} />
                  </td>
                  <td className="py-3.5 px-5">
                    {item.location?.googleMapsUrl ? (
                      <a
                        href={item.location.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sky-600 dark:text-cyan-400 hover:underline font-medium"
                      >
                        <MapPin className="size-3 text-slate-400" />
                        <span>{item.location.address || 'View on Google Maps'}</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400">Without GPS</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {item.scannerNote || 'Standard scan'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
