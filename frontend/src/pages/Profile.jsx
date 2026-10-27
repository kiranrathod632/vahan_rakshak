import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, MapPin, Activity, Check, Heart, Shield } from 'lucide-react';

export default function Profile() {
  const { user, authFetch, fetchProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Sambhaji Patil',
    phone: user?.phone || '9823000000',
    email: user?.email || '',
    gender: user?.gender || 'Male',
    bloodGroup: user?.bloodGroup || 'B+',
    weight: user?.weight || 72,
    height: user?.height || '5.8 ft',
    profilePic: user?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    address: user?.address?.fullAddress || 'Station Road, Pachora, Dist. Jalgaon - 424201',
    medicalNotes: user?.medicalNotes || 'No known drug allergies'
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await authFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        fetchProfile();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink">My Profile & Rescue Demographics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personal demographics are shared with first responders and doctors during road accident emergencies to ensure immediate appropriate medical care.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
        {/* Avatar and basic info */}
        <div className="flex items-center gap-5 border-b border-slate-100 dark:border-[#1f2333] pb-6">
          <img
            src={formData.profilePic}
            alt={formData.name}
            className="size-16 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
          />
          <div>
            <h2 className="text-lg font-bold text-ink">{formData.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">+91 {formData.phone}</p>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
              <Heart className="size-3 text-rose-500" />
              <span>Blood Group: {formData.bloodGroup}</span>
            </div>
          </div>
        </div>

        {/* Demographics inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. sambhaji@example.com"
              className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="Male" className="dark:bg-[#0b0d14]">Male</option>
              <option value="Female" className="dark:bg-[#0b0d14]">Female</option>
              <option value="Other" className="dark:bg-[#0b0d14]">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group *</label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white font-bold text-rose-600 focus:border-brand-500 focus:outline-none"
            >
              <option value="A+" className="dark:bg-[#0b0d14]">A+</option>
              <option value="A-" className="dark:bg-[#0b0d14]">A-</option>
              <option value="B+" className="dark:bg-[#0b0d14]">B+</option>
              <option value="B-" className="dark:bg-[#0b0d14]">B-</option>
              <option value="O+" className="dark:bg-[#0b0d14]">O+</option>
              <option value="O-" className="dark:bg-[#0b0d14]">O-</option>
              <option value="AB+" className="dark:bg-[#0b0d14]">AB+</option>
              <option value="AB-" className="dark:bg-[#0b0d14]">AB-</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Height (e.g. 5.8 ft)</label>
            <input
              type="text"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Profile Photo URL</label>
            <input
              type="text"
              value={formData.profilePic}
              onChange={(e) => setFormData({ ...formData, profilePic: e.target.value })}
              className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Medical Notes / Allergies (Optional)</label>
          <textarea
            rows={2}
            value={formData.medicalNotes}
            onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
            className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#1f2333]">
          {savedSuccess ? (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
              <Check className="size-4" /> Demographics saved successfully!
            </span>
          ) : <span />}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
