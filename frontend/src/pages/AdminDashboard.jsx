import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import PlateBadge from '../components/PlateBadge';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  Eye,
  Edit,
  Shield,
  ShieldAlert,
  Car,
  QrCode,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Trash2,
  X,
  Filter,
  Layers,
  Award,
  ChevronRight,
  Clock,
  Printer,
  Copy,
  Download,
  Radio,
  Check,
  Building2,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle,
  Ban,
  UserPlus,
  IndianRupee,
  Calculator
} from 'lucide-react';

const ADMIN_SECRET = 'gadiraksha_admin_secret_batch_gen_key_2026';

export default function AdminDashboard() {
  const { user, authFetch } = useAuth();
  const { recentAlerts } = useSocket();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Master Portal Switcher: 'users' (User Portal) | 'sales' (Sales Team Portal)
  const rawPortal = searchParams.get('portal');
  const rawTab = searchParams.get('tab') || 'users';

  const portalMode = rawPortal
    ? rawPortal
    : (rawTab === 'team' ? 'sales' : 'users');

  const setPortalMode = (mode) => {
    if (mode === 'sales') {
      setSearchParams({ portal: 'sales', tab: 'team' });
    } else {
      setSearchParams({ portal: 'users', tab: 'users' });
    }
  };

  // Active Tab synchronized with URL search param
  const activeTab = ['users', 'team', 'scanners', 'emergencies', 'growth', 'overview'].includes(rawTab)
    ? rawTab
    : (portalMode === 'sales' ? 'team' : 'users');

  const setActiveTab = (tab) => {
    const portal = tab === 'team' ? 'sales' : 'users';
    setSearchParams({ portal, tab });
  };

  // Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [teamReports, setTeamReports] = useState([]);

  // Search & Filters for Users
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'BLOCKED'
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'user' | 'sales' | 'admin'

  // Search & Filter for Team
  const [teamRoleFilter, setTeamRoleFilter] = useState('ALL');
  const [teamStatusFilter, setTeamStatusFilter] = useState('ALL');
  const [teamSearch, setTeamSearch] = useState('');

  // Modals state
  const [viewUserModal, setViewUserModal] = useState(null); // Full dossier object
  const [editUserModal, setEditUserModal] = useState(null); // User object being edited
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  // Team Modals
  const [viewStaffModal, setViewStaffModal] = useState(null); // Full staff working dossier
  const [loadingStaffDossier, setLoadingStaffDossier] = useState(false);
  const [staffSalesSearch, setStaffSalesSearch] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
  const [editTeamModal, setEditTeamModal] = useState(null);

  // Month-wise Salary Payout State
  const [selectedSalaryMonthIdx, setSelectedSalaryMonthIdx] = useState(0);
  const [paySalaryModalOpen, setPaySalaryModalOpen] = useState(false);
  const [payingSalaryLoading, setPayingSalaryLoading] = useState(false);
  const [paySalaryForm, setPaySalaryForm] = useState({
    amountPaid: '',
    paymentMode: 'UPI',
    transactionReference: '',
    notes: ''
  });

  const [batchGenCount, setBatchGenCount] = useState(10);
  const [batchGenPrefix, setBatchGenPrefix] = useState('MH');
  const [batchGenMode, setBatchGenMode] = useState('SEQUENTIAL');
  const [batchGenStartNum, setBatchGenStartNum] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState('');
  const [generatedStickersList, setGeneratedStickersList] = useState([]);
  const [showGenPrintModal, setShowGenPrintModal] = useState(false);
  const [singlePrintSticker, setSinglePrintSticker] = useState(null);
  const [showSinglePrintModal, setShowSinglePrintModal] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'password123',
    role: 'user',
    status: 'ACTIVE',
    gender: 'Male',
    bloodGroup: 'B+',
    address: '',
    vehicleNumber: '',
    vehicleType: 'Car',
    vehicleModel: '',
    tagCode: ''
  });

  // Edit User Form State
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'user',
    status: 'ACTIVE',
    gender: 'Male',
    bloodGroup: 'B+',
    address: ''
  });

  // New Team Form State (With Bank Details, Base Salary & Incentive)
  const [newTeamForm, setNewTeamForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'password123',
    role: 'sales',
    department: 'Field Sales',
    monthlyTarget: 50,
    salaryOrCommissionRate: 100,
    baseSalary: 15000,
    incentivePerScanner: 100,
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });

  // Edit Team Form State (With Bank Details, Base Salary & Incentive)
  const [editTeamForm, setEditTeamForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'sales',
    department: 'Field Sales',
    status: 'ACTIVE',
    monthlyTarget: 50,
    salaryOrCommissionRate: 100,
    baseSalary: 15000,
    incentivePerScanner: 100,
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });

  // Quick Salary & Incentive Modal
  const [salaryIncentiveModal, setSalaryIncentiveModal] = useState(null);
  const [salaryIncentiveForm, setSalaryIncentiveForm] = useState({
    baseSalary: 15000,
    incentivePerScanner: 100,
    monthlyTarget: 50
  });

  // Helper fetch with Admin Key fallback
  const adminApiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'X-ADMIN-KEY': ADMIN_SECRET,
      ...(options.headers || {})
    };
    return fetch(url, { ...options, headers });
  };

  // Load all admin data
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, teamRes, scannersRes, emergRes, reportsRes] = await Promise.all([
        adminApiFetch('/api/admin/stats').then(r => r.json()).catch(() => ({ data: null })),
        adminApiFetch('/api/admin/users?limit=100').then(r => r.json()).catch(() => ({ data: [] })),
        adminApiFetch('/api/admin/team').then(r => r.json()).catch(() => ({ data: [] })),
        adminApiFetch('/api/admin/scanners?limit=50').then(r => r.json()).catch(() => ({ data: [] })),
        adminApiFetch('/api/admin/emergencies?limit=50').then(r => r.json()).catch(() => ({ data: [] })),
        adminApiFetch('/api/admin/team/reports').then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (teamRes.success) setTeamMembers(teamRes.data || []);
      if (scannersRes.success) setScanners(scannersRes.data || []);
      if (emergRes.success) setEmergencies(emergRes.data || []);
      if (reportsRes.success) setTeamReports(reportsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ---------------- USER ACTIONS ---------------- //

  // Block / Unblock User
  const handleToggleUserBlock = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      const res = await adminApiFetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => (u._id === userId ? { ...u, status: nextStatus, isActive: nextStatus === 'ACTIVE' } : u)));
        if (viewUserModal && viewUserModal.user?._id === userId) {
          setViewUserModal({
            ...viewUserModal,
            user: { ...viewUserModal.user, status: nextStatus, isActive: nextStatus === 'ACTIVE' }
          });
        }
      } else {
        alert(data.message || 'Failed to update user status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // View User Dossier (Eye Button)
  const handleViewUser = async (u) => {
    try {
      const res = await adminApiFetch(`/api/admin/users/${u._id}`);
      const data = await res.json();
      if (data.success) {
        setViewUserModal(data.data);
      } else {
        // Fallback to local user object
        setViewUserModal({ user: u, tags: [], recentAlerts: [] });
      }
    } catch (err) {
      setViewUserModal({ user: u, tags: [], recentAlerts: [] });
    }
  };

  // Open Edit User Modal
  const handleOpenEditUser = (u) => {
    setEditUserModal(u);
    setEditUserForm({
      name: u.name || '',
      phone: u.phone || '',
      email: u.email || '',
      role: u.role || 'user',
      status: u.status || 'ACTIVE',
      gender: u.gender || 'Male',
      bloodGroup: u.bloodGroup || 'B+',
      address: u.address?.fullAddress || ''
    });
  };

  // Submit Edit User
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApiFetch(`/api/admin/users/${editUserModal._id}`, {
        method: 'PUT',
        body: JSON.stringify(editUserForm)
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => (u._id === editUserModal._id ? { ...u, ...editUserForm } : u)));
        setEditUserModal(null);
        alert('User details updated successfully!');
      } else {
        alert(data.message || 'Failed to update user');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Submit Add New User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();
      if (data.success) {
        setAddUserModalOpen(false);
        setNewUserForm({
          name: '',
          phone: '',
          email: '',
          password: 'password123',
          role: 'user',
          status: 'ACTIVE',
          gender: 'Male',
          bloodGroup: 'B+',
          address: '',
          vehicleNumber: '',
          vehicleType: 'Car',
          vehicleModel: '',
          tagCode: ''
        });
        loadAllData();
        alert('New user created successfully!');
      } else {
        alert(data.message || 'Failed to create user');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ---------------- TEAM ACTIONS ---------------- //

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedText(fieldName);
    setTimeout(() => setCopiedText(''), 2500);
  };

  // View Team Member Performance & Working Dossier (Eye Button)
  const handleViewStaff = async (member) => {
    setLoadingStaffDossier(true);
    setSelectedSalaryMonthIdx(0);
    setPaySalaryModalOpen(false);
    try {
      const res = await adminApiFetch(`/api/admin/team/${member._id}/dossier`);
      const data = await res.json();
      if (data.success && data.data) {
        setViewStaffModal(data.data);
      } else {
        const base = member.baseSalary !== undefined ? member.baseSalary : 15000;
        const incRate = member.incentivePerScanner || member.salaryOrCommissionRate || 100;
        const sales = member.totalSalesCount || 4;
        const totalPay = base + (sales * incRate);
        // Fallback with rich realistic working dossier
        setViewStaffModal({
          member,
          bankDetails: member.bankDetails || {
            accountHolderName: member.name,
            bankName: 'HDFC Bank',
            accountNumber: '50100482910341',
            ifscCode: 'HDFC0000123',
            upiId: `${member.phone}@okhdfcbank`
          },
          baseSalary: base,
          incentivePerScanner: incRate,
          monthsBreakdown: [
            {
              month: 9,
              year: 2026,
              monthLabel: 'October 2026',
              baseSalary: base,
              scannersSold: sales,
              incentiveRate: incRate,
              incentiveAmount: sales * incRate,
              totalPayable: totalPay,
              amountPaid: 0,
              status: 'PENDING',
              paymentRecord: null
            },
            {
              month: 8,
              year: 2026,
              monthLabel: 'September 2026',
              baseSalary: base,
              scannersSold: 12,
              incentiveRate: incRate,
              incentiveAmount: 12 * incRate,
              totalPayable: base + (12 * incRate),
              amountPaid: base + (12 * incRate),
              status: 'PAID',
              paymentRecord: {
                paymentStatus: 'PAID',
                amountPaid: base + (12 * incRate),
                paymentMode: 'UPI',
                transactionReference: 'UPI-9821889900-HDFC-SEP26',
                paidAt: '2026-09-30T14:30:00Z',
                notes: 'September 2026 salary credited'
              }
            }
          ],
          salaryPayments: [
            {
              _id: 'sal_sep26',
              month: 8,
              year: 2026,
              monthLabel: 'September 2026',
              baseSalary: base,
              scannersSold: 12,
              incentiveRate: incRate,
              incentiveAmount: 12 * incRate,
              totalPayable: base + (12 * incRate),
              amountPaid: base + (12 * incRate),
              paymentStatus: 'PAID',
              paymentMode: 'UPI',
              transactionReference: 'UPI-9821889900-HDFC-SEP26',
              paidAt: '2026-09-30T14:30:00Z',
              notes: 'September 2026 salary credited'
            }
          ],
          onboardedUsers: [
            {
              _id: 's_u1',
              name: 'Ganesh Kadam',
              phone: '9822101010',
              primaryVehicle: { registrationNumber: 'MH 19 BJ 4421', vehicleType: 'Car', model: 'Swift Dzire' },
              createdAt: '2026-10-24T10:30:00Z',
              status: 'ACTIVE',
              commission: 100
            },
            {
              _id: 's_u2',
              name: 'Rajesh Shinde',
              phone: '9822202020',
              primaryVehicle: { registrationNumber: 'MH 12 CR 8899', vehicleType: 'Bike', model: 'Honda Activa 6G' },
              createdAt: '2026-10-22T14:15:00Z',
              status: 'ACTIVE',
              commission: 100
            }
          ],
          workReports: [
            {
              date: '2026-10-25',
              hoursWorked: 8,
              leadsVisited: 14,
              notes: 'Visited RTO office and auto stand in sector 4. High interest in QR safety stickers.'
            }
          ],
          totalSales: sales,
          totalCommission: sales * incRate,
          monthlyTarget: member.monthlyTarget || 50,
          targetProgressPercent: Math.min(100, Math.round((sales / (member.monthlyTarget || 50)) * 100))
        });
      }
    } catch (err) {
      setViewStaffModal({
        member,
        bankDetails: member.bankDetails || {},
        onboardedUsers: [],
        workReports: [],
        totalSales: member.totalSalesCount || 0,
        totalCommission: 0,
        monthlyTarget: 50,
        targetProgressPercent: 0,
        monthsBreakdown: [],
        salaryPayments: []
      });
    } finally {
      setLoadingStaffDossier(false);
    }
  };

  // Open Salary Payment form for a specific month
  const handleOpenPaySalaryModal = (monthItem) => {
    const payable = monthItem?.totalPayable ?? (
      (viewStaffModal?.member?.baseSalary || 15000) +
      ((monthItem?.scannersSold || 0) * (viewStaffModal?.member?.incentivePerScanner || 100))
    );
    setPaySalaryForm({
      amountPaid: payable,
      paymentMode: viewStaffModal?.bankDetails?.upiId ? 'UPI' : 'BANK_TRANSFER',
      transactionReference: `SAL-${monthItem?.year || 2026}${String((monthItem?.month ?? 9) + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `Salary payout for ${monthItem?.monthLabel || 'Current Month'}`
    });
    setPaySalaryModalOpen(true);
  };

  // Confirm and Submit Salary Payment
  const handleConfirmPaySalary = async (e) => {
    if (e) e.preventDefault();
    if (!viewStaffModal?.member?._id) return;
    setPayingSalaryLoading(true);
    try {
      const activeMonthData = viewStaffModal?.monthsBreakdown?.[selectedSalaryMonthIdx] || {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        monthLabel: 'Current Month'
      };

      const res = await adminApiFetch(`/api/admin/team/${viewStaffModal.member._id}/pay-salary`, {
        method: 'POST',
        body: JSON.stringify({
          month: activeMonthData.month,
          year: activeMonthData.year,
          amountPaid: Number(paySalaryForm.amountPaid),
          paymentMode: paySalaryForm.paymentMode,
          transactionReference: paySalaryForm.transactionReference,
          notes: paySalaryForm.notes,
          status: 'PAID'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Salary marked as PAID successfully!');
        setPaySalaryModalOpen(false);
        // Refresh dossier
        await handleViewStaff(viewStaffModal.member);
        // Refresh team table
        loadAllData();
      } else {
        alert(data.message || 'Failed to record salary payment');
      }
    } catch (err) {
      alert('Error recording salary: ' + err.message);
    } finally {
      setPayingSalaryLoading(false);
    }
  };

  // Revert Salary Payment to PENDING
  const handleTogglePendingSalary = async (monthItem) => {
    if (!viewStaffModal?.member?._id) return;
    if (!window.confirm(`Are you sure you want to revert salary for ${monthItem.monthLabel} to PENDING?`)) return;
    try {
      const res = await adminApiFetch(`/api/admin/team/${viewStaffModal.member._id}/pay-salary`, {
        method: 'POST',
        body: JSON.stringify({
          month: monthItem.month,
          year: monthItem.year,
          status: 'PENDING'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Salary marked as PENDING');
        await handleViewStaff(viewStaffModal.member);
        loadAllData();
      } else {
        alert(data.message || 'Failed to update salary status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Block / Unblock Team Member
  const handleToggleTeamStatus = async (memberId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      const res = await adminApiFetch(`/api/admin/team/${memberId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setTeamMembers(teamMembers.map(m => (m._id === memberId ? { ...m, status: nextStatus, isActive: nextStatus === 'ACTIVE' } : m)));
        if (viewStaffModal && viewStaffModal.member?._id === memberId) {
          setViewStaffModal({
            ...viewStaffModal,
            member: { ...viewStaffModal.member, status: nextStatus, isActive: nextStatus === 'ACTIVE' }
          });
        }
      } else {
        alert(data.message || 'Failed to update team member status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Create Team Member
  const handleCreateTeamMember = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApiFetch('/api/admin/team', {
        method: 'POST',
        body: JSON.stringify(newTeamForm)
      });
      const data = await res.json();
      if (data.success) {
        setAddTeamModalOpen(false);
        setNewTeamForm({
          name: '',
          phone: '',
          email: '',
          password: 'password123',
          role: 'sales',
          department: 'Field Sales',
          monthlyTarget: 50,
          salaryOrCommissionRate: 100,
          bankDetails: {
            accountHolderName: '',
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            upiId: ''
          }
        });
        loadAllData();
        alert(`Team member added successfully!`);
      } else {
        alert(data.message || 'Failed to add team member');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Open Edit Team Modal
  const handleOpenEditTeam = (member) => {
    setEditTeamModal(member);
    setEditTeamForm({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      role: member.role || 'sales',
      department: member.department || 'Sales',
      status: member.status || 'ACTIVE',
      monthlyTarget: member.monthlyTarget || 50,
      salaryOrCommissionRate: member.salaryOrCommissionRate || 100,
      baseSalary: member.baseSalary !== undefined && member.baseSalary !== null ? member.baseSalary : 15000,
      incentivePerScanner: member.incentivePerScanner || member.salaryOrCommissionRate || 100,
      bankDetails: {
        accountHolderName: member.bankDetails?.accountHolderName || member.name || '',
        bankName: member.bankDetails?.bankName || '',
        accountNumber: member.bankDetails?.accountNumber || '',
        ifscCode: member.bankDetails?.ifscCode || '',
        upiId: member.bankDetails?.upiId || ''
      }
    });
  };

  // Quick Salary & Incentive Modal Handlers
  const handleOpenSalaryIncentive = (member) => {
    setSalaryIncentiveModal(member);
    setSalaryIncentiveForm({
      baseSalary: member.baseSalary !== undefined && member.baseSalary !== null ? member.baseSalary : 15000,
      incentivePerScanner: member.incentivePerScanner || member.salaryOrCommissionRate || 100,
      monthlyTarget: member.monthlyTarget || 50
    });
  };

  const handleSaveSalaryIncentive = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApiFetch(`/api/admin/team/${salaryIncentiveModal._id}/salary-incentive`, {
        method: 'PUT',
        body: JSON.stringify(salaryIncentiveForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(`Salary & Incentive updated successfully for ${salaryIncentiveModal.name}!`);
        setSalaryIncentiveModal(null);
        loadAllData();
      } else {
        alert(data.message || 'Failed to update salary');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Save Edit Team
  const handleSaveEditTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApiFetch(`/api/admin/team/${editTeamModal._id}`, {
        method: 'PUT',
        body: JSON.stringify(editTeamForm)
      });
      const data = await res.json();
      if (data.success) {
        setTeamMembers(teamMembers.map(m => (m._id === editTeamModal._id ? { ...m, ...editTeamForm } : m)));
        setEditTeamModal(null);
        alert('Team member updated successfully!');
      } else {
        alert(data.message || 'Failed to update team member');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Delete Team Member
  const handleDeleteTeamMember = async (id, name) => {
    if (!confirm(`Are you sure you want to remove team member ${name}?`)) return;
    try {
      const res = await adminApiFetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTeamMembers(teamMembers.filter(m => m._id !== id));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ---------------- SCANNERS ACTIONS ---------------- //

  const handleBatchGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenSuccessMsg('');
    try {
      const payload = {
        count: batchGenCount,
        prefix: batchGenPrefix,
        mode: batchGenMode
      };
      if (batchGenStartNum && !isNaN(Number(batchGenStartNum))) {
        payload.startNumber = Number(batchGenStartNum);
      }
      const res = await adminApiFetch('/api/admin/scanners/generate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setGenSuccessMsg(`Generated ${data.count} unique printable QR stickers (${data.prefix})!`);
        setGeneratedStickersList(data.data || []);
        setShowGenPrintModal(true);
        loadAllData();
      } else {
        alert(data.message || 'Generation failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Dedicated Print / Save as PDF function for physical vehicle stickers
  const handlePrintSheet = (stickersToPrint) => {
    const list = stickersToPrint && stickersToPrint.length > 0 ? stickersToPrint : (generatedStickersList.length > 0 ? generatedStickersList : scanners);
    if (!list || list.length === 0) {
      alert('No stickers available to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const stickerHtml = list.map(s => {
      const qrImg = s.qrImageBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(s.qrUrl || `${window.location.origin}/scan/${s.tagCode}`)}`;
      return `
        <div class="sticker-card">
          <div class="left-section">
            <div class="brand">
              <span class="brand-name">GADIRAKSHA</span>
              <span class="tag-label">SMART SAFETY</span>
            </div>
            <div class="sub-text">Car Safety tag by GadiRaksha, Scan to contact the vehicle owner.</div>
            <div class="headline">
              Scan the code <br/>
              <u>to contact the</u> <br/>
              vehicle owner.
            </div>
            <div class="footer-text">
              SCAN USING PHONE CAMERA, GOOGLE LENS OR ANY QR SCANNER APP.
            </div>
          </div>
          <div class="right-section">
            <div class="qr-box">
              <img src="${qrImg}" alt="${s.tagCode}" class="qr-img" />
              <div class="tag-meta">
                <span class="nfc-badge">📶 NFC</span>
                <span class="code-badge">${s.tagCode}</span>
              </div>
            </div>
            <div class="emergency-bar">
              <div class="icons">🚫 🆘 ⚠️ 📞</div>
              <div class="caption">Wrong Parking • Emergency Contact • Scan QR</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GadiRaksha-Stickers-${list.length}.pdf</title>
        <style>
          @page {
            size: A4;
            margin: 8mm;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body { background: #f8fafc; padding: 12px; }
          .sheet-header {
            text-align: center;
            margin-bottom: 16px;
            font-size: 13px;
            color: #334155;
            font-weight: 700;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            justify-content: center;
          }
          .sticker-card {
            width: 100%;
            height: 195px;
            background: #ffffff;
            border: 2px solid #0f172a;
            border-radius: 14px;
            overflow: hidden;
            display: flex;
            page-break-inside: avoid;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          .left-section {
            flex: 1;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .brand {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .brand-name {
            font-size: 17px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .tag-label {
            font-size: 8px;
            font-weight: 800;
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            color: #475569;
          }
          .sub-text {
            font-size: 8.5px;
            color: #64748b;
            line-height: 1.2;
          }
          .headline {
            font-size: 13.5px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.25;
          }
          .headline u {
            text-decoration-color: #f59e0b;
            text-decoration-thickness: 2.5px;
            text-underline-offset: 2px;
          }
          .footer-text {
            font-size: 7.5px;
            color: #94a3b8;
            font-weight: 700;
            border-top: 1px solid #f1f5f9;
            padding-top: 4px;
          }
          .right-section {
            width: 155px;
            background: #facc15;
            border-left: 2px solid #0f172a;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
          }
          .qr-box {
            background: #ffffff;
            border: 2px solid #0f172a;
            border-radius: 10px;
            padding: 5px;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .qr-img {
            width: 105px;
            height: 105px;
            object-fit: contain;
          }
          .tag-meta {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 3px;
            padding: 0 2px;
          }
          .nfc-badge {
            font-size: 8.5px;
            font-weight: 800;
            color: #334155;
          }
          .code-badge {
            font-family: monospace;
            font-size: 11px;
            font-weight: 900;
            color: #0f172a;
          }
          .emergency-bar {
            width: 100%;
            text-align: center;
          }
          .icons {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .caption {
            font-size: 7px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.1;
          }
          @media print {
            body { background: transparent; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="sheet-header no-print">
          <button onclick="window.print()" style="padding:10px 24px;font-size:14px;font-weight:bold;background:#0f172a;color:#fff;border:none;border-radius:8px;cursor:pointer;">📄 Download PDF / Print Stickers Sheet</button>
          <span style="margin-left:12px;color:#64748b;font-size:12px;">(Select "Destination: Save as PDF" in the print dialog)</span>
        </div>
        <div class="grid-container">
          ${stickerHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Resolve Emergency Incident
  const handleResolveEmergency = async (id) => {
    try {
      const res = await adminApiFetch(`/api/admin/emergencies/${id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolutionNote: 'Resolved by Admin Master Dashboard' })
      });
      const data = await res.json();
      if (data.success) {
        setEmergencies(emergencies.map(e => (e._id === id ? { ...e, status: 'RESOLVED' } : e)));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ---------------- FILTERED LISTS ---------------- //

  // Default fallback user when db is brand new
  const displayUsers = users.length > 0 ? users : [
    {
      _id: 'sample_u1',
      name: 'Sambhaji Patil',
      phone: '9823000000',
      email: 'sambhaji@gadiraksha.in',
      role: 'user',
      status: 'ACTIVE',
      bloodGroup: 'B+',
      createdAt: new Date().toISOString(),
      primaryVehicle: { vehicleNumber: 'MH19 AB 1234', vehicleModel: 'Honda Activa 6G' },
      address: { fullAddress: 'Station Road, Pachora, Dist. Jalgaon - 424201' }
    }
  ];

  const filteredUsers = displayUsers.filter(u => {
    const q = userSearch.toLowerCase();
    const matchSearch =
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.primaryVehicle?.vehicleNumber && u.primaryVehicle.vehicleNumber.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchRole =
      (u.role === 'user' || u.role === undefined || u.role === null) &&
      (roleFilter === 'ALL' || u.role === roleFilter);
    return matchSearch && matchStatus && matchRole;
  });

  const displayTeam = teamMembers.length > 0 ? teamMembers : [
    {
      _id: 't_m1',
      name: 'Rohan Sharma',
      phone: '9821001122',
      email: 'rohan.sales@gadiraksha.in',
      role: 'sales',
      department: 'Field Sales',
      status: 'ACTIVE',
      monthlyTarget: 50,
      salaryOrCommissionRate: 100,
      totalSalesCount: 38,
      totalCommissionEarned: 3800,
      bankDetails: {
        accountHolderName: 'Rohan Sharma',
        bankName: 'HDFC Bank',
        accountNumber: '50100482910341',
        ifscCode: 'HDFC0000123',
        upiId: 'rohan.sharma@okhdfcbank'
      }
    },
    {
      _id: 't_m2',
      name: 'Pooja Kulkarni',
      phone: '9821003344',
      email: 'pooja.mkt@gadiraksha.in',
      role: 'marketing',
      department: 'Digital Campaigns',
      status: 'ACTIVE',
      monthlyTarget: 100,
      salaryOrCommissionRate: 100,
      totalSalesCount: 82,
      totalCommissionEarned: 8200,
      bankDetails: {
        accountHolderName: 'Pooja Kulkarni',
        bankName: 'State Bank of India',
        accountNumber: '38291048291',
        ifscCode: 'SBIN0001421',
        upiId: 'poojak@okaxis'
      }
    },
    {
      _id: 't_m3',
      name: 'Amit Verma',
      phone: '9821005566',
      email: 'amit.field@gadiraksha.in',
      role: 'sales',
      department: 'Pune Auto Hub',
      status: 'BLOCKED',
      monthlyTarget: 40,
      salaryOrCommissionRate: 100,
      totalSalesCount: 12,
      totalCommissionEarned: 1200,
      bankDetails: {
        accountHolderName: 'Amit Verma',
        bankName: 'ICICI Bank',
        accountNumber: '109283746152',
        ifscCode: 'ICIC0000456',
        upiId: 'amit.verma@icici'
      }
    }
  ];

  const filteredTeam = displayTeam.filter(m => {
  // 🔒 Never show admin or user (vehicle owner) accounts in Sales Team Portal
  const role = (m.role || '').toLowerCase();
  if (role === 'admin' || role === 'user' || !role) return false;

  const q = teamSearch.toLowerCase();
  const matchSearch =
    !teamSearch ||
    (m.name && m.name.toLowerCase().includes(q)) ||
    (m.phone && m.phone.includes(q)) ||
    (m.email && m.email.toLowerCase().includes(q)) ||
    (m.department && m.department.toLowerCase().includes(q));

  const matchRole = teamRoleFilter === 'ALL' || role === teamRoleFilter;
  const matchStatus = teamStatusFilter === 'ALL' || m.status === teamStatusFilter;

  return matchSearch && matchRole && matchStatus;
});

  // Team summary metrics
  const totalStaffCount = displayTeam.length;
  const activeStaffCount = displayTeam.filter(m => m.status === 'ACTIVE').length;
  const totalStaffSales = displayTeam.reduce((sum, m) => sum + (m.totalSalesCount || 0), 0);
  const totalStaffCommission = displayTeam.reduce((sum, m) => sum + (m.totalCommissionEarned || ((m.totalSalesCount || 0) * (m.salaryOrCommissionRate || 100))), 0);

  // Counts for Metrics
  const totalUserCount = stats?.summary?.totalUsers || displayUsers.length;
  const activeUserCount = displayUsers.filter(u => u.status === 'ACTIVE').length;
  const blockedUserCount = displayUsers.filter(u => u.status === 'BLOCKED').length;
  const growthRate = stats?.userGrowth?.growthRate || '+24.5%';
  const totalVehicles = stats?.summary?.totalVehicles || 182;
  const activeScannersCount = stats?.summary?.activeScanners || 168;

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 
     

      {/* 
        ========================================================================
        1. BANNER (DYNAMIC TO SELECTED PORTAL)
        ========================================================================
      */}
      {portalMode === 'users' ? (
        /* USER PORTAL BANNER */
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-brand-400/10 blur-xl pointer-events-none" />



          <div className="relative z-10 flex flex-wrap gap-2.5">
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="btn-primary !bg-white !text-brand-900 hover:!bg-brand-50 shadow-md font-bold text-xs"
            >
              <Plus className="size-4 text-brand-700" />
              <span>+ Add New User</span>
            </button>
            <button
              onClick={() => setActiveTab('scanners')}
              className="btn-secondary !bg-brand-800/60 !border-brand-700 !text-white hover:!bg-brand-800 text-xs font-semibold"
            >
              <QrCode className="size-4" />
              <span>QR Inventory</span>
            </button>
          </div>
        </div>
      ) : (
        /* SALES TEAM PORTAL BANNER */
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-brand-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />



          <div className="relative z-10 flex flex-wrap gap-2.5">
            <button
              onClick={() => setAddTeamModalOpen(true)}
              className="btn-primary !bg-white !text-emerald-950 hover:!bg-emerald-50 shadow-md font-bold text-xs"
            >
              <UserPlus className="size-4 text-emerald-700" />
              <span>+ Hire Team Member</span>
            </button>
            <a
              href="/sales"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary !bg-emerald-900/60 !border-emerald-700 !text-white hover:!bg-emerald-900 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <span>Open Live Staff Portal</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        2. 4 METRIC KPI CARDS (DYNAMIC TO SELECTED PORTAL)
        ========================================================================
      */}
      {portalMode === 'users' ? (
        /* USER PORTAL 4 KPI CARDS */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Users
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                <Users className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
                {totalUserCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">registered</span>
            </div>
            <p className="mt-2 text-xs text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1">
              <TrendingUp className="size-3.5" />
              <span>All Vehicle Owners</span>
            </p>
          </div>

          {/* Card 2: Active Users */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Users
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
                {activeUserCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({blockedUserCount} blocked)
              </span>
            </div>
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="size-3.5" />
              <span>Verified & Protected</span>
            </p>
          </div>

          {/* Card 3: Monthly Growth */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Monthly Growth
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <TrendingUp className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
                {growthRate}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">MoM</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Rapid user adoption
            </p>
          </div>

          {/* Card 4: Fleet & Scanners */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Scanners
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <QrCode className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
                {activeScannersCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">of {totalVehicles} fleet</span>
            </div>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
              Pre-printed stickers active
            </p>
          </div>
        </div>
      ) : (
        /* SALES TEAM PORTAL 4 KPI CARDS */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Staff */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Staff
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Briefcase className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
                {totalStaffCount}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">members</span>
            </div>
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <UserCheck className="size-3.5" />
              <span>{activeStaffCount} Active on Field</span>
            </p>
          </div>

          {/* Card 2: Total Customers Onboarded by Team */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Team Onboardings
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <QrCode className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
                {totalStaffSales}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">customers</span>
            </div>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
              Stickers distributed by staff
            </p>
          </div>

          {/* Card 3: Monthly Target Progress */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Team Target Goal
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <TrendingUp className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-purple-600 dark:text-purple-400">
                {Math.min(100, Math.round((totalStaffSales / (Math.max(1, displayTeam.length) * 50)) * 100))}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">of goal</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Monthly quota progress
            </p>
          </div>

          {/* Card 4: Total Commission Payout */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Team Commissions
              </span>
              <div className="grid size-9 place-items-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Banknote className="size-4.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{totalStaffCommission.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Verified bank settlements
            </p>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        3. SUB-TAB NAVIGATION BAR (RELEVANT TO ACTIVE PORTAL)
        ========================================================================
      */}
      {portalMode === 'users' ? (
        /* USER PORTAL SUB-TABS */
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-[#1f2333]">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeTab === 'users'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#12141e] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1d2e] border border-slate-200 dark:border-[#1f2333]'
              }`}
          >
            <Users className="size-4" />
            <span>Vehicle Users Hub ({filteredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scanners')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeTab === 'scanners'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#12141e] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1d2e] border border-slate-200 dark:border-[#1f2333]'
              }`}
          >
            <QrCode className="size-4" />
            <span>QR Stickers Inventory ({scanners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('emergencies')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeTab === 'emergencies'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#12141e] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1d2e] border border-slate-200 dark:border-[#1f2333]'
              }`}
          >
            <ShieldAlert className="size-4" />
            <span>Emergency SOS Logs ({emergencies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('growth')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${activeTab === 'growth'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#12141e] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1d2e] border border-slate-200 dark:border-[#1f2333]'
              }`}
          >
            <TrendingUp className="size-4" />
            <span>Monthly Growth & Stats</span>
          </button>
        </div>
      ) : (
        /* SALES TEAM PORTAL SUB-TABS */
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1f2333]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm">
              <Briefcase className="size-4" />
              <span>Team Members ({filteredTeam.length})</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#161826]">
              <span>Field Agents & Dealership Staff</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAddTeamModalOpen(true)}
            className="btn-primary !py-2 !px-3.5 text-xs font-bold"
          >
            <UserPlus className="size-4" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      )}

      {/* 4. TAB 1: VEHICLE USERS HUB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Header Bar */}
          <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name, mobile, vehicle plate..."
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-10 pr-4 py-2 text-xs text-ink dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Users</option>
                <option value="BLOCKED">Blocked Users</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="user">User (Owner)</option>
                <option value="sales">Sales Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-[#22253a]">
                  <tr>
                    <th className="py-3.5 px-5">User / Owner</th>
                    <th className="py-3.5 px-5">Mobile & Contact</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Primary Vehicle & Sticker</th>
                    <th className="py-3.5 px-5">Blood Group</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isBlocked = u.status === 'BLOCKED' || u.isActive === false;
                      const vehiclePlate = u.primaryVehicle?.vehicleNumber || u.vehicles?.[0]?.vehicleNumber;

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                          {/* User Name & Avatar */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                                alt={u.name}
                                className="size-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                              <div>
                                <span className="font-bold text-sm text-ink block">{u.name || 'Unnamed User'}</span>
                                <span className="text-[11px] text-slate-400 block">{u.email || 'No email registered'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Mobile */}
                          <td className="py-3.5 px-5 font-mono text-xs">
                            <span className="font-semibold text-ink">+91 {u.phone}</span>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${u.role === 'admin'
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                                  : u.role === 'sales'
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60'
                                    : 'bg-slate-100 dark:bg-[#1a1d2e] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#262a3e]'
                                }`}
                            >
                              {u.role || 'user'}
                            </span>
                          </td>

                          {/* Primary Vehicle & Sticker */}
                          <td className="py-3.5 px-5">
                            {vehiclePlate ? (
                              <div className="flex items-center gap-2">
                                <PlateBadge value={vehiclePlate} size="sm" />
                                {u.primaryVehicle?.vehicleModel && (
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {u.primaryVehicle.vehicleModel}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">No vehicle linked</span>
                            )}
                          </td>

                          {/* Blood Group */}
                          <td className="py-3.5 px-5 font-bold text-rose-600 dark:text-rose-400">
                            {u.bloodGroup || 'B+'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-5">
                            <StatusBadge status={isBlocked ? 'INACTIVE' : 'ACTIVE'} label={isBlocked ? 'Blocked' : 'Active'} />
                          </td>

                          {/* Actions: Eye, Edit, Block */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Eye Button: View Details Dossier */}
                              <button
                                onClick={() => handleViewUser(u)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-[#1a1d2e] transition"
                                title="View User Complete Details Dossier"
                              >
                                <Eye className="size-4" />
                              </button>

                              {/* Edit Button: Update User */}
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-[#1a1d2e] transition"
                                title="Update User Profile & Role"
                              >
                                <Edit className="size-4" />
                              </button>

                              {/* Block / Unblock Button */}
                              <button
                                onClick={() => handleToggleUserBlock(u._id, u.status)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${isBlocked
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 hover:bg-rose-100'
                                  }`}
                                title={isBlocked ? 'Activate User' : 'Block User from System'}
                              >
                                {isBlocked ? 'Unblock' : 'Block'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 text-xs">
                        No vehicle users match the search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: SALES & STAFF TEAM PORTAL */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          {/* Filter & Action Bar */}
          <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name, phone, dept..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-9 pr-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
                />
              </div>

              <select
                value={teamRoleFilter}
                onChange={(e) => setTeamRoleFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="sales">Field Sales Agents</option>
                <option value="marketing">Marketing Specialists</option>
                <option value="support">Customer Support</option>
                <option value="admin">Administrators</option>
              </select>

              <select
                value={teamStatusFilter}
                onChange={(e) => setTeamStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
          </div>

          {/* Team Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-[#22253a]">
                  <tr>
                    <th className="py-3.5 px-4">Staff Member Details</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Mobile Number</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                  {filteredTeam.map((m) => {
                    const isPaid = m.currentMonthSalaryStatus === 'PAID';
                    return (
                      <tr key={m._id} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                        {/* Name & Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-extrabold grid place-items-center text-xs shrink-0 shadow-sm">
                              {m.name?.slice(0, 2).toUpperCase() || 'ST'}
                            </div>
                            <div>
                              <span className="font-bold text-sm text-ink block">{m.name}</span>
                              <span className="text-[11px] text-slate-400 block">{m.email || m.department || 'Field Sales Staff'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                            {m.role}
                          </span>
                        </td>

                        {/* Mobile Number */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold">
                            +91 {m.phone}
                          </span>
                        </td>

                        {/* Status (Active / Blocked & Salary Status) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={m.status || 'ACTIVE'} />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isPaid
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}>
                              Salary: {isPaid ? 'PAID' : 'PENDING'}
                            </span>
                          </div>
                        </td>

                        {/* Actions (Eye Button, Edit, Block, Delete) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Eye button: Opens Complete Working Dossier & Salary Management */}
                            <button
                              onClick={() => handleViewStaff(m)}
                              className="px-3 py-1.5 rounded-xl text-brand-600 dark:text-cyan-400 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition flex items-center gap-1.5 font-bold text-xs shadow-sm"
                              title="👁️ View Details, Salary Pay & Transaction History"
                            >
                              <Eye className="size-3.5" />
                              <span>Details</span>
                            </button>

                            {/* Edit button */}
                            <button
                              onClick={() => handleOpenEditTeam(m)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-[#1a1d2e] transition"
                              title="✏️ Edit Staff Info"
                            >
                              <Edit className="size-3.5" />
                            </button>

                            {/* Block / Unblock Toggle */}
                            <button
                              onClick={() => handleToggleTeamStatus(m._id, m.status)}
                              className={`p-1.5 rounded-lg transition ${m.status === 'BLOCKED'
                                  ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                }`}
                              title={m.status === 'BLOCKED' ? 'Unblock Staff Member' : 'Block Staff Member'}
                            >
                              {m.status === 'BLOCKED' ? <CheckCircle className="size-3.5" /> : <Ban className="size-3.5" />}
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteTeamMember(m._id, m.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="🗑️ Remove Team Member"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTeam.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 text-xs">
                        No team members found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: QR STICKERS INVENTORY */}
      {activeTab === 'scanners' && (
        <div className="space-y-6">
          {/* Pre-Printed Sticker Batch Generator Card */}
          <div className="card p-6 bg-gradient-to-br from-brand-50/70 via-white to-white dark:from-brand-950/40 dark:via-[#12141e] dark:to-[#12141e] border-brand-200/80 dark:border-brand-900/60">
            <div className="flex items-center gap-2.5 text-brand-800 dark:text-brand-300 mb-2">
              <QrCode className="size-5 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-base text-ink">Generate Pre-Printed Physical Stickers (Stock)</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              Create a batch of unique, printable QR sticker codes. Company field agents and vehicle owners can activate and bind these pre-printed codes to their vehicles.
            </p>

            <form onSubmit={handleBatchGenerate} className="mt-4 flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Prefix</label>
                <input
                  type="text"
                  value={batchGenPrefix}
                  onChange={(e) => setBatchGenPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. MH"
                  className="w-20 rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono font-bold uppercase text-ink dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">ID Format</label>
                <select
                  value={batchGenMode}
                  onChange={(e) => setBatchGenMode(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white font-semibold"
                >
                  <option value="SEQUENTIAL">Sequential (MH-1001, MH-1002...)</option>
                  <option value="RANDOM">Random Unique (MH-84920...)</option>
                </select>
              </div>

              {batchGenMode === 'SEQUENTIAL' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Start # (Optional)</label>
                  <input
                    type="number"
                    value={batchGenStartNum}
                    onChange={(e) => setBatchGenStartNum(e.target.value)}
                    placeholder="Auto (Next #)"
                    className="w-28 rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs font-mono text-ink dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                <select
                  value={batchGenCount}
                  onChange={(e) => setBatchGenCount(Number(e.target.value))}
                  className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-xs text-ink dark:text-white font-semibold"
                >
                  <option value={5}>5 Unique Stickers</option>
                  <option value={10}>10 Unique Stickers</option>
                  <option value={25}>25 Unique Stickers</option>
                  <option value={50}>50 Unique Stickers</option>
                  <option value={100}>100 Unique Stickers</option>
                </select>
              </div>

              <div className="self-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="btn-primary !py-2 !px-4 text-xs font-bold"
                >
                  <RefreshCw className={`size-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generating...' : 'Generate Scanners Now'}</span>
                </button>
              </div>
            </form>

            {genSuccessMsg && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>{genSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Scanners List Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1f2333] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-ink">Pre-Printed QR Sticker Inventory</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">All registered tags in database ({scanners.length} total)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const unclaimed = scanners.filter(s => s.status === 'UNCLAIMED');
                  setGeneratedStickersList(unclaimed.length > 0 ? unclaimed : scanners);
                  setShowGenPrintModal(true);
                }}
                className="btn-primary !py-1.5 !px-3 text-xs font-bold flex items-center gap-1.5 !bg-amber-500 hover:!bg-amber-600 !text-slate-950 shadow-md shadow-amber-500/20"
              >
                <Printer className="size-3.5" />
                <span>Print All Blank Stickers (Sheet)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-[#22253a]">
                  <tr>
                    <th className="py-3 px-4">QR Preview</th>
                    <th className="py-3 px-4">Sticker Code</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Vehicle</th>
                    <th className="py-3 px-4">Claimed By Owner</th>
                    <th className="py-3 px-4 text-right">Print & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                  {scanners.map((s) => {
                    const qrImg = s.qrImageBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(s.qrUrl || `${window.location.origin}/scan/${s.tagCode}`)}`;
                    return (
                      <tr key={s._id} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                        <td className="py-2.5 px-4">
                          <div
                            onClick={() => {
                              setSinglePrintSticker(s);
                              setShowSinglePrintModal(true);
                            }}
                            className="size-11 p-1 bg-white rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:scale-105 transition grid place-items-center"
                            title="Click to view & print physical sticker"
                          >
                            <img
                              src={qrImg}
                              alt={s.tagCode}
                              className="size-9 object-contain"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-brand-700 dark:text-cyan-400 text-sm">
                          {s.tagCode}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="py-3 px-4">
                          {s.vehicleDetails?.vehicleNumber ? (
                            <PlateBadge value={s.vehicleDetails.vehicleNumber} size="sm" />
                          ) : (
                            <span className="text-slate-400 text-xs italic">Unassigned (Fresh stock)</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {s.user?.name || s.user?.phone ? (
                            <div>
                              <span className="font-semibold text-ink block">{s.user.name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">+91 {s.user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Unclaimed</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSinglePrintSticker(s);
                                setShowSinglePrintModal(true);
                              }}
                              className="btn-primary !py-1 !px-2.5 text-[11px] !bg-amber-500 hover:!bg-amber-600 !text-slate-950 font-bold flex items-center gap-1 shadow-sm shadow-amber-500/10"
                              title="Print Physical Sticker for Selling"
                            >
                              <Printer className="size-3" />
                              <span>Print</span>
                            </button>
                            <button
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = qrImg;
                                a.download = `${s.tagCode}-GadiRaksha-Sticker.png`;
                                a.click();
                              }}
                              className="btn-secondary !py-1 !px-2 text-[11px] flex items-center gap-1"
                              title="Download QR Image"
                            >
                              <Download className="size-3" />
                            </button>
                            <button
                              onClick={() => navigate(`/scan/${s.tagCode}`)}
                              className="btn-secondary !py-1 !px-2 text-[11px] text-slate-500"
                              title="Preview bystander scan page"
                            >
                              <ExternalLink className="size-3" />
                            </button>
                          </div>
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

      {/* 7. TAB 4: EMERGENCY SOS LOGS */}
      {activeTab === 'emergencies' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-[#1f2333]">
              <h3 className="text-sm font-bold text-ink">Live Emergency Incidents & Road Accident SOS</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Socket.io real-time alerts broadcast from bystander QR scans</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#1f2333]">
              {emergencies.length > 0 ? (
                emergencies.map((e) => (
                  <div key={e._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mt-0.5">
                        <ShieldAlert className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-ink font-bold text-sm">{e.alertType} SOS Alert</strong>
                          <StatusBadge status={e.status} />
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(e.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Vehicle: <strong className="font-mono text-ink">{e.vehicleNumber || e.tagCode}</strong> · Note: {e.scannerNote}
                        </p>
                        {e.location?.googleMapsUrl && (
                          <a
                            href={e.location.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-cyan-400 font-semibold hover:underline mt-1"
                          >
                            <MapPin className="size-3" /> View Location on Google Maps
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <PlateBadge value={e.vehicleNumber || 'MH19 AB 1234'} size="sm" />
                      {e.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolveEmergency(e._id)}
                          className="btn-secondary !py-1 !px-2.5 text-xs text-emerald-700"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No emergency SOS incidents logged.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 5: MONTHLY GROWTH & STATS */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-ink">User Growth by Month (MoM)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total new vehicle registrations and monthly progress</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Growth Rate: {growthRate}
              </span>
            </div>

            <div className="space-y-3">
              {[
                { month: 'May 2026', count: 14, percent: 15, growth: '+12%' },
                { month: 'Jun 2026', count: 28, percent: 30, growth: '+100%' },
                { month: 'Jul 2026', count: 45, percent: 48, growth: '+60%' },
                { month: 'Aug 2026', count: 78, percent: 65, growth: '+73%' },
                { month: 'Sep 2026', count: 120, percent: 85, growth: '+54%' },
                { month: 'Oct 2026', count: 165, percent: 100, growth: '+24.5% (Projected)' }
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">{m.month}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{m.growth}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 dark:bg-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{m.count} Registered Users</span>
                    <span>{m.percent}% scale target</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW USER DOSSIER (EYE BUTTON) ================= */}
      {viewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#12141e] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={viewUserModal.user?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={viewUserModal.user?.name}
                  className="size-14 rounded-2xl object-cover border-2 border-brand-500 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-ink">{viewUserModal.user?.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">+91 {viewUserModal.user?.phone}</span>
                    <StatusBadge status={viewUserModal.user?.status || 'ACTIVE'} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleUserBlock(viewUserModal.user._id, viewUserModal.user.status || 'ACTIVE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${viewUserModal.user?.status === 'BLOCKED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'
                    }`}
                >
                  {viewUserModal.user?.status === 'BLOCKED' ? (
                    <>
                      <CheckCircle className="size-3.5" />
                      <span>Unblock Account</span>
                    </>
                  ) : (
                    <>
                      <Ban className="size-3.5" />
                      <span>Block Account</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setViewUserModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-ink text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Blood Group</span>
                <strong className="text-rose-600 dark:text-rose-400 text-sm font-extrabold">{viewUserModal.user?.bloodGroup || 'B+'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Gender</span>
                <strong className="text-ink text-sm font-bold">{viewUserModal.user?.gender || 'Male'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Account Role</span>
                <strong className="text-brand-600 dark:text-cyan-400 text-sm font-bold uppercase">{viewUserModal.user?.role || 'user'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a]">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Registered Date</span>
                <strong className="text-ink text-xs font-semibold">
                  {viewUserModal.user?.createdAt ? new Date(viewUserModal.user.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                </strong>
              </div>
            </div>

            {/* Address */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a] text-xs">
              <span className="text-[10px] text-slate-400 block uppercase font-bold mb-0.5">Residential Address</span>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {viewUserModal.user?.address?.fullAddress || 'Station Road, Pachora, Dist. Jalgaon - 424201'}
              </p>
            </div>

            {/* Registered Vehicles & Pre-Printed QR Tag Scanners */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Car className="size-3.5 text-brand-600" />
                <span>Registered Vehicles & QR Scanners</span>
              </h4>
              <div className="space-y-2">
                {(viewUserModal.user?.vehicles?.length > 0 ? viewUserModal.user.vehicles : (
                  viewUserModal.user?.primaryVehicle ? [viewUserModal.user.primaryVehicle] : [
                    {
                      registrationNumber: viewUserModal.user?.vehicleNumber || 'MH 19 AB 1234',
                      make: 'Honda',
                      model: viewUserModal.user?.vehicleModel || 'Activa 6G',
                      vehicleType: viewUserModal.user?.vehicleType || 'Two-Wheeler',
                      tagCode: viewUserModal.user?.tagCode || 'MH-1001'
                    }
                  ]
                )).map((v, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 grid place-items-center">
                        <Car className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <PlateBadge value={v.registrationNumber || v.vehicleNumber || 'MH 19 AB 1234'} size="sm" />
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            {v.vehicleType || 'Vehicle'}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          {v.make ? `${v.make} ${v.model}` : (v.model || v.vehicleModel || 'Standard Vehicle')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#10121a] border border-slate-200 dark:border-[#1f2333]">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">QR Sticker Tag</span>
                        <span className="font-mono font-bold text-brand-600 dark:text-cyan-400 text-xs">
                          {v.tagCode || viewUserModal.tags?.[0]?.tagCode || 'MH-1001'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Documents Status */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="size-3.5 text-purple-600" />
                <span>Digital Documents Verification Status</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">RC Book</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                    Verified
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Insurance Policy</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                    Valid (Active)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a] flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">PUC Certificate</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                    Valid
                  </span>
                </div>
              </div>
            </div>

            {/* 3-4 Emergency Family Responders */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="size-3.5 text-rose-600" />
                <span>Emergency Responders (3-4 Family Members)</span>
              </h4>
              <div className="space-y-2 text-xs">
                {(viewUserModal.user?.emergencyContacts?.length > 0 ? viewUserModal.user.emergencyContacts : [
                  { name: 'Pandurang Patil', relation: 'Father', phone: '9822111111', isPrimary: true },
                  { name: 'Sunita Patil', relation: 'Spouse', phone: '9822222222' },
                  { name: 'Anil Patil', relation: 'Brother', phone: '9822333333' }
                ]).map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">({c.relation})</span>
                      {c.isPrimary && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Priority 1 (Primary)
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">+91 {c.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-[#1f2333]">
              <button
                onClick={() => setViewUserModal(null)}
                className="btn-secondary !py-2 !px-5 text-xs font-bold"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER (UPDATE) ================= */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <h3 className="text-base font-bold text-ink">Update User Account Details</h3>
              <button onClick={() => setEditUserModal(null)} className="p-1 text-slate-400 hover:text-ink font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile</label>
                  <input
                    type="text"
                    required
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={editUserForm.bloodGroup}
                    onChange={(e) => setEditUserForm({ ...editUserForm, bloodGroup: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                  >
                    <option value="user">User (Vehicle Owner)</option>
                    <option value="sales">Sales Person</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={editUserForm.status}
                    onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editUserForm.address}
                  onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK UPDATE SALARY & INCENTIVE ================= */}
      {salaryIncentiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12141e] p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 grid place-items-center">
                  <IndianRupee className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Salary & Incentive Settings</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure payroll structure for {salaryIncentiveModal.name}</p>
                </div>
              </div>
              <button onClick={() => setSalaryIncentiveModal(null)} className="p-1.5 text-slate-400 hover:text-ink font-bold rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSalaryIncentive} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Monthly Salary (फिक्स मासिक वेतन - ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={salaryIncentiveForm.baseSalary}
                    onChange={(e) => setSalaryIncentiveForm({ ...salaryIncentiveForm, baseSalary: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-ink dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incentive Per Scanner (प्रति स्कैनर इंसेंटिव - ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-500">₹</span>
                  <input
                    type="number"
                    required
                    value={salaryIncentiveForm.incentivePerScanner}
                    onChange={(e) => setSalaryIncentiveForm({ ...salaryIncentiveForm, incentivePerScanner: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Staff member earns this extra incentive on each activated vehicle sticker.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Target Quota (मासिक लक्ष्य - Stickers)
                </label>
                <input
                  type="number"
                  required
                  value={salaryIncentiveForm.monthlyTarget}
                  onChange={(e) => setSalaryIncentiveForm({ ...salaryIncentiveForm, monthlyTarget: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-ink dark:text-white font-mono font-bold"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setSalaryIncentiveModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 font-bold shadow-md shadow-brand-500/20"
                >
                  Save Salary & Incentive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW USER ================= */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <h3 className="text-base font-bold text-ink">Register New Vehicle User / Customer</h3>
              <button onClick={() => setAddUserModalOpen(false)} className="p-1 text-slate-400 hover:text-ink font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9822001122"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={newUserForm.bloodGroup}
                    onChange={(e) => setNewUserForm({ ...newUserForm, bloodGroup: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
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
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
                  >
                    <option value="user">User (Vehicle Owner)</option>
                    <option value="sales">Sales Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a] space-y-2">
                <span className="font-bold text-ink block">Vehicle & Pre-Printed Sticker Link (Optional)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Plate (e.g. MH19 AB 1234)"
                    value={newUserForm.vehicleNumber}
                    onChange={(e) => setNewUserForm({ ...newUserForm, vehicleNumber: e.target.value })}
                    className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono uppercase text-ink dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Sticker Code (e.g. MH-1001)"
                    value={newUserForm.tagCode}
                    onChange={(e) => setNewUserForm({ ...newUserForm, tagCode: e.target.value })}
                    className="rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono uppercase text-ink dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Pachora, Maharashtra"
                  value={newUserForm.address}
                  onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 font-bold"
                >
                  Create & Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / HIRE TEAM MEMBER ================= */}
      {addTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#12141e] p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-cyan-400 grid place-items-center">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Hire / Add Staff Member</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Register employee with role, targets & bank payout details</p>
                </div>
              </div>
              <button onClick={() => setAddTeamModalOpen(false)} className="p-1.5 text-slate-400 hover:text-ink font-bold rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeamMember} className="space-y-4 text-xs">
              {/* Personal & Employment Details */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">1. Staff Information</h4>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunil Deshmukh"
                    value={newTeamForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTeamForm({
                        ...newTeamForm,
                        name: val,
                        bankDetails: {
                          ...newTeamForm.bankDetails,
                          accountHolderName: newTeamForm.bankDetails.accountHolderName || val
                        }
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-ink dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9821009988"
                      value={newTeamForm.phone}
                      onChange={(e) => setNewTeamForm({ ...newTeamForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 font-mono text-ink dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. sunil@gadiraksha.in"
                      value={newTeamForm.email}
                      onChange={(e) => setNewTeamForm({ ...newTeamForm, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-ink dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Temporary Password *</label>
                    <input
                      type="text"
                      required
                      value={newTeamForm.password}
                      onChange={(e) => setNewTeamForm({ ...newTeamForm, password: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 font-mono text-ink dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role & Designation *</label>
                    <select
                      value={newTeamForm.role}
                      onChange={(e) => setNewTeamForm({ ...newTeamForm, role: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-ink dark:text-white font-bold"
                    >
                      <option value="sales">Field Sales Representative</option>
                      <option value="marketing">Marketing Specialist</option>
                      <option value="support">Customer Support Agent</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Field Sales"
                      value={newTeamForm.department}
                      onChange={(e) => setNewTeamForm({ ...newTeamForm, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Salary (₹)</label>
                    <input
                      type="number"
                      placeholder="15000"
                      value={newTeamForm.baseSalary}
                      onChange={(e) => setNewTeamForm({ ...newTeamForm, baseSalary: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Incentive / Scanner (₹)</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={newTeamForm.incentivePerScanner}
                      onChange={(e) => setNewTeamForm({
                        ...newTeamForm,
                        incentivePerScanner: Number(e.target.value),
                        salaryOrCommissionRate: Number(e.target.value)
                      })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-mono font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={newTeamForm.monthlyTarget}
                      onChange={(e) => setNewTeamForm({ ...newTeamForm, monthlyTarget: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-brand-600 dark:text-cyan-400" />
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-brand-700 dark:text-cyan-300">
                    2. Bank Account Details (For Commission Payouts)
                  </h4>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. State Bank of India, HDFC Bank"
                        value={newTeamForm.bankDetails.bankName}
                        onChange={(e) => setNewTeamForm({
                          ...newTeamForm,
                          bankDetails: { ...newTeamForm.bankDetails, bankName: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="As on passbook"
                        value={newTeamForm.bankDetails.accountHolderName}
                        onChange={(e) => setNewTeamForm({
                          ...newTeamForm,
                          bankDetails: { ...newTeamForm.bankDetails, accountHolderName: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 50100482910341"
                        value={newTeamForm.bankDetails.accountNumber}
                        onChange={(e) => setNewTeamForm({
                          ...newTeamForm,
                          bankDetails: { ...newTeamForm.bankDetails, accountNumber: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0000123"
                        value={newTeamForm.bankDetails.ifscCode}
                        onChange={(e) => setNewTeamForm({
                          ...newTeamForm,
                          bankDetails: { ...newTeamForm.bankDetails, ifscCode: e.target.value.toUpperCase() }
                        })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono uppercase text-ink dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">UPI ID (Google Pay, PhonePe, Paytm)</label>
                    <input
                      type="text"
                      placeholder="e.g. username@okhdfcbank"
                      value={newTeamForm.bankDetails.upiId}
                      onChange={(e) => setNewTeamForm({
                        ...newTeamForm,
                        bankDetails: { ...newTeamForm.bankDetails, upiId: e.target.value }
                      })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setAddTeamModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 font-bold shadow-md shadow-brand-500/20"
                >
                  Hire & Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT TEAM MEMBER ================= */}
      {editTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#12141e] p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3.5">
              <div>
                <h3 className="text-base font-bold text-ink">Update Staff Member Details</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Edit member designation, status & bank account details</p>
              </div>
              <button onClick={() => setEditTeamModal(null)} className="p-1.5 text-slate-400 hover:text-ink font-bold rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTeam} className="space-y-4 text-xs">
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">1. Staff Information</h4>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editTeamForm.name}
                    onChange={(e) => setEditTeamForm({ ...editTeamForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-ink dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile</label>
                    <input
                      type="text"
                      required
                      value={editTeamForm.phone}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 font-mono text-ink dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editTeamForm.email}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-ink dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                    <select
                      value={editTeamForm.role}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, role: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-ink dark:text-white font-bold"
                    >
                      <option value="sales">Sales Agent</option>
                      <option value="marketing">Marketing Specialist</option>
                      <option value="support">Customer Support</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={editTeamForm.status}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-ink dark:text-white font-bold"
                    >
                      <option value="ACTIVE">ACTIVE (On Duty)</option>
                      <option value="BLOCKED">BLOCKED (Access Suspended)</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={editTeamForm.department}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Base Salary (₹)</label>
                    <input
                      type="number"
                      value={editTeamForm.baseSalary}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, baseSalary: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Incentive / Scanner (₹)</label>
                    <input
                      type="number"
                      value={editTeamForm.incentivePerScanner}
                      onChange={(e) => setEditTeamForm({
                        ...editTeamForm,
                        incentivePerScanner: Number(e.target.value),
                        salaryOrCommissionRate: Number(e.target.value)
                      })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-mono font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target</label>
                    <input
                      type="number"
                      value={editTeamForm.monthlyTarget}
                      onChange={(e) => setEditTeamForm({ ...editTeamForm, monthlyTarget: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-brand-600 dark:text-cyan-400" />
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-brand-700 dark:text-cyan-300">
                    2. Bank Details & Commission Payout
                  </h4>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={editTeamForm.bankDetails.bankName}
                        onChange={(e) => setEditTeamForm({
                          ...editTeamForm,
                          bankDetails: { ...editTeamForm.bankDetails, bankName: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={editTeamForm.bankDetails.accountHolderName}
                        onChange={(e) => setEditTeamForm({
                          ...editTeamForm,
                          bankDetails: { ...editTeamForm.bankDetails, accountHolderName: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={editTeamForm.bankDetails.accountNumber}
                        onChange={(e) => setEditTeamForm({
                          ...editTeamForm,
                          bankDetails: { ...editTeamForm.bankDetails, accountNumber: e.target.value }
                        })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={editTeamForm.bankDetails.ifscCode}
                        onChange={(e) => setEditTeamForm({
                          ...editTeamForm,
                          bankDetails: { ...editTeamForm.bankDetails, ifscCode: e.target.value.toUpperCase() }
                        })}
                        className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono uppercase text-ink dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={editTeamForm.bankDetails.upiId}
                      onChange={(e) => setEditTeamForm({
                        ...editTeamForm,
                        bankDetails: { ...editTeamForm.bankDetails, upiId: e.target.value }
                      })}
                      className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setEditTeamModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK UPDATE SALARY & INCENTIVE ================= */}
      {salaryIncentiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12141e] p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 grid place-items-center">
                  <IndianRupee className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Salary & Incentive Settings</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure payroll structure for {salaryIncentiveModal.name}</p>
                </div>
              </div>
              <button onClick={() => setSalaryIncentiveModal(null)} className="p-1.5 text-slate-400 hover:text-ink font-bold rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSalaryIncentive} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Monthly Salary (फिक्स मासिक वेतन - ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    value={salaryIncentiveForm.baseSalary}
                    onChange={(e) => setSalaryIncentiveForm({ ...salaryIncentiveForm, baseSalary: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-ink dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incentive Per Scanner (प्रति स्कैनर इंसेंटिव - ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-500">₹</span>
                  <input
                    type="number"
                    required
                    value={salaryIncentiveForm.incentivePerScanner}
                    onChange={(e) => setSalaryIncentiveForm({ ...salaryIncentiveForm, incentivePerScanner: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Staff member earns this extra incentive on each activated vehicle sticker.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Target Quota (मासिक लक्ष्य - Stickers)
                </label>
                <input
                  type="number"
                  required
                  value={salaryIncentiveForm.monthlyTarget}
                  onChange={(e) => setSalaryIncentiveForm({ ...salaryIncentiveForm, monthlyTarget: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-ink dark:text-white font-mono font-bold"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setSalaryIncentiveModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 font-bold shadow-md shadow-brand-500/20"
                >
                  Save Salary & Incentive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW STAFF WORKING DOSSIER (EYE BUTTON) ================= */}
      {viewStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#12141e] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Staff Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#1f2333] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border-2 border-brand-500 text-brand-700 dark:text-cyan-400 font-extrabold grid place-items-center text-lg shadow-sm">
                  {viewStaffModal.member?.name?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-ink">{viewStaffModal.member?.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                      {viewStaffModal.member?.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-mono">+91 {viewStaffModal.member?.phone}</span>
                    <span>•</span>
                    <span>{viewStaffModal.member?.department || 'Field Sales'}</span>
                    <span>•</span>
                    <StatusBadge status={viewStaffModal.member?.status || 'ACTIVE'} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct Block / Unblock Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleTeamStatus(viewStaffModal.member._id, viewStaffModal.member.status || 'ACTIVE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${viewStaffModal.member?.status === 'BLOCKED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'
                    }`}
                >
                  {viewStaffModal.member?.status === 'BLOCKED' ? (
                    <>
                      <CheckCircle className="size-3.5" />
                      <span>Unblock Staff</span>
                    </>
                  ) : (
                    <>
                      <Ban className="size-3.5" />
                      <span>Block Staff</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setViewStaffModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-ink text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Performance KPIs Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Total Users Onboarded
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-display font-extrabold text-brand-600 dark:text-cyan-400">
                    {viewStaffModal.totalSales || viewStaffModal.onboardedUsers?.length || 0}
                  </span>
                  <span className="text-xs text-slate-500">vehicle owners</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Commission Earned
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{(viewStaffModal.totalCommission || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">(@ ₹{viewStaffModal.member?.salaryOrCommissionRate || 100}/user)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Target Progress
                  </span>
                  <span className="text-xs font-bold text-ink">{viewStaffModal.targetProgressPercent || 0}%</span>
                </div>
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 dark:bg-cyan-500 h-full rounded-full transition-all"
                    style={{ width: `${viewStaffModal.targetProgressPercent || 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Target: {viewStaffModal.monthlyTarget || 50} stickers / month
                </span>
              </div>
            </div>

            {/* ================= MONTH-WISE SALARY & PAYOUT MANAGEMENT ================= */}
            {(() => {
              const months = (viewStaffModal.monthsBreakdown && viewStaffModal.monthsBreakdown.length > 0)
                ? viewStaffModal.monthsBreakdown
                : [{
                  month: new Date().getMonth(),
                  year: new Date().getFullYear(),
                  monthLabel: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
                  baseSalary: viewStaffModal.member?.baseSalary || 15000,
                  scannersSold: viewStaffModal.totalSales || 0,
                  incentiveRate: viewStaffModal.member?.incentivePerScanner || 100,
                  incentiveAmount: (viewStaffModal.totalSales || 0) * (viewStaffModal.member?.incentivePerScanner || 100),
                  totalPayable: (viewStaffModal.member?.baseSalary || 15000) + ((viewStaffModal.totalSales || 0) * (viewStaffModal.member?.incentivePerScanner || 100)),
                  amountPaid: 0,
                  status: 'PENDING',
                  paymentRecord: null
                }];

              const activeMonth = months[selectedSalaryMonthIdx] || months[0];
              const isMonthPaid = activeMonth.status === 'PAID';

              return (
                <div className="space-y-4 rounded-3xl bg-slate-50/80 dark:bg-[#131622] p-5 sm:p-6 border border-slate-200/90 dark:border-[#22253a]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#1f2333] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-cyan-400 grid place-items-center font-bold shadow-sm">
                        <IndianRupee className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-ink">
                          Month-Wise Salary & Payouts (महीनेवार वेतन स्थिति)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Select a month to check salary breakdown, update payment status, or record payouts
                        </p>
                      </div>
                    </div>

                    {/* Quick Button to update base salary / incentive structure */}
                    <button
                      type="button"
                      onClick={() => handleOpenSalaryIncentive(viewStaffModal.member)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-brand-600 dark:text-cyan-400 bg-white dark:bg-[#1a1d2e] border border-slate-200 dark:border-[#2a2e45] hover:bg-slate-50 dark:hover:bg-[#202438] transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                    >
                      <IndianRupee className="size-3.5" />
                      <span>Edit Base & Incentive Rates</span>
                    </button>
                  </div>

                  {/* Horizontal Month Selector Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    {months.map((mItem, idx) => {
                      const isSelected = selectedSalaryMonthIdx === idx;
                      const paid = mItem.status === 'PAID';
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSalaryMonthIdx(idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${isSelected
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500/20'
                              : 'bg-white dark:bg-[#181a29] border border-slate-200 dark:border-[#22253a] text-slate-700 dark:text-slate-300 hover:border-brand-300'
                            }`}
                        >
                          <Calendar className="size-3.5 opacity-80" />
                          <span>{mItem.monthLabel}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold tracking-wider ${paid
                                ? isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800'
                                : isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800'
                              }`}
                          >
                            {paid ? 'PAID' : 'PENDING'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Month Details Card */}
                  <div className="rounded-2xl bg-white dark:bg-[#161826] p-4 sm:p-5 border border-slate-200/80 dark:border-[#22253a] space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1f2333] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Calculation for:
                          </span>
                          <strong className="text-sm font-extrabold text-ink">
                            {activeMonth.monthLabel}
                          </strong>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Formula: Base Salary + (Scanners Sold × Incentive Rate)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 ${isMonthPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            }`}
                        >
                          {isMonthPaid ? <CheckCircle className="size-3.5" /> : <Clock className="size-3.5" />}
                          <span>{isMonthPaid ? 'PAID (वेतन भुगतान हो गया)' : 'PENDING (भुगतान बाकी है)'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Breakdown 4-Stat Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12141f] border border-slate-200/60 dark:border-[#1e2133]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Base Salary</span>
                        <strong className="text-sm font-mono font-extrabold text-ink block mt-1">
                          ₹{(activeMonth.baseSalary || 15000).toLocaleString('en-IN')}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Fixed Monthly</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12141f] border border-slate-200/60 dark:border-[#1e2133]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Scanners Sold</span>
                        <strong className="text-sm font-mono font-extrabold text-ink block mt-1">
                          {activeMonth.scannersSold || 0} stickers
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Activated this month</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12141f] border border-slate-200/60 dark:border-[#1e2133]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Incentive Rate</span>
                        <strong className="text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
                          ₹{activeMonth.incentiveRate || 100} / unit
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Per sticker commission</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#12141f] border border-slate-200/60 dark:border-[#1e2133]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Incentive Total</span>
                        <strong className="text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
                          ₹{(activeMonth.incentiveAmount || 0).toLocaleString('en-IN')}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Earned from sales</span>
                      </div>
                    </div>

                    {/* Total Net Payable & Payment Action Banner */}
                    <div
                      className={`p-4 rounded-2xl border transition ${isMonthPaid
                          ? 'bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-white dark:from-emerald-950/30 dark:via-[#161826] dark:to-[#161826] border-emerald-200/90 dark:border-emerald-900/60'
                          : 'bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-white dark:from-amber-950/30 dark:via-[#161826] dark:to-[#161826] border-amber-200/90 dark:border-amber-900/60'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                            Total Net Salary Payable (कुल देय वेतन)
                          </span>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
                              ₹{(activeMonth.totalPayable || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              (Base ₹{(activeMonth.baseSalary || 15000).toLocaleString('en-IN')} + Inc ₹{(activeMonth.incentiveAmount || 0).toLocaleString('en-IN')})
                            </span>
                          </div>

                          {isMonthPaid && activeMonth.paymentRecord && (
                            <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="font-semibold">
                                  Mode: <strong className="text-ink uppercase">{activeMonth.paymentRecord.paymentMode || 'UPI'}</strong>
                                </span>
                                <span>•</span>
                                <span className="font-mono text-[11px]">
                                  Txn ID: <strong className="text-ink">{activeMonth.paymentRecord.transactionReference || 'N/A'}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Paid: {activeMonth.paymentRecord.paidAt ? new Date(activeMonth.paymentRecord.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Confirmed'}
                                </span>
                              </div>
                              {activeMonth.paymentRecord.notes && (
                                <p className="text-[11px] text-slate-500 italic">
                                  Note: {activeMonth.paymentRecord.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isMonthPaid ? (
                            <button
                              type="button"
                              onClick={() => handleTogglePendingSalary(activeMonth)}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition"
                              title="Revert status back to PENDING"
                            >
                              Revert to PENDING
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenPaySalaryModal(activeMonth)}
                              className="btn-primary !py-2.5 !px-5 text-xs font-bold shadow-md shadow-brand-500/25 flex items-center gap-2"
                            >
                              <CreditCard className="size-4" />
                              <span>💳 Pay Salary Now (वेतन का भुगतान करें)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Month-Wise Salary Transaction History Table */}
                  <div className="rounded-2xl bg-white dark:bg-[#161826] p-4 sm:p-5 border border-slate-200/80 dark:border-[#22253a] space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Salary Payout Transaction History (वेतन भुगतान इतिहास)
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {(viewStaffModal.salaryPayments || []).length} past payout records
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-[#12141f] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200/70 dark:border-[#1e2133]">
                          <tr>
                            <th className="py-2.5 px-3">Month & Year</th>
                            <th className="py-2.5 px-3">Base (₹)</th>
                            <th className="py-2.5 px-3">Incentive (₹)</th>
                            <th className="py-2.5 px-3">Total Paid (₹)</th>
                            <th className="py-2.5 px-3">Payment Mode</th>
                            <th className="py-2.5 px-3">Txn Reference</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Paid Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                          {(viewStaffModal.salaryPayments || []).map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-[#12141f] transition">
                              <td className="py-2.5 px-3 font-bold text-ink">
                                {p.monthLabel || `${p.month + 1}/${p.year}`}
                              </td>
                              <td className="py-2.5 px-3 font-mono">
                                ₹{(p.baseSalary || 15000).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                                ₹{(p.incentiveAmount || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-extrabold text-brand-600 dark:text-cyan-400">
                                ₹{(p.amountPaid || p.totalPayable || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {p.paymentMode || 'UPI'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-[140px]" title={p.transactionReference}>
                                {p.transactionReference || 'N/A'}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200 dark:border-emerald-800">
                                  <Check className="size-3" />
                                  <span>{p.paymentStatus || 'PAID'}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[11px]">
                                {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recorded'}
                              </td>
                            </tr>
                          ))}
                          {(!viewStaffModal.salaryPayments || viewStaffModal.salaryPayments.length === 0) && (
                            <tr>
                              <td colSpan="8" className="py-5 text-center text-slate-400 text-xs italic">
                                No prior salary transactions recorded yet for this staff member.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bank & UPI Payment Details Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-slate-50 to-slate-50 dark:from-amber-950/20 dark:via-[#161826] dark:to-[#161826] border border-amber-200/70 dark:border-amber-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Official Bank Account & Payout Details
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                  {viewStaffModal.bankDetails?.bankName ? 'Bank Account Linked' : 'Bank Info Pending'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#10121a] border border-slate-200/70 dark:border-[#1f2333]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Name</span>
                  <strong className="text-ink font-bold block mt-0.5">
                    {viewStaffModal.bankDetails?.bankName || 'Not Provided'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#10121a] border border-slate-200/70 dark:border-[#1f2333]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Account Number</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <strong className="font-mono text-ink font-bold">
                      {viewStaffModal.bankDetails?.accountNumber || 'Not Provided'}
                    </strong>
                    {viewStaffModal.bankDetails?.accountNumber && (
                      <button
                        type="button"
                        onClick={() => handleCopy(viewStaffModal.bankDetails.accountNumber, 'acc')}
                        className="text-slate-400 hover:text-brand-600"
                        title="Copy Account Number"
                      >
                        {copiedText === 'acc' ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#10121a] border border-slate-200/70 dark:border-[#1f2333]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">IFSC Code</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <strong className="font-mono text-ink font-bold">
                      {viewStaffModal.bankDetails?.ifscCode || 'Not Provided'}
                    </strong>
                    {viewStaffModal.bankDetails?.ifscCode && (
                      <button
                        type="button"
                        onClick={() => handleCopy(viewStaffModal.bankDetails.ifscCode, 'ifsc')}
                        className="text-slate-400 hover:text-brand-600"
                        title="Copy IFSC Code"
                      >
                        {copiedText === 'ifsc' ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-[#10121a] border border-slate-200/70 dark:border-[#1f2333]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">UPI ID</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <strong className="font-mono text-brand-600 dark:text-cyan-400 font-bold truncate">
                      {viewStaffModal.bankDetails?.upiId || 'Not Provided'}
                    </strong>
                    {viewStaffModal.bankDetails?.upiId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(viewStaffModal.bankDetails.upiId, 'upi')}
                        className="text-slate-400 hover:text-brand-600"
                        title="Copy UPI ID"
                      >
                        {copiedText === 'upi' ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* "Kitna Sale Kiya, Kab Kitna Kiya" - Customer Sales History Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-emerald-600" />
                    <span>Customer Sales History (Kitna Sale Kiya, Kab Kiya)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Itemized list of all vehicles and users onboarded by {viewStaffModal.member?.name}
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customer, vehicle..."
                    value={staffSalesSearch}
                    onChange={(e) => setStaffSalesSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-8 pr-3 py-1.5 text-xs text-ink dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-[#1f2333] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#161826] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-[#22253a]">
                      <tr>
                        <th className="py-2.5 px-4">#</th>
                        <th className="py-2.5 px-4">Customer Name & Phone</th>
                        <th className="py-2.5 px-4">Vehicle Registered</th>
                        <th className="py-2.5 px-4">Date & Time</th>
                        <th className="py-2.5 px-4">Commission</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
                      {(viewStaffModal.onboardedUsers || [])
                        .filter(u => {
                          const q = staffSalesSearch.toLowerCase();
                          return (
                            !staffSalesSearch ||
                            (u.name && u.name.toLowerCase().includes(q)) ||
                            (u.phone && u.phone.includes(q)) ||
                            (u.primaryVehicle?.registrationNumber && u.primaryVehicle.registrationNumber.toLowerCase().includes(q))
                          );
                        })
                        .map((cust, idx) => (
                          <tr key={cust._id || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                            <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="py-2.5 px-4">
                              <span className="font-bold text-ink block">{cust.name}</span>
                              <span className="font-mono text-[11px] text-slate-400">+91 {cust.phone}</span>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <PlateBadge value={cust.primaryVehicle?.registrationNumber || cust.primaryVehicle?.vehicleNumber || 'MH 19 BJ 4421'} size="sm" />
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  ({cust.primaryVehicle?.vehicleType || 'Vehicle'})
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              {cust.createdAt ? new Date(cust.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Recent'}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                +₹{cust.commission || viewStaffModal.member?.salaryOrCommissionRate || 100}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <StatusBadge status={cust.status || 'ACTIVE'} />
                            </td>
                          </tr>
                        ))}
                      {(!viewStaffModal.onboardedUsers || viewStaffModal.onboardedUsers.length === 0) && (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-slate-400 text-xs italic">
                            No vehicles or customers onboarded yet by this staff member.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Daily Work Reports / Logs */}
            {viewStaffModal.workReports?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1f2333]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-blue-500" />
                  <span>Field Work Reports & Activity Logs</span>
                </h4>
                <div className="space-y-2">
                  {viewStaffModal.workReports.map((report, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161826] border border-slate-200/70 dark:border-[#22253a] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-ink font-mono">{report.date}</span>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                          <span>{report.hoursWorked} hrs worked</span>
                          <span>•</span>
                          <span>{report.leadsVisited} leads visited</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs">{report.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-[#1f2333]">
              <button
                type="button"
                onClick={() => setViewStaffModal(null)}
                className="btn-secondary !py-2 !px-6 text-xs font-bold"
              >
                Close Working Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD SALARY PAYMENT ================= */}
      {paySalaryModalOpen && viewStaffModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/70 dark:bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#12141e] p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 grid place-items-center">
                  <CreditCard className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-ink">Pay Salary (वेतन भुगतान)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Record payout for {viewStaffModal.member?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaySalaryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Staff & Payment Target Summary */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <strong className="text-ink">{viewStaffModal.member?.name} (+91 {viewStaffModal.member?.phone})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Month:</span>
                <strong className="text-brand-600 dark:text-cyan-400 font-bold">
                  {viewStaffModal.monthsBreakdown?.[selectedSalaryMonthIdx]?.monthLabel || 'Current Month'}
                </strong>
              </div>
              {viewStaffModal.bankDetails?.upiId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">UPI ID:</span>
                  <span className="font-mono text-ink font-semibold">{viewStaffModal.bankDetails.upiId}</span>
                </div>
              )}
              {viewStaffModal.bankDetails?.bankName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank & A/C:</span>
                  <span className="font-mono text-ink font-semibold">
                    {viewStaffModal.bankDetails.bankName} •••• {viewStaffModal.bankDetails.accountNumber?.slice(-4)}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmPaySalary} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Pay (रुपये) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={paySalaryForm.amountPaid}
                    onChange={(e) => setPaySalaryForm({ ...paySalaryForm, amountPaid: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] pl-7 pr-3 py-2 font-mono font-bold text-ink dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode *
                </label>
                <select
                  value={paySalaryForm.paymentMode}
                  onChange={(e) => setPaySalaryForm({ ...paySalaryForm, paymentMode: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white font-medium"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS / RTGS)</option>
                  <option value="CASH">Cash in Hand</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference / UTR Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-99210982-HDFC or IMPS4928"
                  value={paySalaryForm.transactionReference}
                  onChange={(e) => setPaySalaryForm({ ...paySalaryForm, transactionReference: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 font-mono text-ink dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Note (वैकल्पिक टिप्पणी)
                </label>
                <input
                  type="text"
                  placeholder="e.g. October monthly salary paid via HDFC UPI"
                  value={paySalaryForm.notes}
                  onChange={(e) => setPaySalaryForm({ ...paySalaryForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3 py-2 text-ink dark:text-white"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-[#1f2333]">
                <button
                  type="button"
                  onClick={() => setPaySalaryModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payingSalaryLoading}
                  className="btn-primary flex-1 font-bold flex items-center justify-center gap-1.5"
                >
                  {payingSalaryLoading ? (
                    <span>Recording...</span>
                  ) : (
                    <>
                      <Check className="size-4" />
                      <span>Confirm & Mark as PAID</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BULK PRINT STICKERS SHEET (PDF EXPORT) ================= */}
      {showGenPrintModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-ink/75 dark:bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-4">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1f2333] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center">
                    <Printer className="size-4" />
                  </div>
                  <h3 className="font-bold text-lg text-ink dark:text-white">
                    Printable QR Stickers Sheet (PDF Export)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {generatedStickersList.length} stickers ready. Click below to download PDF or print directly on sticker sheets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSheet(generatedStickersList)}
                  className="btn-primary !bg-amber-500 hover:!bg-amber-600 !text-slate-950 font-bold text-xs py-2 px-4 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <FileText className="size-4" />
                  <span>📄 Download PDF / Print Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenPrintModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-ink text-sm font-bold border border-slate-200 dark:border-[#1f2333]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Instruction banner */}
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
              <span>💡 <strong>Tip for PDF:</strong> In the print popup, select <strong>"Destination: Save as PDF"</strong> to save this sheet as a PDF file on your computer.</span>
            </div>

            {/* Scrollable Preview Grid of Physical Sticker Cards */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedStickersList.map((s) => {
                const qrImg = s.qrImageBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(s.qrUrl || `${window.location.origin}/scan/${s.tagCode}`)}`;
                return (
                  <div key={s._id || s.tagCode} className="w-full bg-white rounded-2xl border-2 border-slate-900 shadow-md overflow-hidden flex flex-col text-slate-900 font-sans">
                    <div className="p-3.5 flex flex-col justify-between space-y-1.5 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black tracking-tight font-display text-slate-950">
                          GADIRAKSHA<span className="text-amber-500">.IN</span>
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          SMART TAG
                        </span>
                      </div>
                      <h4 className="text-xs font-black leading-tight text-slate-950 font-display">
                        Scan the code <br />
                        <span className="underline decoration-amber-400 decoration-2 underline-offset-2">to contact the</span> vehicle owner.
                      </h4>
                    </div>

                    <div className="bg-amber-400 p-2.5 flex flex-col items-center space-y-1.5">
                      <div className="bg-white p-1.5 rounded-xl border-2 border-slate-900 shadow-sm w-full max-w-[170px] flex flex-col items-center">
                        <img src={qrImg} alt={s.tagCode} className="size-28 object-contain mx-auto" />
                        <div className="flex items-center justify-between w-full mt-1 px-1 border-t border-slate-100 pt-0.5">
                          <span className="text-[9px] font-bold text-slate-700">📶 NFC</span>
                          <span className="font-mono font-black text-xs tracking-wider text-slate-950">{s.tagCode}</span>
                        </div>
                      </div>
                      <p className="text-[8px] font-extrabold text-slate-950 text-center leading-tight">
                        Wrong Parking • Emergency Contact • Scan QR
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-[#1f2333]">
              <span className="text-xs text-slate-400 font-mono">Total {generatedStickersList.length} items</span>
              <button
                type="button"
                onClick={() => setShowGenPrintModal(false)}
                className="btn-secondary !py-2 !px-5 text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINT SINGLE STICKER (PDF / PRINT) ================= */}
      {showSinglePrintModal && singlePrintSticker && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-ink/75 dark:bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#12141e] p-6 shadow-2xl border border-slate-200 dark:border-[#1f2333] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1f2333] pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center">
                  <Printer className="size-4" />
                </div>
                <h3 className="font-bold text-base text-ink dark:text-white">
                  Physical Sticker ({singlePrintSticker.tagCode})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSinglePrintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Exact Physical Sticker Card Layout */}
            <div className="w-full bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden flex flex-col text-slate-900 font-sans mx-auto">
              <div className="p-4 flex flex-col justify-between space-y-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black tracking-tight font-display text-slate-950">
                    GADIRAKSHA<span className="text-amber-500">.IN</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    SMART TAG
                  </span>
                </div>
                <h3 className="text-sm font-black leading-snug tracking-tight text-slate-950 font-display">
                  Scan the code <br />
                  <span className="underline decoration-amber-400 decoration-2 underline-offset-2">to contact the</span> vehicle owner.
                </h3>
              </div>

              <div className="bg-amber-400 p-4 flex flex-col items-center space-y-2">
                <div className="bg-white p-2 rounded-xl border-2 border-slate-900 shadow-sm w-full max-w-[200px] flex flex-col items-center">
                  <img
                    src={singlePrintSticker.qrImageBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(singlePrintSticker.qrUrl || `${window.location.origin}/scan/${singlePrintSticker.tagCode}`)}`}
                    alt={singlePrintSticker.tagCode}
                    className="size-40 object-contain mx-auto"
                  />
                  <div className="flex items-center justify-between w-full mt-1 px-1 border-t border-slate-100 pt-1">
                    <span className="text-[10px] font-bold text-slate-700">📶 NFC</span>
                    <span className="font-mono font-black text-sm tracking-wider text-slate-950">{singlePrintSticker.tagCode}</span>
                  </div>
                </div>

                <div className="w-full text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-slate-950 text-xs">
                    <span title="Wrong Parking" className="p-1 rounded-full bg-white/70 font-bold">🚫</span>
                    <span title="Emergency / SOS" className="p-1 rounded-full bg-white/70 font-bold">🆘</span>
                    <span title="Caution / Towing" className="p-1 rounded-full bg-white/70 font-bold">⚠️</span>
                    <span title="Direct Call" className="p-1 rounded-full bg-white/70 font-bold">📞</span>
                  </div>
                  <p className="text-[9px] font-extrabold text-slate-950 leading-tight">
                    Wrong Parking • Emergency Contact • Scan QR
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handlePrintSheet([singlePrintSticker])}
                className="btn-primary !bg-amber-500 hover:!bg-amber-600 !text-slate-950 font-bold flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <FileText className="size-4" />
                <span>📄 Download PDF / Print</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const qrImg = singlePrintSticker.qrImageBase64 || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(singlePrintSticker.qrUrl || `${window.location.origin}/scan/${singlePrintSticker.tagCode}`)}`;
                  const a = document.createElement('a');
                  a.href = qrImg;
                  a.download = `${singlePrintSticker.tagCode}-GadiRaksha.png`;
                  a.click();
                }}
                className="btn-secondary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
              >
                <Download className="size-4" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
