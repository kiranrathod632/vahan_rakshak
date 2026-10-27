import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import PlateBadge from '../components/PlateBadge';
import {
  Bell,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Car,
  QrCode,
  Users,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
  Sun,
  Moon
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const [openFaq, setOpenFaq] = useState(null);
  const [mockNotified, setMockNotified] = useState(false);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Do people scanning my vehicle need an app?',
      a: 'No app is required! Any normal smartphone camera, Google Lens, or Paytm/WhatsApp scanner can scan the QR code instantly in under 2 seconds.'
    },
    {
      q: 'How does masked calling protect my privacy?',
      a: 'When someone scans your sticker, your personal mobile number is never displayed to them. If they choose to call, the call is routed through our virtual privacy switchboard.'
    },
    {
      q: 'What happens during a road accident or medical emergency?',
      a: 'When a bystander taps the "Accident SOS" button, all 3 to 4 of your registered family members receive immediate automated calls, SMS, and WhatsApp alerts containing your exact live Google Maps GPS location and blood group.'
    },
    {
      q: 'Can I transfer this sticker if I buy a new car or bike?',
      a: 'Yes! From your dashboard, you can update the vehicle registration number, brand, model, and documents in just a few taps without needing a new sticker.'
    },
    {
      q: 'Is the sticker weatherproof and durable?',
      a: 'Yes, our stickers are made with automotive-grade, UV-coated, scratch-resistant vinyl that withstands high heat, heavy Indian monsoon rains, and car washes.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 font-sans selection:bg-brand-600 selection:text-white transition-colors duration-200">
      {/* 
        Grid Pattern Background (matching the screenshot)
      */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#161926_1px,transparent_1px),linear-gradient(to_bottom,#161926_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0e1017]/95 backdrop-blur-md border-b border-slate-100 dark:border-[#1c1f2e] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo with 4-square grid icon matching screenshot */}
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 grid grid-cols-2 gap-1 p-2 shadow-md shadow-blue-500/20">
              <span className="bg-white rounded-xs" />
              <span className="bg-white rounded-xs" />
              <span className="bg-white rounded-xs" />
              <span className="bg-white rounded-xs" />
            </div>
            <div className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
              Suraksha<span className="text-blue-600 dark:text-blue-400">QR</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition">How it works</a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Features</a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition">FAQ</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
            </button>

            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition px-2 py-1"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition px-2 py-1"
            >
              Register
            </Link>
            <Link
              to="/activate"
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 shadow-md shadow-blue-500/25 active:scale-[0.98] transition flex items-center gap-1.5"
            >
              <span>Get your sticker</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-xs">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>Made for Indian roads · Cars, bikes & scooters</span>
            </div>

            {/* Giant Title matching screenshot */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-slate-950 leading-[1.08]">
              Your vehicle,{' '}
              <span className="relative inline-block text-blue-600">
                reachable
                {/* Hand-drawn yellow underline SVG */}
                <svg
                  className="absolute -bottom-2 left-0 w-full overflow-visible"
                  viewBox="0 0 250 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 10C65 3.5 160 3 247 10"
                    stroke="#f59e0b"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              without <br className="hidden sm:inline" />
              your number.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed pt-2">
              Stick a SurakshaQR on your car or bike. Anyone who scans it can notify you about a blocked gate, lights left on or a parking problem — and, in an emergency, alert your family. Your phone number, address and documents stay private.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/register"
                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-3.5 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition flex items-center gap-2"
              >
                <span>Register Vehicle Free</span>
                <ArrowRight className="size-4.5" />
              </Link>
              <Link
                to="/activate"
                className="rounded-2xl bg-white dark:bg-[#161826] border border-slate-300 dark:border-[#272b3f] hover:bg-slate-50 dark:hover:bg-[#1f2333] text-slate-800 dark:text-slate-100 font-semibold text-base px-6 py-3.5 shadow-xs transition flex items-center gap-2"
              >
                <QrCode className="size-4.5 text-blue-600 dark:text-cyan-400" />
                <span>Activate Physical Sticker</span>
              </Link>
            </div>

            {/* Micro Trust Points */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Weatherproof 3M Vinyl</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>3–4 Family Contacts Alerted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>100% Privacy Masked</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Phone Mockup (Matching the screenshot exactly!) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            
            {/* Ambient back-glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />

            {/* Floating Live Alert Toast (as shown in screenshot) */}
            <div className="absolute -top-4 right-0 sm:-right-4 z-30 bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xl flex items-center gap-3 animate-bounce-once">
              <span className="size-2.5 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  ● Alert delivered
                </span>
                <span className="text-[11px] text-slate-500">SMS & WhatsApp to owner · 2 sec</span>
              </div>
            </div>

            {/* Mobile Device Frame */}
            <div className="relative z-20 w-full max-w-[340px] sm:max-w-[370px] bg-slate-950 p-3 rounded-[3rem] shadow-2xl border-4 border-slate-900">
              
              {/* Phone Screen Container */}
              <div className="bg-white rounded-[2.2rem] overflow-hidden p-5 space-y-4 text-slate-800">
                
                {/* Screen Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="font-display font-extrabold text-sm text-slate-900">
                    Suraksha<span className="text-blue-600">QR</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Verified sticker
                  </span>
                </div>

                {/* Vehicle Card Inside Mockup */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    CAR · HYUNDAI CRETA
                  </span>

                  {/* Indian Plate */}
                  <div className="inline-flex items-center overflow-hidden rounded-md border-2 border-slate-900 bg-white font-mono font-bold text-xs shadow-xs">
                    <div className="flex flex-col items-center justify-center bg-blue-700 text-white px-1 py-0.5 text-[7px] leading-tight">
                      <span className="text-yellow-300">●</span>
                      <span className="font-black">IND</span>
                    </div>
                    <div className="px-3 py-1 font-mono font-black text-slate-900 tracking-wider">
                      KA 05 ·· 4821
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Need to contact the vehicle owner?
                  </p>

                  {/* Blue Button: Notify Owner */}
                  <button
                    onClick={() => setMockNotified(true)}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 shadow-md shadow-blue-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
                  >
                    <Bell className="size-4" />
                    <span>{mockNotified ? 'Owner Alerted!' : 'Notify owner'}</span>
                  </button>

                  {/* Secondary Action: Call Masked Line */}
                  <div className="pt-1">
                    <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 mx-auto">
                      <PhoneCall className="size-3.5 text-blue-600" />
                      <span>Call via masked line</span>
                    </button>
                  </div>
                </div>

                {/* Emergency Demographics Preview */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-left text-[11px] text-rose-900 space-y-1">
                  <div className="font-bold flex items-center justify-between text-rose-700">
                    <span>🚑 Emergency SOS Network</span>
                    <span className="bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded font-black text-[9px]">Blood: B+</span>
                  </div>
                  <p className="text-rose-800/90 text-[10px]">
                    Alerts 3-4 family members with live GPS coordinates.
                  </p>
                </div>
              </div>

              {/* Angled Sticker Peaking at the bottom left (matches screenshot!) */}
              <div className="absolute -bottom-6 -left-8 z-30 rotate-[-8deg] bg-blue-600 rounded-2xl p-3 text-white shadow-2xl border-2 border-white max-w-[210px]">
                <div className="text-[9px] font-black uppercase tracking-wider text-blue-200 mb-1">
                  SCAN TO CONTACT OWNER
                </div>
                <div className="bg-white p-2 rounded-xl text-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=http://localhost:5000/scan/MH-1001"
                    alt="Physical Sticker QR"
                    className="size-20 mx-auto"
                  />
                  <span className="font-mono text-[10px] font-bold text-slate-900 block mt-1">
                    SQR-24-008812
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Simple 3-Step Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950">
              How SurakshaQR Works
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              No complicated pairing or Bluetooth required. Company prints physical QR stickers — you scan and bind them to your vehicle in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 font-display font-black text-xl grid place-items-center">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Get Physical Sticker</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive your pre-printed weatherproof QR safety sticker from our dealers, company distributors, or by ordering online.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 font-display font-black text-xl grid place-items-center">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Activate & Add Family</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan or enter the sticker code. Add your vehicle number, blood group, and 3 to 4 family emergency contacts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition">
              <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 font-display font-black text-xl grid place-items-center">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Stick & Stay Safe</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Peel and stick on your vehicle windshield, mudguard, or number plate. You are now protected 24x7!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Engineered For Protection
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950">
            Why Every Indian Vehicle Needs SurakshaQR
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            From crowded parking lots in Mumbai and Pune to high-speed expressways, SurakshaQR protects you and your family at every turn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-blue-300 transition">
            <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center">
              <Lock className="size-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">100% Privacy by Design</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No bystander ever sees your phone number. All calls and SMS alerts are routed through privacy masking lines.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-rose-300 transition">
            <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center">
              <Users className="size-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">3–4 Family SOS Circle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              During an accident, automated Calls, SMS, and WhatsApp alerts with live Google Maps GPS location are dispatched to your family immediately.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-amber-300 transition">
            <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center">
              <AlertTriangle className="size-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">No-Parking Alerts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get notified when your vehicle is parked in an obstructed spot before the traffic police issues a challan or tows your car.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-purple-300 transition">
            <div className="size-12 rounded-2xl bg-purple-50 text-purple-600 grid place-items-center">
              <FileText className="size-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">PUC & Insurance Tracker</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track vehicle document expiries with automatic reminders so you avoid hefty fines during routine RTO checks.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950">
              One Weatherproof Sticker. A Year of Peace of Mind.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Affordable safety designed for every two-wheeler and four-wheeler in India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Plan 1: Single Sticker */}
            <div className="card p-8 bg-white border-2 border-slate-200 rounded-3xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    Single Vehicle
                  </span>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-slate-900">₹299</span>
                    <span className="text-xs text-slate-500 font-medium"> / year</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mt-4">1 Weatherproof QR Sticker</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ideal for personal cars, bikes, and scooters.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>1 UV-coated scratch-resistant vinyl sticker</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Masked phone calling & privacy guard</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Accident SOS with live Google Maps GPS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>3–4 Family emergency contacts alerted</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>No-parking & obstruction alerts</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/activate"
                className="w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 shadow-md shadow-blue-500/25 transition"
              >
                Activate Single Sticker
              </Link>
            </div>

            {/* Plan 2: Family Pack (Best Value) */}
            <div className="card p-8 bg-white border-2 border-blue-600 ring-4 ring-blue-500/10 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider py-1 px-4 rounded-bl-xl">
                Best Value
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    Family 3-Pack
                  </span>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-slate-900">₹699</span>
                    <span className="text-xs text-slate-500 font-medium"> / year</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mt-4">3 Weatherproof QR Stickers</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Protect 3 household vehicles (cars, scooters, bikes).
                </p>

                <ul className="mt-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>3 Individual pre-printed QR stickers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>All single plan safety features included</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Priority SMS & WhatsApp dispatch servers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Dedicated 24x7 emergency response line</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/activate"
                className="w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 shadow-md shadow-blue-500/25 transition"
              >
                Activate Family 3-Pack
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-5">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left gap-4 group"
              >
                <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`size-5 text-slate-400 group-hover:text-blue-600 transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed pr-6">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Need Help or Want to Become a Dealer?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Speak to our team for bulk physical stickers or general inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/919823000000?text=Hi%20SurakshaQR%20Team%2C%20I%20have%20an%20inquiry%20regarding%20QR%20stickers."
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-5 transition flex items-center gap-2"
            >
              <MessageCircle className="size-4" />
              <span>Chat on WhatsApp</span>
            </a>
            <Link
              to="/activate"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 px-5 transition flex items-center gap-2"
            >
              <QrCode className="size-4" />
              <span>Activate Your Sticker</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-blue-600 grid grid-cols-2 gap-0.5 p-1 text-white">
              <span className="bg-white rounded-xs" />
              <span className="bg-white rounded-xs" />
              <span className="bg-white rounded-xs" />
              <span className="bg-white rounded-xs" />
            </div>
            <span className="font-display font-extrabold text-base text-slate-900">SurakshaQR</span>
          </div>

          <p>© 2026 SurakshaQR / GadiRaksha. In an emergency, always call 112 first.</p>

          <div className="flex items-center gap-4 font-semibold text-slate-700">
            <Link to="/activate" className="hover:text-blue-600">Activate Sticker</Link>
            <Link to="/login" className="hover:text-blue-600">User Dashboard</Link>
            <Link to="/admin" className="hover:text-blue-600">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
