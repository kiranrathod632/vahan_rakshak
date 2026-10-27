import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { FileText, Shield, CheckCircle2, AlertTriangle, Calendar, Edit3, X, Eye } from 'lucide-react';

export default function Documents() {
  const { authFetch } = useAuth();
  const [documents, setDocuments] = useState({
    puc: { docNumber: 'MH19-PUC-98214', validUntil: '2027-04-15' },
    insurance: { docNumber: 'BAJAJ-ALLIANZ-882', companyName: 'Bajaj Allianz', validUntil: '2027-02-28' },
    rc: { docNumber: 'MH19AB1234', validUntil: '2035-10-10' }
  });
  const [showDocsOnScan, setShowDocsOnScan] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeDocType, setActiveDocType] = useState('puc');

  const [editForm, setEditForm] = useState({
    docNumber: '',
    companyName: '',
    validUntil: ''
  });

  const openEdit = (type) => {
    setActiveDocType(type);
    const curr = documents[type] || {};
    setEditForm({
      docNumber: curr.docNumber || '',
      companyName: curr.companyName || '',
      validUntil: curr.validUntil ? curr.validUntil.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleSaveDoc = async (e) => {
    e.preventDefault();
    const updated = {
      ...documents,
      [activeDocType]: {
        ...documents[activeDocType],
        ...editForm
      }
    };
    setDocuments(updated);
    setShowEditModal(false);

    try {
      await authFetch('/api/tags/MH-1001/documents', {
        method: 'PUT',
        body: JSON.stringify({
          [activeDocType]: editForm,
          showDocsOnScan
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Vehicle Documents</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of PUC, Insurance, and RC validity. Receive automated renewal reminders before expiration.
          </p>
        </div>

        {/* Privacy verification toggle */}
        <label className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#12141e] border border-slate-200 dark:border-[#1f2333] rounded-xl cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={showDocsOnScan}
            onChange={(e) => setShowDocsOnScan(e.target.checked)}
            className="size-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
          <span className="text-slate-700 dark:text-slate-300 font-medium">Show verified badges on public scan</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PUC Card */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <FileText className="size-5" />
              </span>
              <StatusBadge status="VALID" label="Valid (Active)" />
            </div>

            <h3 className="mt-4 font-bold text-base text-ink">Pollution (PUC) Certificate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Certificate No: <strong className="text-ink">{documents.puc?.docNumber || 'MH19-PUC-98214'}</strong>
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="size-3.5 text-slate-400" />
              <span>Valid until: <strong>{documents.puc?.validUntil || '2027-04-15'}</strong></span>
            </div>
          </div>

          <button
            onClick={() => openEdit('puc')}
            className="btn-secondary w-full text-xs font-semibold"
          >
            <Edit3 className="size-3.5" />
            <span>Update PUC</span>
          </button>
        </div>

        {/* Insurance Card */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Shield className="size-5" />
              </span>
              <StatusBadge status="VALID" label="Active Coverage" />
            </div>

            <h3 className="mt-4 font-bold text-base text-ink">Vehicle Insurance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Provider: <strong className="text-ink">{documents.insurance?.companyName || 'Bajaj Allianz'}</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Policy: <strong className="text-ink">{documents.insurance?.docNumber || 'BAJAJ-ALLIANZ-882'}</strong>
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="size-3.5 text-slate-400" />
              <span>Valid until: <strong>{documents.insurance?.validUntil || '2027-02-28'}</strong></span>
            </div>
          </div>

          <button
            onClick={() => openEdit('insurance')}
            className="btn-secondary w-full text-xs font-semibold"
          >
            <Edit3 className="size-3.5" />
            <span>Update Insurance</span>
          </button>
        </div>

        {/* RC Card */}
        <div className="card p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <CheckCircle2 className="size-5" />
              </span>
              <StatusBadge status="VALID" label="Lifetime Valid" />
            </div>

            <h3 className="mt-4 font-bold text-base text-ink">Registration Certificate (RC)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              RC Number: <strong className="text-ink">{documents.rc?.docNumber || 'MH19AB1234'}</strong>
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="size-3.5 text-slate-400" />
              <span>Valid until: <strong>2035-10-10</strong></span>
            </div>
          </div>

          <button
            onClick={() => openEdit('rc')}
            className="btn-secondary w-full text-xs font-semibold"
          >
            <Edit3 className="size-3.5" />
            <span>Update RC</span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <h3 className="text-base font-bold text-ink uppercase">
                Update {activeDocType} Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-ink text-sm font-bold"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document / Policy Number
                </label>
                <input
                  type="text"
                  required
                  value={editForm.docNumber}
                  onChange={(e) => setEditForm({ ...editForm, docNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono uppercase text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              {activeDocType === 'insurance' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Insurance Company Name
                  </label>
                  <input
                    type="text"
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    placeholder="e.g. Bajaj Allianz / ICICI Lombard"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valid Until Date
                </label>
                <input
                  type="date"
                  value={editForm.validUntil}
                  onChange={(e) => setEditForm({ ...editForm, validUntil: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
