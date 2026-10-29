import React, { useState, useEffect, useRef } from 'react';
import {
  CheckBadgeIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface OtpVerificationDrawerProps {
  type: 'email' | 'phone';
  label: string;
  targetValue: string;
  isVerified: boolean;
  onSendOtp: () => Promise<{ devOtp?: string; message?: string }>;
  onVerifyOtp: (otp: string) => Promise<void>;
  disabled?: boolean;
}

export const OtpVerificationDrawer: React.FC<OtpVerificationDrawerProps> = ({
  type,
  label,
  targetValue,
  isVerified,
  onSendOtp,
  onVerifyOtp,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOpenDrawer = async () => {
    if (isVerified || disabled || !targetValue.trim()) return;
    setIsOpen(true);
    setErrorMessage(null);
    setDigits(['', '', '', '', '', '']);
    await sendOtpCode();
  };

  const sendOtpCode = async () => {
    setIsSending(true);
    setErrorMessage(null);
    try {
      await onSendOtp();
      setCooldown(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMessage(err?.data?.error || err?.message || `Failed to send ${type} verification code.`);
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto-advance to next box
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (cleanVal && index === 5 && newDigits.every((d) => d.length === 1)) {
      submitCode(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    const newDigits = [...digits];
    for (let i = 0; i < paste.length; i++) {
      newDigits[i] = paste[i];
    }
    setDigits(newDigits);
    if (paste.length === 6) {
      submitCode(paste);
    } else {
      inputRefs.current[Math.min(paste.length, 5)]?.focus();
    }
  };

  const submitCode = async (otpCode?: string) => {
    const code = otpCode || digits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      await onVerifyOtp(code);
      setIsOpen(false);
    } catch (err: any) {
      setErrorMessage(err?.data?.error || err?.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-muted-foreground">{label}</label>
        {isVerified ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckBadgeIcon className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        ) : targetValue ? (
          <button
            type="button"
            onClick={handleOpenDrawer}
            disabled={disabled || isOpen}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Verify {type === 'email' ? 'Email' : 'Phone'}</span>
          </button>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">Required</span>
        )}
      </div>

      {/* Inline OTP Verification Drawer */}
      {isOpen && !isVerified && (
        <div className="p-4 rounded-2xl border border-accent/30 bg-accent/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-foreground">
                Enter 6-Digit Code Sent to {targetValue}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                We sent a security verification code to your {type === 'email' ? 'inbox' : 'mobile via SMS'}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <div className="flex items-center gap-2 justify-center py-1">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={isVerifying || isSending}
                className="w-10 h-12 text-center text-lg font-mono font-bold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-xs"
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={sendOtpCode}
              disabled={cooldown > 0 || isSending || isVerifying}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => submitCode()}
              disabled={isVerifying || isSending || digits.some((d) => !d)}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-xs shadow-xs disabled:opacity-40 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {isVerifying ? (
                <>
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-3.5 h-3.5" />
                  <span>Confirm Code</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
