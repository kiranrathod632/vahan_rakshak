import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import PlateBadge from '../components/PlateBadge';
import {
  QrCode,
  Plus,
  Download,
  Printer,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Radio,
  Shield,
  Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Scanners() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [activeCode, setActiveCode] = useState('MH-1001');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Claim state
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [customVehicle, setCustomVehicle] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');

  const loadTags = async () => {
    try {
      const res = await authFetch('/api/tags/my-tags');
      const data = await res.json();
      if (data.success && data.data) {
        setTags(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTags();
    authFetch('/api/auth/vehicles')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setVehicles(d.data);
          if (d.data.length > 0) setSelectedVehicle(d.data[0].vehicleNumber);
        }
      })
      .catch(() => {});
  }, []);

  const handleClaimSticker = async () => {
    if (!activeCode || !activeCode.trim()) return;
    setClaiming(true);
    setClaimMsg('');
    const targetPlate = selectedVehicle === 'NEW' ? customVehicle : (selectedVehicle || vehicles[0]?.vehicleNumber || customVehicle);
    if (!targetPlate || !targetPlate.trim()) {
      alert('Please enter or select a vehicle number to assign this sticker');
      setClaiming(false);
      return;
    }

    try {
      const res = await authFetch('/api/tags/claim', {
        method: 'POST',
        body: JSON.stringify({
          tagCode: activeCode.trim().toUpperCase(),
          vehicleNumber: targetPlate.trim().toUpperCase()
        })
      });
      const data = await res.json();
      if (data.success) {
        setClaimMsg(`Sticker ${activeCode.toUpperCase()} successfully claimed and linked to ${targetPlate.toUpperCase()}!`);
        loadTags();
      } else {
        alert(data.message || 'Failed to claim sticker');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setClaiming(false);
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${window.location.origin}/scan/${activeCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/scan/${activeCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Batch generate fresh random code
  const handleBatchGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(apiUrl('/api/tags/batch-generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ADMIN-KEY': 'gadiraksha_admin_secret_batch_gen_key_2026'
        },
        body: JSON.stringify({ count: 1, baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined })
      });
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        const newCode = data.data[0].tagCode;
        setActiveCode(newCode);
        loadTags();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink">My QR Scanners</h1>
        <p className="text-xs text-slate-500">
          Manage your physical pre-printed QR stickers, download printable templates, and test live scans
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active QR Sticker Showcase Card (Matches Physical Vehicle Sticker Layout) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4 sm:p-5 flex flex-col items-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-400 text-xs font-semibold border border-brand-200 dark:border-brand-900/60">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Printable Vehicle QR Sticker</span>
            </div>

            {/* Official Physical Sticker Card Layout (Yellow + White Dual Card) */}
            <div className="w-full bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden flex flex-col text-slate-900 font-sans">
              {/* Top/Left Section */}
              <div className="p-4 flex flex-col justify-between space-y-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black tracking-tight font-display text-slate-950">
                    GADIRAKSHA<span className="text-amber-500">.IN</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    SMART TAG
                  </span>
                </div>
                <h3 className="text-sm font-black leading-snug tracking-tight text-slate-950 font-display">
                  Scan the code <br />
                  <span className="underline decoration-amber-400 decoration-2 underline-offset-2">to contact the</span> vehicle owner.
                </h3>
              </div>

              {/* Bottom/Right Yellow Accent Section with QR */}
              <div className="bg-amber-400 p-3.5 flex flex-col items-center space-y-2">
                <div className="bg-white p-2 rounded-xl border-2 border-slate-900 shadow-sm w-full max-w-[200px] flex flex-col items-center">
                  <img
                    src={qrImageUrl}
                    alt="Vehicle QR"
                    className="size-40 object-contain mx-auto"
                  />
                  <div className="flex items-center justify-between w-full mt-1 px-1 border-t border-slate-100 pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700">
                      <Radio className="size-2.5 text-amber-600" /> NFC
                    </span>
                    <span className="font-mono font-black text-sm tracking-wider text-slate-950">
                      {activeCode}
                    </span>
                  </div>
                </div>

                {/* 4 Emergency Icon Badges */}
                <div className="w-full text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-slate-950 text-xs">
                    <span title="Wrong Parking" className="p-1 rounded-full bg-white/70 font-bold">🚫</span>
                    <span title="Emergency / SOS" className="p-1 rounded-full bg-white/70 font-bold">🆘</span>
                    <span title="Caution / Towing" className="p-1 rounded-full bg-white/70 font-bold">⚠️</span>
                    <span title="Direct Call" className="p-1 rounded-full bg-white/70 font-bold">📞</span>
                  </div>
                  <p className="text-[9px] font-extrabold text-slate-950 leading-tight">
                    Wrong Parking • Emergency Contact • Scan QR
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={copyLink}
                className="btn-secondary flex-1 !py-2 text-xs"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={() => window.open(qrImageUrl, '_blank')}
                className="btn-secondary !py-2 px-3 text-xs"
                title="Download QR Image"
              >
                <Download className="size-3.5" />
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary !py-2 px-3 text-xs"
                title="Print Sticker"
              >
                <Printer className="size-3.5" />
              </button>
            </div>

            <button
              onClick={() => navigate(`/scan/${activeCode}`)}
              className="btn-primary w-full text-xs font-bold"
            >
              <ExternalLink className="size-4" />
              <span>Open Bystander Scan Simulation</span>
            </button>
          </div>
        </div>

        {/* Physical Sticker Configuration Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <QrCode className="size-5 text-brand-600 dark:text-cyan-400" />
              <span>Select or Set Any Physical Pre-Printed Sticker Code</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If you have printed physical stickers (e.g. <strong className="font-mono text-brand-700 dark:text-cyan-400">MH-1001</strong>, <strong className="font-mono text-brand-700 dark:text-cyan-400">GR-5520</strong>), enter it below to generate the exact QR code matching your physical stock!
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={activeCode}
                onChange={(e) => setActiveCode(e.target.value.trim().toUpperCase())}
                placeholder="e.g. MH-1001"
                className="flex-1 rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-sm font-mono uppercase font-bold text-ink dark:text-white focus:border-brand-500 focus:outline-none"
              />
              <button
                onClick={() => alert(`Sticker code set to: ${activeCode}`)}
                className="btn-primary !px-5 text-xs font-bold"
              >
                Set Sticker
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#1f2333] space-y-3">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Claim / Bind Sticker {activeCode} to Your Vehicle
              </h3>
              {vehicles.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Your Vehicle
                  </label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-semibold text-ink dark:text-white focus:outline-none"
                  >
                    {vehicles.map(v => (
                      <option key={v._id} value={v.vehicleNumber}>
                        {v.vehicleNumber} ({v.vehicleModel || v.vehicleType || 'Vehicle'})
                      </option>
                    ))}
                    <option value="NEW">➕ Add New Vehicle Number</option>
                  </select>
                </div>
              )}

              {(vehicles.length === 0 || selectedVehicle === 'NEW') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Vehicle Number Plate
                  </label>
                  <input
                    type="text"
                    value={customVehicle}
                    onChange={(e) => setCustomVehicle(e.target.value)}
                    placeholder="e.g. MH 19 AB 1234"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs font-mono font-bold uppercase text-ink dark:text-white focus:outline-none"
                  />
                </div>
              )}

              {claimMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>{claimMsg}</span>
                </div>
              )}

              <button
                onClick={handleClaimSticker}
                disabled={claiming}
                className="btn-primary w-full text-xs font-bold !bg-amber-500 hover:!bg-amber-600 !text-slate-950 shadow-md shadow-amber-500/20"
              >
                {claiming ? 'Linking Sticker...' : `Claim & Link ${activeCode} to Selected Vehicle`}
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1f2333]">
              <span className="text-xs text-slate-500 dark:text-slate-400">Need a fresh random code?</span>
              <button
                onClick={handleBatchGenerate}
                disabled={generating}
                className="btn-secondary !py-1.5 !px-3 text-xs"
              >
                <RefreshCw className={`size-3.5 ${generating ? 'animate-spin' : ''}`} />
                <span>Generate Random Code</span>
              </button>
            </div>
          </div>

          {/* List of Registered Scanners */}
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 dark:border-[#1f2333] px-6 py-4">
              <h3 className="font-bold text-sm text-ink">Registered Stickers in Network</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your activated and bound vehicle QR codes</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#1f2333] text-xs">
              {(tags.length > 0 ? tags : [
                {
                  _id: 't1',
                  tagCode: 'MH-1001',
                  status: 'ACTIVE',
                  vehicleDetails: { vehicleNumber: 'MH19 AB 1234' },
                  claimedAt: new Date()
                }
              ]).map((t) => (
                <div key={t._id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#161826]">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-mono font-bold text-xs">
                      QR
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-mono text-sm font-bold text-ink">{t.tagCode}</strong>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Assigned to: <strong className="font-mono text-slate-700 dark:text-slate-300">{t.vehicleDetails?.vehicleNumber || 'MH19 AB 1234'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveCode(t.tagCode)}
                      className="btn-secondary !py-1 !px-2.5 text-xs"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/scan/${t.tagCode}`)}
                      className="btn-primary !py-1 !px-2.5 text-xs"
                    >
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
