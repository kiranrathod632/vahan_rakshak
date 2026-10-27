import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CameraQRScanner from '../components/CameraQRScanner';
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
  RefreshCw,
  Camera
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { register, token, fetchProfile } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  // Extract pre-scanned tag code from URL query (?tagCode=MH-1001) or navigation state
  const rawTagParam = searchParams.get('tagCode') || location.state?.tagCode || '';
  const initialTagCode = rawTagParam.toUpperCase().trim();

  // 4 Steps: 1. Account -> 2. QR Scanner -> 3. Bike/Vehicle -> 4. Family & Personal
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Physical tag tracking
  const [hasPhysicalTag, setHasPhysicalTag] = useState(true);
  const [isFirstScanDetected, setIsFirstScanDetected] = useState(Boolean(initialTagCode));
  const [tagCheckLoading, setTagCheckLoading] = useState(false);
  const [tagCheckResult, setTagCheckResult] = useState(null);
  const [isAccountRegistered, setIsAccountRegistered] = useState(false);
  const [registeredToken, setRegisteredToken] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Mobile & Password
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2: QR Scanner
    tagCode: initialTagCode,

    // Step 3: Bike & Vehicle Details
    vehicleNumber: '',
    vehicleType: 'Two-Wheeler', // Default Two-Wheeler (Bike / Scooter)
    vehicleModel: '',
    vehicleColor: '',

    // Step 4: Family & Personal Details
    bloodGroup: 'B+',
    gender: 'Male',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Father',
    emergencyContact2Name: '',
    emergencyContact2Phone: '',
    emergencyContact2Relation: 'Mother',
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
      return data;
    } catch (err) {
      const fallback = {
        available: true,
        message: `Sticker ${code} ready for verification on registration.`
      };
      setTagCheckResult(fallback);
      return fallback;
    } finally {
      setTagCheckLoading(false);
    }
  };

  useEffect(() => {
    if (initialTagCode) {
      verifyTagAvailability(initialTagCode);
    }
  }, [initialTagCode]);

  // Step 1 Validation (Mobile & Password)
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name (पूरा नाम दर्ज करें)');
      return false;
    }
    const cleanPhone = formData.phone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number (10 अंकों का मोबाइल नंबर दर्ज करें)');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long (पासवर्ड कम से कम 6 अक्षरों का होना चाहिए)');
      return false;
    }
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password');
      return false;
    }
    return true;
  };

  // Step 2 Validation (QR Scanner)
  const validateStep2 = () => {
    if (hasPhysicalTag) {
      if (!formData.tagCode.trim()) {
        setError('Please scan your physical QR sticker with the camera, or enter the code manually');
        return false;
      }
      if (tagCheckResult && tagCheckResult.available === false) {
        setError(tagCheckResult.message || `Physical sticker "${formData.tagCode}" is already claimed by another user.`);
        return false;
      }
    }
    return true;
  };

  // Step 3 Validation (Bike Details)
  const validateStep3 = () => {
    if (!formData.vehicleNumber.trim()) {
      setError('Please enter your vehicle registration number (e.g. MH 12 AB 1234)');
      return false;
    }
    return true;
  };

  // Step 4 Validation (Family & Personal)
  const validateStep4 = () => {
    if (formData.emergencyContactPhone) {
      const cleanPhone = formData.emergencyContactPhone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setError('Please enter a valid 10-digit emergency contact phone number');
        return false;
      }
    }
    return true;
  };

  // Handle QR Camera Scan Event
  const handleCameraScanSuccess = async (code, checkData) => {
    setError('');
    const cleanCode = (code || '').toUpperCase().trim();
    setFormData((prev) => ({ ...prev, tagCode: cleanCode }));
    setTagCheckResult(checkData);

    setSuccessBanner(`🎉 QR Scanner "${cleanCode}" successfully scanned! Binding to your account...`);

    // If user has filled mobile & password, register account & claim tag immediately
    if (validateStep1()) {
      await registerAccountWithTag(cleanCode);
    }
  };

  // Register user account & lock the QR scanner to this user
  const registerAccountWithTag = async (tagCodeOverride) => {
    if (isAccountRegistered) {
      setCurrentStep(3);
      return;
    }

    setLoading(true);
    setError('');

    const cleanPhone = formData.phone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');
    const code = (tagCodeOverride || formData.tagCode || '').toUpperCase().trim();

    const payload = {
      name: formData.name.trim(),
      phone: cleanPhone,
      email: formData.email.trim() ? formData.email.trim().toLowerCase() : undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword || formData.password,
      tagCode: hasPhysicalTag && code ? code : undefined
    };

    try {
      const res = await register(payload);
      if (res.success) {
        setIsAccountRegistered(true);
        if (res.user?.token) {
          setRegisteredToken(res.user.token);
        }
        setSuccessBanner(`✅ Registration complete! QR Scanner "${code || 'Safety'}" is now permanently yours! Next: Add your vehicle details.`);
        setTimeout(() => {
          setSuccessBanner('');
          setCurrentStep(3);
        }, 1200);
      } else {
        setError(res.message || 'Registration failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Registration error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save Vehicle Details (Step 3 -> Step 4)
  const handleSaveVehicleStep = async () => {
    if (!validateStep3()) return;
    setError('');
    setLoading(true);

    const authToken = registeredToken || token || localStorage.getItem('gr_token');

    // If user hasn't registered account yet, register them first
    if (!isAccountRegistered) {
      const cleanPhone = formData.phone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');
      const payload = {
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim() ? formData.email.trim().toLowerCase() : undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword || formData.password,
        tagCode: hasPhysicalTag && formData.tagCode.trim() ? formData.tagCode.toUpperCase().trim() : undefined,
        vehicleNumber: formData.vehicleNumber.toUpperCase().trim(),
        vehicleType: formData.vehicleType,
        vehicleModel: formData.vehicleModel.trim() || undefined,
        vehicleColor: formData.vehicleColor.trim() || undefined
      };

      try {
        const res = await register(payload);
        if (res.success) {
          setIsAccountRegistered(true);
          if (res.user?.token) setRegisteredToken(res.user.token);
          setCurrentStep(4);
        } else {
          setError(res.message || 'Could not save vehicle');
        }
      } catch (err) {
        setError('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Account is already registered; add vehicle to Vehicle collection
    try {
      const res = await fetch('/api/auth/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          vehicleNumber: formData.vehicleNumber.toUpperCase().trim(),
          vehicleType: formData.vehicleType,
          vehicleModel: formData.vehicleModel.trim(),
          vehicleColor: formData.vehicleColor.trim(),
          tagCode: formData.tagCode.trim() ? formData.tagCode.toUpperCase().trim() : undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchProfile(authToken);
        setCurrentStep(4);
      } else {
        // If vehicle already added or minor error, proceed to emergency step
        setCurrentStep(4);
      }
    } catch (err) {
      console.warn('Vehicle save warning:', err);
      setCurrentStep(4);
    } finally {
      setLoading(false);
    }
  };

  // Final Step: Save Family & Personal Details -> Complete Registration
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep4()) return;
    setLoading(true);

    const authToken = registeredToken || token || localStorage.getItem('gr_token');

    const emergencyContacts = [];
    if (formData.emergencyContactName && formData.emergencyContactPhone) {
      emergencyContacts.push({
        name: formData.emergencyContactName.trim(),
        relation: formData.emergencyContactRelation || 'Father',
        phone: formData.emergencyContactPhone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, ''),
        isPrimary: true,
        priorityOrder: 1
      });
    }

    if (formData.emergencyContact2Name && formData.emergencyContact2Phone) {
      emergencyContacts.push({
        name: formData.emergencyContact2Name.trim(),
        relation: formData.emergencyContact2Relation || 'Mother',
        phone: formData.emergencyContact2Phone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, ''),
        isPrimary: false,
        priorityOrder: 2
      });
    }

    // If account was already registered in step 2/3, update profile
    if (isAccountRegistered && authToken) {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            address: formData.address.trim() ? formData.address.trim() : undefined,
            emergencyContacts
          })
        });
        const data = await res.json();
        await fetchProfile(authToken);
        navigate('/app');
      } catch (err) {
        navigate('/app');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fallback: If not registered yet, do comprehensive 1-call registration
    const cleanPhone = formData.phone.trim().replace(/^(\+91[\s-]?|91[\s-]?)/, '').replace(/\D/g, '');
    const fullPayload = {
      name: formData.name.trim(),
      phone: cleanPhone,
      email: formData.email.trim() ? formData.email.trim().toLowerCase() : undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword || formData.password,
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
      const res = await register(fullPayload);
      if (res.success) {
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

  // Step Next / Prev navigation
  const nextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      registerAccountWithTag();
    } else if (currentStep === 3) {
      handleSaveVehicleStep();
    } else if (currentStep === 4) {
      // Final submit
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const steps = [
    { num: 1, label: 'Account', icon: User },
    { num: 2, label: 'QR Scanner', icon: QrCode },
    { num: 3, label: 'Bike Details', icon: Car },
    { num: 4, label: 'Family & Personal', icon: Users }
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
            Scan your QR safety sticker, register your vehicle, and protect your loved ones with instant SOS alerts.
          </p>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 border-y border-slate-100 dark:border-[#1f2333] py-3 text-xs font-bold">
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
                  else if (st.num === 4 && validateStep1() && validateStep2() && validateStep3()) setCurrentStep(4);
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-2 rounded-xl transition ${
                  isCurrent
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-400 border border-brand-200 dark:border-brand-800'
                    : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-[#181a29]'
                      : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div
                  className={`size-6 rounded-full grid place-items-center text-[11px] font-extrabold shrink-0 ${
                    isCurrent
                      ? 'bg-brand-600 text-white shadow-sm'
                      : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : st.num}
                </div>
                <span className="text-[11px] sm:text-xs truncate">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Notification Success Banner */}
        {successBanner && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 animate-in fade-in">
            <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">{successBanner}</div>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 animate-in fade-in">
            <span className="text-base">⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* ================= STEP 1: MOBILE & PASSWORD ================= */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <User className="size-4 text-brand-600 dark:text-cyan-400" />
              <span>1. Mobile Number & Account Password</span>
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
                  Mobile Number (10 डिजिट मोबाइल नंबर) *
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
                <span className="text-[10px] text-slate-400 mt-1 block">Used to sign in to your vehicle safety dashboard</span>
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

            {/* Step 1 Actions */}
            <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-[#1f2333]">
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary !py-2.5 !px-6 text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2"
              >
                <span>Proceed to QR Scanner</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: CAMERA QR SCANNER ================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Camera className="size-4 text-brand-600 dark:text-cyan-400" />
                <span>2. Scan Physical QR Safety Sticker</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Step 2 of 4
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Camera se physical QR sticker ko scan karein. Scan karte hi ye sticker <strong className="text-brand-600 dark:text-cyan-400 font-bold">permanently aapka</strong> ho jayega aur registration complete ho jayegi. Uske baad aap bike aur family details add karenge.
            </p>

            {/* Live Camera Scanner Component */}
            <CameraQRScanner
              initialCode={formData.tagCode}
              onScanSuccess={handleCameraScanSuccess}
            />

            {/* First-Scan Notification if pre-loaded */}
            {isFirstScanDetected && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">First-Time Physical Sticker Scan Detected!</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                    Unique Scanner Code <strong className="font-mono text-amber-600 dark:text-amber-300 font-extrabold">{formData.tagCode}</strong> has been auto-detected. Completing this step permanently locks this sticker to your account.
                  </p>
                </div>
              </div>
            )}

            {/* Option to Skip if user has no sticker yet */}
            <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setHasPhysicalTag(false);
                  registerAccountWithTag('');
                }}
                className="hover:underline text-slate-500 dark:text-slate-400 hover:text-brand-600 text-[11px]"
              >
                Don't have a sticker yet? Skip this step
              </button>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1f2333]">
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary !py-2.5 !px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <ChevronLeft className="size-4" />
                <span>Account Info</span>
              </button>

              <button
                type="button"
                disabled={loading || (hasPhysicalTag && !formData.tagCode.trim())}
                onClick={() => registerAccountWithTag()}
                className="btn-primary !py-2.5 !px-6 text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2"
              >
                {loading ? (
                  <span>Claiming Sticker & Registering...</span>
                ) : (
                  <>
                    <span>Confirm & Continue to Bike Details</span>
                    <ChevronRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: BIKE / VEHICLE DETAILS ================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Car className="size-4 text-brand-600 dark:text-cyan-400" />
                <span>3. Bike & Vehicle Information</span>
              </div>
              <span className="text-[11px] font-semibold text-brand-600 dark:text-cyan-400">
                Step 3 of 4
              </span>
            </div>

            <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 text-xs text-brand-800 dark:text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>
                QR Scanner <strong className="font-mono font-bold">{formData.tagCode || 'ACTIVE'}</strong> is now assigned to your account! Ab apni bike/vehicle ki details add karein:
              </span>
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
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none font-semibold"
                >
                  <option value="Two-Wheeler">Two-Wheeler (Bike / Scooter)</option>
                  <option value="Car">Car / SUV / Sedan</option>
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
                  placeholder="e.g. Hero Splendor / Activa / Pulsar"
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
                  placeholder="e.g. Black / Red / Silver / Blue"
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1f2333]">
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary !py-2.5 !px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <ChevronLeft className="size-4" />
                <span>QR Scanner</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSaveVehicleStep}
                className="btn-primary !py-2.5 !px-6 text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2"
              >
                {loading ? (
                  <span>Saving Vehicle...</span>
                ) : (
                  <>
                    <span>Continue to Family & Personal Details</span>
                    <ChevronRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: FAMILY & PERSONAL DETAILS ================= */}
        {currentStep === 4 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Users className="size-4 text-rose-600 dark:text-rose-400" />
                <span>4. Family SOS Contacts & Personal Details</span>
              </div>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                Final Step 4 of 4
              </span>
            </div>

            {/* Primary Family Contact Box */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                <Heart className="size-4 text-rose-600" />
                <span>Primary Family Emergency Contact (आपातकालीन परिवार संपर्क) *</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                In case of accident, emergency, or vehicle wrong parking, bystander call and instant WhatsApp SOS alerts will reach this family member.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Contact Name (नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh (Father)"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Relationship (रिश्ता) *
                  </label>
                  <select
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                  >
                    <option value="Father">Father (पिता)</option>
                    <option value="Mother">Mother (माता)</option>
                    <option value="Spouse">Spouse / Wife / Husband (पति/पत्नी)</option>
                    <option value="Brother">Brother (भाई)</option>
                    <option value="Sister">Sister (बहन)</option>
                    <option value="Son">Son (बेटा)</option>
                    <option value="Daughter">Daughter (बेटी)</option>
                    <option value="Friend">Friend (दोस्त)</option>
                    <option value="Other">Other Relative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Mobile Number (मोबाइल नंबर) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="9822110000"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value.replace(/\D/g, '') })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono font-bold text-ink dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Personal Demographics (Blood Group & Gender) */}
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

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Residential Address (पता - आपातकालीन मदद हेतु)
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

            {/* Step 4 Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1f2333]">
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary !py-2.5 !px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <ChevronLeft className="size-4" />
                <span>Bike Details</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary !py-2.5 !px-8 text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2"
              >
                {loading ? (
                  <span>Saving & Launching Dashboard...</span>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Complete Registration & Open Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

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
