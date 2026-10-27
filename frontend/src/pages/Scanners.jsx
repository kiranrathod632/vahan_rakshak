import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Scanners() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [activeCode, setActiveCode] = useState('MH-1001');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

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
  }, []);

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
      const res = await fetch('/api/tags/batch-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ADMIN-KEY': 'gadiraksha_admin_secret_batch_gen_key_2026'
        },
        body: JSON.stringify({ count: 1 })
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
        {/* Active QR Sticker Showcase Card */}
        <div className="card p-6 flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200 dark:border-brand-900/60">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Active Weatherproof Sticker</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-xl">
            <img
              src={qrImageUrl}
              alt="Vehicle QR"
              className="size-48 rounded-xl object-contain mx-auto"
            />
            <div className="mt-3 font-mono font-black text-lg tracking-widest text-slate-950">
              {activeCode}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              GadiRaksha Smart Safety
            </p>
          </div>

          <div className="flex gap-2 w-full pt-2">
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
