import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PlateBadge from '../components/PlateBadge';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldAlert,
  AlertTriangle,
  Car,
  MapPin,
  Heart,
  User,
  Phone,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Shield,
  Lightbulb,
  AlertOctagon,
  Volume2,
  Send,
  QrCode,
  LogIn,
  Plus
} from 'lucide-react';

export default function PublicScan() {
  const { tagCode = 'MH-1001' } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, authFetch } = useAuth();

  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Location and alert dispatch
  const [includeGps, setIncludeGps] = useState(true);
  const [coordinates, setCoordinates] = useState({ latitude: 20.671, longitude: 75.342 });
  const [scannerNote, setScannerNote] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  // Claim state for logged-in users
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicleNum, setSelectedVehicleNum] = useState('');
  const [customVehicleNum, setCustomVehicleNum] = useState('');
  const [customVehicleType, setCustomVehicleType] = useState('Car');
  const [claiming, setClaiming] = useState(false);
  const [claimErr, setClaimErr] = useState('');
  const [claimSuccessMsg, setClaimSuccessMsg] = useState('');

  // Fetch logged-in user vehicles
  useEffect(() => {
    if (user) {
      authFetch('/api/auth/vehicles')
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.data)) {
            setUserVehicles(d.data);
            if (d.data.length > 0) {
              setSelectedVehicleNum(d.data[0].vehicleNumber);
            } else {
              setSelectedVehicleNum('NEW');
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    // Attempt to get user GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        () => console.log('Location access denied or unavailable')
      );
    }

    const fetchScan = async () => {
      try {
        const res = await fetch(`/api/scan/${tagCode}`);
        const data = await res.json();
        if (data.success) {
          setScanData(data);
        } else {
          setError(data.message || 'Unable to read sticker.');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
  }, [tagCode]);

  const handleTriggerAlert = async (type) => {
    setDispatching(true);
    setDispatchResult(null);

    let defaultNote = 'Vehicle needs attention';
    if (type === 'ACCIDENT') defaultNote = 'Accident reported by bystander';
    else if (type === 'NO_PARKING') defaultNote = 'Aapli gaadi no-parking / rastyat adchan karat aahe (Please move vehicle)';
    else if (type === 'LIGHTS_ON') defaultNote = 'Vehicle lights are ON or tyre is flat';
    else if (type === 'TOW_WARNING') defaultNote = 'Traffic police / towing crane is approaching vehicle';

    try {
      const payload = {
        alertType: type,
        latitude: includeGps ? coordinates.latitude : null,
        longitude: includeGps ? coordinates.longitude : null,
        address: scannerNote || (includeGps ? 'GPS Location Attached' : ''),
        scannerNote: scannerNote || defaultNote,
        scannerName: 'Concerned Citizen'
      };

      const res = await fetch(`/api/scan/${tagCode}/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setDispatchResult({
          type,
          message: data.message,
          directFamilyWhatsAppLinks: data.directFamilyWhatsAppLinks || [],
          directWhatsAppUrl: data.directWhatsAppUrl,
          directCallUrl: data.directCallUrl || scanData?.ownerContact?.directCallUrl,
          maskedPhone: data.maskedPhone || scanData?.ownerContact?.maskedPhone,
          hasLocation: data.hasLocation
        });
      } else {
        alert(data.message || 'Failed to dispatch alert');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDispatching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-white transition-colors duration-200">
        <div className="text-center space-y-3">
          <div className="size-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">Reading GadiRaksha Smart Sticker...</p>
        </div>
      </div>
    );
  }

  // First time scan of pre-printed unclaimed sticker
  if (scanData?.status === 'UNCLAIMED' || scanData?.isFirstTimeScan) {
    const handleClaimForLoggedInUser = async (e) => {
      e.preventDefault();
      setClaiming(true);
      setClaimErr('');
      setClaimSuccessMsg('');

      const targetVehicle = selectedVehicleNum === 'NEW' ? customVehicleNum : (selectedVehicleNum || customVehicleNum);
      if (!targetVehicle || !targetVehicle.trim()) {
        setClaimErr('Please enter or select a vehicle number');
        setClaiming(false);
        return;
      }

      try {
        const res = await authFetch('/api/tags/claim', {
          method: 'POST',
          body: JSON.stringify({
            tagCode,
            vehicleNumber: targetVehicle.trim().toUpperCase(),
            vehicleType: customVehicleType
          })
        });
        const data = await res.json();
        if (data.success) {
          setClaimSuccessMsg(data.message || 'Scanner claimed successfully!');
          setTimeout(async () => {
            const freshRes = await fetch(`/api/scan/${tagCode}`);
            const freshData = await freshRes.json();
            if (freshData.success) {
              setScanData(freshData);
            }
          }, 1200);
        } else {
          setClaimErr(data.message || 'Failed to claim sticker');
        }
      } catch (err) {
        setClaimErr('Error claiming sticker: ' + err.message);
      } finally {
        setClaiming(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12141e] p-6 sm:p-8 border border-slate-200/90 dark:border-[#1f2333] text-center space-y-5 shadow-2xl relative">
          
          <button
            type="button"
            onClick={toggleTheme}
            className="absolute right-4 top-4 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
          </button>

          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 grid place-items-center mx-auto text-2xl">
            📦
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/20">
              Fresh Pre-Printed Sticker
            </span>
            <h1 className="text-2xl font-bold font-display text-ink dark:text-white mt-2">
              Unclaimed Safety Scanner
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Code: <strong className="text-amber-600 dark:text-amber-400">{tagCode}</strong>
            </p>
          </div>

          {user ? (
            /* User is already registered and logged in */
            <div className="space-y-4 text-left pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] text-xs">
                <p className="text-slate-500 dark:text-slate-400">Logged in as:</p>
                <p className="font-bold text-ink dark:text-white text-sm">{user.name || 'Vehicle Owner'} ({user.phone})</p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                You have scanned this physical sticker for the first time! Link it to your vehicle to activate 24x7 emergency coverage:
              </p>

              <form onSubmit={handleClaimForLoggedInUser} className="space-y-3">
                {userVehicles.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Vehicle to Assign
                    </label>
                    <select
                      value={selectedVehicleNum}
                      onChange={(e) => setSelectedVehicleNum(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-semibold text-ink dark:text-white focus:outline-none"
                    >
                      {userVehicles.map(v => (
                        <option key={v._id} value={v.vehicleNumber}>
                          {v.vehicleNumber} ({v.vehicleModel || v.vehicleType || 'Vehicle'})
                        </option>
                      ))}
                      <option value="NEW">➕ Add New Vehicle</option>
                    </select>
                  </div>
                )}

                {(userVehicles.length === 0 || selectedVehicleNum === 'NEW') && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Vehicle Number Plate
                      </label>
                      <input
                        type="text"
                        value={customVehicleNum}
                        onChange={(e) => setCustomVehicleNum(e.target.value)}
                        placeholder="e.g. MH 19 AB 1234"
                        required
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs font-mono font-bold uppercase text-ink dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Vehicle Type
                      </label>
                      <select
                        value={customVehicleType}
                        onChange={(e) => setCustomVehicleType(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-semibold text-ink dark:text-white focus:outline-none"
                      >
                        <option value="Two-Wheeler">Two-Wheeler (Bike / Scooter)</option>
                        <option value="Car">Car / SUV</option>
                        <option value="Auto">Auto Rickshaw</option>
                        <option value="Commercial">Commercial / Truck / Bus</option>
                      </select>
                    </div>
                  </div>
                )}

                {claimErr && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/60">
                    {claimErr}
                  </div>
                )}

                {claimSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>{claimSuccessMsg} Activating...</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={claiming}
                  className="btn-primary w-full !bg-amber-500 hover:!bg-amber-600 !text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-xs py-2.5"
                >
                  <QrCode className="size-4" />
                  <span>{claiming ? 'Linking Sticker...' : `Claim & Link ${tagCode} to My Vehicle`}</span>
                </button>
              </form>

              <button
                type="button"
                onClick={() => navigate('/app')}
                className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:underline pt-1"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            /* Visitor is not logged in */
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This physical GadiRaksha QR safety sticker is brand new and unclaimed! On this first scan, register your account or log in to permanently link this sticker to your vehicle.
              </p>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => navigate(`/register?tagCode=${tagCode}`, { state: { tagCode } })}
                  className="btn-primary w-full !bg-amber-500 hover:!bg-amber-600 !text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <span>Register & Make This Sticker Yours</span>
                  <ChevronRight className="size-4" />
                </button>

                <button
                  onClick={() => navigate(`/login?tagCode=${tagCode}`, { state: { tagCode } })}
                  className="w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-cyan-400 bg-brand-50/50 dark:bg-brand-950/30 hover:bg-brand-100 transition flex items-center justify-center gap-1.5"
                >
                  <LogIn className="size-3.5" />
                  <span>Already Registered? Log In to Link Sticker</span>
                </button>

                <button
                  onClick={() => navigate(`/activate?tagCode=${tagCode}`, { state: { tagCode } })}
                  className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 dark:border-[#22253a] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161826] transition"
                >
                  Or Use Express 1-Step Wizard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const vehiclePlate = scanData?.vehicle?.number || 'MH 19 AB 1234';
  const vehicleModel = scanData?.vehicle?.model || 'Honda Activa 6G';
  const bloodGroup = scanData?.medicalSupport?.bloodGroup || 'B+';
  const weight = scanData?.medicalSupport?.weight || '72 kg';
  const height = scanData?.medicalSupport?.height || '5.8 ft';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6 transition-colors duration-200">
      <div className="w-full max-w-md mx-auto space-y-4">
        
        {/* Top Header with Brand and Theme Toggle */}
        <div className="flex items-center justify-between py-1">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Shield className="size-4.5" />
            </div>
            <span className="font-display font-extrabold text-base text-ink dark:text-white">GadiRaksha</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Protected</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Main Vehicle Card */}
        <div className="card p-6 shadow-xl space-y-5 border border-slate-200/90 dark:border-[#1f2333]">
          <div className="flex items-center justify-between">
            <PlateBadge value={vehiclePlate} size="lg" />
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold">
              Protected Vehicle
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white flex items-center gap-2">
              <Car className="size-5 text-amber-500" />
              <span>{vehicleModel}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sticker ID: <span className="font-mono text-brand-600 dark:text-cyan-400 font-semibold">{tagCode}</span>
            </p>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <span className="text-base">🛡️</span>
            <p className="leading-relaxed">
              <strong>Privacy Guaranteed:</strong> Owner's phone number is never revealed to you. Your alert is delivered instantly through masked notifications.
            </p>
          </div>

          {/* Medical Demographics (First Responders Box) */}
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
            <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900/50 pb-1.5 text-xs">
              <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <Heart className="size-3.5 text-rose-500" /> Medical / Rescue Demographics
              </span>
              <strong className="text-rose-700 dark:text-rose-400 font-extrabold text-sm">{bloodGroup}</strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div>Biometrics: <strong className="text-ink dark:text-white">{weight}, {height}</strong></div>
              <div>Emergency: <strong className="text-emerald-600 dark:text-emerald-400">3-4 Family Linked</strong></div>
            </div>
          </div>

          {/* Location Setting */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">GPS Location Option:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGps}
                  onChange={(e) => setIncludeGps(e.target.checked)}
                  className="size-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className={`text-[11px] font-semibold ${includeGps ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {includeGps ? '📍 With GPS Location' : '⚡ Without GPS'}
                </span>
              </label>
            </div>

            <input
              type="text"
              value={scannerNote}
              onChange={(e) => setScannerNote(e.target.value)}
              placeholder="Landmark or note (e.g. Near Pachora Station)"
              className="w-full bg-white dark:bg-[#0b0d14] border border-slate-300 dark:border-[#272b3f] rounded-xl px-3 py-2 text-xs text-ink dark:text-white placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Action Alert Selection Grid */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Choose Reason for Scanning (अलर्ट प्रकार निवडा):
            </span>

            {/* Option 1: No Parking / Gaadi Hatao */}
            <button
              type="button"
              onClick={() => handleTriggerAlert('NO_PARKING')}
              disabled={dispatching}
              className="w-full p-3.5 sm:p-4 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-[0.98] transition flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 grid place-items-center text-lg shrink-0 mt-0.5">
                  🚫
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                    गाडी नो-पार्किंगमध्ये आहे (No Parking Alert)
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Vehicle Obstructing / Please Move Car/Bike
                  </p>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 mt-1">
                    <Volume2 className="size-3" /> Sends phone call & push notification to owner
                  </span>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400 dark:text-slate-500 group-hover:text-amber-500 transition shrink-0" />
            </button>

            {/* Option 2: Accident / Medical Emergency SOS */}
            <button
              type="button"
              onClick={() => handleTriggerAlert('ACCIDENT')}
              disabled={dispatching}
              className="w-full p-3.5 sm:p-4 rounded-2xl border-2 border-rose-500/80 bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/30 active:scale-[0.98] transition flex items-center justify-between text-left group pulse-sos shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-400 grid place-items-center text-lg shrink-0 mt-0.5">
                  🆘
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-300">
                    अपघात / आणीबाणी (Accident SOS Emergency)
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-200 mt-0.5 font-medium">
                    Critical Road Incident / Urgent Medical Help
                  </p>
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1 mt-1">
                    <Phone className="size-3" /> Dispatches calls & WhatsApp to 3-4 family members with GPS
                  </span>
                </div>
              </div>
              <ChevronRight className="size-5 text-rose-500 group-hover:translate-x-1 transition shrink-0" />
            </button>

            {/* Option 3: Lights ON / Window Open / Flat Tyre */}
            <button
              type="button"
              onClick={() => handleTriggerAlert('LIGHTS_ON')}
              disabled={dispatching}
              className="w-full p-3.5 sm:p-4 rounded-2xl border border-sky-300 dark:border-sky-500/30 bg-sky-50/70 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 active:scale-[0.98] transition flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-sky-500/20 text-sky-700 dark:text-sky-400 grid place-items-center text-lg shrink-0 mt-0.5">
                  💡
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-sky-900 dark:text-sky-300">
                    लाईट चालू / खिडकी उघडी / टायर पंचर (Vehicle Issue)
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Headlights left ON, flat tyre, or window rolled down
                  </p>
                  <span className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold flex items-center gap-1 mt-1">
                    <Send className="size-3" /> Alerts owner to prevent battery drain or theft
                  </span>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400 dark:text-slate-500 group-hover:text-sky-500 transition shrink-0" />
            </button>

            {/* Option 4: Towing Alert / Police Action */}
            <button
              type="button"
              onClick={() => handleTriggerAlert('TOW_WARNING')}
              disabled={dispatching}
              className="w-full p-3.5 sm:p-4 rounded-2xl border border-red-300 dark:border-red-500/30 bg-red-50/70 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98] transition flex items-center justify-between text-left group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-red-500/20 text-red-700 dark:text-red-400 grid place-items-center text-lg shrink-0 mt-0.5">
                  ⚠️
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-red-900 dark:text-red-300">
                    टोईंग क्रेन / पोलीस कारवाई (Towing Alert)
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Traffic police crane is towing this vehicle
                  </p>
                  <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold flex items-center gap-1 mt-1">
                    <AlertOctagon className="size-3" /> Urgent alarm sent to owner's dashboard & phone
                  </span>
                </div>
              </div>
              <ChevronRight className="size-5 text-slate-400 dark:text-slate-500 group-hover:text-red-500 transition shrink-0" />
            </button>
          </div>

          {/* Quick Direct Call & WhatsApp Action Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#1f2333] space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block text-center">
              Direct Contact Options (थेट संपर्क साधा):
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={scanData?.ownerContact?.directCallUrl || '#'}
                onClick={(e) => {
                  if (!scanData?.ownerContact?.directCallUrl) {
                    e.preventDefault();
                    handleTriggerAlert('NO_PARKING');
                  }
                }}
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition"
              >
                <PhoneCall className="size-4 shrink-0" />
                <span>Call Owner Directly</span>
              </a>

              <a
                href={scanData?.ownerContact?.directWhatsAppUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="size-4 shrink-0" />
                <span>WhatsApp Owner</span>
              </a>
            </div>
          </div>

          {/* Dispatch Confirmation Feedback Box */}
          {dispatchResult && (
            <div
              className={`p-4 rounded-2xl text-xs space-y-3 border shadow-lg animate-in fade-in duration-300 ${
                dispatchResult.type === 'ACCIDENT'
                  ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-600 text-rose-800 dark:text-rose-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-ink dark:text-white text-sm">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <span>{dispatchResult.message}</span>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Notification & Voice Call: <strong className="text-emerald-600 dark:text-emerald-400">Delivered to Owner</strong></span>
                <span>{dispatchResult.hasLocation ? '📍 Location Sent' : '⚡ Alert Sent'}</span>
              </div>

              {/* Immediate Call / WhatsApp to Owner after sending alert */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap gap-2">
                {dispatchResult.directCallUrl && (
                  <a
                    href={dispatchResult.directCallUrl}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <PhoneCall className="size-3.5" />
                    <span>Call Owner Now</span>
                  </a>
                )}
                {dispatchResult.directWhatsAppUrl && (
                  <a
                    href={dispatchResult.directWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="size-3.5" />
                    <span>WhatsApp Chat</span>
                  </a>
                )}
              </div>

              {/* Direct Family WhatsApp links (For ACCIDENT SOS) */}
              {dispatchResult.directFamilyWhatsAppLinks.length > 0 && (
                <div className="pt-2 border-t border-rose-200 dark:border-rose-800/60 space-y-2">
                  <p className="font-bold text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                    <MessageCircle className="size-3.5" /> Connect with Family Emergency Contacts:
                  </p>
                  <div className="space-y-1.5">
                    {dispatchResult.directFamilyWhatsAppLinks.map((c, i) => (
                      <a
                        key={i}
                        href={c.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition"
                      >
                        <div>
                          <strong className="text-ink dark:text-white">{c.name}</strong>
                          <span className="text-[10px] text-slate-400 ml-1">({c.relation})</span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                          <MessageCircle className="size-3" /> Connect
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 pb-4">
          Emergency Assistance · Always call <strong className="text-ink dark:text-white">112</strong> in extreme medical emergency.
        </div>
      </div>
    </div>
  );
}
