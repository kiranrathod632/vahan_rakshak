import React from 'react';

export default function StatusBadge({ status = 'ACTIVE', label, size = 'sm' }) {
  const norm = (status || '').toUpperCase();

  let styles = 'bg-slate-100 dark:bg-[#1a1d2d] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#262a3e]';
  let dotColor = 'bg-slate-400';
  let defaultLabel = status;

  if (norm === 'ACTIVE' || norm === 'VALID' || norm === 'RESOLVED') {
    styles = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
    dotColor = 'bg-emerald-500';
    defaultLabel = norm === 'ACTIVE' ? 'Active' : norm === 'VALID' ? 'Valid' : 'Resolved';
  } else if (norm === 'EXPIRING' || norm === 'EXPIRING_SOON' || norm === 'UNCLAIMED' || norm === 'PENDING') {
    styles = 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60';
    dotColor = 'bg-amber-500';
    defaultLabel = norm === 'EXPIRING_SOON' || norm === 'EXPIRING' ? 'Expiring Soon' : norm === 'UNCLAIMED' ? 'Unclaimed' : 'Pending';
  } else if (norm === 'EXPIRED' || norm === 'INACTIVE' || norm === 'ACCIDENT' || norm === 'CRITICAL') {
    styles = 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60';
    dotColor = 'bg-rose-500';
    defaultLabel = norm === 'EXPIRED' ? 'Expired' : norm === 'INACTIVE' ? 'Inactive' : 'Accident SOS';
  } else if (norm === 'NO_PARKING') {
    styles = 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60';
    dotColor = 'bg-blue-500';
    defaultLabel = 'No-Parking';
  }

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        isSmall ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      } ${styles}`}
    >
      <span className={`size-1.5 rounded-full ${dotColor} ${norm === 'ACCIDENT' ? 'animate-ping' : ''}`} />
      <span>{label || defaultLabel}</span>
    </span>
  );
}
