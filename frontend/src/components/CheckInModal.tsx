import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  XMarkIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useCheckInBookingMutation } from '../store/bookingApi';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  clientName?: string;
  meetingAddress?: string;
  onSuccess?: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  orderId,
  clientName = 'Client',
  meetingAddress,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkInBooking, { isLoading }] = useCheckInBookingMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit PIN.');
      return;
    }

    try {
      setErrorMsg(null);
      await checkInBooking({ orderId, pin: pin.trim() }).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.error || err?.message || 'Invalid check-in PIN. Please ask your client to verify.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <ShieldCheckIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Venue Check-In Handshake</h2>
              <p className="text-xs text-muted-foreground">Verify physical presence with {clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Venue Reminder */}
        {meetingAddress && (
          <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/80 flex items-center gap-2.5 text-xs text-foreground/80">
            <MapPinIcon className="w-4 h-4 text-accent shrink-0" />
            <span className="truncate">{meetingAddress}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <CheckCircleIcon className="w-4 h-4" />
            <span>2-Way Cryptographic Handshake</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ask {clientName} to open their Cue Bookings screen and read or show the 6-digit Meeting PIN.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
              Enter 6-Digit Meeting PIN
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPin(val);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="••••••"
              autoFocus
              className="w-full text-center tracking-[0.5em] text-3xl font-mono font-black py-4 px-3 rounded-2xl bg-muted/50 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-hidden transition-all text-foreground"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2">
              <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || pin.length !== 6}
              className="flex-1 py-3 px-4 rounded-xl bg-accent hover:opacity-90 disabled:opacity-50 text-accent-foreground text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Start Outing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
