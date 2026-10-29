import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import type { BookingSummary } from '../BookingCard';
import { useCancelBookingMutation } from '../../store/bookingApi';
import { formatINR } from '../../utils/currency';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingSummary | null;
  onSuccess?: () => void;
}

const CANCELLATION_REASONS = [
  'Change of plans / scheduling conflict',
  'Selected wrong date, time, or location',
  'Found an alternative arrangement',
  'Personal or medical emergency',
  'Other reason',
];

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(CANCELLATION_REASONS[0]);
      setCustomNotes('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const isConfirmed = booking.status === 'Confirmed';
  const isPending = booking.status === 'PendingPayment';

  const formatBookingDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatBookingTime = (startStr?: string, endStr?: string) => {
    if (!startStr) return '';
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : null;
    const startFormatted = start.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    if (!end) return startFormatted;
    const endFormatted = end.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${startFormatted} – ${endFormatted}`;
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullReason =
      selectedReason === 'Other reason' && customNotes.trim()
        ? customNotes.trim()
        : customNotes.trim()
        ? `${selectedReason}: ${customNotes.trim()}`
        : selectedReason;

    try {
      await cancelBooking({
        orderId: booking.orderId,
        reason: fullReason,
      }).unwrap();

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Cancel booking error:', err);
      setErrorMsg(
        err?.data?.error ||
          err?.message ||
          'Failed to cancel booking. Please try again or contact support.'
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-muted/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-destructive/15 text-destructive border border-destructive/20 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2
                id="cancel-booking-title"
                className="text-lg sm:text-xl font-bold font-serif text-foreground"
              >
                Cancel Booking #{booking.orderId.slice(0, 8)}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please confirm your cancellation request below
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cancel dialog"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleConfirmCancel} className="p-6 space-y-5 text-xs sm:text-sm">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium flex items-center gap-2.5">
              <InformationCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Booking Summary Box */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Companion</span>
              <span className="font-semibold text-foreground">
                {booking.providerName || 'Verified Companion'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CalendarDaysIcon className="w-3.5 h-3.5 text-accent" />
                <span>Schedule</span>
              </span>
              <span className="font-medium text-foreground">
                {formatBookingDate(booking.startTime)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5 text-accent" />
                <span>Time Window</span>
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {formatBookingTime(booking.startTime, booking.endTime)}
              </span>
            </div>

            {booking.totalAmount > 0 && (
              <div className="pt-2 border-t border-border/80 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Order Total</span>
                <span className="font-mono tabular-nums font-bold text-foreground">
                  {formatINR(booking.totalAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Escrow & Refund Policy Notice */}
          <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/25 flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-foreground block">
                {isConfirmed ? 'Protected Escrow Refund' : 'Safe Cancellation'}
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                {isConfirmed
                  ? 'Your escrow payment is protected. Cancelling will automatically refund eligible funds directly to your wallet according to the platform cancellation policy.'
                  : isPending
                  ? 'No payment has been charged for this booking yet. Cancelling will immediately release the reserved time slot for other members.'
                  : 'Cancelling will update this session and release any associated holds.'}
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground">
              Reason for Cancellation <span className="text-destructive">*</span>
            </label>
            <div className="space-y-2">
              {CANCELLATION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'border-accent bg-accent/10 text-foreground font-semibold'
                      : 'border-border bg-card hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="text-accent focus:ring-accent"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional Additional Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground">
              Additional Details / Comments (Optional)
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Let the companion know why plans changed..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-foreground text-xs focus:ring-1 focus:ring-accent placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isCancelling}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-border hover:bg-muted text-foreground font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Keep Booking
            </button>
            <button
              type="submit"
              disabled={isCancelling}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isCancelling ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancellation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

