import React from 'react';

/**
 * Authentic Indian Vehicle Number Plate Badge
 * Matching the exact look from vehicle-qr-scanner.netlify.app
 */
export default function PlateBadge({ value = 'MH 19 AB 1234', size = 'md', className = '' }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  // Format plate string (e.g. MH19AB1234 -> MH 19 AB 1234)
  const formatPlate = (plate) => {
    if (!plate) return 'MH 00 XX 0000';
    const clean = plate.replace(/\s+/g, '').toUpperCase();
    if (clean.length === 10) {
      return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6)}`;
    }
    return clean;
  };

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-md border-2 border-slate-900 bg-white font-mono font-bold tracking-wider text-slate-900 shadow-sm ${
        isSmall
          ? 'h-6 text-[11px]'
          : isLarge
          ? 'h-10 text-base'
          : 'h-8 text-xs'
      } ${className}`}
      title="Indian Vehicle Registration Plate"
    >
      {/* IND Blue vertical strip on the left with Ashoka Chakra emblem */}
      <div
        className={`flex flex-col items-center justify-center bg-blue-700 font-sans text-white ${
          isSmall ? 'w-4 px-0.5 text-[6px]' : isLarge ? 'w-6 px-1 text-[8px]' : 'w-5 px-1 text-[7px]'
        }`}
      >
        <span className="leading-none text-yellow-300">●</span>
        <span className="font-extrabold tracking-tight">IND</span>
      </div>

      {/* License plate number */}
      <div className={`px-2 py-0.5 whitespace-nowrap font-mono font-black ${isLarge ? 'px-3' : 'px-2'}`}>
        {formatPlate(value)}
      </div>
    </div>
  );
}
