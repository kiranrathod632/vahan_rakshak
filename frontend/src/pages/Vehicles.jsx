import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PlateBadge from '../components/PlateBadge';
import StatusBadge from '../components/StatusBadge';
import { Car, Plus, QrCode, Shield, FileText, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Vehicles() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New vehicle form state
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Car',
    vehicleModel: '',
    vehicleColor: '',
    tagCode: '',
    pucNumber: '',
    insuranceNumber: '',
    insuranceCompany: ''
  });

  const loadVehicles = async () => {
    try {
      const res = await authFetch('/api/auth/vehicles');
      const data = await res.json();
      if (data.success && data.data) {
        setVehicles(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/auth/vehicles', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({
          vehicleNumber: '',
          vehicleType: 'Car',
          vehicleModel: '',
          vehicleColor: '',
          tagCode: '',
          pucNumber: '',
          insuranceNumber: '',
          insuranceCompany: ''
        });
        loadVehicles();
      } else {
        alert(data.message || 'Failed to add vehicle');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-ink">My Vehicles</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Register and manage your cars, bikes, and connected safety stickers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="size-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(vehicles.length > 0 ? vehicles : [
          {
            _id: 'default_v1',
            vehicleNumber: 'MH19 AB 1234',
            vehicleType: 'Two-Wheeler',
            vehicleModel: 'Honda Activa 6G',
            vehicleColor: 'Pearl White',
            tagCode: 'MH-1001',
            puc: { pucNumber: 'MH19-PUC-98214' },
            insurance: { insuranceNumber: 'BAJAJ-ALLIANZ-882' }
          }
        ]).map((veh) => (
          <div key={veh._id} className="card p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <PlateBadge value={veh.vehicleNumber} size="md" />
                <StatusBadge status="ACTIVE" label="Protected" />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                  <Car className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink">{veh.vehicleModel || 'Vehicle'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {veh.vehicleType} · {veh.vehicleColor || 'Standard'}
                  </p>
                </div>
              </div>

              {/* Linked Tag & Document Info */}
              <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 dark:border-[#1f2333] text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <QrCode className="size-3.5 text-brand-600 dark:text-brand-400" /> Linked Sticker:
                  </span>
                  <strong className="font-mono text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-900/60">
                    {veh.tagCode || 'MH-1001'}
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <FileText className="size-3.5" /> PUC Certificate:
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Valid</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Shield className="size-3.5" /> Insurance:
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-[#1f2333]">
              <button
                onClick={() => navigate(`/scan/${veh.tagCode || 'MH-1001'}`)}
                className="btn-secondary flex-1 !py-1.5 text-xs"
              >
                <QrCode className="size-3.5" />
                <span>Scan Simulation</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <h3 className="text-base font-bold text-ink">Register New Vehicle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-ink text-sm font-bold"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Registration No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH19 AB 1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono uppercase text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Car" className="dark:bg-[#0b0d14]">Car / Four-Wheeler</option>
                    <option value="Two-Wheeler" className="dark:bg-[#0b0d14]">Bike / Scooter</option>
                    <option value="Commercial" className="dark:bg-[#0b0d14]">Commercial / Truck</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand & Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Honda Activa 6G"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. White / Silver"
                    value={formData.vehicleColor}
                    onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Sticker Code (if you have one)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH-1001 or GR-5520"
                  value={formData.tagCode}
                  onChange={(e) => setFormData({ ...formData, tagCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono uppercase text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PUC Number
                  </label>
                  <input
                    type="text"
                    placeholder="PUC Number"
                    value={formData.pucNumber}
                    onChange={(e) => setFormData({ ...formData, pucNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Insurance Policy Number
                  </label>
                  <input
                    type="text"
                    placeholder="Insurance Policy No"
                    value={formData.insuranceNumber}
                    onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
