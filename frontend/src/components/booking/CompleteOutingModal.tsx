import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  XMarkIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useCompleteBookingMutation } from '../../store/bookingApi';
import { useReleaseEscrowMutation } from '../../store/paymentApi';

interface CompleteOutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  companionName?: string;
  meetingAddress?: string;
  onSuccess?: () => void;
}

export const CompleteOutingModal: React.FC<CompleteOutingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  companionName = 'Companion',
  meetingAddress,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completeBooking, { isLoading: isCompleting }] = useCompleteBookingMutation();
  const [releaseEscrow, { isLoading: isReleasing }] = useReleaseEscrowMutation();

  if (!isOpen) return null;

  const isLoading = isCompleting || isReleasing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit Completion PIN.');
      return;
    }

    try {
      setErrorMsg(null);
      await completeBooking({ orderId, completionPin: pin.trim() }).unwrap();
      try {
        await releaseEscrow({ orderId }).unwrap();
      } catch {
        // Escrow may already be settled or handled by service event
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.error || err?.message || 'Invalid completion PIN. Please ask your companion to verify.');
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheckIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">Complete Outing & Settle</h2>
              <p className="text-xs text-muted-foreground">Verify safe conclusion with {companionName}</p>
            </div>
          </div>
          <button
            type="button"
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
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <SparklesIcon className="w-4 h-4" />
            <span>Mutual Verification Handshake</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ask {companionName} for their <strong>6-digit Outing Completion PIN</strong>. Entering this PIN verifies that your meetup concluded safely and initiates the release of escrow funds.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 text-center">
              Enter Companion's Completion PIN
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
              className="w-full text-center tracking-[0.5em] text-3xl font-mono font-black py-4 px-3 rounded-2xl bg-muted/50 border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-hidden transition-all text-foreground tabular-nums"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2">
              <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 min-h-[44px] rounded-xl border border-border text-foreground text-xs font-bold hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || pin.trim().length !== 6}
              className="flex-1 py-3 min-h-[44px] rounded-xl bg-accent text-accent-foreground text-xs font-bold hover:bg-accent-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  <span>Settling...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Verify & Release</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

