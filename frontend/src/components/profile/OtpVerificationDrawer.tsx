import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Badge,
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  CheckmarkCircle16Regular,
  ShieldCheckmark16Regular,
  ArrowSync16Regular,
  Dismiss20Regular,
  Send16Regular,
} from '@fluentui/react-icons';

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
      }, 150);
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

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="block text-body1 font-semibold text-foreground">{label}</span>
          <span className="block text-caption1 text-muted-foreground tabular">
            {targetValue || 'Not configured'}
          </span>
        </div>
        {isVerified ? (
          <Badge appearance="tint" color="success" icon={<CheckmarkCircle16Regular />}>
            Verified
          </Badge>
        ) : targetValue ? (
          <Button
            appearance="outline"
            size="small"
            icon={<ShieldCheckmark16Regular />}
            onClick={handleOpenDrawer}
            disabled={disabled || isOpen}
          >
            Verify {type === 'email' ? 'email' : 'phone'}
          </Button>
        ) : (
          <Badge appearance="outline" color="informative">
            Required
          </Badge>
        )}
      </div>

      <OverlayDrawer
        position="end"
        open={isOpen && !isVerified}
        onOpenChange={(_e, { open }) => setIsOpen(open)}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close verification drawer"
                icon={<Dismiss20Regular />}
                onClick={() => setIsOpen(false)}
              />
            }
          >
            Verify {type === 'email' ? 'email address' : 'mobile number'}
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody className="space-y-5 pt-2">
          <div>
            <p className="text-body1 font-semibold text-foreground">
              Enter 6-digit code sent to <span className="tabular">{targetValue}</span>
            </p>
            <p className="text-caption1 text-muted-foreground mt-1">
              We sent a security verification code to your {type === 'email' ? 'inbox' : 'mobile via SMS'}.
            </p>
          </div>

          {errorMessage && (
            <MessageBar intent="error">
              <MessageBarBody>{errorMessage}</MessageBarBody>
            </MessageBar>
          )}

          <div className="flex items-center gap-2 justify-center py-2">
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
                aria-label={`Verification digit ${idx + 1}`}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={isVerifying || isSending}
                className="w-11 h-12 text-center text-subtitle1 font-mono font-semibold tabular rounded-md border border-border bg-card text-foreground focus:outline-none focus:border-brand-stroke"
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              appearance="subtle"
              size="small"
              icon={<ArrowSync16Regular className={isSending ? 'animate-spin' : ''} />}
              onClick={sendOtpCode}
              disabled={cooldown > 0 || isSending || isVerifying}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </Button>

            <Button
              appearance="primary"
              icon={isVerifying ? <ArrowSync16Regular className="animate-spin" /> : <Send16Regular />}
              onClick={() => submitCode()}
              disabled={isVerifying || isSending || digits.some((d) => !d)}
              className="min-h-11"
            >
              {isVerifying ? 'Verifying...' : 'Confirm code'}
            </Button>
          </div>
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
};
