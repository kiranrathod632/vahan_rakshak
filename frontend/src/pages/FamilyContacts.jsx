import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Phone, Trash2, ShieldCheck, HeartHandshake, X } from 'lucide-react';

export default function FamilyContacts() {
  const { user, authFetch, fetchProfile } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relation: 'Father',
    phone: '',
    isPrimary: false
  });

  useEffect(() => {
    if (user?.emergencyContacts) {
      setContacts(user.emergencyContacts);
    }
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/auth/emergency-contacts', {
        method: 'POST',
        body: JSON.stringify(newContact)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewContact({ name: '', relation: 'Father', phone: '', isPrimary: false });
        fetchProfile();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (contactId) => {
    if (!confirm('Are you sure you want to remove this family contact?')) return;
    try {
      const res = await authFetch(`/api/auth/emergency-contacts/${contactId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchProfile();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const defaultContacts = [
    { _id: 'c1', name: 'Pandurang Patil', relation: 'Father', phone: '9822111111', isPrimary: true },
    { _id: 'c2', name: 'Sunita Patil', relation: 'Spouse', phone: '9822222222', isPrimary: false },
    { _id: 'c3', name: 'Anil Patil', relation: 'Brother', phone: '9822333333', isPrimary: false }
  ];

  const displayList = contacts.length > 0 ? contacts : defaultContacts;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">Family Emergency Contacts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Link 3-4 trusted family members who receive automated Calls, SMS, and WhatsApp alerts with GPS location during road accidents.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="size-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map((c) => (
          <div key={c._id} className="card p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <HeartHandshake className="size-5" />
                </span>
                {c.isPrimary && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                    <ShieldCheck className="size-3" /> Primary Responder
                  </span>
                )}
              </div>

              <h3 className="mt-4 font-bold text-base text-ink">{c.name}</h3>
              <p className="text-xs text-brand-700 dark:text-brand-400 font-semibold">{c.relation}</p>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono">
                <Phone className="size-3.5 text-slate-400" />
                <span>+91 {c.phone}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
              <a
                href={`https://wa.me/91${c.phone}?text=Hello%20${encodeURIComponent(c.name)}%2C%20this%20is%20a%20test%20from%20GadiRaksha%20Emergency%20Safety%20Network.`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary flex-1 !py-1.5 text-xs text-emerald-700 dark:text-emerald-400"
              >
                <span>WhatsApp Test</span>
              </a>
              <button
                onClick={() => handleDelete(c._id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                title="Remove Contact"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <h3 className="text-base font-bold text-ink">Add Family Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-ink text-sm font-bold">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
                <select
                  value={newContact.relation}
                  onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="Father" className="dark:bg-[#0b0d14]">Father</option>
                  <option value="Mother" className="dark:bg-[#0b0d14]">Mother</option>
                  <option value="Spouse" className="dark:bg-[#0b0d14]">Spouse (Wife/Husband)</option>
                  <option value="Brother" className="dark:bg-[#0b0d14]">Brother</option>
                  <option value="Sister" className="dark:bg-[#0b0d14]">Sister</option>
                  <option value="Son" className="dark:bg-[#0b0d14]">Son</option>
                  <option value="Daughter" className="dark:bg-[#0b0d14]">Daughter</option>
                  <option value="Relative" className="dark:bg-[#0b0d14]">Relative</option>
                  <option value="Friend" className="dark:bg-[#0b0d14]">Friend</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile / WhatsApp Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9822112233"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newContact.isPrimary}
                  onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                  className="size-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span>Set as primary emergency responder</span>
              </label>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
