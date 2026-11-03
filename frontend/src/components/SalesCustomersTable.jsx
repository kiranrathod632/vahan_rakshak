import React from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle2,
  Shield,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import PlateBadge from './PlateBadge';

export default function SalesCustomersTable({
  customers = [],
  filteredCustomers = [],
  activeCustomersCount = 0,
  pendingCustomersCount = 0,
  customerStatusFilter = 'ALL',
  setCustomerStatusFilter,
  vehicleFilter = 'ALL',
  setVehicleFilter,
  search = '',
  setSearch,
  loading = false,
  setShowAddCustomerModal,
  handleViewCustomer,
  handleOpenEditCustomer,
  handleToggleCustomerBlock,
  handleDeleteCustomer,
  isOverviewMode = false,
  onViewAll
}) {
  // If in overview mode, we can display up to 8 customers with a "View All" link
  const displayList = isOverviewMode ? filteredCustomers.slice(0, 8) : filteredCustomers;

  return (
    <div className="card p-5 sm:p-7 space-y-4 border border-slate-200/90 dark:border-[#1f2336] shadow-sm">
      
      {/* 
        ========================================================================
        1. HEADER & FILTER CONTROLS
        ========================================================================
      */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1e2235] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <Users className="size-4" />
            </span>
            <h3 className="font-display font-bold text-base sm:text-lg text-ink dark:text-white">
              My Registered Customers & QR Scanners Directory
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Vehicle owners onboarded directly through your field account with pre-printed QR stickers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOverviewMode && onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 mr-2"
            >
              <span>View Full Directory ({customers.length})</span>
              <ChevronRight className="size-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddCustomerModal(true)}
            className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>+ Onboard New Customer</span>
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        2. STATUS PILLS & SEARCH BAR
        ========================================================================
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#161826] border border-slate-200 dark:border-[#22253a] self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setCustomerStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              customerStatusFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            All Users ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setCustomerStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              customerStatusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            Active ({activeCustomersCount})
          </button>
          <button
            type="button"
            onClick={() => setCustomerStatusFilter('BLOCKED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              customerStatusFilter === 'BLOCKED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            Blocked / Pending ({pendingCustomersCount})
          </button>
        </div>

        {/* Filter by Vehicle Type & Search Input */}
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

      {/* 
        ========================================================================
        3. DATA TABLE
        ========================================================================
      */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading customer records...
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 grid place-items-center mx-auto">
            <Users className="size-6" />
          </div>
          <h4 className="font-bold text-ink dark:text-white text-sm">No customers found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or click "+ Onboard New Customer" to register a driver on the spot.
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
                <th className="py-3 px-4">QR Sticker Tag</th>
                <th className="py-3 px-3">Blood Group</th>
                <th className="py-3 px-3">Registered Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1f2333] text-slate-700 dark:text-slate-200">
              {displayList.map((c, idx) => {
                const isBlocked = c.status === 'BLOCKED' || c.status === 'INACTIVE' || c.isActive === false;

                return (
                  <tr key={c._id || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#161826] transition">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                    
                    <td className="py-3 px-4 font-bold text-ink dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold grid place-items-center text-xs uppercase shrink-0">
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
                      <span className="font-semibold block">{c.vehicleModel}</span>
                      <span className="text-[10px] text-slate-400">{c.vehicleType} • {c.vehicleColor}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-xs bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        {c.tagCode}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        {c.bloodGroup || 'B+'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {c.onboardedAt ? new Date(c.onboardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isBlocked
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Eye Button: Full Dossier */}
                        <button
                          type="button"
                          onClick={() => handleViewCustomer(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
                          title="View Emergency Safety Dossier"
                        >
                          <Eye className="size-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditCustomer(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                          title="Edit Customer Profile"
                        >
                          <Edit className="size-4" />
                        </button>

                        {/* Block/Unblock Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleCustomerBlock(c._id, c.status)}
                          className={`p-1.5 rounded-lg transition ${
                            isBlocked
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          }`}
                          title={isBlocked ? "Unblock Customer" : "Block Customer"}
                        >
                          <Ban className="size-4" />
                        </button>

                        {/* Delete Customer */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(c._id, c.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete Customer & Release Tag"
                        >
                          <Trash2 className="size-4" />
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

      {/* Overview Footer */}
      {isOverviewMode && filteredCustomers.length > 8 && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1.5"
          >
            <span>Showing 8 of {filteredCustomers.length} registered customers • Click to view all</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
