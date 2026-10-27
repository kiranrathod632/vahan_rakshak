import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PlateBadge from '../components/PlateBadge';
import {
  Shield,
  QrCode,
  User,
  Users,
  Car,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Heart,
  Phone,
  Lock,
  Sparkles,
  Camera,
  Sun,
  Moon,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function ActivateWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { fetchProfile } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  // Extract pre-scanned tag code from URL query (?tagCode=MH-1001) or navigation state
  const rawTagParam = searchParams.get('tagCode') || location.state?.tagCode || '';
  const initialTagCode = rawTagParam.toUpperCase().trim();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagStatus, setTagStatus] = useState(null);
  const [checkingTag, setCheckingTag] = useState(false);

  // Form state across all steps
  const [formData, setFormData] = useState({
    // Step 1: Account
    phone: '',
    password: '',
    // Step 2: Pre-printed scanner
    tagCode: initialTagCode,
    // Step 3: Personal details
    name: '',
    gender: 'Male',
    bloodGroup: 'B+',
    weight: '',
    height: '',
    address: '',
    profilePic: '',
    // Step 4: Family contacts
    fam1Name: '',
    fam1Phone: '',
    fam1Relation: 'Father',
    fam2Name: '',
    fam2Phone: '',
    fam2Relation: 'Spouse',
    fam3Name: '',
    fam3Phone: '',
    fam3Relation: 'Brother',
    // Step 5: Vehicle details
    vehicleNumber: '',
    vehicleType: 'Car',
    vehicleModel: '',
    vehicleColor: '',
    pucNumber: '',
    insuranceNumber: ''
  });

  // Check availability of unique physical sticker code
  const checkTagCode = async (code) => {
    const cleanCode = (code || formData.tagCode || '').toUpperCase().trim();
    if (!cleanCode) {
      setTagStatus(null);
      return;
    }
    setCheckingTag(true);
    try {
      const res = await fetch(`/api/tags/check/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      setTagStatus(data);
    } catch (err) {
      setTagStatus({ available: true, message: `Sticker ${cleanCode} ready for claiming.` });
    } finally {
      setCheckingTag(false);
    }
  };

  useEffect(() => {
    if (initialTagCode) {
      checkTagCode(initialTagCode);
    }
  }, [initialTagCode]);

  const nextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.phone || formData.phone.length < 10) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.tagCode.trim()) {
        setError('Please enter or scan the pre-printed QR sticker code');
        return;
      }
      if (tagStatus && tagStatus.available === false) {
        setError(tagStatus.message || `Physical sticker "${formData.tagCode}" is already claimed by another user.`);
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.name.trim()) {
        setError('Please enter your full name');
        return;
      }
    }
    if (currentStep === 4) {
      if (!formData.fam1Name || !formData.fam1Phone) {
        setError('Please provide at least 1 primary family contact');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emergencyContacts = [
      { name: formData.fam1Name, relation: formData.fam1Relation || 'Father', phone: formData.fam1Phone, isPrimary: true },
      { name: formData.fam2Name, relation: formData.fam2Relation || 'Spouse', phone: formData.fam2Phone },
      { name: formData.fam3Name, relation: formData.fam3Relation || 'Brother', phone: formData.fam3Phone }
    ].filter(c => c.name && c.phone);

    const payload = {
      tagCode: formData.tagCode.trim().toUpperCase(),
      name: formData.name,
      phone: formData.phone,
      password: formData.password,
      profilePic: formData.profilePic,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      weight: Number(formData.weight),
      height: formData.height,
      address: formData.address,
      vehicleNumber: formData.vehicleNumber.toUpperCase().trim(),
      vehicleType: formData.vehicleType,
      vehicleModel: formData.vehicleModel,
      vehicleColor: formData.vehicleColor,
      emergencyContacts,
      puc: { docNumber: formData.pucNumber },
      insurance: { docNumber: formData.insuranceNumber }
    };

    try {
      const res = await fetch('/api/tags/register-and-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        if (data.data?.token) {
          localStorage.setItem('gr_token', data.data.token);
          localStorage.setItem('gr_user', JSON.stringify(data.data.user || {}));
        }
        await fetchProfile(data.data?.token);
        // Successfully assigned! Redirect to User Dashboard
        navigate('/app');
      } else {
        setError(data.message || 'Activation failed');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Account', icon: Phone },
    { num: 2, label: 'Scanner Code', icon: QrCode },
    { num: 3, label: 'Personal', icon: User },
    { num: 4, label: 'Family SOS', icon: Users },
    { num: 5, label: 'Vehicle', icon: Car }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 py-6 sm:py-10 px-4 sm:px-6 font-sans transition-colors duration-200">
      {/* Top Floating Navbar with Theme Toggle */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <Shield className="size-5" />
          </div>
          <span className="font-display font-extrabold text-xl text-ink dark:text-white">GadiRaksha</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink dark:text-white">
            Activate Physical Pre-Printed Sticker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Follow the 5 simple steps to assign your pre-printed safety scanner to your vehicle
          </p>
        </div>

        {/* Steps Progress Indicator */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isDone = currentStep > st.num;
              const isCurrent = currentStep === st.num;
              return (
                <div key={st.num} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid size-9 place-items-center rounded-xl text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-4 ring-brand-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="size-5" /> : <Icon className="size-4" />}
                    </div>
                    <span className={`text-[10px] font-semibold mt-1 hidden sm:block ${isCurrent ? 'text-brand-700' : 'text-slate-400'}`}>
                      {st.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 transition-all ${currentStep > st.num ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        {/* Step Cards Container */}
        <div className="card p-6 sm:p-8 space-y-6">
          
          {/* STEP 1: Signup Mobile Number & Password */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                  Step 1 of 5
                </span>
                <h2 className="text-lg font-bold text-ink mt-2">Create Your GadiRaksha Account</h2>
                <p className="text-xs text-slate-500">Sign up using your active WhatsApp / mobile number</p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9823000000"
                      className="w-full rounded-xl border border-slate-300 pl-12 pr-3.5 py-2.5 text-xs font-mono text-ink focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Set Secret Password *
                  </label>
                  <div className="relative">
                    <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Minimum 6 characters. Used to log into your user dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pre-Printed Scanner Code Input / Scan */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                  Step 2 of 5
                </span>
                <h2 className="text-lg font-bold text-ink mt-2">Assign Pre-Printed Scanner Sticker</h2>
                <p className="text-xs text-slate-600">
                  Company already printed physical QR stickers. Enter or scan the code on your physical sticker.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-4 text-center">
                <div className="size-16 rounded-2xl bg-white/10 text-amber-400 border border-white/10 grid place-items-center mx-auto text-3xl">
                  📦
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Enter Physical Sticker Code:
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Har QR scanner unique code ke saath aata hai. First scan ya registration pe vo permanently aapka hojayga.
                  </p>
                  <div className="flex max-w-xs mx-auto gap-2">
                    <input
                      type="text"
                      required
                      value={formData.tagCode}
                      onChange={(e) => {
                        const code = e.target.value.toUpperCase();
                        setFormData({ ...formData, tagCode: code });
                        setTagStatus(null);
                      }}
                      onBlur={() => {
                        if (formData.tagCode.trim()) checkTagCode(formData.tagCode);
                      }}
                      placeholder="e.g. MH-1001 or GR-5520"
                      className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-center text-sm font-mono uppercase font-black text-amber-400 tracking-widest focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => checkTagCode(formData.tagCode)}
                      disabled={checkingTag || !formData.tagCode.trim()}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      {checkingTag ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                      <span>Verify</span>
                    </button>
                  </div>
                </div>

                {/* Tag Live Status Feedback */}
                {tagStatus && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-semibold mx-auto max-w-sm flex items-center justify-center gap-2 border ${
                      tagStatus.available
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : 'bg-rose-950/60 text-rose-300 border-rose-800'
                    }`}
                  >
                    {tagStatus.available ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="size-4 shrink-0 text-rose-400" />
                    )}
                    <span>{tagStatus.message}</span>
                  </div>
                )}

                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, tagCode: 'MH-1001' });
                      checkTagCode('MH-1001');
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-mono font-semibold text-slate-200"
                  >
                    Sample: MH-1001
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, tagCode: 'GR-8840' });
                      checkTagCode('GR-8840');
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-mono font-semibold text-slate-200"
                  >
                    Sample: GR-8840
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-600" />
                  <span>Unique Physical Sticker Guarantee:</span>
                </span>
                <p className="text-amber-800 dark:text-amber-400 leading-relaxed">
                  Har sticker ka code completely unique rehta hai. First scan ya registration complete hote hi ye sticker permanently aapke vehicle aur emergency contacts ke saath bind ho jaata hai. Baad me koi aur ise claim nahi kar sakta.
                </p>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                This code links your physical sticker permanently to your account once completed!
              </p>
            </div>
          )}

          {/* STEP 3: Personal & Rescue Demographics */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  Step 3 of 5
                </span>
                <h2 className="text-lg font-bold text-ink mt-2">Owner Profile & Rescue Demographics</h2>
                <p className="text-xs text-slate-500">
                  Important medical information shared with emergency responders during road accidents
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sambhaji Patil"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-ink focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group *</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-rose-600 focus:border-brand-500 focus:outline-none"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-ink focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-ink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Height (e.g. 5.8 ft)</label>
                    <input
                      type="text"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Station Road, Pachora, Dist. Jalgaon - 424201"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-ink focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: 3-4 Family Emergency Contacts */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  Step 4 of 5
                </span>
                <h2 className="text-lg font-bold text-ink mt-2">3–4 Family Emergency Contacts</h2>
                <p className="text-xs text-slate-500">
                  During an emergency or road accident, these family members receive instant automated Calls, SMS, and WhatsApp alerts with your live location.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Contact 1 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Contact 1 (Primary Responder)</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      Primary
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={formData.fam1Name}
                      onChange={(e) => setFormData({ ...formData, fam1Name: e.target.value })}
                      placeholder="Name (e.g. Father)"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-ink"
                    />
                    <input
                      type="text"
                      required
                      value={formData.fam1Phone}
                      onChange={(e) => setFormData({ ...formData, fam1Phone: e.target.value })}
                      placeholder="WhatsApp Mobile No"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono text-ink"
                    />
                  </div>
                </div>

                {/* Contact 2 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700">Contact 2</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.fam2Name}
                      onChange={(e) => setFormData({ ...formData, fam2Name: e.target.value })}
                      placeholder="Name (e.g. Spouse)"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-ink"
                    />
                    <input
                      type="text"
                      value={formData.fam2Phone}
                      onChange={(e) => setFormData({ ...formData, fam2Phone: e.target.value })}
                      placeholder="WhatsApp Mobile No"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono text-ink"
                    />
                  </div>
                </div>

                {/* Contact 3 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-700">Contact 3</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.fam3Name}
                      onChange={(e) => setFormData({ ...formData, fam3Name: e.target.value })}
                      placeholder="Name (e.g. Brother)"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-ink"
                    />
                    <input
                      type="text"
                      value={formData.fam3Phone}
                      onChange={(e) => setFormData({ ...formData, fam3Phone: e.target.value })}
                      placeholder="WhatsApp Mobile No"
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono text-ink"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Vehicle Details & Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                  Step 5 of 5
                </span>
                <h2 className="text-lg font-bold text-ink mt-2">Vehicle Details & Activation</h2>
                <p className="text-xs text-slate-500">
                  Bind physical sticker <strong className="font-mono text-brand-700">{formData.tagCode}</strong> to your vehicle
                </p>
              </div>

              {/* Plate preview */}
              <div className="p-4 bg-slate-900 rounded-2xl text-center space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Live License Plate Preview</span>
                <PlateBadge value={formData.vehicleNumber} size="lg" />
              </div>

              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vehicle Plate Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. MH19 AB 1234"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono uppercase font-bold text-ink focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-ink focus:outline-none"
                    >
                      <option value="Two-Wheeler">Bike / Scooter</option>
                      <option value="Car">Car / Four-Wheeler</option>
                      <option value="Commercial">Commercial / Truck</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      placeholder="e.g. Honda Activa 6G"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-ink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vehicle Color
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleColor}
                      onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                      placeholder="e.g. White / Silver"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-ink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PUC Number
                    </label>
                    <input
                      type="text"
                      value={formData.pucNumber}
                      onChange={(e) => setFormData({ ...formData, pucNumber: e.target.value })}
                      placeholder="MH19-PUC-98214"
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Insurance Policy Number
                    </label>
                    <input
                      type="text"
                      value={formData.insuranceNumber}
                      onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                      placeholder="BAJAJ-ALLIANZ-882"
                      className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-ink"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary !py-2 !px-4 text-xs font-semibold"
              >
                <ChevronLeft className="size-4" />
                <span>Back</span>
              </button>
            ) : <span />}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary !py-2 !px-5 text-xs font-bold ml-auto"
              >
                <span>Continue</span>
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="btn-primary !py-2.5 !px-6 text-xs font-extrabold shadow-lg ml-auto"
              >
                {loading ? 'Activating Sticker & Creating Dashboard...' : 'Permanently Activate Scanner'}
                <Sparkles className="size-4 text-amber-300" />
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
