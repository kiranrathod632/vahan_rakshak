import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import EmergencyAlertModal from './EmergencyAlertModal';

export default function AdminLayout() {
  const { user, token, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Verifying Administrator Access...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to dedicated admin login page
  if (!user && !token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0d14] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Live Socket.io Emergency Alert Popup Banner */}
      <EmergencyAlertModal />

      {/* Dedicated Admin Sidebar (No personal garage / documents / family contacts items) */}
      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
