import React, { useState } from 'react';
import { ShoppingBag, Check, Shield, Zap, Sparkles, QrCode, Download, ExternalLink, ArrowRight, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Purchase() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState('single');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address?.fullAddress || '');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [orderError, setOrderError] = useState('');

  const handleOrder = async () => {
    setLoading(true);
    setOrderError('');
    try {
      const quantity = selectedPlan === 'single' ? 1 : 3;
      const res = await authFetch('/api/tags/buy', {
        method: 'POST',
        body: JSON.stringify({
          plan: selectedPlan === 'single' ? '1_YEAR_STANDARD' : 'FAMILY_PACK',
          quantity,
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleType,
          deliveryAddress,
          paymentMode
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrderData(data);
      } else {
        setOrderError(data.message || 'Failed to place order');
      }
    } catch (err) {
      setOrderError('Error placing order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-cyan-400 text-xs font-semibold border border-brand-200 dark:border-brand-900/60">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Official Smart Vehicle Safety Stickers</span>
        </div>
        <h1 className="text-3xl font-extrabold font-display text-ink dark:text-white">
          Order New GadiRaksha Stickers
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Weatherproof, scratch-resistant QR stickers designed for Indian cars, bikes, and scooters.
        </p>
      </div>

      {orderData ? (
        <div className="card p-6 sm:p-8 max-w-2xl mx-auto space-y-6 border border-emerald-300 dark:border-emerald-800 shadow-xl bg-white dark:bg-[#12141e]">
          <div className="text-center space-y-2">
            <div className="grid size-14 place-items-center rounded-2xl bg-emerald-500 text-white mx-auto shadow-lg shadow-emerald-500/20 text-2xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold font-display text-ink dark:text-white">
              Order Confirmed & Scanners Generated!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transaction ID: <span className="font-mono font-bold text-brand-600 dark:text-cyan-400">{orderData.order?.transactionId}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161826] border border-slate-200/80 dark:border-[#22253a] flex flex-wrap justify-between items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
              <strong className="text-lg text-emerald-600 dark:text-emerald-400">₹{orderData.order?.totalAmount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Stickers Generated</span>
              <strong className="text-sm text-ink dark:text-white">{orderData.data?.length} Unique Scanners</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                <Truck className="size-3.5" /> Physical Dispatching
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-ink dark:text-white">Your Instant Digital Safety QR Codes:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orderData.data?.map((tag) => (
                <div key={tag._id} className="p-4 rounded-2xl border border-slate-200 dark:border-[#1f2333] bg-white dark:bg-[#0b0d14] flex flex-col items-center text-center space-y-3 shadow-sm">
                  {tag.qrImageBase64 ? (
                    <img src={tag.qrImageBase64} alt={tag.tagCode} className="size-36 rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-white" />
                  ) : (
                    <div className="size-36 rounded-xl bg-slate-100 dark:bg-[#161826] grid place-items-center font-mono font-bold">QR</div>
                  )}
                  <div>
                    <span className="font-mono font-black text-base text-ink dark:text-white tracking-widest">{tag.tagCode}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {tag.vehicleDetails?.vehicleNumber || 'Unassigned (Ready to link)'}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full pt-1">
                    {tag.qrImageBase64 && (
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tag.qrImageBase64;
                          link.download = `${tag.tagCode}-GadiRaksha-Sticker.png`;
                          link.click();
                        }}
                        className="btn-secondary flex-1 !py-1.5 text-xs flex items-center justify-center gap-1"
                      >
                        <Download className="size-3.5" />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      onClick={() => window.open(`/scan/${tag.tagCode}`, '_blank')}
                      className="btn-primary flex-1 !py-1.5 text-xs flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Test Scan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/app/scanners')}
              className="btn-primary flex-1 font-bold text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <span>View in My Scanners</span>
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => navigate('/app')}
              className="btn-secondary flex-1 font-bold text-xs py-2.5"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {orderError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/60 max-w-4xl mx-auto">
              {orderError}
            </div>
          )}

          {/* Pricing Plans Grid */}
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
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-cyan-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-900/60">
                    Single Sticker
                  </span>
                  <span className="text-2xl font-black font-display text-ink dark:text-white">₹299 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/year</span></span>
                </div>

                <h3 className="mt-4 font-bold text-lg text-ink dark:text-white">1 Weatherproof QR Sticker</h3>
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
                    <span>Instant Digital QR + Weatherproof Sticker by courier</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className={`mt-6 w-full ${selectedPlan === 'single' ? 'btn-primary' : 'btn-secondary'} text-xs font-bold`}
              >
                {selectedPlan === 'single' ? '✓ Plan Selected' : 'Select Single Plan (₹299)'}
              </button>
            </div>

            {/* Plan 2: Family 3-Pack */}
            <div
              onClick={() => setSelectedPlan('family')}
              className={`card p-6 flex flex-col justify-between cursor-pointer border-2 transition relative overflow-hidden ${
                selectedPlan === 'family' ? 'border-brand-600 ring-4 ring-brand-500/10' : 'border-slate-200 dark:border-[#1f2333]'
              }`}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider py-1 px-4 rounded-bl-xl">
                Best Value (Save ₹200)
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/60">
                    Family 3-Pack
                  </span>
                  <span className="text-2xl font-black font-display text-ink dark:text-white">₹699 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/year</span></span>
                </div>

                <h3 className="mt-4 font-bold text-lg text-ink dark:text-white">3 Weatherproof QR Stickers</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Protect 3 household vehicles (cars, scooters, bikes).
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600" />
                    <span>3 Individual pre-printed QR stickers generated</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600" />
                    <span>All single plan safety features included for all 3</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600" />
                    <span>Priority SMS & WhatsApp dispatch servers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600" />
                    <span>Doorstep physical stickers delivery</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className={`mt-6 w-full ${selectedPlan === 'family' ? 'btn-primary' : 'btn-secondary'} text-xs font-bold`}
              >
                {selectedPlan === 'family' ? '✓ Plan Selected' : 'Select Family 3-Pack (₹699)'}
              </button>
            </div>
          </div>

          {/* Checkout & Delivery Details Card */}
          <div className="card p-6 max-w-4xl mx-auto space-y-4 border border-slate-200 dark:border-[#1f2333]">
            <h3 className="font-bold text-base text-ink dark:text-white flex items-center gap-2">
              <Truck className="size-4.5 text-brand-600 dark:text-cyan-400" />
              <span>Vehicle & Delivery Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Vehicle Number Plate (Optional)
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. MH 19 AB 1234 (Or assign later)"
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-ink dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs font-semibold text-ink dark:text-white focus:outline-none"
                >
                  <option value="Car">Car / SUV</option>
                  <option value="Two-Wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
                  <option value="Auto-Rickshaw">Auto-Rickshaw</option>
                  <option value="Commercial/Truck">Commercial / Truck / Bus</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Sticker Delivery Address
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Flat No, Building, Street, City, Pincode"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs text-ink dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2.5 text-xs font-semibold text-ink dark:text-white focus:outline-none"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleOrder}
                  disabled={loading}
                  className="btn-primary w-full !py-2.5 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  <ShoppingBag className="size-4" />
                  <span>
                    {loading ? 'Generating Scanners...' : `Complete Order & Buy Now (${selectedPlan === 'single' ? '₹299' : '₹699'})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
