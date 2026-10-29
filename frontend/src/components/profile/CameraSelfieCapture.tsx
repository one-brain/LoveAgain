import React, { useState, useRef, useEffect } from 'react';
import {
  CameraIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface CameraSelfieCaptureProps {
  onSelfieCaptured: (file: File, previewUrl: string) => void;
  existingPreviewUrl?: string | null;
  onClear?: () => void;
}

export const CameraSelfieCapture: React.FC<CameraSelfieCaptureProps> = ({
  onSelfieCaptured,
  existingPreviewUrl,
  onClear,
}) => {
  const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
  const [isInitializing, setIsInitializing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingPreviewUrl || null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (existingPreviewUrl) {
      setPreviewUrl(existingPreviewUrl);
    }
  }, [existingPreviewUrl]);

  // Clean up video stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setIsInitializing(true);
    setMode('camera');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or environment. Please upload a selfie image file instead.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera initialization error:', err);
      let msg = 'Unable to access camera. Please allow camera permissions in your browser or upload a file.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please grant camera access in browser settings, or upload a photo file.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera found on this device. Please upload a selfie image file.';
      }
      setCameraError(msg);
      setMode('idle');
      stopCamera();
    } finally {
      setIsInitializing(false);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror image to match webcam orientation
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setMode('preview');
        stopCamera();
        onSelfieCaptured(file, url);
      },
      'image/jpeg',
      0.9
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setCameraError('Selfie image must be 5MB or smaller.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setCameraError('Please select a JPEG, PNG, or WebP photo.');
      return;
    }

    setCameraError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreviewUrl(url);
      setMode('preview');
      onSelfieCaptured(file, url);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    if (onClear) onClear();
    startCamera();
  };

  const handleReset = () => {
    stopCamera();
    setPreviewUrl(null);
    setMode('idle');
    setCameraError(null);
    if (onClear) onClear();
  };

  return (
    <div className="space-y-3">
      {cameraError && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2">
          <ExclamationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{cameraError}</div>
          <button
            type="button"
            onClick={() => setCameraError(null)}
            className="text-destructive/70 hover:text-destructive"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Mode 1: Active Camera Stream */}
      {mode === 'camera' && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-accent bg-black aspect-4/3 max-w-md mx-auto shadow-lg flex items-center justify-center">
          {isInitializing ? (
            <div className="flex flex-col items-center gap-2 text-white text-xs">
              <ArrowPathIcon className="w-6 h-6 animate-spin text-accent" />
              <span>Connecting to camera...</span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              {/* Oval face guide overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white/80 bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    Align your face here
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4 z-10">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <CameraIcon className="w-4 h-4" />
                  <span>Take Snapshot</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-semibold text-xs backdrop-blur-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode 2: Captured / Existing Preview */}
      {previewUrl && mode !== 'camera' && (
        <div className="rounded-2xl border border-border bg-card p-3 max-w-md mx-auto space-y-3">
          <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-border bg-muted/20">
            <img src={previewUrl} alt="Selfie preview" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>Selfie Ready</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-2 px-3 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 text-accent" />
              <span>Retake via Camera</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground transition-colors cursor-pointer"
              title="Upload different file"
            >
              <ArrowUpTrayIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 3: Idle / No Selfie Yet */}
      {!previewUrl && mode === 'idle' && (
        <div className="rounded-2xl border-2 border-dashed border-border hover:border-accent/60 bg-muted/10 hover:bg-muted/20 p-5 transition-all text-center space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent mx-auto flex items-center justify-center">
            <CameraIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Live Selfie Verification</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Take a quick live photo using your web camera, or upload a clear photo from your device.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={startCamera}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <CameraIcon className="w-4 h-4" />
              <span>Use Camera</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4 text-muted-foreground" />
              <span>Upload Photo File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
