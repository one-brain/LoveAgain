import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Card,
  Badge,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components';
import {
  Camera20Regular,
  ArrowSync20Regular,
  CheckmarkCircle16Regular,
  ArrowUpload20Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';

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
        throw new Error(
          'Camera access is not supported by your browser or environment. Please upload a selfie image file instead.'
        );
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
      let msg =
        'Unable to access camera. Please allow camera permissions in your browser or upload a file.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg =
          'Camera permission denied. Please grant camera access in browser settings, or upload a photo file.';
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
        <MessageBar intent="error">
          <MessageBarBody className="flex items-center justify-between gap-2">
            <span>{cameraError}</span>
            <Button
              appearance="transparent"
              size="small"
              icon={<Dismiss16Regular />}
              onClick={() => setCameraError(null)}
              aria-label="Dismiss camera error"
            />
          </MessageBarBody>
        </MessageBar>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="hidden"
        onChange={handleFileSelect}
      />

      {mode === 'camera' && (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-primary aspect-4/3 max-w-md mx-auto shadow-md flex items-center justify-center">
          {isInitializing ? (
            <div className="flex flex-col items-center gap-2 text-primary-foreground text-caption1">
              <Spinner size="small" />
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
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-primary-foreground/70 flex items-center justify-center">
                  <span className="text-caption1 font-semibold text-primary-foreground bg-primary/70 px-2.5 py-0.5 rounded-md">
                    Align your face here
                  </span>
                </div>
              </div>

              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4 z-10">
                <Button
                  appearance="primary"
                  icon={<Camera20Regular />}
                  onClick={captureSnapshot}
                  className="min-h-11"
                >
                  Capture
                </Button>
                <Button
                  appearance="secondary"
                  onClick={handleReset}
                  className="min-h-11"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {previewUrl && mode !== 'camera' && (
        <Card className="rounded-2xl border border-border bg-card p-3 max-w-md mx-auto space-y-3 shadow-sm">
          <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-border bg-muted">
            <img src={previewUrl} alt="Selfie preview" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2">
              <Badge appearance="filled" color="success" icon={<CheckmarkCircle16Regular />}>
                Selfie ready
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              appearance="outline"
              icon={<ArrowSync20Regular />}
              onClick={handleRetake}
              className="flex-1 min-h-11"
            >
              Retake
            </Button>
            <Button
              appearance="subtle"
              icon={<ArrowUpload20Regular />}
              onClick={() => fileInputRef.current?.click()}
              title="Upload different file"
              aria-label="Upload different file"
              className="min-h-11"
            />
          </div>
        </Card>
      )}

      {!previewUrl && mode === 'idle' && (
        <Card className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center space-y-3 max-w-md mx-auto shadow-none">
          <div className="w-10 h-10 rounded-lg bg-accent-light text-brand-fg mx-auto flex items-center justify-center">
            <Camera20Regular />
          </div>
          <div>
            <h4 className="text-body1 font-semibold text-foreground">Live selfie verification</h4>
            <p className="text-caption1 text-muted-foreground mt-0.5">
              Take a quick live photo using your camera, or upload a clear photo from your device.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <Button
              appearance="primary"
              icon={<Camera20Regular />}
              onClick={startCamera}
              className="w-full sm:w-auto min-h-11"
            >
              Use camera
            </Button>
            <Button
              appearance="outline"
              icon={<ArrowUpload20Regular />}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto min-h-11"
            >
              Upload photo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
