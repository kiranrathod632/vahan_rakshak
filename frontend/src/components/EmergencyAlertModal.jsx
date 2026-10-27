import React from 'react';
import { useSocket } from '../context/SocketContext';
import { AlertTriangle, ShieldAlert, X, MapPin, Phone, Users, ExternalLink } from 'lucide-react';
import PlateBadge from './PlateBadge';

export default function EmergencyAlertModal() {
  const { liveAlert, dismissAlert } = useSocket();

  if (!liveAlert) return null;

  const alertType = liveAlert.alertType || liveAlert.type || 'NO_PARKING';
  const isEmergency = alertType === 'ACCIDENT';
  const isTow = alertType === 'TOW_WARNING';
  const isLights = alertType === 'LIGHTS_ON';

  const badgeText = isEmergency
    ? 'SOS Emergency Alert'
    : (isTow ? 'Towing Crane Alert' : (isLights ? 'Lights / Tyre Alert' : 'No-Parking Alert'));

  const titleText = isEmergency
    ? 'Road Accident Reported!'
    : (isTow
      ? 'Vehicle Being Towed by Traffic Police!'
      : (isLights ? 'Headlights ON or Flat Tyre Reported' : 'Vehicle in No-Parking / Road Blocked'));

  return (
    <div className="fixed top-5 right-5 left-5 md:left-auto md:w-[440px] z-50 animate-bounce-once">
      <div
        className={`rounded-2xl p-5 shadow-2xl backdrop-blur border-2 ${
          isEmergency
            ? 'bg-rose-950/95 border-rose-500 text-white shadow-rose-900/50 pulse-sos'
            : (isTow
              ? 'bg-amber-950/95 border-red-500 text-white shadow-red-900/50'
              : 'bg-slate-900/95 border-amber-500 text-white shadow-amber-900/40')
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isEmergency
                  ? 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                  : 'bg-amber-600/30 text-amber-300 border-amber-500/50'
              }`}
            >
              {isEmergency ? (
                <ShieldAlert className="size-6 text-rose-400" />
              ) : (
                <AlertTriangle className="size-6 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    isEmergency ? 'bg-rose-500/30 text-rose-200' : 'bg-amber-500/30 text-amber-200'
                  }`}
                >
                  {badgeText}
                </span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <h3 className="text-base font-bold tracking-tight text-white mt-0.5">
                {titleText}
              </h3>
            </div>
          </div>
          <button
            onClick={dismissAlert}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Dismiss alert"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Vehicle & Demographics Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <PlateBadge value={liveAlert.vehicleNumber || liveAlert.tagCode} size="sm" />
            <span className="font-mono text-xs text-amber-400 font-bold">
              Tag: {liveAlert.tagCode || 'MH-1001'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Owner:</span>
              <strong className="text-white">{liveAlert.ownerName || 'Vehicle Owner'}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Blood Group:</span>
              <strong className="text-rose-400">{liveAlert.bloodGroup || 'B+'}</strong>
            </div>
          </div>

          {liveAlert.weight && (
            <div className="text-[11px] text-slate-400">
              Biometrics: <span className="text-slate-200 font-medium">{liveAlert.weight}kg, {liveAlert.height || '5.8ft'}</span>
            </div>
          )}

          {liveAlert.address && (
            <div className="flex items-start gap-1.5 text-slate-300 text-[11px]">
              <MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{liveAlert.address}</span>
            </div>
          )}

          {liveAlert.scannerNote && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-300 text-xs">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                Scanner / Reporter Note:
              </span>
              <p className="mt-0.5 font-semibold text-slate-100">"{liveAlert.scannerNote}"</p>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold pt-1">
            <Users className="size-3.5" />
            <span>
              {liveAlert.familyContactsNotified || 3} Family Contacts Dispatched (Call + SMS + WhatsApp)
            </span>
          </div>

          {liveAlert.location?.googleMapsUrl && (
            <div className="pt-1">
              <a
                href={liveAlert.location.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-xs font-semibold underline"
              >
                <MapPin className="size-3.5" /> View Incident Location on Google Maps
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={dismissAlert}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition text-center"
          >
            Acknowledge & Close
          </button>
          {liveAlert.directWhatsAppUrl && (
            <a
              href={liveAlert.directWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition text-center flex items-center gap-1"
            >
              <Phone className="size-3.5" /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
