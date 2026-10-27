import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import PlateBadge from '../components/PlateBadge';
import StatusBadge from '../components/StatusBadge';
import {
  Car,
  QrCode,
  FileText,
  Radio,
  Plus,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const { recentAlerts } = useSocket();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [tags, setTags] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick pre-printed claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimTagCode, setClaimTagCode] = useState('');
  const [selectedClaimVehicle, setSelectedClaimVehicle] = useState('');
  const [customClaimVehicle, setCustomClaimVehicle] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  // Fetch dashboard data
  const loadData = async () => {
    try {
      const [vRes, tRes, aRes] = await Promise.all([
        authFetch('/api/auth/vehicles').then(r => r.json()).catch(() => ({ data: [] })),
        authFetch('/api/tags/my-tags').then(r => r.json()).catch(() => ({ data: [] })),
        authFetch('/api/alerts/my-alerts').then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      const vList = vRes.data || [];
      setVehicles(vList);
      if (vList.length > 0 && !selectedClaimVehicle) {
        setSelectedClaimVehicle(vList[0].vehicleNumber);
      }
      setTags(tRes.data || []);
      setAlerts(aRes.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick pre-printed claim submit
  const handleQuickClaim = async (e) => {
    e.preventDefault();
    if (!claimTagCode || !claimTagCode.trim()) return;
    setClaimLoading(true);
    setClaimSuccess('');

    const targetVehicle = selectedClaimVehicle === 'NEW' ? customClaimVehicle : (selectedClaimVehicle || vehicles[0]?.vehicleNumber || customClaimVehicle);
    if (!targetVehicle || !targetVehicle.trim()) {
      alert('Please enter or select a vehicle number');
      setClaimLoading(false);
      return;
    }

    try {
      const res = await authFetch('/api/tags/claim', {
        method: 'POST',
        body: JSON.stringify({
          tagCode: claimTagCode.trim().toUpperCase(),
          vehicleNumber: targetVehicle.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (data.success) {
        setClaimSuccess(`Sticker ${claimTagCode.toUpperCase()} claimed & permanently assigned to ${targetVehicle.toUpperCase()}!`);
        loadData();
        setTimeout(() => {
          setShowClaimModal(false);
          setClaimSuccess('');
          setClaimTagCode('');
        }, 2000);
      } else {
        alert(data.message || 'Failed to claim sticker');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setClaimLoading(false);
    }
  };
      setClaimLoading(false);
    }
  };

  const activeScannersCount = tags.filter(t => t.status === 'ACTIVE').length;
  const expiringDocsCount = tags.filter(t => t.documentExpiryStatus?.hasExpiringOrExpired).length;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-brand-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="size-3.5 text-amber-300" />
            <span>Pre-Printed QR Scanner Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Welcome back, {user?.name || 'Sambhaji'}!
          </h1>
          <p className="mt-1 text-sm text-brand-200/90 max-w-xl">
            Your vehicles are protected by the GadiRaksha QR network. Anyone scanning your vehicle reaches you or your 3-4 family members without seeing your phone number.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowClaimModal(true)}
            className="btn-primary !bg-white !text-brand-900 hover:!bg-brand-50 shadow-md font-bold text-xs"
          >
            <QrCode className="size-4 text-brand-700" />
            <span>Activate Pre-Printed Sticker</span>
          </button>
          <button
            onClick={() => navigate('/app/vehicles')}
            className="btn-secondary !bg-brand-800/60 !border-brand-700 !text-white hover:!bg-brand-800 text-xs font-semibold"
          >
            <Plus className="size-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Scanners
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
              <QrCode className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
              {activeScannersCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">of {tags.length || 1} tags</span>
          </div>
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="size-3.5" />
            <span>Weatherproof QR Active</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              My Vehicles
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Car className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
              {vehicles.length || 1}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">registered</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {vehicles[0]?.vehicleModel || 'Honda Activa 6G'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Document Expiries
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <FileText className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
              {expiringDocsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">needing renewal</span>
          </div>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            PUC & Insurance tracked
          </p>
        </div>

        {/* Metric 4 */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Emergency Circle
            </span>
            <div className="grid size-9 place-items-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Users className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
              {user?.emergencyContacts?.length || 3}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Family Members</span>
          </div>
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
            Direct Call + WhatsApp Alert
          </p>
        </div>
      </div>

      {/* Main Grid: Left Column (Vehicles & Live Incidents) / Right Column (Documents, Fast Claim, Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: My Vehicles Card */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-ink">My Vehicles</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vehicles linked with your GadiRaksha stickers</p>
              </div>
              <Link
                to="/app/vehicles"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-[#1f2333]">
              {(vehicles.length > 0 ? vehicles : [
                {
                  _id: 'v1',
                  vehicleNumber: 'MH19 AB 1234',
                  vehicleType: 'Two-Wheeler',
                  vehicleModel: 'Honda Activa 6G',
                  vehicleColor: 'Pearl White',
                  tagCode: 'MH-1001'
                }
              ]).map((veh) => (
                <li key={veh._id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                  <div className="flex items-center gap-4">
                    <div className="grid size-12 place-items-center rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-bold">
                      <Car className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <PlateBadge value={veh.vehicleNumber} size="sm" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {veh.vehicleModel || 'Vehicle'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {veh.vehicleType} · {veh.vehicleColor || 'Standard'} · Tag:{' '}
                        <strong className="font-mono text-brand-700 dark:text-brand-400">{veh.tagCode || 'MH-1001'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status="ACTIVE" label="Sticker Active" />
                    <button
                      onClick={() => navigate(`/scan/${veh.tagCode || 'MH-1001'}`)}
                      className="btn-secondary !py-1.5 !px-3 text-xs"
                      title="Simulate Bystander QR Scan"
                    >
                      <QrCode className="size-3.5" />
                      <span>Scan View</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Live Scans & Emergency Alerts Feed */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <Radio className="size-4 animate-pulse" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-ink">Recent Scans & Real-Time Incidents</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Live events broadcast via Socket.io & Saved in MongoDB</p>
                </div>
              </div>
              <Link
                to="/app/emergencies"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Full history</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#1f2333]">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alt, idx) => {
                  const isAccident = alt.type === 'ACCIDENT' || alt.alertType === 'ACCIDENT';
                  return (
                    <div key={idx} className={`p-5 flex items-start justify-between gap-4 ${isAccident ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'hover:bg-slate-50 dark:hover:bg-[#161826]'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${isAccident ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'}`}>
                          {isAccident ? <ShieldAlert className="size-5" /> : <AlertTriangle className="size-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-ink">
                              {isAccident ? 'Accident SOS Triggered' : 'No-Parking Alert'}
                            </span>
                            <StatusBadge status={alt.type || 'NO_PARKING'} />
                            <span className="text-[11px] text-slate-400">Just now</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            Vehicle <strong className="font-mono text-ink">{alt.vehicleNumber || alt.tagCode}</strong> · {alt.scannerNote || 'Alert dispatched to vehicle owner & family'}
                          </p>
                          {alt.location?.googleMapsUrl && (
                            <a
                              href={alt.location.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-cyan-400 hover:underline"
                            >
                              <MapPin className="size-3" /> Incident Location on Google Maps
                              <ExternalLink className="size-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <PlateBadge value={alt.vehicleNumber || 'MH 19 AB 1234'} size="sm" />
                    </div>
                  );
                })
              ) : alerts.length > 0 ? (
                alerts.slice(0, 3).map((a) => (
                  <div key={a._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#161826]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#1a1d2d] text-slate-700 dark:text-slate-300">
                        <Clock className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={a.alertType} />
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            Tag: {a.tagCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(a.createdAt).toLocaleString()} · Status: <strong>{a.status}</strong>
                        </p>
                      </div>
                    </div>
                    {a.location?.googleMapsUrl && (
                      <a
                        href={a.location.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <MapPin className="size-3.5" /> Map
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                  <p>No recent alerts or scans logged yet.</p>
                  <p className="mt-1 text-slate-400 dark:text-slate-500">
                    Use the <strong>"Test QR Scan"</strong> button at top right to simulate a scan or trigger a test alert!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col on lg) */}
        <div className="space-y-8">
          
          {/* Quick Pre-Printed Scanner Claim Card */}
          <div className="card p-6 bg-gradient-to-br from-brand-50/70 via-white to-white dark:from-brand-950/40 dark:via-[#12141e] dark:to-[#12141e] border-brand-200/80 dark:border-brand-900/60">
            <div className="flex items-center gap-2.5 text-brand-800 dark:text-brand-300 mb-2">
              <QrCode className="size-5 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-sm">Got a Physical Pre-Printed Sticker?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Enter the code printed on your sticker (e.g. <code className="text-brand-700 dark:text-brand-400 font-bold">MH-1001</code>) to bind it permanently to your vehicle profile!
            </p>

            <form onSubmit={handleQuickClaim} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={claimTagCode}
                  onChange={(e) => setClaimTagCode(e.target.value)}
                  placeholder="e.g. MH-1001"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs font-mono uppercase font-bold text-ink dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {claimSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>{claimSuccess}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={claimLoading}
                  className="btn-primary flex-1 text-xs font-bold"
                >
                  {claimLoading ? 'Activating...' : 'Quick Bind'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/activate')}
                  className="btn-secondary text-xs font-semibold"
                  title="Open Full 5-Step Activation Wizard"
                >
                  Full Wizard →
                </button>
              </div>
            </form>
          </div>

          {/* Document Expiry Alerts Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-ink">Document Expiry Alerts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">PUC, Insurance & Fitness</p>
              </div>
              <Link to="/app/documents" className="text-xs font-semibold text-brand-600 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <span>📄</span> PUC Certificate
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    MH19-PUC-98214
                  </p>
                </div>
                <StatusBadge status="VALID" label="Valid (320d)" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <span>🛡️</span> Vehicle Insurance
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    BAJAJ-ALLIANZ-882
                  </p>
                </div>
                <StatusBadge status="VALID" label="Valid (180d)" />
              </div>
            </div>
          </div>

          {/* 3-4 Family Members Emergency Circle Quick Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="size-4.5 text-rose-600" />
                <h3 className="font-bold text-sm text-ink">Family Emergency Circle</h3>
              </div>
              <Link to="/app/family" className="text-xs font-semibold text-brand-600 hover:underline">
                Edit
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              During an accident, all {user?.emergencyContacts?.length || 3} members receive automatic alerts with GPS location:
            </p>

            <ul className="space-y-2 text-xs">
              {(user?.emergencyContacts?.length > 0 ? user.emergencyContacts : [
                { name: 'Pandurang Patil', relation: 'Father', phone: '9822111111', isPrimary: true },
                { name: 'Sunita Patil', relation: 'Spouse', phone: '9822222222' },
                { name: 'Anil Patil', relation: 'Brother', phone: '9822333333' }
              ]).map((c, i) => (
                <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#161826] border border-slate-200/60 dark:border-[#22253a]">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">({c.relation})</span>
                  </div>
                  {c.isPrimary && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
                      Primary
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Quick Pre-Printed Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="size-5 text-brand-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-ink">Activate Physical QR Sticker</h3>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter the unique code printed on your physical sticker (e.g. <strong className="font-mono text-brand-700 dark:text-cyan-400">MH-1001</strong>). Once bound, anyone scanning it reaches your emergency contacts instantly.
            </p>

            <form onSubmit={handleQuickClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sticker Code
                </label>
                <input
                  type="text"
                  value={claimTagCode}
                  onChange={(e) => setClaimTagCode(e.target.value)}
                  placeholder="e.g. MH-1001"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-sm font-mono uppercase font-bold text-ink dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {vehicles.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign to Vehicle
                  </label>
                  <select
                    value={selectedClaimVehicle}
                    onChange={(e) => setSelectedClaimVehicle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs font-semibold text-ink dark:text-white focus:outline-none"
                  >
                    {vehicles.map(v => (
                      <option key={v._id} value={v.vehicleNumber}>
                        {v.vehicleNumber} ({v.vehicleModel || v.vehicleType || 'Vehicle'})
                      </option>
                    ))}
                    <option value="NEW">➕ Add New Vehicle</option>
                  </select>
                </div>
              )}

              {(vehicles.length === 0 || selectedClaimVehicle === 'NEW') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Number Plate
                  </label>
                  <input
                    type="text"
                    value={customClaimVehicle}
                    onChange={(e) => setCustomClaimVehicle(e.target.value)}
                    placeholder="e.g. MH 19 AB 1234"
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-ink dark:text-white focus:outline-none"
                  />
                </div>
              )}

              {claimSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>{claimSuccess}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claimLoading}
                  className="btn-primary flex-1 font-bold"
                >
                  {claimLoading ? 'Binding...' : 'Bind & Activate'}
                </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => {
                    setShowClaimModal(false);
                    navigate('/activate');
                  }}
                  className="text-xs text-brand-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  Need step-by-step setup? Open 5-Step Activation Wizard →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
