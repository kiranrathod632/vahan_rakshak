import React, { useState } from 'react';
import { ShoppingBag, Check, Shield, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Purchase() {
  const [selectedPlan, setSelectedPlan] = useState('single');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

  const handleOrder = () => {
    setOrderSuccess(true);
    setTimeout(() => {
      navigate('/app/scanners');
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Official Smart Vehicle Safety Stickers</span>
        </div>
        <h1 className="text-3xl font-extrabold font-display text-ink">
          Order New GadiRaksha Stickers
        </h1>
        <p className="text-xs text-slate-500">
          Weatherproof, scratch-resistant QR stickers designed for Indian cars, bikes, and scooters.
        </p>
      </div>

      {orderSuccess ? (
        <div className="card p-8 text-center max-w-md mx-auto space-y-3 bg-emerald-50 border-emerald-200">
          <div className="grid size-12 place-items-center rounded-full bg-emerald-600 text-white mx-auto">
            <Check className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-emerald-950">Order Confirmed!</h2>
          <p className="text-xs text-emerald-800">
            Your QR safety sticker has been activated and added to your Scanners list. Redirecting...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plan 1: Single Sticker */}
          <div
            onClick={() => setSelectedPlan('single')}
            className={`card p-6 flex flex-col justify-between cursor-pointer border-2 transition ${
              selectedPlan === 'single' ? 'border-brand-600 ring-4 ring-brand-500/10' : 'border-slate-200 dark:border-[#1f2333]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-900/60">
                  Single Sticker
                </span>
                <span className="text-2xl font-black font-display text-ink">₹299 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/year</span></span>
              </div>

              <h3 className="mt-4 font-bold text-lg text-ink">1 Weatherproof QR Sticker</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Perfect for your daily car or motorcycle.
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>Masked phone calling & privacy guard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>3-4 Emergency Family contacts dispatched</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>Accident SOS with GPS location mapping</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>No-Parking & blocked pathway alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>PUC & Insurance renewal alerts</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleOrder}
              className={`mt-6 w-full ${selectedPlan === 'single' ? 'btn-primary' : 'btn-secondary'} text-xs font-bold`}
            >
              Order Single Sticker (₹299)
            </button>
          </div>

          {/* Plan 2: Family Pack */}
          <div
            onClick={() => setSelectedPlan('family')}
            className={`card p-6 flex flex-col justify-between cursor-pointer border-2 transition relative overflow-hidden ${
              selectedPlan === 'family' ? 'border-brand-600 ring-4 ring-brand-500/10' : 'border-slate-200 dark:border-[#1f2333]'
            }`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider py-1 px-4 rounded-bl-xl">
              Best Value
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/60">
                  Family 3-Pack
                </span>
                <span className="text-2xl font-black font-display text-ink">₹699 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/year</span></span>
              </div>

              <h3 className="mt-4 font-bold text-lg text-ink">3 Weatherproof QR Stickers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Protect 3 household vehicles (cars, scooters, bikes).
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>3 Individual pre-printed QR stickers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>All single plan safety features included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>Priority SMS & WhatsApp dispatch servers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" />
                  <span>Dedicated emergency support hotline</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleOrder}
              className={`mt-6 w-full ${selectedPlan === 'family' ? 'btn-primary' : 'btn-secondary'} text-xs font-bold`}
            >
              Order Family 3-Pack (₹699)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
