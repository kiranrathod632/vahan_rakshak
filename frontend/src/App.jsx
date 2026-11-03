import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EmergencyAlertModal from './components/EmergencyAlertModal';

// Pages
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Scanners from './pages/Scanners';
import Documents from './pages/Documents';
import FamilyContacts from './pages/FamilyContacts';
import ScanHistory from './pages/ScanHistory';
import Emergencies from './pages/Emergencies';
import Notifications from './pages/Notifications';
import Purchase from './pages/Purchase';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PublicScan from './pages/PublicScan';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import SalesDashboard from './pages/SalesDashboard';
import Home from './pages/Home';
import ActivateWizard from './pages/ActivateWizard';

/**
 * Dedicated Website Domain Detector:
 * - Admin Website: Matches domains containing 'admin' (e.g. vahan-rakshak-admin-omega.vercel.app, admin.domain.com)
 * - Sales Website: Matches domains containing 'sales' (e.g. vahan-rakshak-sales-omega.vercel.app, sales.domain.com)
 * - User Website: Default (e.g. vahan-rakshak-omega.vercel.app, localhost)
 */
const getPortalMode = () => {
  if (typeof window === 'undefined') return 'default';
  const hostname = window.location.hostname.toLowerCase();

  // URL query parameter takes priority for testing on localhost: e.g. ?portal=admin or ?portal=sales
  const searchParams = new URLSearchParams(window.location.search);
  const portalParam = searchParams.get('portal');
  if (portalParam === 'admin') return 'admin';
  if (portalParam === 'sales') return 'sales';

  // Dedicated Admin Website Domain
  if (hostname.includes('admin')) {
    return 'admin';
  }

  // Dedicated Sales Staff Website Domain
  if (hostname.includes('sales')) {
    return 'sales';
  }

  return 'default';
};

/**
 * Main App Layout with Sidebar, Topbar Navbar, and Live Emergency Alert Banner
 */
function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Live Socket.io Emergency Alert Popup Banner */}
      <EmergencyAlertModal />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const portalMode = getPortalMode();

  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            {/* 
              ========================================================================
              1. DEDICATED ADMIN WEBSITE (https://vahan-rakshak-admin-omega.vercel.app)
              Only Admin Login & Master Control Center. Pure admin website.
              ========================================================================
            */}
            {portalMode === 'admin' && (
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}

            {/* 
              ========================================================================
              2. DEDICATED SALES WEBSITE (https://vahan-rakshak-sales-omega.vercel.app)
              Only Sales Staff Login & Field Portal. Pure sales website.
              ========================================================================
            */}
            {portalMode === 'sales' && (
              <Routes>
                <Route path="/" element={<SalesDashboard />} />
                <Route path="/sales" element={<SalesDashboard />} />
                <Route path="/sales/login" element={<SalesDashboard />} />
                <Route path="/login" element={<SalesDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}

            {/* 
              ========================================================================
              3. DEDICATED CUSTOMER & USER WEBSITE (https://vahan-rakshak-omega.vercel.app)
              Only Vehicle Owner features: Home, Register, User Login, Scan, Garage.
              No Admin or Sales links displayed!
              ========================================================================
            */}
            {portalMode === 'default' && (
              <Routes>
                {/* User Landing page */}
                <Route path="/" element={<Home />} />

                {/* Step-by-Step Signup & Pre-Printed Scanner Activation Wizard */}
                <Route path="/activate" element={<ActivateWizard />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/register" element={<Register />} />

                {/* Public Scan endpoints accessed by bystanders */}
                <Route path="/scan/:tagCode" element={<PublicScan />} />
                <Route path="/s/:tagCode" element={<PublicScan />} />

                {/* Customer Login (Clean - No Admin/Sales buttons) */}
                <Route path="/login" element={<Login />} />

                {/* Direct routes for sales/admin when testing on main domain */}
                <Route path="/sales" element={<SalesDashboard />} />
                <Route path="/sales/login" element={<SalesDashboard />} />
                <Route path="/team" element={<Navigate to="/sales" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />

                {/* ================= CUSTOMER USER GARAGE DASHBOARD ================= */}
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="vehicles" element={<Vehicles />} />
                  <Route path="scanners" element={<Scanners />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="family" element={<FamilyContacts />} />
                  <Route path="scan-history" element={<ScanHistory />} />
                  <Route path="emergencies" element={<Emergencies />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="purchase" element={<Purchase />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="admin" element={<Navigate to="/admin" replace />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
