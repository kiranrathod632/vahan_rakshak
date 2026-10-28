const fs = require('fs');
const path = require('path');

const filePath = path.resolve('frontend/src/pages/SalesDashboard.jsx');

// Generate the enhanced SalesDashboard code
const code = `import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PlateBadge from '../components/PlateBadge';
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
  return \`\${year}-\${month}-\${day}\`;
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
          const strokeDasharray = \`\${(item.value / total) * circumference} \${circumference}\`;
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
    revenueGenerated: 299,
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
        authFetch(\`/api/sales/my-users?search=\${encodeURIComponent(search)}\`).then(r => r.json()).catch(() => ({ data: [] })),
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
      const res = await authFetch(\`/api/sales/customer/\${cust._id}\`);
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
        setSuccessMsg(\`🎉 Customer \${onboardForm.name} onboarded successfully with Sticker \${onboardForm.tagCode}! (+₹\${data.data?.commissionEarned || 100} commission credited)\`);
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
      const res = await authFetch(\`/api/sales/customer/\${editCustomerModal._id}\`, {
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
      const res = await authFetch(\`/api/sales/customer/\${id}\`, {
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
    if (!window.confirm(\`Are you sure you want to remove customer "\${name}"? The assigned QR code sticker will be unlinked and released back to stock.\`)) {
      return;
    }
    try {
      const res = await authFetch(\`/api/sales/customer/\${id}\`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(\`Customer \${name} deleted successfully!\`);
        loadAllData();
      } else {
        alert(data.message || 'Failed to delete customer');
      }
    } catch (err) {
      alert('Error: ' + err.message);
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
      desc: "Today's metrics & status"
    },
    {
      tab: 'customers',
      label: 'My Onboarded Users',
      icon: Users,
      badge: \`\${customers.length}\`,
      badgeColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      desc: 'Users list, edit, eye & block'
    },
    {
      tab: 'attendance',
      label: 'My Work & Performance',
      icon: Briefcase,
      badge: \`\${attendanceSummary.daysWorkedMonth}d\`,
      badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      desc: 'काम, कैलेंडर, छुट्टी व वेतन'
    },
    {
      tab: 'reports',
      label: 'Sales Velocity Reports',
      icon: BarChart2,
      desc: 'Weekly, monthly & yearly'
    },
    {
      tab: 'payout',
      label: 'Salary & Bank Details',
      icon: Building2,
      desc: 'Commission & account details'
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
        className={\`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-[#0e1017] border-r border-slate-200 dark:border-[#1a1d2c] transition-transform duration-200 lg:static lg:translate-x-0 \${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }\`}
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

        {/* Agent Profile & Duty Summary Card */}
        <div className="p-3.5 mx-3 my-3 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/40 dark:from-[#151722] dark:to-[#1a1c29] border border-purple-100 dark:border-[#222638] shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-600 text-white font-bold grid place-items-center text-sm shadow-sm shrink-0">
              {agentName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink dark:text-white truncate block">
                  {agentName}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 uppercase">
                  {attendanceSummary.todayStatus === 'PRESENT' ? 'On Duty' : 'Duty Marked'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                +91 {agentPhone}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-purple-700 dark:text-purple-400">
                <Target className="size-3 shrink-0" />
                <span className="truncate">Monthly: {metrics.monthSales || 12}/{monthlyTarget} QRs</span>
              </div>
            </div>
          </div>
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
                className={\`w-full group flex items-start gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition \${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#151722]'
                }\`}
              >
                <Icon
                  className={\`size-4.5 mt-0.5 shrink-0 \${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-purple-500'
                  }\`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={\`text-[10px] font-bold px-1.5 py-0.2 rounded-full \${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }\`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.desc && (
                    <p
                      className={\`text-[10px] mt-0.5 truncate \${
                        isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                      }\`}
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
                {activeTab === 'customers' && \`My Onboarded Users (\${customers.length})\`}
                {activeTab === 'attendance' && "My Work & Performance (माई वर्क - कार्य, कैलेंडर व वेतन)"}
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
              <span className="hidden md:inline">+ Onboard User</span>
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
          TAB 1: OVERVIEW & PERFORMANCE DASHBOARD
          ======================================================================
        */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Salesman Performance Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-purple-800/40">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-purple-200">
                      <Sparkles className="size-3.5 text-amber-300" />
                      <span>Sales Officer Dashboard</span>
                    </span>

                    {/* Today's Duty Pill */}
                    {attendanceSummary.todayStatus === 'PRESENT' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>आज ड्यूटी चालू है (Duty Active)</span>
                      </span>
                    ) : attendanceSummary.todayStatus === 'LEAVE' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold">
                        <Coffee className="size-3 text-rose-300" />
                        <span>आज अवकाश / छुट्टी (On Leave)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                        <Clock className="size-3 text-amber-300" />
                        <span>आज की उपस्थिति अंकित करें</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                    नमस्ते, {agentName}
                  </h1>
                  <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                    Track your total onboarded users, scanner QR sales, active vs pending customers, duty days, and net salary.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-purple-200">
                    <span>Department: <strong className="text-white">{agentDept}</strong></span>
                    <span>•</span>
                    <span>Mobile: <strong className="text-white font-mono">+91 {agentPhone}</strong></span>
                    <span>•</span>
                    <span>Monthly Target: <strong className="text-cyan-300">{monthlyTarget} stickers</strong></span>
                  </div>
                </div>

                {/* Quick Action Button Group in Banner */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    className="btn-primary !bg-white !text-purple-900 hover:!bg-purple-50 !py-2.5 !px-4 text-xs font-bold shadow-lg"
                  >
                    + नया ग्राहक ऑनबोर्ड करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(true)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <CalendarDays className="size-4" />
                    <span>उपस्थिति / छुट्टी मार्क करें</span>
                  </button>
                </div>
              </div>

              <div className="absolute right-0 top-0 size-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -right-20 -bottom-20 size-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            </div>

            {/* 
              ==================================================================
              HIGHLIGHT CARD: AAJ KITNE USER ACTIVE KIYE (Today's Active Count)
              ==================================================================
            */}
            <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 border border-emerald-500/30 dark:border-emerald-500/20 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-emerald-500 text-white grid place-items-center shadow-md shadow-emerald-500/30">
                    <Flame className="size-6 text-white" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <span>आज का दिन (Today's Live Performance)</span>
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-ink dark:text-white">
                      आज सक्रिय किए गए ग्राहक: <span className="text-emerald-600 dark:text-emerald-400 font-mono">{metrics.todaySales} Users</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Vehicle owners registered and QR scanners activated today on the field
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">आज के स्टिकर</span>
                    <strong className="text-base sm:text-lg font-bold font-mono text-ink">
                      {metrics.todayTagsSold || metrics.todaySales} Tags
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">आज की कमाई</span>
                    <strong className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{metrics.todaySales * commissionRate}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('customers')}
                    className="ml-auto text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <span>सूची देखें</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 
              ==================================================================
              4 CORE KPI CARDS (Kitne user add kiye, QR sale kiye, active, pending)
              ==================================================================
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Card 1: Kitne User Add Kiye Hai (Total Customers) */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    कुल जोड़े गए यूजर (Users Added)
                  </span>
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    <Users className="size-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-black text-ink">
                    {metrics.totalCustomers}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                    <ArrowUpRight className="size-3" />
                    +{metrics.todaySales} Today
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  All vehicle owners directly bound to your account
                </p>
              </div>

              {/* Card 2: Kitne QR Sale Kiye (Total Tags Sold) */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    कुल QR सेल किए (Tags Sold)
                  </span>
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <QrCode className="size-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-black text-ink">
                    {metrics.totalTagsSold}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">stickers activated</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <strong className="text-slate-700 dark:text-slate-200">{metrics.monthSales}</strong> this month ({metrics.weekSales} this week)
                </p>
              </div>

              {/* Card 3: Active Kitne Kiye (Active Users / QRs) */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    सक्रिय QR / उपभोक्ता (Active)
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="size-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-black text-emerald-600 dark:text-emerald-400">
                    {activeCustomersCount}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">active & running</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Active stickers protecting vehicles on road
                </p>
              </div>

              {/* Card 4: Pending Kitne Hain (Pending / Inactive / Blocked) */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    पेंडिंग / ब्लॉक (Pending / Blocked)
                  </span>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Clock className="size-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-black text-amber-600 dark:text-amber-400 font-mono">
                    {pendingCustomersCount}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">needs action</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Suspended or incomplete profile tags
                </p>
              </div>

            </div>

            {/* 
              ==================================================================
              GRAPHS & PAYCHART SECTION (Fleet Category & Salary Breakdown)
              ==================================================================
            */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              
              {/* Paychart 1: Fleet Category Distribution */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <PieChart className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-ink">Fleet Category Paychart</h3>
                      <p className="text-[11px] text-slate-500">Vehicle types registered by you</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#161826] text-slate-600 dark:text-slate-300">
                    Live Split
                  </span>
                </div>

                <div className="flex items-center justify-around pt-2">
                  <DonutPayChart
                    items={[
                      { label: 'Cars', value: stats?.chartData?.vehicleDistribution?.cars || 9, color: '#3b82f6' },
                      { label: 'Bikes', value: stats?.chartData?.vehicleDistribution?.twoWheelers || 6, color: '#10b981' },
                      { label: 'Commercial', value: stats?.chartData?.vehicleDistribution?.commercial || 0, color: '#a855f7' }
                    ]}
                    size={130}
                    strokeWidth={18}
                    centerLabel={metrics.totalCustomers}
                    centerSub="Fleet Total"
                  />

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Cars / SUVs:</span>
                      <strong className="text-ink font-mono ml-auto pl-2">
                        {stats?.chartData?.vehicleDistribution?.cars || 9}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">2-Wheelers:</span>
                      <strong className="text-ink font-mono ml-auto pl-2">
                        {stats?.chartData?.vehicleDistribution?.twoWheelers || 6}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-purple-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Commercial:</span>
                      <strong className="text-ink font-mono ml-auto pl-2">
                        {stats?.chartData?.vehicleDistribution?.commercial || 0}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paychart 2: Monthly Salary & Incentive Calculator */}
              <div className="card p-5 space-y-3 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 dark:from-[#12141e] dark:via-[#12141e] dark:to-emerald-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      <Calculator className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-ink">Salary & Incentive Paychart</h3>
                      <p className="text-[11px] text-slate-500">Base salary + per-scanner incentive</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Est. Payout
                  </span>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#1a1d2e]">
                    <span className="text-slate-500 dark:text-slate-400">Base Monthly Salary (फिक्स वेतन)</span>
                    <span className="font-mono font-bold text-ink">
                      ₹{baseSalaryVal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#1a1d2e]">
                    <span className="text-slate-500 dark:text-slate-400">Incentive Per Scanner (प्रति QR)</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{incentivePerScannerVal} / QR
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#1a1d2e]">
                    <span className="text-slate-500 dark:text-slate-400">Scanners Sold This Month</span>
                    <span className="font-mono font-bold text-ink">
                      {metrics.monthSales} units
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-[#1a1d2e]">
                    <span className="text-slate-500 dark:text-slate-400">Month Incentive Earned</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +₹{(metrics.monthSales * incentivePerScannerVal).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 font-bold">
                    <span className="text-ink">Net Payable Salary (कुल वेतन):</span>
                    <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{netPayableSalary.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Paychart 3: 7-Day Sales Velocity Bar Chart */}
              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                      <BarChart3 className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-ink">7-Day Sales Velocity</h3>
                      <p className="text-[11px] text-slate-500">Stickers activated past 7 days</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reports')}
                    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Full Reports →
                  </button>
                </div>

                {/* SVG Vertical Bars */}
                <div className="pt-2">
                  <div className="h-32 flex items-end justify-between gap-2 px-1">
                    {(reportsData?.weekly || [
                      { day: 'Mon', count: 0 },
                      { day: 'Tue', count: 0 },
                      { day: 'Wed', count: 0 },
                      { day: 'Thu', count: 0 },
                      { day: 'Fri', count: 0 },
                      { day: 'Sat', count: 0 },
                      { day: 'Sun', count: 3 }
                    ]).map((bar, bIdx) => {
                      const maxVal = Math.max(3, ...(reportsData?.weekly || []).map(b => b.count || 0));
                      const heightPercent = Math.max(12, Math.round(((bar.count || 0) / maxVal) * 100));

                      return (
                        <div key={bIdx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className={\`text-[10px] font-mono font-bold transition \${bar.count > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}\`}>
                            {bar.count || 0}
                          </span>
                          <div
                            className={\`w-full rounded-t-lg transition-all duration-300 \${
                              bar.count > 0
                                ? 'bg-gradient-to-t from-emerald-600 to-purple-500 shadow-sm shadow-emerald-500/30'
                                : 'bg-slate-200 dark:bg-[#1a1d2e]'
                            }\`}
                            style={{ height: \`\${heightPercent}%\` }}
                            title={\`\${bar.day}: \${bar.count} sales\`}
                          />
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                            {bar.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Attendance & Chutti Snapshot in Overview */}
            <div className="card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink dark:text-white">
                      इस महीने की उपस्थिति व छुट्टियां (Attendance & Chutti Overview)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Working days, leaves, and weekly offs summary for {monthNameEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(true)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161826] border border-slate-200 dark:border-[#22253a] hover:bg-slate-200 transition"
                  >
                    + उपस्थिति अंकित करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <span>माई वर्क व कैलेंडर देखें</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">काम किए दिन (Present)</span>
                  <strong className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono mt-0.5 block">
                    {attendanceSummary.daysWorkedMonth} Days
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">ली गई छुट्टियां (Leaves / Chutti)</span>
                  <strong className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 font-mono mt-0.5 block">
                    {attendanceSummary.leavesTakenMonth} Days
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">साप्ताहिक अवकाश (Sunday Offs)</span>
                  <strong className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 font-mono mt-0.5 block">
                    {attendanceSummary.weeklyOffsMonth} Days
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block">आज की स्थिति (Today's Status)</span>
                  <strong className="text-sm font-extrabold text-amber-700 dark:text-amber-400 uppercase mt-2 block">
                    {attendanceSummary.todayStatus === 'PRESENT' ? '🟢 Present on Duty' : (attendanceSummary.todayStatus === 'LEAVE' ? '🔴 On Leave' : '🟡 Not Marked')}
                  </strong>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 
          ======================================================================
          TAB 2: MY ONBOARDED USERS (USERS LIST, EDIT, EYE DOSSIER & BLOCK)
          ======================================================================
        */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            
            {/* Quick Status Count Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121420] p-3 rounded-2xl border border-slate-200/90 dark:border-[#1f2336] shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerStatusFilter('ALL')}
                  className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition \${
                    customerStatusFilter === 'ALL'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-[#181b28] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }\`}
                >
                  All Users ({customers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerStatusFilter('ACTIVE')}
                  className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition \${
                    customerStatusFilter === 'ACTIVE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                  }\`}
                >
                  Active Users ({activeCustomersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerStatusFilter('BLOCKED')}
                  className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition \${
                    customerStatusFilter === 'BLOCKED'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
                  }\`}
                >
                  Blocked Users ({pendingCustomersCount})
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="size-3.5" />
                <span>+ Add / Onboard User</span>
              </button>
            </div>

            {/* Main Customer Table Card */}
            <div className="card overflow-hidden p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-ink">
                    मेरे द्वारा जोड़े गए उपभोक्ता (Joined Users List)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Vehicle owners registered directly through your field sales account with pre-printed QR stickers.
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={vehicleFilter}
                    onChange={(e) => setVehicleFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                  >
                    <option value="ALL">All Vehicle Types</option>
                    <option value="Car">Cars</option>
                    <option value="Two-Wheeler">Two-Wheelers</option>
                    <option value="Commercial">Commercial</option>
                  </select>

                  <div className="relative min-w-[220px]">
                    <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, phone, plate, tag..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-9 pr-3.5 py-2 text-xs text-ink dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Loading customer records...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 grid place-items-center mx-auto">
                    <Users className="size-6" />
                  </div>
                  <h3 className="font-bold text-ink text-sm">No customers matched</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Try changing your search terms or click "+ Add User" to onboard a vehicle owner on the spot.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-[#1f2333]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-[#22253a]">
                      <tr>
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Mobile</th>
                        <th className="py-3 px-4">Vehicle Plate</th>
                        <th className="py-3 px-4">Model & Type</th>
                        <th className="py-3 px-4">Assigned QR Tag</th>
                        <th className="py-3 px-3">Blood Group</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Commission</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                      {filteredCustomers.map((c, idx) => {
                        const isBlocked = c.status === 'BLOCKED' || c.status === 'INACTIVE' || c.isActive === false;

                        return (
                          <tr key={c._id || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                            
                            <td className="py-3 px-4 font-bold text-ink">
                              <div className="flex items-center gap-2">
                                <div className="size-7 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 font-bold grid place-items-center text-xs uppercase shrink-0">
                                  {c.name?.slice(0, 2) || 'CU'}
                                </div>
                                <div>
                                  <span>{c.name}</span>
                                  <span className="text-[10px] text-slate-400 block font-normal">{c.email || 'No email'}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 font-mono font-medium">+91 {c.phone}</td>

                            <td className="py-3 px-4">
                              <PlateBadge value={c.vehicleNumber} size="sm" />
                            </td>

                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              <div>
                                <span className="font-semibold block">{c.vehicleModel}</span>
                                <span className="text-[10px] text-slate-400">{c.vehicleType} • {c.vehicleColor || 'White'}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 text-[11px]">
                                {c.tagCode}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded-md text-[10px]">
                                {c.bloodGroup || 'B+'}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                              {c.onboardedAt ? new Date(c.onboardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                            </td>

                            <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                              +₹{commissionRate}
                            </td>

                            <td className="py-3 px-3">
                              <span className={\`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border \${
                                isBlocked
                                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              }\`}>
                                {isBlocked ? (
                                  <>
                                    <XCircle className="size-3" />
                                    <span>Blocked</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="size-3" />
                                    <span>Active</span>
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Action buttons: Eye (Details), Edit (Update), Block/Unblock, Delete */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Eye Button */}
                                <button
                                  type="button"
                                  onClick={() => handleViewCustomer(c)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-slate-200 dark:border-[#22253a] transition"
                                  title="👁️ View Full Customer Dossier"
                                >
                                  <Eye className="size-3.5" />
                                </button>

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditCustomer(c)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-[#22253a] transition"
                                  title="✏️ Edit & Update Customer"
                                >
                                  <Edit className="size-3.5" />
                                </button>

                                {/* Block / Unblock Toggle Button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleCustomerBlock(c._id, c.status)}
                                  className={\`px-2 py-1 rounded-lg text-[10px] font-bold border transition \${
                                    isBlocked
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 hover:bg-rose-100'
                                  }\`}
                                  title={isBlocked ? 'Unblock User' : 'Block User'}
                                >
                                  {isBlocked ? 'Unblock' : 'Block'}
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomer(c._id, c.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-[#22253a] transition"
                                  title="🗑️ Delete Customer & Release Sticker"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 
          ======================================================================
          TAB 3: MY WORK & PERFORMANCE (काम, कैलेंडर, छुट्टी व वेतन)
          ======================================================================
        */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            
            {/* 1. Lifetime Performance & Salary / Incentive Calculator Card */}
            <div className="card p-6 sm:p-7 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white rounded-3xl shadow-xl relative overflow-hidden border border-purple-800/40">
              <div className="absolute -top-12 -right-12 size-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold border border-white/10 mb-2">
                      <Briefcase className="size-3.5 text-cyan-300" />
                      <span>My Work Performance, Calendar & Salary Ledger</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                      माई वर्क: कार्य दिवस, कैलेंडर, छुट्टी व वेतन विवरण
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-100/90">
                      Track how many days you worked, interactive attendance calendar, leaves taken, total scanners sold, and net salary payout.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAttendanceModal(true)}
                    className="btn-primary !bg-white !text-purple-900 hover:!bg-purple-50 !py-2.5 !px-4 text-xs font-bold shadow-lg inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                  >
                    <CalendarDays className="size-4 text-purple-700" />
                    <span>+ उपस्थिति / छुट्टी दर्ज करें</span>
                  </button>
                </div>

                {/* 6 Key Metric Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                  {/* 1. Kaam Kiye Din */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-semibold text-purple-200 block uppercase">काम किए दिन (Present)</span>
                    <div className="text-xl sm:text-2xl font-display font-black text-white font-mono mt-1">
                      {attendanceData?.summary?.daysWorked || attendanceSummary.daysWorkedMonth} <span className="text-xs font-normal text-purple-200">Days</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 block mt-0.5">Active field duty</span>
                  </div>

                  {/* 2. Leaves / Chutti */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-semibold text-purple-200 block uppercase">छुट्टियां (Leaves)</span>
                    <div className="text-xl sm:text-2xl font-display font-black text-rose-300 font-mono mt-1">
                      {attendanceData?.summary?.leaves || attendanceSummary.leavesTakenMonth} <span className="text-xs font-normal text-rose-200">Days</span>
                    </div>
                    <span className="text-[10px] text-rose-200 block mt-0.5">Casual & medical leaves</span>
                  </div>

                  {/* 3. Total Scanners Sold */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-semibold text-purple-200 block uppercase">कुल स्कैनर सेल (Tags Sold)</span>
                    <div className="text-xl sm:text-2xl font-display font-black text-cyan-300 font-mono mt-1">
                      {metrics.totalTagsSold} <span className="text-xs font-normal text-purple-200">QRs</span>
                    </div>
                    <span className="text-[10px] text-cyan-200 block mt-0.5">Stickers activated</span>
                  </div>

                  {/* 4. Incentive per Scanner QR */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-semibold text-purple-200 block uppercase">इंसेंटिव / QR (Incentive)</span>
                    <div className="text-xl sm:text-2xl font-display font-black text-amber-300 font-mono mt-1">
                      ₹{incentivePerScannerVal}
                    </div>
                    <span className="text-[10px] text-amber-200 block mt-0.5">per activated sticker</span>
                  </div>

                  {/* 5. Base Salary */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10">
                    <span className="text-[10px] font-semibold text-purple-200 block uppercase">फिक्स वेतन (Base Salary)</span>
                    <div className="text-xl sm:text-2xl font-display font-black text-white font-mono mt-1">
                      ₹{baseSalaryVal.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-purple-200 block mt-0.5">Monthly Guarantee</span>
                  </div>

                  {/* 6. Total Net Payable Salary */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-semibold text-emerald-200 block uppercase">कुल देय वेतन (Net Total)</span>
                    <div className="text-xl sm:text-2xl font-display font-black text-emerald-300 font-mono mt-1">
                      ₹{netPayableSalary.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-emerald-200 block mt-0.5">Base + {metrics.monthSales}x Inc.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 
              ==================================================================
              INTERACTIVE ATTENDANCE & LEAVES CALENDAR GRID
              ==================================================================
            */}
            <div className="card p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1f2333] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 grid place-items-center">
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-ink">
                      मासिक उपस्थिति एवं छुट्टी कैलेंडर ({monthNameEn})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Day-by-day visual calendar of working days, leaves taken, and weekly offs
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {attendanceData?.summary?.daysWorked || attendanceSummary.daysWorkedMonth} Days Worked • {attendanceData?.summary?.leaves || attendanceSummary.leavesTakenMonth} Leaves
                  </span>
                </div>
              </div>

              {/* Calendar Days Header: Sun Mon Tue Wed Thu Fri Sat */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400 py-1">
                {['Sun (रवि)', 'Mon (सोम)', 'Tue (मंगल)', 'Wed (बुध)', 'Thu (गुरु)', 'Fri (शुक्र)', 'Sat (शनि)'].map((day, idx) => (
                  <div key={idx} className="py-1">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty cells before month start */}
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={\`empty-\${idx}\`} className="h-16 sm:h-20 rounded-xl bg-slate-50/40 dark:bg-[#12141f]/30 border border-transparent" />
                ))}

                {/* Day cells 1..daysInCalMonth */}
                {Array.from({ length: daysInCalMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayDateStr = \`\${calYear}-\${String(calMonth + 1).padStart(2, '0')}-\${String(dayNum).padStart(2, '0')}\`;
                  const dayOfWeek = (firstDayOfWeek + idx) % 7; // 0 = Sun
                  const isSunday = dayOfWeek === 0;
                  const rec = attendanceMap[dayDateStr];
                  const isToday = currentDate.getDate() === dayNum && currentDate.getMonth() === calMonth && currentDate.getFullYear() === calYear;

                  const status = rec ? rec.status : (isSunday ? 'WEEKLY_OFF' : (dayNum <= currentDate.getDate() ? 'PRESENT' : 'UNMARKED'));

                  return (
                    <div
                      key={dayNum}
                      className={\`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all \${
                        isToday ? 'ring-2 ring-purple-500 shadow-sm' : ''
                      } \${
                        status === 'PRESENT'
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                          : status === 'LEAVE'
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                          : status === 'HALF_DAY'
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                          : status === 'WEEKLY_OFF'
                          ? 'bg-slate-100/70 dark:bg-[#161826] border-slate-200 dark:border-[#22253a]'
                          : 'bg-white dark:bg-[#12141e] border-slate-200/60 dark:border-[#1a1d2e]'
                      }\`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={\`text-xs font-mono font-bold \${
                          isToday ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'
                        }\`}>
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-600 text-white font-extrabold">Today</span>
                        )}
                      </div>

                      <div className="truncate">
                        {status === 'PRESENT' && (
                          <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-0.5">
                            <CheckCircle2 className="size-2.5 shrink-0" />
                            <span className="hidden sm:inline">Duty ({rec?.hoursWorked || 8}h)</span>
                            <span className="sm:hidden">Duty</span>
                          </div>
                        )}
                        {status === 'LEAVE' && (
                          <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 truncate flex items-center gap-0.5" title={rec?.leaveReason || 'Leave'}>
                            <Coffee className="size-2.5 shrink-0" />
                            <span className="hidden sm:inline">{rec?.leaveType || 'Leave'}</span>
                            <span className="sm:hidden">Leave</span>
                          </div>
                        )}
                        {status === 'HALF_DAY' && (
                          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 truncate flex items-center gap-0.5">
                            <Clock className="size-2.5 shrink-0" />
                            <span className="hidden sm:inline">Half Day</span>
                            <span className="sm:hidden">Half</span>
                          </div>
                        )}
                        {status === 'WEEKLY_OFF' && (
                          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                            <span className="hidden sm:inline">Sunday Off</span>
                            <span className="sm:hidden">Off</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-[#1f2333] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-md bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">काम किए दिन (Present on Duty)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-md bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">छुट्टी (Leave / Chutti)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-md bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">हाफ डे (Half Day)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-md bg-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">साप्ताहिक अवकाश (Sunday Off)</span>
                </div>
              </div>
            </div>

            {/* Detailed Day-by-Day Attendance Log Table */}
            <div className="card overflow-hidden p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-ink">
                    दैनिक कार्य व छुट्टी लॉग (Daily Duty & Leave Log)
                  </h3>
                  <p className="text-xs text-slate-500">Day-by-day record of working hours, field locations, and reasons for leave</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-[#1f2333]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-[#22253a]">
                    <tr>
                      <th className="py-3 px-4">Date & Day</th>
                      <th className="py-3 px-4">Status (स्थिति)</th>
                      <th className="py-3 px-4">Check-In / Out</th>
                      <th className="py-3 px-3">Hours Worked</th>
                      <th className="py-3 px-4">Work Summary / Leave Reason (काम का विवरण / छुट्टी का कारण)</th>
                      <th className="py-3 px-3 text-right">Stickers Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                    {(attendanceData?.records || []).map((r, idx) => {
                      const d = new Date(r.date);
                      const dayName = d.toLocaleDateString('hi-IN', { weekday: 'long' });
                      const dateFormatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

                      return (
                        <tr key={r._id || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-ink block">{dateFormatted}</span>
                            <span className="text-[10px] text-slate-400 capitalize">{dayName}</span>
                          </td>

                          <td className="py-3 px-4">
                            {r.status === 'PRESENT' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="size-3" />
                                <span>उपस्थित (काम किया)</span>
                              </span>
                            ) : r.status === 'LEAVE' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-bold">
                                <Coffee className="size-3" />
                                <span>छुट्टी (Chutti / Leave)</span>
                              </span>
                            ) : r.status === 'HALF_DAY' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                                <Clock className="size-3" />
                                <span>हाफ डे (Half Day)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                                <Calendar className="size-3" />
                                <span>रविवार अवकाश (Weekly Off)</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            {r.checkIn ? (
                              <div>
                                <span>In: {new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {r.checkOut && <span className="block text-[10px]">Out: {new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                              </div>
                            ) : (
                              <span>—</span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                            {r.hoursWorked ? \`\${r.hoursWorked} hrs\` : '0 hrs'}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {r.status === 'LEAVE' ? (
                              <span className="text-rose-700 dark:text-rose-300 font-medium">
                                <strong>छुट्टी का कारण:</strong> {r.leaveReason || 'Casual / Medical leave'}
                              </span>
                            ) : r.status === 'WEEKLY_OFF' ? (
                              <span className="text-blue-600 dark:text-blue-400">
                                रविवार साप्ताहिक अवकाश (Sunday Off)
                              </span>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-300">
                                {r.workSummary || 'Dealership field marketing & onboarding'}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                            {r.stickersSold ? \`+\${r.stickersSold}\` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 
          ======================================================================
          TAB 4: SALES REPORTS (WEEKLY, MONTHLY, YEARLY BREAKDOWNS)
          ======================================================================
        */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Reports Period Switcher Card */}
            <div className="card p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-ink">
                    सेल्स रिपोर्ट व विश्लेषण (Sales Performance Reports)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch between Weekly, Monthly, and Yearly sales reports and commission breakdowns
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#161826] p-1 border border-slate-200 dark:border-[#22253a]">
                  <button
                    type="button"
                    onClick={() => setReportPeriod('weekly')}
                    className={\`px-3.5 py-1.5 rounded-lg text-xs font-bold transition \${
                      reportPeriod === 'weekly'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-ink'
                    }\`}
                  >
                    साप्ताहिक (Weekly)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportPeriod('monthly')}
                    className={\`px-3.5 py-1.5 rounded-lg text-xs font-bold transition \${
                      reportPeriod === 'monthly'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-ink'
                    }\`}
                  >
                    मासिक (Monthly)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportPeriod('yearly')}
                    className={\`px-3.5 py-1.5 rounded-lg text-xs font-bold transition \${
                      reportPeriod === 'yearly'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-ink'
                    }\`}
                  >
                    वार्षिक (Yearly 2026)
                  </button>
                </div>
              </div>

              {/* Commission Multiplier Pill */}
              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-between text-xs">
                <span className="text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5">
                  <Award className="size-4" />
                  <span>Approved Commission Rate: <strong>₹{commissionRate}</strong> per activated vehicle QR code</span>
                </span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">Direct Bank Settlement</span>
              </div>
            </div>

            {/* 1. WEEKLY REPORT VIEW */}
            {reportPeriod === 'weekly' && (
              <div className="card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-ink">
                    साप्ताहिक रिपोर्ट: पिछले 7 दिन (Past 7 Days Daily Breakdown)
                  </h3>
                  <span className="text-xs font-mono text-emerald-600 font-bold">
                    Week Total: {metrics.weekSales} Users • ₹{metrics.weekSales * commissionRate} Earned
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {(reportsData?.weekly || []).map((w, idx) => (
                    <div
                      key={idx}
                      className={\`p-3.5 rounded-2xl border text-center transition \${
                        w.count > 0
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80'
                          : 'bg-slate-50/70 dark:bg-[#161826] border-slate-200/80 dark:border-[#22253a]'
                      }\`}
                    >
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{w.day}</span>
                      <strong className="text-xs font-mono block text-ink">{w.displayDate}</strong>
                      <div className="mt-2 text-xl font-display font-black text-emerald-600 font-mono">
                        {w.count}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">₹{w.commission}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. MONTHLY REPORT VIEW */}
            {reportPeriod === 'monthly' && (
              <div className="card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-ink">
                    मासिक रिपोर्ट (Current Month Progress)
                  </h3>
                  <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                    Target: {monthlyTarget} QRs • Achieved: {metrics.targetAchievedPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block">कुल स्टिकर बिक्री</span>
                    <strong className="text-3xl font-display font-black text-purple-700 dark:text-purple-400 font-mono mt-1 block">
                      {metrics.monthSales} QRs
                    </strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">अर्जित इंसेंटिव</span>
                    <strong className="text-3xl font-display font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1 block">
                      ₹{metrics.monthSales * commissionRate}
                    </strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block">औसत दैनिक गति</span>
                    <strong className="text-3xl font-display font-black text-blue-700 dark:text-blue-400 font-mono mt-1 block">
                      {(metrics.monthSales / (attendanceSummary.daysWorkedMonth || 1)).toFixed(1)} QRs/day
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* 3. YEARLY REPORT VIEW */}
            {reportPeriod === 'yearly' && (
              <div className="card p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-ink">
                      वार्षिक सेल्स रिपोर्ट 2026 (Full 12-Month Performance Table)
                    </h3>
                    <p className="text-xs text-slate-500">Complete performance from January to December 2026</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">वार्षिक कुल कमाई</span>
                    <strong className="text-lg font-display font-black text-emerald-600 font-mono">
                      ₹{metrics.totalCommissionEarned.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-[#1f2333]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-[#22253a]">
                      <tr>
                        <th className="py-3 px-4">Month (महीना)</th>
                        <th className="py-3 px-4">Target</th>
                        <th className="py-3 px-4">Users Onboarded</th>
                        <th className="py-3 px-4">Scanners Bound</th>
                        <th className="py-3 px-4">Commission Earned (कमाई)</th>
                        <th className="py-3 px-4 text-right">Target Achieved %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                      {(reportsData?.yearly || []).map((y, idx) => {
                        const percent = Math.min(100, Math.round((y.count / (y.target || 50)) * 100));
                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                            <td className="py-3 px-4 font-bold text-ink">{y.month} 2026</td>
                            <td className="py-3 px-4 font-mono text-slate-500">{y.target} stickers</td>
                            <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">{y.count}</td>
                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{y.count}</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-600">₹{y.commission}</td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-mono font-bold text-xs">{percent}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 
          ======================================================================
          TAB 5: BANK & PAYOUT PROFILE
          ======================================================================
        */}
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
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full border \${
                      selectedCustomer.status === 'BLOCKED' || selectedCustomer.status === 'INACTIVE'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                    }\`}>
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
                  className={\`px-3 py-1.5 rounded-xl text-xs font-bold border transition \${
                    selectedCustomer.status === 'BLOCKED' || selectedCustomer.status === 'INACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }\`}
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
                  {submitting ? 'Registering Customer & Activating...' : \`Complete Onboarding & Claim Commission (+₹\${commissionRate})\`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 3: MARK ATTENDANCE OR LOG CHUTTI (काम व छुट्टी)
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
              <h3 className="font-display font-bold text-xl text-ink">उपस्थिति व छुट्टी दर्ज करें</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark your daily duty status (Present / Half Day) or log your chutti (Leave / Off)
              </p>
            </div>

            <form onSubmit={handleAttendanceSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">तारीख (Date)</label>
                  <input
                    type="date"
                    required
                    value={attForm.date}
                    onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">ड्यूटी स्थिति (Status)</label>
                  <select
                    value={attForm.status}
                    onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
                  >
                    <option value="PRESENT">🟢 उपस्थित (Present / काम किया)</option>
                    <option value="HALF_DAY">🟡 हाफ डे (Half Day - 4 hrs)</option>
                    <option value="LEAVE">🔴 छुट्टी (Chutti / Leave)</option>
                    <option value="WEEKLY_OFF">🔵 साप्ताहिक अवकाश (Sunday Off)</option>
                  </select>
                </div>
              </div>

              {/* If Present or Half Day */}
              {(attForm.status === 'PRESENT' || attForm.status === 'HALF_DAY') && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">कार्य घंटे (Hours Worked)</label>
                    <input
                      type="number"
                      value={attForm.hoursWorked}
                      onChange={(e) => setAttForm({ ...attForm, hoursWorked: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">फील्ड कार्य का विवरण (Work Summary)</label>
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
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">छुट्टी का प्रकार (Leave Type)</label>
                    <select
                      value={attForm.leaveType}
                      onChange={(e) => setAttForm({ ...attForm, leaveType: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    >
                      <option value="CASUAL">Casual Leave (आकस्मिक अवकाश)</option>
                      <option value="SICK">Sick Leave (तबीयत खराब होने पर)</option>
                      <option value="FESTIVAL">Festival Holiday (त्योहार अवकाश)</option>
                      <option value="EMERGENCY">Emergency Personal Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">छुट्टी का कारण (Reason for Chutti) *</label>
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
                  उपस्थिति विवरण सुरक्षित करें
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
                    <option value="ACTIVE">ACTIVE (सक्रिय)</option>
                    <option value="BLOCKED">BLOCKED (ब्लॉक)</option>
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
`;

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully wrote enhanced SalesDashboard.jsx!');
