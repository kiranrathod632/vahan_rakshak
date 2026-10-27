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
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
            {/* Landing page matching vehicle-qr-scanner.netlify.app */}
            <Route path="/" element={<Home />} />

            {/* Step-by-Step Signup & Pre-Printed Scanner Activation Wizard */}
            <Route path="/activate" element={<ActivateWizard />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/register" element={<Register />} />

            {/* Public Scan endpoints accessed by bystanders */}
            <Route path="/scan/:tagCode" element={<PublicScan />} />
            <Route path="/s/:tagCode" element={<PublicScan />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />

            {/* Sales Team Dedicated Portal */}
            <Route path="/sales" element={<SalesDashboard />} />
            <Route path="/sales/login" element={<SalesDashboard />} />
            <Route path="/team" element={<Navigate to="/sales" replace />} />

            {/* Dedicated Admin Portal Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Master Control Center (Isolated Admin Layout with dedicated AdminSidebar) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>

            {/* User Dashboard & Subpages */}
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
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}
