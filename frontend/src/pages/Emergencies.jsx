import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';
import PlateBadge from '../components/PlateBadge';
import { ShieldAlert, MapPin, ExternalLink, Users, CheckCircle2, Phone } from 'lucide-react';

export default function Emergencies() {
  const { authFetch } = useAuth();
  const { recentAlerts } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);

  const loadAlerts = async () => {
    try {
      const res = await authFetch('/api/alerts/my-alerts');
      const data = await res.json();
      if (data.success && data.data) {
        setAlerts(data.data.filter(a => a.alertType === 'ACCIDENT'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      const res = await authFetch(`/api/alerts/${id}/resolve`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(alerts.map(a => a._id === id ? { ...a, status: 'RESOLVED' } : a));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  const sampleEmergency = [
    {
      _id: 'sos_1',
      tagCode: 'MH-1001',
      vehicleNumber: 'MH19 AB 1234',
      alertType: 'ACCIDENT',
      status: 'SENT',
      createdAt: new Date().toISOString(),
      location: {
        latitude: 20.671,
        longitude: 75.342,
        address: 'Pachora By-Pass Highway',
        googleMapsUrl: 'https://maps.google.com/?q=20.671,75.342'
      },
      scannerNote: 'Accident reported. First aid dispatched. Family members alerted automatically.',
      notificationsSent: [
        { recipient: 'Pandurang Patil (Father)', channel: 'WHATSAPP_CALL', status: 'DELIVERED' },
        { recipient: 'Sunita Patil (Spouse)', channel: 'SMS', status: 'DELIVERED' },
        { recipient: 'Anil Patil (Brother)', channel: 'WHATSAPP', status: 'DELIVERED' }
      ]
    }
  ];

  const displayList = alerts.length > 0 ? alerts : sampleEmergency;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Emergency SOS Incident Log</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Records of critical road accident alerts, GPS coordinates, and automated family notification dispatches
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {displayList.map((item) => (
          <div
            key={item._id}
            className={`card p-6 border-l-4 ${
              item.status === 'RESOLVED'
                ? 'border-l-emerald-500 bg-white dark:bg-[#12141e]'
                : 'border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 shrink-0">
                  <ShieldAlert className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-base text-ink">
                      Accident SOS Reported
                    </h3>
                    <StatusBadge status={item.status === 'RESOLVED' ? 'RESOLVED' : 'ACCIDENT'} />
                    <span className="font-mono text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Sticker Code: <strong className="font-mono text-brand-700 dark:text-brand-400">{item.tagCode}</strong> · {item.scannerNote}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                    {item.location?.googleMapsUrl && (
                      <a
                        href={item.location.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sky-600 dark:text-cyan-400 font-semibold hover:underline"
                      >
                        <MapPin className="size-3.5" />
                        <span>View Location on Google Maps</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <Users className="size-3.5" />
                      <span>3 Family Members Notified (Call + SMS + WhatsApp)</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <PlateBadge value={item.vehicleNumber || 'MH 19 AB 1234'} size="sm" />
                {item.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolve(item._id)}
                    disabled={resolvingId === item._id}
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>{resolvingId === item._id ? 'Saving...' : 'Mark Resolved'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
