import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PlateBadge from '../components/PlateBadge';
import SalesVelocityChart from '../components/SalesVelocityChart';
import SalesCustomersTable from '../components/SalesCustomersTable';
import SalesMyWorkSection from '../components/SalesMyWorkSection';
import {
  TrendingUp,
  Users,
  QrCode,
  DollarSign,
  Plus,
  CheckCircle2,
  Phone,
  Shield,
  Search,
  Calendar,
  Clock,
  Car,
  Award,
  Sparkles,
  ArrowUpRight,
  LogOut,
  RefreshCw,
  FileText,
  X,
  Target,
  Sun,
  Moon,
  Building2,
  CreditCard,
  Wallet,
  KeyRound,
  Copy,
  Check,
  ChevronRight,
  Lock,
  Eye,
  AlertCircle,
  CalendarDays,
  Coffee,
  Briefcase,
  CheckCircle,
  XCircle,
  Flame,
  Activity,
  UserCheck,
  BarChart2,
  Edit,
  Trash2,
  PieChart,
  BarChart3,
  Calculator,
  IndianRupee,
  LayoutDashboard,
  Menu,
  Ban
} from 'lucide-react';

// Helper to normalize date to YYYY-MM-DD string
const toDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Reusable SVG Donut Paychart Component
function DonutPayChart({ items = [], size = 150, strokeWidth = 20, centerLabel = '', centerSub = '' }) {
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-[#1c1f2e]"
          fill="transparent"
        />
        {items.map((item, idx) => {
          if (!item.value) return null;
          const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedPercent * circumference;
          accumulatedPercent += item.value / total;

          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              fill="transparent"
              className="transition-all duration-500 hover:opacity-80"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-xl font-display font-extrabold text-ink dark:text-white leading-none">
          {centerLabel}
        </span>
        {centerSub && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase mt-0.5">
            {centerSub}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SalesDashboard() {
  const { user, token, login, logout, authFetch } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  // Active navigation tab: 'overview' | 'customers' | 'attendance' | 'reports' | 'payout'
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reports sub-tab: 'weekly' | 'monthly' | 'yearly'
  const [reportPeriod, setReportPeriod] = useState('weekly');

  // Customer Status Filter: 'ALL' | 'ACTIVE' | 'BLOCKED'
  const [customerStatusFilter, setCustomerStatusFilter] = useState('ALL');

  // Authentication states if not signed in
  const [loginPhone, setLoginPhone] = useState('9821889900');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Data states
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [copiedText, setCopiedText] = useState('');
  // Extra Feature: Quick QR Sticker Verification
  const [stickerLookupInput, setStickerLookupInput] = useState('');
  const [stickerLookupResult, setStickerLookupResult] = useState(null);

  // Extra Feature: Interactive Earnings Calculator
  const [extraQRsEstimate, setExtraQRsEstimate] = useState(5);


  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Edit Customer Modal State
  const [editCustomerModal, setEditCustomerModal] = useState(null);
  const [editCustomerForm, setEditCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    bloodGroup: 'B+',
    medicalNotes: '',
    fullAddress: '',
    city: 'Pune',
    state: 'Maharashtra',
    vehicleNumber: '',
    vehicleModel: '',
    vehicleType: 'Car',
    vehicleColor: 'White',
    status: 'ACTIVE'
  });

  // Direct Customer Onboarding Form
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'password123',
    vehicleNumber: '',
    vehicleType: 'Car',
    vehicleModel: '',
    vehicleColor: 'White',
    tagCode: '',
    bloodGroup: 'B+',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse',
    fullAddress: '',
    city: 'Pune'
  });

  // Mark Attendance / Chutti Form
  const [attForm, setAttForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT', // PRESENT | HALF_DAY | LEAVE | WEEKLY_OFF
    hoursWorked: 8,
    workSummary: '',
    leaveReason: '',
    leaveType: 'NONE' // CASUAL | SICK | WEEKLY_OFF | FESTIVAL | EMERGENCY
  });

  // Daily Work Activity Report Form
  const [reportForm, setReportForm] = useState({
    tasksSummary: '',
    stickersAssignedOrSold: 2,
    usersOnboarded: 1,
    revenueGenerated: 499,
    hoursWorked: 8,
    leadsContacted: 8,
    notesAndFeedback: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Direct Staff Login handler
  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await login(loginPhone, loginPassword);
      if (res.success) {
        loadAllData();
      } else {
        setLoginError(res.message || 'Invalid staff credentials');
      }
    } catch (err) {
      setLoginError('Login error: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Fetch All Sales Data (Stats, Customers, Attendance, Reports)
  const loadAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, custRes, attRes, repRes] = await Promise.all([
        authFetch('/api/sales/my-stats').then(r => r.json()).catch(() => ({ data: null })),
        authFetch(`/api/sales/my-users?search=${encodeURIComponent(search)}`).then(r => r.json()).catch(() => ({ data: [] })),
        authFetch('/api/sales/attendance').then(r => r.json()).catch(() => ({ data: null })),
        authFetch('/api/sales/reports').then(r => r.json()).catch(() => ({ data: null }))
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (custRes.success) setCustomers(custRes.data || []);
      if (attRes.success) setAttendanceData(attRes.data);
      if (repRes.success) setReportsData(repRes.data);
    } catch (err) {
      console.error('Error loading sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token, search]);

  // Fetch full single customer dossier for Eye button
  const handleViewCustomer = async (cust) => {
    setSelectedCustomer(cust);
    setLoadingDossier(true);
    try {
      const res = await authFetch(`/api/sales/customer/${cust._id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedCustomer(data.data);
      }
    } catch (err) {
      console.error('Failed to load full customer dossier:', err);
    } finally {
      setLoadingDossier(false);
    }
  };

  // Handle direct customer onboard
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await authFetch('/api/sales/onboard-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardForm)
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`🎉 Customer ${onboardForm.name} onboarded successfully with Sticker ${onboardForm.tagCode}! (+₹${data.data?.commissionEarned || 100} commission credited)`);
        setOnboardForm({
          name: '',
          phone: '',
          email: '',
          password: 'password123',
          vehicleNumber: '',
          vehicleType: 'Car',
          vehicleModel: '',
          vehicleColor: 'White',
          tagCode: '',
          bloodGroup: 'B+',
          emergencyName: '',
          emergencyPhone: '',
          emergencyRelation: 'Spouse',
          fullAddress: '',
          city: 'Pune'
        });
        loadAllData();
        setTimeout(() => {
          setShowAddCustomerModal(false);
          setSuccessMsg('');
        }, 1800);
      } else {
        setErrorMsg(data.message || 'Failed to onboard customer');
      }
    } catch (err) {
      setErrorMsg('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (cust) => {
    setEditCustomerModal(cust);
    setEditCustomerForm({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email && cust.email !== 'N/A' ? cust.email : '',
      bloodGroup: cust.bloodGroup || 'B+',
      medicalNotes: cust.medicalNotes || '',
      fullAddress: cust.address?.fullAddress || '',
      city: cust.address?.city || 'Pune',
      state: cust.address?.state || 'Maharashtra',
      vehicleNumber: cust.vehicleNumber || '',
      vehicleModel: cust.vehicleModel || '',
      vehicleType: cust.vehicleType || 'Car',
      vehicleColor: cust.vehicleColor || 'White',
      status: cust.status || 'ACTIVE'
    });
  };

  // Submit Edit Customer
  const handleSaveEditCustomer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/sales/customer/${editCustomerModal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCustomerForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Customer details updated successfully!');
        setEditCustomerModal(null);
        loadAllData();
      } else {
        alert(data.message || 'Failed to update customer');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Customer Block / Unblock by Sales Agent
  const handleToggleCustomerBlock = async (id, currentStatus) => {
    const isCurrentlyBlocked = currentStatus === 'BLOCKED' || currentStatus === 'INACTIVE';
    const nextStatus = isCurrentlyBlocked ? 'ACTIVE' : 'BLOCKED';
    try {
      const res = await authFetch(`/api/sales/customer/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, isActive: nextStatus === 'ACTIVE' })
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(customers.map(c => (c._id === id ? { ...c, status: nextStatus, isActive: nextStatus === 'ACTIVE' } : c)));
        if (selectedCustomer && selectedCustomer._id === id) {
          setSelectedCustomer({ ...selectedCustomer, status: nextStatus, isActive: nextStatus === 'ACTIVE' });
        }
      } else {
        alert(data.message || 'Failed to update customer status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Delete Customer by Sales Agent
  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove customer "${name}"? The assigned QR code sticker will be unlinked and released back to stock.`)) {
      return;
    }
    try {
      const res = await authFetch(`/api/sales/customer/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(`Customer ${name} deleted successfully!`);
        loadAllData();
      } else {
        alert(data.message || 'Failed to delete customer');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  
  // Quick QR Sticker Validator Handler
  const handleVerifySticker = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const clean = stickerLookupInput.trim().toUpperCase();
    if (!clean) return;

    const match = customers.find(c => 
      (c.tagCode || '').toUpperCase() === clean || 
      (c.assignedScannerCode || '').toUpperCase() === clean ||
      (c.vehicleNumber || '').toUpperCase() === clean
    );

    if (match) {
      setStickerLookupResult({
        code: clean,
        status: 'BOUND',
        customer: match
      });
    } else {
      setStickerLookupResult({
        code: clean,
        status: 'UNCLAIMED'
      });
    }
  };

  // Quick Duty Status Switcher
  const handleQuickDuty = async (newStatus) => {
    try {
      const res = await authFetch('/api/sales/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: toDateString(new Date()),
          status: newStatus,
          notes: `Quick logged as ${newStatus}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          attendanceSummary: {
            ...(prev?.attendanceSummary || {}),
            todayStatus: newStatus
          }
        }));
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Mark Attendance or Log Chutti
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch('/api/sales/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Attendance status saved successfully!');
        setShowAttendanceModal(false);
        loadAllData();
      } else {
        alert(data.message || 'Failed to update attendance');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle submit daily sales report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch('/api/sales/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Daily work activity report logged successfully!');
        setShowReportModal(false);
        loadAllData();
      } else {
        alert(data.message || 'Report submission failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Active and Blocked Customers Counts
  const activeCustomersCount = customers.filter(c => c.status === 'ACTIVE' || c.isActive !== false).length;
  const pendingCustomersCount = customers.filter(c => c.status === 'BLOCKED' || c.status === 'INACTIVE' || c.isActive === false).length;

  // Filtered customer list
  const filteredCustomers = customers.filter(c => {
    // Status filter
    if (customerStatusFilter === 'ACTIVE' && (c.status === 'BLOCKED' || c.status === 'INACTIVE' || c.isActive === false)) return false;
    if (customerStatusFilter === 'BLOCKED' && c.status !== 'BLOCKED' && c.status !== 'INACTIVE' && c.isActive !== false) return false;
    // Vehicle type filter
    if (vehicleFilter !== 'ALL' && (c.vehicleType || '').toLowerCase() !== vehicleFilter.toLowerCase()) return false;
    return true;
  });

  // Calendar dates helper for "My Work" tab
  const currentDate = new Date();
  const calYear = currentDate.getFullYear();
  const calMonth = currentDate.getMonth(); // 0-indexed
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun
  const monthNameEn = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Map of date string -> attendance record
  const attendanceMap = {};
  (attendanceData?.records || []).forEach(r => {
    const dStr = toDateString(r.date);
    attendanceMap[dStr] = r;
  });

  // If user is not authenticated, render dedicated Staff Login Screen
  if (!token || !user) {
    return (
      <div className="min-h-screen flex flex-col justify-between p-4 bg-slate-50 dark:bg-[#0b0d14] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-md shadow-brand-500/20">
              <Shield className="size-5.5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-ink dark:text-white">
                GadiRaksha
              </span>
              <span className="text-[10px] text-brand-600 dark:text-cyan-400 block font-bold uppercase tracking-wider">
                Sales & Staff Portal
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1c27] border border-slate-200 dark:border-[#1f2333] transition"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-600" />}
          </button>
        </header>

        <div className="w-full max-w-md mx-auto my-auto">
          <div className="card p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200/90 dark:border-[#1f2333]">
            <div className="text-center space-y-2">
              <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-cyan-400 grid place-items-center mx-auto shadow-sm">
                <Target className="size-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                <Sparkles className="size-3" />
                <span>Field Team Portal</span>
              </div>
              <h1 className="text-2xl font-bold font-display text-ink dark:text-white">
                Salesman Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to view today's active users, scanner sales, duty attendance vs chutti, and weekly/monthly/yearly reports.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/60">
                {loginError}
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Staff Mobile Number
                </label>
                <div className="relative">
                  <Phone className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="e.g. 9821889900"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs font-mono text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-3.5 py-2.5 text-xs text-ink dark:text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Demo Credentials Helper Pill */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] text-[11px] space-y-1">
                <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-brand-600 dark:text-cyan-400" />
                  <span>Demo Salesman Credentials:</span>
                </span>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono">
                  <span>Mobile: <strong>9821889900</strong> (Sachin Gaikwad)</span>
                  <span>Pass: <strong>password123</strong></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full !py-2.5 text-xs font-bold shadow-md shadow-brand-500/20"
              >
                {loginLoading ? 'Authenticating Staff...' : 'Sign In to Sales Portal →'}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 dark:border-[#1f2333] text-center text-xs text-slate-500 dark:text-slate-400">
              <span>Authorized GadiRaksha Sales Representatives & Field Agents Only</span>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-400 py-3">
          © 2026 GadiRaksha Smart Vehicle Safety Network. Sales & field operations portal.
        </footer>
      </div>
    );
  }

  // Fallback calculations for agent metrics
  const agentName = user?.name || stats?.agent?.name || 'Sachin Gaikwad';
  const agentPhone = user?.phone || stats?.agent?.phone || '9821889900';
  const agentDept = stats?.agent?.department || user?.department || 'Field Operations & Dealerships';
  const monthlyTarget = stats?.agent?.monthlyTarget || user?.monthlyTarget || 60;
  const commissionRate = stats?.metrics?.commissionPerUnit || user?.salaryOrCommissionRate || 100;
  const bankDetails = stats?.agent?.bankDetails || user?.bankDetails || {};

  const metrics = stats?.metrics || {
    totalCustomers: customers.length || 15,
    totalTagsSold: customers.length || 15,
    todaySales: 3, // Aaj kitne active kiye
    todayTagsSold: 3,
    weekSales: 3,
    monthSales: 12,
    yearSales: 15,
    targetAchievedPercent: Math.min(100, Math.round(((12) / monthlyTarget) * 100)),
    totalCommissionEarned: (customers.length || 15) * commissionRate,
    commissionPerUnit: commissionRate,
    baseSalary: 15000,
    incentivePerScanner: commissionRate
  };

  const baseSalaryVal = stats?.payroll?.baseSalary || stats?.metrics?.baseSalary || 15000;
  const incentivePerScannerVal = stats?.payroll?.incentivePerScanner || stats?.metrics?.incentivePerScanner || commissionRate;
  const netPayableSalary = baseSalaryVal + (metrics.monthSales * incentivePerScannerVal);

  const attendanceSummary = stats?.attendanceSummary || {
    todayStatus: 'PRESENT',
    daysWorkedMonth: 20,
    leavesTakenMonth: 2,
    weeklyOffsMonth: 4
  };

  const navItems = [
    {
      tab: 'overview',
      label: 'Overview & Performance',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      
    },
    {
      tab: 'customers',
      label: 'My Onboarded Users',
      icon: Users,
      badge: `${customers.length}`,
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
     
    },
    {
      tab: 'attendance',
      label: 'My Work & Performance',
      icon: Briefcase,
      badge: `${attendanceSummary.daysWorkedMonth}d`,
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    
    },
    {
      tab: 'reports',
      label: 'Sales Velocity Reports',
      icon: BarChart2,
    },
    {
      tab: 'payout',
      label: 'Salary & Bank Details',
      icon: Building2,
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin-Style Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-[#0e1017] border-r border-slate-200 dark:border-[#1a1d2c] transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-[#1a1d2c] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white shadow-md shadow-purple-600/20">
              <Shield className="size-5.5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-ink dark:text-white">
                GadiRaksha
              </span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  Sales Console
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-ink dark:hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => {
                  setActiveTab(item.tab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full group flex items-start gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#151722]'
                }`}
              >
                <Icon
                  className={`size-4.5 mt-0.5 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-purple-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.desc && (
                    <p
                      className={`text-[10px] mt-0.5 truncate ${
                        isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.desc}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-[#1a1d2c] space-y-2 shrink-0">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-[#151722] text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Duty Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {attendanceSummary.todayStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1d2c] border border-slate-200 dark:border-[#1f2333] transition"
            >
              {isDark ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-indigo-600" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/sales/login');
              }}
              className="flex items-center justify-center p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-[#1f2333] transition"
              title="Sign Out"
            >
              <LogOut className="size-4" />
            </button>
          </div>

          <div className="text-[10px] text-center text-slate-400 font-mono">
            GadiRaksha Sales Portal v2.5
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0e1017] border-b border-slate-200 dark:border-[#1a1d2c] shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1d2c] lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm sm:text-base text-ink dark:text-white">
                {activeTab === 'overview' && "Sales Dashboard & Live Duty"}
                {activeTab === 'customers' && `My Onboarded Users (${customers.length})`}
                {activeTab === 'attendance' && "My Work & Performance (Calendar, Attendance & Salary)"}
                {activeTab === 'reports' && "Sales Velocity Reports"}
                {activeTab === 'payout' && "Salary & Bank Details"}
              </span>
              <span className="hidden sm:inline-block size-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400">
                Field Sales Console
              </span>
            </div>
          </div>

          {/* Quick Action Buttons on Top Navbar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddCustomerModal(true)}
              className="btn-primary !py-1.5 !px-3 text-xs font-bold shadow-md shadow-purple-500/20 inline-flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span className="hidden md:inline">Onboard User</span>
              <span className="md:hidden">+ User</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAttendanceModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-ink dark:hover:text-white bg-slate-100 dark:bg-[#161826] border border-slate-200 dark:border-[#22253a] px-2.5 py-1.5 rounded-xl transition"
            >
              <CalendarDays className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Mark Duty</span>
              <span className="md:hidden">Duty</span>
            </button>

            <button
              type="button"
              onClick={() => loadAllData()}
              className="p-2 rounded-xl text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1d2c] border border-slate-200 dark:border-[#1f2333] transition"
              title="Refresh Data"
            >
              <RefreshCw className="size-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#1f2333]">
              <div className="size-8 rounded-full bg-purple-600 text-white font-bold grid place-items-center text-xs">
                {agentName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-ink dark:text-white block leading-tight">
                  {agentName}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Field Sales Staff
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Tab Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* 
          ======================================================================
          TAB 1: OVERVIEW & PERFORMANCE DASHBOARD (ENLAZ SAAS STANDARD)
          ======================================================================
        */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 1. SALES COMMAND HERO & LIVE DUTY STRIP */}
            <div className="rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/20 dark:from-purple-950/60 dark:via-[#131522] dark:to-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 p-6 sm:p-7 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      ⚡ AUTHORIZED FIELD SALES & DEALERSHIP AGENT
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE QUOTA SYNC
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                    Welcome back, {agentName}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    Today: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{metrics.todaySales} customers activated</strong> · Base Pay: ₹{(baseSalaryVal).toLocaleString('en-IN')} + Incentive Rate: ₹{commissionRate}/QR
                  </p>

                  {/* Interactive Quick Duty Status Selector */}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Duty Status:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickDuty('PRESENT')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        attendanceSummary.todayStatus === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#1a1c2a] border border-slate-200 dark:border-[#262a3f] text-slate-600 dark:text-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      <span>Present (Full Day)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDuty('HALF_DAY')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        attendanceSummary.todayStatus === 'HALF_DAY'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#1a1c2a] border border-slate-200 dark:border-[#262a3f] text-slate-600 dark:text-slate-300 hover:border-amber-500'
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      <span>Half Day</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDuty('LEAVE')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        attendanceSummary.todayStatus === 'LEAVE'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white dark:bg-[#1a1c2a] border border-slate-200 dark:border-[#262a3f] text-slate-600 dark:text-slate-300 hover:border-rose-500'
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-rose-400" />
                      <span>On Leave</span>
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 self-start lg:self-center">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    className="btn-primary !py-2.5 !px-5 text-xs font-bold shadow-md shadow-purple-600/25 flex items-center justify-center gap-2"
                  >
                    <Plus className="size-4" />
                    <span>Onboard New Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(true)}
                    className="bg-white dark:bg-[#181a28] hover:bg-slate-50 dark:hover:bg-[#202336] border border-slate-200/80 dark:border-[#282c44] text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <CalendarDays className="size-4 text-purple-600" />
                    <span>Log Detailed Attendance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. OVERALL TOTALS & KEY PERFORMANCE INDICATORS (4 ENLAZ-STYLE KPI CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Today's Activations */}
              <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Customers Activated Today
                  </span>
                  <div className="size-11 rounded-2xl grid place-items-center bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/30">
                    <Flame className="size-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {metrics.todaySales}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                      <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                      +{metrics.todaySales} Today
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
                    Vehicle QR stickers linked on field
                  </p>
                </div>
              </div>

              {/* Card 2: Total Users Onboarded */}
              <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Total Users Registered
                  </span>
                  <div className="size-11 rounded-2xl grid place-items-center bg-purple-100/70 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/30">
                    <Users className="size-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {metrics.totalCustomers}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                      <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                      +45.5%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
                    Direct customer accounts created
                  </p>
                </div>
              </div>

              {/* Card 3: Total QR Tags Sold */}
              <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Total QR Scanners Sold
                  </span>
                  <div className="size-11 rounded-2xl grid place-items-center bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30">
                    <QrCode className="size-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {metrics.totalTagsSold}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                      <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                      +{metrics.monthSales} Month
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
                    Stickers active on road
                  </p>
                </div>
              </div>

              {/* Card 4: Projected Net Monthly Payout */}
              <div className="rounded-3xl bg-white dark:bg-[#121420] border border-slate-200/80 dark:border-[#1e2235] p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Net Projected Payout
                  </span>
                  <div className="size-11 rounded-2xl grid place-items-center bg-amber-100/70 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/30">
                    <IndianRupee className="size-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                      ₹{netPayableSalary.toLocaleString('en-IN')}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                      ₹{commissionRate}/QR
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-normal">
                    Base ₹{(baseSalaryVal).toLocaleString('en-IN')} + Inc ₹{metrics.totalCommissionEarned.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

           
{/* 2. DUAL TREND GRAPHS (USER REGISTRATION GRAPH & QR SCANNERS GRAPH) */}
            <SalesVelocityChart
              reportPeriod={reportPeriod}
              setReportPeriod={setReportPeriod}
              reportsData={reportsData}
              metrics={metrics}
              commissionRate={commissionRate}
              monthlyTarget={monthlyTarget}
              activeCustomersCount={activeCustomersCount}
              pendingCustomersCount={pendingCustomersCount}
              title="User Registrations & QR Scanners Sales Trend Graphs"
              subtitle="Switch between User Growth graph, QR Scanners activation graph, and commission throughput"
            />

            {/* 3. REGISTERED CUSTOMERS DIRECTORY (USERS LIST ON DASHBOARD) */}
            <SalesCustomersTable
              customers={customers}
              filteredCustomers={filteredCustomers}
              activeCustomersCount={activeCustomersCount}
              pendingCustomersCount={pendingCustomersCount}
              customerStatusFilter={customerStatusFilter}
              setCustomerStatusFilter={setCustomerStatusFilter}
              vehicleFilter={vehicleFilter}
              setVehicleFilter={setVehicleFilter}
              search={search}
              setSearch={setSearch}
              loading={loading}
              setShowAddCustomerModal={setShowAddCustomerModal}
              handleViewCustomer={handleViewCustomer}
              handleOpenEditCustomer={handleOpenEditCustomer}
              handleToggleCustomerBlock={handleToggleCustomerBlock}
              handleDeleteCustomer={handleDeleteCustomer}
              isOverviewMode={true}
              onViewAll={() => setActiveTab('customers')}
            />

            {/* 4. SALESPERSON'S OWN MY WORK DOSSIER (WORKING DAYS, LEAVES, QR SALES, INCENTIVE, CALENDAR & PAYOUT HISTORY) */}
            <SalesMyWorkSection
              attendanceData={attendanceData}
              attendanceSummary={attendanceSummary}
              metrics={metrics}
              baseSalaryVal={baseSalaryVal}
              incentivePerScannerVal={incentivePerScannerVal}
              netPayableSalary={netPayableSalary}
              bankDetails={bankDetails}
              agentName={agentName}
              monthNameEn={monthNameEn}
              daysInCalMonth={daysInCalMonth}
              firstDayOfWeek={firstDayOfWeek}
              attendanceMap={attendanceMap}
              setShowAttendanceModal={setShowAttendanceModal}
              copiedText={copiedText}
              handleCopy={handleCopy}
            />

          </div>
        )}

        {/* 
          ======================================================================
          TAB 2: MY ONBOARDED USERS (DEDICATED FULL SCREEN)
          ======================================================================
        */}
        {activeTab === 'customers' && (
          <SalesCustomersTable
            customers={customers}
            filteredCustomers={filteredCustomers}
            activeCustomersCount={activeCustomersCount}
            pendingCustomersCount={pendingCustomersCount}
            customerStatusFilter={customerStatusFilter}
            setCustomerStatusFilter={setCustomerStatusFilter}
            vehicleFilter={vehicleFilter}
            setVehicleFilter={setVehicleFilter}
            search={search}
            setSearch={setSearch}
            loading={loading}
            setShowAddCustomerModal={setShowAddCustomerModal}
            handleViewCustomer={handleViewCustomer}
            handleOpenEditCustomer={handleOpenEditCustomer}
            handleToggleCustomerBlock={handleToggleCustomerBlock}
            handleDeleteCustomer={handleDeleteCustomer}
            isOverviewMode={false}
          />
        )}

        {/* 
          ======================================================================
          TAB 3: MY WORK & PERFORMANCE (DEDICATED FULL SCREEN)
          ======================================================================
        */}
        {activeTab === 'attendance' && (
          <SalesMyWorkSection
            attendanceData={attendanceData}
            attendanceSummary={attendanceSummary}
            metrics={metrics}
            baseSalaryVal={baseSalaryVal}
            incentivePerScannerVal={incentivePerScannerVal}
            netPayableSalary={netPayableSalary}
            bankDetails={bankDetails}
            agentName={agentName}
            monthNameEn={monthNameEn}
            daysInCalMonth={daysInCalMonth}
            firstDayOfWeek={firstDayOfWeek}
            attendanceMap={attendanceMap}
            setShowAttendanceModal={setShowAttendanceModal}
            copiedText={copiedText}
            handleCopy={handleCopy}
          />
        )}

        {/* 
          ======================================================================
          TAB 4: SALES REPORTS (DEDICATED FULL SCREEN)
          ======================================================================
        */}
        {activeTab === 'reports' && (
          <SalesVelocityChart
            reportPeriod={reportPeriod}
            setReportPeriod={setReportPeriod}
            reportsData={reportsData}
            metrics={metrics}
            commissionRate={commissionRate}
            monthlyTarget={monthlyTarget}
          />
        )}

        {activeTab === 'payout' && (
          <div className="card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 grid place-items-center">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-ink">
                    Registered Bank & UPI Payout Account
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your monthly salary and per-scanner incentives are directly wired to this verified bank account
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                ✓ Verified Payout Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12141e] border border-slate-200/80 dark:border-[#1f2333] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Name</span>
                <strong className="text-ink text-sm font-bold block">{bankDetails.bankName || 'HDFC Bank'}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12141e] border border-slate-200/80 dark:border-[#1f2333] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Account Holder Name</span>
                <strong className="text-ink text-sm font-bold block">{bankDetails.accountHolderName || agentName}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12141e] border border-slate-200/80 dark:border-[#1f2333] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Account Number</span>
                <div className="flex items-center justify-between">
                  <strong className="font-mono text-ink text-sm font-bold">{bankDetails.accountNumber || '50100492810341'}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankDetails.accountNumber || '50100492810341', 'acc')}
                    className="text-slate-400 hover:text-purple-600"
                  >
                    {copiedText === 'acc' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#12141e] border border-slate-200/80 dark:border-[#1f2333] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">IFSC Code</span>
                <div className="flex items-center justify-between">
                  <strong className="font-mono text-ink text-sm font-bold">{bankDetails.ifscCode || 'HDFC0000123'}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankDetails.ifscCode || 'HDFC0000123', 'ifsc')}
                    className="text-slate-400 hover:text-purple-600"
                  >
                    {copiedText === 'ifsc' ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* UPI ID Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-400 block">Instant UPI VPA Handle</span>
                <strong className="font-mono text-ink dark:text-white text-sm font-bold">{bankDetails.upiId || 'sachin.gaikwad@okhdfcbank'}</strong>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(bankDetails.upiId || 'sachin.gaikwad@okhdfcbank', 'upi')}
                className="btn-secondary !py-1.5 !px-3 text-xs font-bold inline-flex items-center gap-1 self-start sm:self-auto"
              >
                {copiedText === 'upi' ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>Copy UPI ID</span>
              </button>
            </div>
          </div>
        )}

        </main>
      </div>

      {/* 
        ========================================================================
        MODAL 1: CUSTOMER DETAILS DOSSIER (EYE BUTTON MODAL)
        ========================================================================
      */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-ink/60 dark:bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#12141e] border border-slate-200 dark:border-[#1f2333] rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-ink font-bold"
            >
              ✕
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 font-bold grid place-items-center text-lg uppercase shrink-0">
                  {selectedCustomer.name?.slice(0, 2) || 'CU'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-xl text-ink">
                      {selectedCustomer.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedCustomer.status === 'BLOCKED' || selectedCustomer.status === 'INACTIVE'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {selectedCustomer.status === 'BLOCKED' || selectedCustomer.status === 'INACTIVE' ? 'Blocked' : 'Active User'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    +91 {selectedCustomer.phone} • Onboarded: {selectedCustomer.onboardedAt ? new Date(selectedCustomer.onboardedAt).toLocaleDateString('en-IN') : 'Recent'}
                  </p>
                </div>
              </div>

              {/* Action Buttons inside Dossier Header */}
              <div className="flex items-center gap-2 pr-8">
                <button
                  type="button"
                  onClick={() => handleToggleCustomerBlock(selectedCustomer._id, selectedCustomer.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    selectedCustomer.status === 'BLOCKED' || selectedCustomer.status === 'INACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {selectedCustomer.status === 'BLOCKED' || selectedCustomer.status === 'INACTIVE' ? 'Unblock User' : 'Block User'}
                </button>
              </div>
            </div>

            {loadingDossier ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading full user dossier...</div>
            ) : (
              <div className="space-y-4 text-xs">
                
                {/* Vehicle Specs Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200 dark:border-[#22253a] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Registered Vehicle Details
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <PlateBadge value={selectedCustomer.vehicleNumber || selectedCustomer.primaryVehicle?.vehicleNumber} size="md" />
                    <div>
                      <strong className="text-ink text-sm block">
                        {selectedCustomer.vehicleModel || selectedCustomer.primaryVehicle?.vehicleModel}
                      </strong>
                      <span className="text-slate-400 text-xs">
                        Type: {selectedCustomer.vehicleType || selectedCustomer.primaryVehicle?.vehicleType} • Color: {selectedCustomer.vehicleColor || selectedCustomer.primaryVehicle?.vehicleColor || 'White'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pre-Printed QR Tag Card */}
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Assigned QR Scanner Sticker
                    </span>
                    <span className="font-mono font-bold text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                      {selectedCustomer.tagCode || selectedCustomer.tag?.tagCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <span>Total Emergency Scans: <strong>{selectedCustomer.totalScans || selectedCustomer.tag?.totalScans || 0} times</strong></span>
                    <span className="text-emerald-600 font-bold">+₹{commissionRate} Commission Credited</span>
                  </div>
                </div>

                {/* Emergency Contacts Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200 dark:border-[#22253a] space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Family Emergency SOS Contacts ({selectedCustomer.emergencyContacts?.length || 0})
                  </span>
                  {(selectedCustomer.emergencyContacts && selectedCustomer.emergencyContacts.length > 0) ? (
                    <div className="space-y-2">
                      {selectedCustomer.emergencyContacts.map((em, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#12141e] border border-slate-200/80 dark:border-[#1f2333]">
                          <div>
                            <strong className="text-ink text-xs block">{em.name}</strong>
                            <span className="text-[10px] text-slate-400">Relation: {em.relation}</span>
                          </div>
                          <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">+91 {em.phone}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No emergency contacts registered yet.</p>
                  )}
                </div>

                {/* Address & Medical Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200 dark:border-[#22253a]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Driver Blood Group</span>
                    <strong className="text-rose-600 font-bold text-sm mt-0.5 block">{selectedCustomer.bloodGroup || 'B+'}</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200 dark:border-[#22253a]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">City & State</span>
                    <strong className="text-ink font-bold text-xs mt-0.5 block">
                      {selectedCustomer.address?.city || 'Pune'}, {selectedCustomer.address?.state || 'Maharashtra'}
                    </strong>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 2: DIRECT CUSTOMER ONBOARDING
        ========================================================================
      */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 dark:bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#12141e] border border-slate-200 dark:border-[#1f2333] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddCustomerModal(false)}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-ink font-bold"
            >
              ✕
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase mb-1">
                <Sparkles className="size-3.5" />
                <span>On-Spot Vehicle Owner Registration</span>
              </div>
              <h3 className="font-display font-bold text-xl text-ink">Onboard New Vehicle Owner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This vehicle and pre-printed QR tag will be permanently credited to your sales account (+₹{commissionRate}).
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={onboardForm.name}
                    onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile (Login Phone) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9823000000"
                    value={onboardForm.phone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                  />
                </div>
              </div>

              {/* Pre-Printed Sticker & Plate */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60">
                <div>
                  <label className="block text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">Pre-Printed Sticker Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-1025"
                    value={onboardForm.tagCode}
                    onChange={(e) => setOnboardForm({ ...onboardForm, tagCode: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono font-bold uppercase text-purple-600 dark:text-purple-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">Vehicle Plate Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH 12 AB 1234"
                    value={onboardForm.vehicleNumber}
                    onChange={(e) => setOnboardForm({ ...onboardForm, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono font-bold uppercase text-ink dark:text-white"
                  />
                </div>
              </div>

              {/* Vehicle Type & Model */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Type</label>
                  <select
                    value={onboardForm.vehicleType}
                    onChange={(e) => setOnboardForm({ ...onboardForm, vehicleType: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-2.5 py-2 text-ink dark:text-white"
                  >
                    <option value="Car">Car</option>
                    <option value="Two-Wheeler">Two-Wheeler</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Model / Make</label>
                  <input
                    type="text"
                    placeholder="e.g. Swift Dzire / Activa 6G"
                    value={onboardForm.vehicleModel}
                    onChange={(e) => setOnboardForm({ ...onboardForm, vehicleModel: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                  />
                </div>
              </div>

              {/* Family Emergency Contact */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Family Emergency SOS Contact
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name (e.g. Spouse)"
                    value={onboardForm.emergencyName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, emergencyName: e.target.value })}
                    className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-1.5 text-xs text-ink dark:text-white"
                  />
                  <input
                    type="tel"
                    placeholder="Emergency Mobile Number"
                    value={onboardForm.emergencyPhone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, emergencyPhone: e.target.value })}
                    className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-1.5 text-xs font-mono text-ink dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full !py-2.5 text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  {submitting ? 'Registering Customer & Activating...' : `Complete Onboarding & Claim Commission (+₹${commissionRate})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 3: MARK ATTENDANCE OR LOG LEAVE
        ========================================================================
      */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 dark:bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#12141e] border border-slate-200 dark:border-[#1f2333] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAttendanceModal(false)}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-ink font-bold"
            >
              ✕
            </button>

            <div>
              <h3 className="font-display font-bold text-xl text-ink">Mark Attendance & Leave</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark your daily duty status (Present / Half Day) or log your chutti (Leave / Off)
              </p>
            </div>

            <form onSubmit={handleAttendanceSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={attForm.date}
                    onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Duty Status</label>
                  <select
                    value={attForm.status}
                    onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
                  >
                    <option value="PRESENT">🟢 Present on Duty</option>
                    <option value="HALF_DAY">🟡 Half Day (4 hrs)</option>
                    <option value="LEAVE">🔴 Leave</option>
                    <option value="WEEKLY_OFF">🔵 Sunday Off</option>
                  </select>
                </div>
              </div>

              {/* If Present or Half Day */}
              {(attForm.status === 'PRESENT' || attForm.status === 'HALF_DAY') && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Hours Worked</label>
                    <input
                      type="number"
                      value={attForm.hoursWorked}
                      onChange={(e) => setAttForm({ ...attForm, hoursWorked: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Summary</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Visited 5 dealerships in Pune Camp, onboarded 3 vehicles, placed QR stands."
                      value={attForm.workSummary}
                      onChange={(e) => setAttForm({ ...attForm, workSummary: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* If Leave / Chutti */}
              {attForm.status === 'LEAVE' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                    <select
                      value={attForm.leaveType}
                      onChange={(e) => setAttForm({ ...attForm, leaveType: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    >
                      <option value="CASUAL">Casual Leave</option>
                      <option value="SICK">Sick Leave</option>
                      <option value="FESTIVAL">Festival Holiday</option>
                      <option value="EMERGENCY">Emergency Personal Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Leave *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Family function in hometown / Doctor visit"
                      value={attForm.leaveReason}
                      onChange={(e) => setAttForm({ ...attForm, leaveReason: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full !py-2.5 text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  Save Attendance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 4: EDIT & UPDATE CUSTOMER DETAILS
        ========================================================================
      */}
      {editCustomerModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 dark:bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#12141e] border border-slate-200 dark:border-[#1f2333] rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditCustomerModal(null)}
              className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-ink font-bold"
            >
              ✕
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase mb-1">
                <Edit className="size-3.5" />
                <span>Update Customer Profile</span>
              </div>
              <h3 className="font-display font-bold text-xl text-ink">
                Edit Customer Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update customer contact info, vehicle specs, and status. QR tag remains bound.
              </p>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editCustomerForm.name}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={editCustomerForm.phone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="customer@gmail.com"
                    value={editCustomerForm.email}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={editCustomerForm.status}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] space-y-3">
                <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block">
                  Vehicle Specifications
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Plate Number</label>
                    <input
                      type="text"
                      value={editCustomerForm.vehicleNumber}
                      onChange={(e) => setEditCustomerForm({ ...editCustomerForm, vehicleNumber: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono font-bold uppercase text-ink dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Type</label>
                    <select
                      value={editCustomerForm.vehicleType}
                      onChange={(e) => setEditCustomerForm({ ...editCustomerForm, vehicleType: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    >
                      <option value="Car">Car</option>
                      <option value="Two-Wheeler">Two-Wheeler</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Model / Make</label>
                    <input
                      type="text"
                      value={editCustomerForm.vehicleModel}
                      onChange={(e) => setEditCustomerForm({ ...editCustomerForm, vehicleModel: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Color</label>
                    <input
                      type="text"
                      value={editCustomerForm.vehicleColor}
                      onChange={(e) => setEditCustomerForm({ ...editCustomerForm, vehicleColor: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Address</label>
                <input
                  type="text"
                  placeholder="Street / Colony / Landmark"
                  value={editCustomerForm.fullAddress}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, fullAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full !py-2.5 text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  {submitting ? 'Saving Changes...' : 'Save & Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
