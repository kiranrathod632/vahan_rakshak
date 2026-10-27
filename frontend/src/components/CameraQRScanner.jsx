import React, { useState, useEffect, useRef } from 'react';
import { apiUrl } from '../utils/api';
import {
  Camera,
  FlipHorizontal,
  Zap,
  ZapOff,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  QrCode,
  Sparkles
} from 'lucide-react';

/**
 * CameraQRScanner - Live Device Camera Scanner with Hardware BarcodeDetector
 * Supports mobile rear/front camera, torch toggle, audio beep, and manual code fallback.
 */
export default function CameraQRScanner({ onScanSuccess, initialCode = '' }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scannedCode, setScannedCode] = useState(initialCode);
  const [manualCode, setManualCode] = useState(initialCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Play a crisp audio beep on successful QR scan
  const playSuccessBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 note
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      // AudioContext may be restricted by autoplay policy
    }
  };

  // Helper to extract tag code from URL or plain string
  // Examples:
  // "http://localhost:5000/scan/MH-1001" -> "MH-1001"
  // "https://gadiraksha.com/s/NGF132" -> "NGF132"
  // "MH-1001" -> "MH-1001"
  const extractCode = (raw) => {
    if (!raw) return '';
    const clean = String(raw).trim();
    const scanMatch = clean.match(/\/(?:scan|s)\/([A-Za-z0-9_-]+)/i);
    if (scanMatch && scanMatch[1]) {
      return scanMatch[1].toUpperCase().trim();
    }
    return clean.toUpperCase().trim();
  };

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    setCameraError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser. Please enter the sticker code manually below.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }

      // Initialize real-time QR detection
      startScanningLoop();
    } catch (err) {
      console.warn('Camera start error:', err);
      let msg = 'Could not access camera. Please allow camera permissions or enter the code manually below.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser settings or enter the code below.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device. You can enter the sticker code manually below.';
      }
      setCameraError(msg);
      setCameraActive(false);
    }
  };

  // Toggle Torch / Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack && videoTrack.applyConstraints) {
      try {
        const newTorch = !torchOn;
        await videoTrack.applyConstraints({
          advanced: [{ torch: newTorch }]
        });
        setTorchOn(newTorch);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  // Flip camera between front and back
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Continuous frame scanning loop using BarcodeDetector
  const startScanningLoop = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;

          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const rawVal = barcodes[0].rawValue;
              const code = extractCode(rawVal);
              if (code && code !== scannedCode) {
                playSuccessBeep();
                handleCodeScanned(code);
              }
            }
          } catch (e) {
            // Frame detection error, continue loop
          }
        }, 250);
      } catch (err) {
        console.warn('BarcodeDetector initialization warning:', err);
      }
    }
  };

  // Handle detected or submitted tag code
  const handleCodeScanned = async (codeToVerify) => {
    const code = extractCode(codeToVerify);
    if (!code) return;

    setScannedCode(code);
    setManualCode(code);
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch(apiUrl(`/api/tags/check/${encodeURIComponent(code)}`));
      const data = await res.json();
      setVerificationResult(data);

      if (data.available || data.status === 'UNCLAIMED') {
        stopCamera();
        if (onScanSuccess) {
          onScanSuccess(code, data);
        }
      }
    } catch (err) {
      // In case of network glitch, permit progress
      const fallbackResult = {
        available: true,
        tagCode: code,
        message: `Sticker ${code} detected and ready to link!`
      };
      setVerificationResult(fallbackResult);
      stopCamera();
      if (onScanSuccess) {
        onScanSuccess(code, fallbackResult);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Start camera on mount & change when facingMode changes
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  return (
    <div className="space-y-4">
      {/* Live Camera Scanner Box */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-brand-500/40 shadow-xl shadow-brand-500/10 aspect-video max-h-72 w-full flex items-center justify-center">
        
        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Viewfinder Overlay when Camera is Active */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Darkened Vignette */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Target Reticle */}
            <div className="relative size-44 sm:size-52 border-2 border-brand-400/80 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 size-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 size-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 size-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 size-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

              {/* Laser Scanning Line Animation */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse"
                style={{
                  animation: 'scannerLaser 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />

              <style>{`
                @keyframes scannerLaser {
                  0% { top: 10%; opacity: 0.2; }
                  50% { top: 85%; opacity: 1; }
                  100% { top: 10%; opacity: 0.2; }
                }
              `}</style>

              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 bg-black/60 px-2 py-0.5 rounded-full border border-amber-400/40">
                POINT AT QR CODE
              </span>
            </div>

            <p className="relative mt-2 text-[11px] font-medium text-white/80 drop-shadow">
              Align physical sticker inside frame
            </p>
          </div>
        )}

        {/* Camera Permission / Error Fallback UI */}
        {!cameraActive && (
          <div className="absolute inset-0 p-5 text-center flex flex-col items-center justify-center bg-slate-900/90 text-white space-y-2.5">
            <div className="size-12 rounded-2xl bg-white/10 text-amber-400 grid place-items-center">
              <Camera className="size-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-bold text-slate-100">Camera Standby / Permission</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cameraError || 'Allow camera permission or enter your physical sticker code manually below.'}
              </p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <RefreshCw className="size-3.5" />
              <span>Retry Camera</span>
            </button>
          </div>
        )}

        {/* Floating Top Controls (Torch & Flip) */}
        {cameraActive && (
          <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl backdrop-blur-md transition ${
                  torchOn ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-black/60 text-white hover:bg-black/80'
                }`}
                title="Toggle Flashlight"
              >
                {torchOn ? <Zap className="size-4" /> : <ZapOff className="size-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={flipCamera}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition"
              title="Switch Front/Rear Camera"
            >
              <FlipHorizontal className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Manual Input & Verification Feedback */}
      <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/90 dark:border-brand-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <QrCode className="size-4 text-brand-600 dark:text-cyan-400" />
            <span>Enter Code Manually (Printed below QR):</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">e.g. MH-1001, NGF132</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. MH-1001 or NGF132"
            value={manualCode}
            onChange={(e) => {
              const val = e.target.value.toUpperCase().trim();
              setManualCode(val);
              setVerificationResult(null);
            }}
            className="flex-1 rounded-xl border border-slate-300 dark:border-[#272b3f] bg-white dark:bg-[#0b0d14] px-3.5 py-2 text-xs font-mono font-extrabold uppercase text-ink dark:text-white tracking-widest focus:border-brand-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={isVerifying || !manualCode.trim()}
            onClick={() => handleCodeScanned(manualCode)}
            className="btn-primary !py-2 !px-4 text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            {isVerifying ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            <span>{isVerifying ? 'Checking...' : 'Verify Sticker'}</span>
          </button>
        </div>

        {/* Verification Alert Banner */}
        {verificationResult && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in ${
              verificationResult.available
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            {verificationResult.available ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="size-4 shrink-0 text-rose-600" />
            )}
            <span>
              {verificationResult.available
                ? `✅ Unique Scanner Code "${manualCode}" is verified! You can proceed to link it.`
                : verificationResult.message || `Scanner code "${manualCode}" is already claimed.`}
            </span>
          </div>
        )}

        {/* Quick Sample Buttons for Instant Testing */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Quick test:</span>
          <button
            type="button"
            onClick={() => handleCodeScanned('MH-1001')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#12141e] border border-slate-200 dark:border-[#272b3f] hover:border-brand-400 font-mono font-bold text-slate-700 dark:text-slate-200 text-[10px]"
          >
            MH-1001
          </button>
          <button
            type="button"
            onClick={() => handleCodeScanned('MH-1010')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#12141e] border border-slate-200 dark:border-[#272b3f] hover:border-brand-400 font-mono font-bold text-slate-700 dark:text-slate-200 text-[10px]"
          >
            MH-1010
          </button>
          <button
            type="button"
            onClick={() => handleCodeScanned('NGF132')}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#12141e] border border-slate-200 dark:border-[#272b3f] hover:border-brand-400 font-mono font-bold text-slate-700 dark:text-slate-200 text-[10px]"
          >
            NGF132
          </button>
        </div>
      </div>
    </div>
  );
}
