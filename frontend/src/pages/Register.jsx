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
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Sparkles,
  QrCode,
  Mail,
  Camera,
  Check
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { register } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Extract pre-scanned tag code from URL query (?tagCode=MH-1001) or navigation state
  const rawTagParam = searchParams.get('tagCode') || location.state?.tagCode || '';
  const initialTagCode = rawTagParam.toUpperCase().trim();

  // ONLY 2 STEPS:
  // Step 1: Mobile Number & Password
  // Step 2: Camera QR Scanner -> Claims QR -> Registration Complete -> Redirects to Dashboard!
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    tagCode: initialTagCode
  });

  const [isFirstScanDetected, setIsFirstScanDetected] = useState(Boolean(initialTagCode));

  // Step 1 Validation
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

  // Complete Registration & Claim Tag -> Redirect to Dashboard
  const handleCompleteRegistration = async (tagCodeOverride) => {
    if (!validateStep1()) {
      setCurrentStep(1);
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
      tagCode: code || undefined
    };

    try {
      const res = await register(payload);
      if (res.success) {
        setSuccessBanner(
          code
            ? `🎉 QR Scanner "${code}" aapka ho gaya! Registration complete. Opening Dashboard...`
            : '🎉 Registration complete! Opening Dashboard...'
        );
        // Redirect directly to User Dashboard
        setTimeout(() => {
          navigate('/app', { state: { justRegistered: true, scannedTag: code } });
        }, 900);
      } else {
        setError(res.message || 'Registration failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Registration error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Camera QR Scan Event
  const handleCameraScanSuccess = async (scannedCode) => {
    const cleanCode = (scannedCode || '').toUpperCase().trim();
    setFormData((prev) => ({ ...prev, tagCode: cleanCode }));
    setSuccessBanner(`✅ QR Code "${cleanCode}" Scanned! Registering and assigning to your account...`);

    // Immediately complete registration and redirect to dashboard
    await handleCompleteRegistration(cleanCode);
  };

  const steps = [
    { num: 1, label: 'Mobile & Password', icon: Phone },
    { num: 2, label: 'Scan QR Scanner', icon: QrCode }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 py-6 sm:py-10 px-4 sm:px-6 font-sans transition-colors duration-200">
      
      {/* Top Floating Navbar */}
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
            <span>2-Step Quick Registration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink dark:text-white">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Number aur password daalein, QR scanner scan karein, aur turant dashboard pe jakar bike aur family info add karein.
          </p>
        </div>

        {/* 2-Step Progress Bar */}
        <div className="grid grid-cols-2 gap-3 border-y border-slate-100 dark:border-[#1f2333] py-3 text-xs font-bold">
          {steps.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            const Icon = st.icon;

            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num === 1) setCurrentStep(1);
                  else if (st.num === 2 && validateStep1()) setCurrentStep(2);
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition ${
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
                <span className="text-xs font-bold">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Notification Banner */}
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
              <Phone className="size-4 text-brand-600 dark:text-cyan-400" />
              <span>Step 1: Mobile Number & Password Setup</span>
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

            {/* Step 1 Action */}
            <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-[#1f2333]">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  if (validateStep1()) {
                    setCurrentStep(2);
                  }
                }}
                className="btn-primary !py-2.5 !px-6 text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2"
              >
                <span>Proceed to Scan QR Scanner</span>
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
                <span>Step 2: Scan Physical QR Sticker</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Final Step
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-500 shrink-0" />
                <span>Camera se QR Scanner scan karein:</span>
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                Scan karte hi ye QR scanner permanently aapka ho jayega aur aap sidhe apne Dashboard par pahunch jayenge, jahan se aap apni bike details, family emergency contacts, aur personal info add kar sakenge!
              </p>
            </div>

            {/* Live Camera Scanner Component */}
            <CameraQRScanner
              initialCode={formData.tagCode}
              onScanSuccess={handleCameraScanSuccess}
            />

            {/* First-Scan Notification if pre-loaded */}
            {isFirstScanDetected && (
              <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 flex items-center gap-2 text-xs text-brand-800 dark:text-cyan-300">
                <Sparkles className="size-4 text-brand-600 dark:text-cyan-400 shrink-0" />
                <span>
                  Physical Sticker Code <strong className="font-mono font-extrabold">{formData.tagCode}</strong> auto-detected. Click Confirm to claim & launch dashboard!
                </span>
              </div>
            )}

            {/* Option to Skip if user has no sticker yet */}
            <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => handleCompleteRegistration('')}
                className="hover:underline text-slate-500 dark:text-slate-400 hover:text-brand-600 text-[11px]"
              >
                Don't have a sticker yet? Register and go to dashboard
              </button>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1f2333]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-secondary !py-2.5 !px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <ChevronLeft className="size-4" />
                <span>Back to Mobile & Password</span>
              </button>

              <button
                type="button"
                disabled={loading || !formData.tagCode.trim()}
                onClick={() => handleCompleteRegistration()}
                className="btn-primary !py-2.5 !px-6 text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2"
              >
                {loading ? (
                  <span>Claiming Sticker & Launching Dashboard...</span>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Confirm & Go to Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Links */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <div>
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-600 dark:text-cyan-400 hover:underline">
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
