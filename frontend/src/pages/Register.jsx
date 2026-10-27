import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Phone,
  Lock,
  User,
  Car,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Sparkles,
  QrCode,
  Heart,
  MapPin,
  Mail,
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { register } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  // Extract pre-scanned tag code from URL query (?tagCode=MH-1001) or navigation state
  const rawTagParam = searchParams.get('tagCode') || location.state?.tagCode || '';
  const initialTagCode = rawTagParam.toUpperCase().trim();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasPhysicalTag, setHasPhysicalTag] = useState(Boolean(initialTagCode));
  const [isFirstScanDetected, setIsFirstScanDetected] = useState(Boolean(initialTagCode));

  // Tag verification state
  const [tagCheckLoading, setTagCheckLoading] = useState(false);
  const [tagCheckResult, setTagCheckResult] = useState(null);

  // Form State - Starts empty with helpful placeholders
  const [formData, setFormData] = useState({
    // Step 1: Account & Credentials
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2: Vehicle & QR Safety Tag
    vehicleNumber: '',
    vehicleType: 'Car',
    vehicleModel: '',
    vehicleColor: '',
    tagCode: initialTagCode,

    // Step 3: Emergency & Rescue Demographics
    gender: 'Male',
    bloodGroup: 'B+',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Father',
    address: ''
  });

  // Verify unique sticker code availability
  const verifyTagAvailability = async (codeToVerify) => {
    const code = (codeToVerify || formData.tagCode || '').toUpperCase().trim();
    if (!code) {
      setTagCheckResult(null);
      return;
    }
    setTagCheckLoading(true);
    try {
      const res = await fetch(`/api/tags/check/${encodeURIComponent(code)}`);
      const data = await res.json();
      setTagCheckResult(data);
    } catch (err) {
      setTagCheckResult({
        available: true,
        message: `Sticker ${code} ready for verification on registration.`
      });
    } finally {
      setTagCheckLoading(false);
    }
  };

  // Run initial tag check if tagCode was passed from a first scan
  useEffect(() => {
    if (initialTagCode) {
      verifyTagAvailability(initialTagCode);
    }
  }, [initialTagCode]);

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    const cleanPhone = formData.phone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password');
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.vehicleNumber.trim()) {
      setError('Please enter your vehicle registration number (e.g. MH 12 AB 1234)');
      return false;
    }
    if (hasPhysicalTag) {
      if (!formData.tagCode.trim()) {
        setError('Please enter your physical QR sticker code (e.g. MH-1001) or uncheck the option');
        return false;
      }
      if (tagCheckResult && tagCheckResult.available === false) {
        setError(tagCheckResult.message || `Physical sticker code "${formData.tagCode}" is already claimed by another user.`);
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    if (currentStep === 2) {
      if (!validateStep2()) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setLoading(true);

    const cleanPhone = formData.phone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');

    const emergencyContacts = [];
    if (formData.emergencyContactName && formData.emergencyContactPhone) {
      emergencyContacts.push({
        name: formData.emergencyContactName.trim(),
        relation: formData.emergencyContactRelation || 'Relative',
        phone: formData.emergencyContactPhone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, ''),
        isPrimary: true,
        priorityOrder: 1
      });
    }

    const payload = {
      name: formData.name.trim(),
      phone: cleanPhone,
      email: formData.email.trim() ? formData.email.trim().toLowerCase() : undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      address: formData.address.trim() ? formData.address.trim() : undefined,
      vehicleNumber: formData.vehicleNumber.toUpperCase().trim(),
      vehicleType: formData.vehicleType,
      vehicleModel: formData.vehicleModel.trim() || undefined,
      vehicleColor: formData.vehicleColor.trim() || undefined,
      tagCode: hasPhysicalTag && formData.tagCode.trim() ? formData.tagCode.toUpperCase().trim() : undefined,
      emergencyContacts
    };

    try {
      const res = await register(payload);
      if (res.success) {
        // Automatically redirects to User Dashboard
        navigate('/app');
      } else {
        setError(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Account Info', icon: User },
    { num: 2, label: 'Vehicle Details', icon: Car },
    { num: 3, label: 'Emergency Rescue', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 py-6 sm:py-10 px-4 sm:px-6 font-sans transition-colors duration-200">
      
      {/* Top Floating Navbar with Brand & Theme Toggle */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-md shadow-brand-500/20">
            <Shield className="size-5.5" />
          </div>
          <div>
            <span className="font-display font-extrabold text-xl text-ink dark:text-white leading-tight block">
              GadiRaksha
            </span>
            <span className="text-[10px] text-brand-600 dark:text-cyan-400 font-bold uppercase tracking-wider block">
              Smart Vehicle Safety
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
          </button>

          <Link
            to="/login"
            className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-cyan-400 transition px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1f2333] bg-white dark:bg-[#12141e]"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#12141e] rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 dark:border-[#1f2333] space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-400 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <Sparkles className="size-3.5" />
            <span>Vehicle Owner Direct Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink dark:text-white">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Protect your vehicle with bystander QR emergency calling, accident family SOS, and digital document locker.
          </p>
        </div>

        {/* 3-Step Breadcrumb Progress Bar */}
        <div className="grid grid-cols-3 gap-2 border-y border-slate-100 dark:border-[#1f2333] py-3 text-xs font-bold">
          {steps.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            const Icon = st.icon;

            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num < currentStep) setCurrentStep(st.num);
                  else if (st.num === 2 && validateStep1()) setCurrentStep(2);
                  else if (st.num === 3 && validateStep1() && validateStep2()) setCurrentStep(3);
                }}
                className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
                  isCurrent
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-400 border border-brand-200 dark:border-brand-800'
                    : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-[#181a29]'
                      : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div
                  className={`size-6 rounded-full grid place-items-center text-[11px] font-extrabold ${
                    isCurrent
                      ? 'bg-brand-600 text-white shadow-sm'
                      : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : st.num}
                </div>
                <span className="hidden sm:inline">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 animate-in fade-in">
            <span className="text-base">⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ================= STEP 1: PERSONAL & ACCOUNT ================= */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <User className="size-4 text-brand-600 dark:text-cyan-400" />
                <span>1. Personal Information & Login Password</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name (पूरा नाम) *
                </label>
                <div className="relative">
                  <User className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (10 डिजिट मोबाइल) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-12 pr-3.5 py-2.5 text-xs font-mono font-bold text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Used to sign in to your dashboard</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (ईमेल - वैकल्पिक)
                  </label>
                  <div className="relative">
                    <Mail className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Create Password (पासवर्ड) *
                  </label>
                  <div className="relative">
                    <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password (पासवर्ड दोबारा लिखें) *
                  </label>
                  <div className="relative">
                    <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: VEHICLE & QR SAFETY TAG ================= */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Car className="size-4 text-brand-600 dark:text-cyan-400" />
                <span>2. Vehicle Information & Sticker Binding</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Registration Number (गाड़ी नंबर) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH 12 AB 1234 or DL 8C AB 9988"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-4 py-2.5 text-sm font-mono font-extrabold uppercase text-ink dark:text-white focus:border-brand-500 focus:outline-none tracking-wider"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Type (प्रकार) *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Car">Car / SUV / Sedan</option>
                    <option value="Two-Wheeler">Two-Wheeler (Bike / Scooter)</option>
                    <option value="Commercial">Commercial (Truck / Van)</option>
                    <option value="Auto-Rickshaw">Auto-Rickshaw (3W)</option>
                    <option value="Other">Other Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand & Model (मेक/मॉडल)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Nexon / Activa"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Color (रंग)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. White / Silver / Black"
                    value={formData.vehicleColor}
                    onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Physical QR Sticker Option */}
              <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/90 dark:border-brand-900/60 space-y-3">
                
                {/* First Scan Banner if scanned from phone */}
                {isFirstScanDetected && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                    <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">First-Time Physical Sticker Scan Detected!</span>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                        Unique Scanner Code <strong className="font-mono text-amber-600 dark:text-amber-300 font-extrabold">{formData.tagCode}</strong> has been auto-filled. Each scanner is unique; on completing registration, this sticker becomes permanently yours!
                      </p>
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPhysicalTag}
                    onChange={(e) => {
                      setHasPhysicalTag(e.target.checked);
                      if (e.target.checked && formData.tagCode) {
                        verifyTagAvailability(formData.tagCode);
                      }
                    }}
                    className="size-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-ink dark:text-white">
                    I have a physical GadiRaksha QR Safety Sticker (Pre-printed / Dealer pack)
                  </span>
                </label>

                {hasPhysicalTag ? (
                  <div className="pt-2 space-y-2.5 animate-in fade-in">
                    <label className="block text-[11px] font-bold text-brand-800 dark:text-cyan-300">
                      Enter Physical Sticker Code (Printed below QR, e.g. MH-1001) *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <QrCode className="size-4 text-brand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="e.g. MH-1001 or GR-8842"
                          value={formData.tagCode}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            setFormData({ ...formData, tagCode: val });
                            setTagCheckResult(null);
                          }}
                          onBlur={() => {
                            if (formData.tagCode.trim()) {
                              verifyTagAvailability(formData.tagCode);
                            }
                          }}
                          className="w-full rounded-xl border border-brand-300 dark:border-brand-800 bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs font-mono font-extrabold uppercase text-ink dark:text-white focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => verifyTagAvailability(formData.tagCode)}
                        disabled={tagCheckLoading || !formData.tagCode.trim()}
                        className="btn-secondary !py-2 !px-3 text-xs font-bold shrink-0 flex items-center gap-1.5"
                      >
                        {tagCheckLoading ? (
                          <RefreshCw className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5 text-brand-600" />
                        )}
                        <span>{tagCheckLoading ? 'Verifying...' : 'Check Sticker'}</span>
                      </button>
                    </div>

                    {/* Tag Availability Live Feedback Pill */}
                    {tagCheckResult && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                          tagCheckResult.available
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {tagCheckResult.available ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="size-4 shrink-0 text-rose-600" />
                        )}
                        <span>{tagCheckResult.message}</span>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      <p className="flex items-center gap-1 font-medium">
                        <span className="size-1.5 rounded-full bg-brand-500 inline-block" />
                        <span>Each physical sticker is unique and can only be activated once.</span>
                      </p>
                      <p className="flex items-center gap-1 font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>On your first scan/registration, this unique scanner code permanently becomes yours!</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                    Don't have a sticker yet? You can still register your vehicle today and order or activate a QR sticker anytime from your dashboard.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 3: EMERGENCY RESCUE DEMOGRAPHICS ================= */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Users className="size-4 text-rose-600 dark:text-rose-400" />
                <span>3. Accident SOS Responders & Medical Demographics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group (ब्लड ग्रुप - आपातकाल हेतु)
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs font-bold text-rose-600 focus:border-brand-500 focus:outline-none"
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
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Primary Family Contact Box */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                  <Heart className="size-4 text-rose-600" />
                  <span>Primary Emergency SOS Contact (आपातकालीन संपर्क)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  In case of an accident or medical emergency, instant automated alerts and live location will be delivered to this family contact.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh (Father)"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Relationship *
                    </label>
                    <select
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse / Wife / Husband</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other Relative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      maxLength="10"
                      placeholder="9822110000"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value.replace(/\D/g, '') })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono text-ink dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address (पता - वैकल्पिक)
                </label>
                <div className="relative">
                  <MapPin className="size-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows="2"
                    placeholder="e.g. Flat 402, Shiv Shrushti Apts, Station Road, Pune - 411038"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons: Next, Prev, Submit */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary !py-2.5 !px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <ChevronLeft className="size-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary !py-2.5 !px-6 text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-1.5 ml-auto"
              >
                <span>Continue to {currentStep === 1 ? 'Vehicle Details' : 'Emergency Contacts'}</span>
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary !py-2.5 !px-8 text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 ml-auto"
              >
                {loading ? (
                  <span>Creating Account & Vehicle...</span>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Complete Registration & Go to Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Bottom Navigation Links */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div>
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-600 dark:text-cyan-400 hover:underline">
              Sign In to Your Dashboard
            </Link>
          </div>
          <div>
            Have a pre-printed sticker?{' '}
            <Link to="/activate" className="font-bold text-slate-600 dark:text-slate-300 hover:underline">
              Activate Pre-Printed Sticker
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
