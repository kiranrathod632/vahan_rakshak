import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  CheckCircle2,
  Heart,
  User,
  Check
} from 'lucide-react';

export default function Dashboard() {
  const { user, authFetch, fetchProfile } = useAuth();
  const { recentAlerts } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [vehicles, setVehicles] = useState([]);
  const [tags, setTags] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals for post-registration details:
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Form states:
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    vehicleType: 'Two-Wheeler', // Two-Wheeler (Bike / Scooter) default
    vehicleModel: '',
    vehicleColor: '',
    tagCode: ''
  });

  const [familyForm, setFamilyForm] = useState({
    name: '',
    relation: 'Father',
    phone: '',
    isPrimary: true
  });

  const [personalForm, setPersonalForm] = useState({
    bloodGroup: user?.bloodGroup || 'B+',
    gender: user?.gender || 'Male',
    address: user?.address?.fullAddress || (typeof user?.address === 'string' ? user?.address : '') || ''
  });

  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // Quick pre-printed claim modal state
  const [claimTagCode, setClaimTagCode] = useState('');
  const [selectedClaimVehicle, setSelectedClaimVehicle] = useState('');
  const [customClaimVehicle, setCustomClaimVehicle] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  // Fetch dashboard data
  const loadData = async () => {
    try {
      const [vRes, tRes, aRes] = await Promise.all([
        authFetch('/api/auth/vehicles').then((r) => r.json()).catch(() => ({ data: [] })),
        authFetch('/api/tags/my-tags').then((r) => r.json()).catch(() => ({ data: [] })),
        authFetch('/api/alerts/my-alerts').then((r) => r.json()).catch(() => ({ data: [] }))
      ]);

      const vList = vRes.data || [];
      const tList = tRes.data || [];
      setVehicles(vList);
      setTags(tList);
      setAlerts(aRes.data || []);

      if (vList.length > 0 && !selectedClaimVehicle) {
        setSelectedClaimVehicle(vList[0].vehicleNumber);
      }

      // Pre-select any unlinked or first active tag for vehicle form
      if (tList.length > 0 && !vehicleForm.tagCode) {
        const unlinked = tList.find((t) => !t.vehicle) || tList[0];
        if (unlinked) {
          setVehicleForm((prev) => ({ ...prev, tagCode: unlinked.tagCode }));
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // If arriving straight from registration, auto-open Bike details modal if no vehicles exist
    if (location.state?.justRegistered) {
      setShowVehicleModal(true);
    }
  }, []);

  // Save Bike / Vehicle Details
  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.vehicleNumber.trim()) {
      setModalError('Please enter vehicle registration number (e.g. MH 12 AB 1234)');
      return;
    }
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    try {
      const res = await authFetch('/api/auth/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          vehicleNumber: vehicleForm.vehicleNumber.toUpperCase().trim(),
          vehicleType: vehicleForm.vehicleType,
          vehicleModel: vehicleForm.vehicleModel.trim(),
          vehicleColor: vehicleForm.vehicleColor.trim(),
          tagCode: vehicleForm.tagCode ? vehicleForm.tagCode.toUpperCase().trim() : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalSuccess('🎉 Vehicle added and linked to your QR sticker successfully!');
        await loadData();
        await fetchProfile();
        setTimeout(() => {
          setShowVehicleModal(false);
          setModalSuccess('');
          setVehicleForm({ vehicleNumber: '', vehicleType: 'Two-Wheeler', vehicleModel: '', vehicleColor: '', tagCode: '' });
          // If no family contacts yet, gently open family contacts next
          if (!user?.emergencyContacts || user.emergencyContacts.length === 0) {
            setShowFamilyModal(true);
          }
        }, 1200);
      } else {
        setModalError(data.message || 'Failed to add vehicle');
      }
    } catch (err) {
      setModalError('Error: ' + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Save Family Emergency Contact
  const handleSaveFamily = async (e) => {
    e.preventDefault();
    if (!familyForm.name.trim() || !familyForm.phone.trim()) {
      setModalError('Please provide contact name and 10-digit mobile number');
      return;
    }
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    const cleanPhone = familyForm.phone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setModalError('Please enter a valid 10-digit mobile number');
      setModalLoading(false);
      return;
    }

    try {
      const res = await authFetch('/api/auth/emergency-contacts', {
        method: 'POST',
        body: JSON.stringify({
          name: familyForm.name.trim(),
          relation: familyForm.relation || 'Father',
          phone: cleanPhone,
          isPrimary: familyForm.isPrimary
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalSuccess('🎉 Family emergency contact saved successfully!');
        await fetchProfile();
        setTimeout(() => {
          setShowFamilyModal(false);
          setModalSuccess('');
          setFamilyForm({ name: '', relation: 'Mother', phone: '', isPrimary: false });
        }, 1200);
      } else {
        setModalError(data.message || 'Failed to save family contact');
      }
    } catch (err) {
      setModalError('Error: ' + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Save Personal Demographics (Blood Group & Address)
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    try {
      const res = await authFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          bloodGroup: personalForm.bloodGroup,
          gender: personalForm.gender,
          address: personalForm.address.trim() ? personalForm.address.trim() : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalSuccess('🎉 Personal & emergency rescue info updated!');
        await fetchProfile();
        setTimeout(() => {
          setShowPersonalModal(false);
          setModalSuccess('');
        }, 1200);
      } else {
        setModalError(data.message || 'Failed to update personal details');
      }
    } catch (err) {
      setModalError('Error: ' + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Quick pre-printed claim submit
  const handleQuickClaim = async (e) => {
    e.preventDefault();
    if (!claimTagCode || !claimTagCode.trim()) return;
    setClaimLoading(true);
    setClaimSuccess('');

    const targetVehicle =
      selectedClaimVehicle === 'NEW'
        ? customClaimVehicle
        : selectedClaimVehicle || vehicles[0]?.vehicleNumber || customClaimVehicle;
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

  const activeScannersCount = tags.filter((t) => t.status === 'ACTIVE').length;
  const expiringDocsCount = tags.filter((t) => t.documentExpiryStatus?.hasExpiringOrExpired).length;

  const hasVehicle = vehicles.length > 0;
  const hasFamily = user?.emergencyContacts && user.emergencyContacts.length > 0;
  const hasPersonal = Boolean(user?.bloodGroup && user.bloodGroup !== 'Unknown');

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-brand-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="size-3.5 text-amber-300" />
            <span>QR Safety Shield Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Welcome back, {user?.name || 'Vehicle Owner'}!
          </h1>
          <p className="mt-1 text-sm text-brand-200/90 max-w-xl">
            Aapka QR Scanner active hai. Kisi bhi emergency ya parking issue me bystander scan karega toh bina aapka number dikhe sidhe call aur family SOS alert jayega.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowVehicleModal(true)}
            className="btn-primary !bg-white !text-brand-900 hover:!bg-brand-50 shadow-md font-bold text-xs flex items-center gap-1.5"
          >
            <Car className="size-4 text-brand-700" />
            <span>Add Bike / Vehicle</span>
          </button>
          <button
            onClick={() => setShowFamilyModal(true)}
            className="btn-secondary !bg-brand-800/60 !border-brand-700 !text-white hover:!bg-brand-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <Users className="size-4" />
            <span>Add Family SOS</span>
          </button>
          <button
            onClick={() => setShowPersonalModal(true)}
            className="btn-secondary !bg-brand-800/60 !border-brand-700 !text-white hover:!bg-brand-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <User className="size-4" />
            <span>Personal Info</span>
          </button>
        </div>
      </div>

      {/* Post-Registration Quick Setup Action Cards (Prominently shows when details need to be completed) */}
      {(!hasVehicle || !hasFamily || !hasPersonal) && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                Setup In Progress
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ink dark:text-white mt-1">
                Complete Your Safety Details (गाड़ी एवं परिवार की जानकारी यहाँ से जोड़ें)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Aapka account aur QR scanner activate ho chuka hai. Poori suraksha ke liye neeche diye 3 steps complete karein:
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {Number(hasVehicle) + Number(hasFamily) + Number(hasPersonal)} of 3 Complete
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Step A: Bike / Vehicle Details */}
            <div
              onClick={() => setShowVehicleModal(true)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                hasVehicle
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-[#12141e] border-slate-200 dark:border-[#272b3f] hover:border-brand-500 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${hasVehicle ? 'bg-emerald-500 text-white' : 'bg-brand-50 dark:bg-brand-950 text-brand-600'}`}>
                    <Car className="size-5" />
                  </div>
                  {hasVehicle ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="size-3.5 stroke-[3]" /> Added
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-brand-600 dark:text-cyan-400">
                      Step 1
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-ink dark:text-white">1. Bike / Vehicle Info</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {hasVehicle
                    ? `${vehicles[0]?.vehicleNumber} (${vehicles[0]?.vehicleModel || vehicles[0]?.vehicleType})`
                    : 'Gadi number aur model jodein taaki QR sticker gadi se link ho.'}
                </p>
              </div>
              <button
                type="button"
                className={`mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  hasVehicle ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200' : 'bg-brand-600 text-white hover:bg-brand-500'
                }`}
              >
                <span>{hasVehicle ? 'Edit Bike Info' : '+ Add Bike Details'}</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* Step B: Family SOS Contacts */}
            <div
              onClick={() => setShowFamilyModal(true)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                hasFamily
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-[#12141e] border-slate-200 dark:border-[#272b3f] hover:border-rose-500 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${hasFamily ? 'bg-emerald-500 text-white' : 'bg-rose-50 dark:bg-rose-950 text-rose-600'}`}>
                    <Heart className="size-5" />
                  </div>
                  {hasFamily ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="size-3.5 stroke-[3]" /> Added
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      Step 2
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-ink dark:text-white">2. Family Emergency SOS</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {hasFamily
                    ? `${user?.emergencyContacts[0]?.name} (${user?.emergencyContacts[0]?.relation})`
                    : 'Emergency me parivaar ko turant call aur alert bhejne ke liye.'}
                </p>
              </div>
              <button
                type="button"
                className={`mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  hasFamily ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200' : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
              >
                <span>{hasFamily ? 'Edit Family SOS' : '+ Add Family Contact'}</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>

            {/* Step C: Personal Info (Blood Group & Address) */}
            <div
              onClick={() => setShowPersonalModal(true)}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                hasPersonal
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-[#12141e] border-slate-200 dark:border-[#272b3f] hover:border-amber-500 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${hasPersonal ? 'bg-emerald-500 text-white' : 'bg-amber-50 dark:bg-amber-950 text-amber-600'}`}>
                    <User className="size-5" />
                  </div>
                  {hasPersonal ? (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="size-3.5 stroke-[3]" /> Added
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      Step 3
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-ink dark:text-white">3. Personal & Medical Info</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {hasPersonal
                    ? `Blood Group: ${user?.bloodGroup}`
                    : 'Emergency rescue ke liye Blood Group aur pata add karein.'}
                </p>
              </div>
              <button
                type="button"
                className={`mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  hasPersonal ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200' : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                <span>{hasPersonal ? 'Edit Personal Info' : '+ Add Blood Group'}</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

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
              {vehicles.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">registered</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
            {vehicles[0]?.vehicleModel || (vehicles.length === 0 ? 'No vehicle added yet' : 'Vehicle')}
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
              {user?.emergencyContacts?.length || 0}
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
              <button
                type="button"
                onClick={() => setShowVehicleModal(true)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>+ Add Bike / Vehicle</span>
                <ChevronRight className="size-4" />
              </button>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-[#1f2333]">
              {vehicles.length > 0 ? (
                vehicles.map((veh) => (
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
                ))
              ) : (
                <li className="p-8 text-center space-y-3">
                  <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 grid place-items-center mx-auto">
                    <Car className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink dark:text-white">No Vehicles Added Yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Aapka QR sticker registered hai! Apni bike ya car ka number add karein taaki bystander call aur emergency alerts kaam karein.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowVehicleModal(true)}
                    className="btn-primary !py-2 !px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow"
                  >
                    <Plus className="size-4" />
                    <span>Add Bike / Vehicle Now</span>
                  </button>
                </li>
              )}
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
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No active emergencies. Your vehicles are safe and secure.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1 Col on lg) */}
        <div className="space-y-8">
          
          {/* Family Emergency Circle Card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="size-4.5 text-rose-600" />
                <h3 className="font-bold text-sm text-ink">Family Emergency Circle</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFamilyModal(true)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                + Add Member
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              In case of accident or emergency, these contacts receive immediate SMS/WhatsApp SOS alerts with your GPS location:
            </p>

            <ul className="space-y-2 text-xs">
              {user?.emergencyContacts && user.emergencyContacts.length > 0 ? (
                user.emergencyContacts.map((c, i) => (
                  <li key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/60 dark:border-[#22253a]">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">({c.relation})</span>
                      <span className="block font-mono text-[11px] text-slate-500">{c.phone}</span>
                    </div>
                    {c.isPrimary && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
                        Primary
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <li className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 text-center space-y-2">
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
                    No family emergency contacts added yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFamilyModal(true)}
                    className="btn-primary !bg-rose-600 hover:!bg-rose-500 !py-1.5 !px-3 text-xs"
                  >
                    + Add Primary Contact
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Personal Medical Info Card */}
          <div className="card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="size-4.5 text-brand-600" />
                <h3 className="font-bold text-sm text-ink">Personal & Rescue Info</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPersonalModal(true)}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/60 dark:border-[#22253a]">
                <span className="text-[10px] text-slate-400 block font-semibold">Blood Group</span>
                <strong className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                  {user?.bloodGroup || 'Not Added'}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/60 dark:border-[#22253a]">
                <span className="text-[10px] text-slate-400 block font-semibold">Gender</span>
                <strong className="text-ink dark:text-white font-bold text-xs">
                  {user?.gender || 'Male'}
                </strong>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/60 dark:border-[#22253a] text-xs">
              <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">Address</span>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] truncate">
                {user?.address?.fullAddress || (typeof user?.address === 'string' ? user?.address : '') || 'Address not added yet'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ================= MODAL 1: ADD BIKE / VEHICLE ================= */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-cyan-400">
                  <Car className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink dark:text-white">Add Bike / Vehicle Details</h3>
                  <p className="text-[11px] text-slate-400">Apni gaadi ki details add karein</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowVehicleModal(false);
                  setModalError('');
                  setModalSuccess('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 text-xs font-semibold">
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleSaveVehicle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Registration Number (गाड़ी नंबर) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH 12 AB 1234 or DL 8C AB 9988"
                  value={vehicleForm.vehicleNumber}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-sm font-mono font-black uppercase text-ink dark:text-white tracking-wider focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Type (प्रकार) *
                  </label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none font-semibold"
                  >
                    <option value="Two-Wheeler">Two-Wheeler (Bike / Scooter)</option>
                    <option value="Car">Car / SUV / Sedan</option>
                    <option value="Commercial">Commercial (Truck / Van)</option>
                    <option value="Auto-Rickshaw">Auto-Rickshaw (3W)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Make & Model (मेक/मॉडल)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hero Splendor / Activa"
                    value={vehicleForm.vehicleModel}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleModel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Color (रंग)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Black / Red / Silver"
                    value={vehicleForm.vehicleColor}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleColor: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link QR Sticker
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH-1001"
                    value={vehicleForm.tagCode}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, tagCode: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono font-bold text-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary flex-1 font-bold"
                >
                  {modalLoading ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD FAMILY EMERGENCY CONTACT ================= */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
                  <Heart className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink dark:text-white">Add Family Emergency Contact</h3>
                  <p className="text-[11px] text-slate-400">आपातकालीन परिवार संपर्क जोड़ें</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowFamilyModal(false);
                  setModalError('');
                  setModalSuccess('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 text-xs font-semibold">
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleSaveFamily} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Name (नाम) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil (Father)"
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs text-ink dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Relationship (रिश्ता) *
                  </label>
                  <select
                    value={familyForm.relation}
                    onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                  >
                    <option value="Father">Father (पिता)</option>
                    <option value="Mother">Mother (माता)</option>
                    <option value="Spouse">Spouse (पति/पत्नी)</option>
                    <option value="Brother">Brother (भाई)</option>
                    <option value="Sister">Sister (बहन)</option>
                    <option value="Son">Son (बेटा)</option>
                    <option value="Daughter">Daughter (बेटी)</option>
                    <option value="Friend">Friend (दोस्त)</option>
                    <option value="Other">Other Relative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="9822110000"
                    value={familyForm.phone}
                    onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono font-bold text-ink dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFamilyModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary !bg-rose-600 hover:!bg-rose-500 flex-1 font-bold"
                >
                  {modalLoading ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: PERSONAL DEMOGRAPHICS ================= */}
      {showPersonalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <User className="size-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink dark:text-white">Personal & Medical Info</h3>
                  <p className="text-[11px] text-slate-400">ब्लड ग्रुप एवं रेस्क्यू पता</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPersonalModal(false);
                  setModalError('');
                  setModalSuccess('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 text-xs font-semibold">
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleSavePersonal} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group (ब्लड ग्रुप)
                  </label>
                  <select
                    value={personalForm.bloodGroup}
                    onChange={(e) => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-bold text-rose-600 focus:outline-none"
                  >
                    <option value="B+">B+ (B Positive)</option>
                    <option value="O+">O+ (O Positive)</option>
                    <option value="A+">A+ (A Positive)</option>
                    <option value="AB+">AB+ (AB Positive)</option>
                    <option value="B-">B- (B Negative)</option>
                    <option value="O-">O- (O Negative)</option>
                    <option value="A-">A- (A Negative)</option>
                    <option value="AB-">AB- (AB Negative)</option>
                    <option value="Unknown">Don't know yet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender (लिंग)
                  </label>
                  <select
                    value={personalForm.gender}
                    onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address (रेस्क्यू हेतु पता)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Flat 402, Station Road, Pune - 411038"
                  value={personalForm.address}
                  onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] p-3 text-xs text-ink dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPersonalModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary !bg-amber-600 hover:!bg-amber-500 flex-1 font-bold"
                >
                  {modalLoading ? 'Saving...' : 'Save Info'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    {vehicles.map((v) => (
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
