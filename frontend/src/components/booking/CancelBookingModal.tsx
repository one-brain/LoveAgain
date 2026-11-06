import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  Radio,
  Textarea,
  Field,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components';
import {
  Warning24Regular,
  Dismiss20Regular,
  Calendar16Regular,
  Clock16Regular,
  ShieldCheckmark20Regular,
} from '@fluentui/react-icons';
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
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className="max-w-lg w-full bg-card border border-border rounded-2xl p-6">
        <form onSubmit={handleConfirmCancel}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Close cancel dialog"
                  icon={<Dismiss20Regular />}
                  onClick={onClose}
                />
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive-light text-destructive flex items-center justify-center shrink-0">
                  <Warning24Regular />
                </div>
                <div>
                  <span id="cancel-booking-title" className="text-subtitle1 font-semibold text-foreground block tabular">
                    Cancel booking #{booking.orderId.slice(0, 8)}
                  </span>
                  <span className="text-caption1 font-normal text-muted-foreground block">
                    Please confirm your cancellation request below
                  </span>
                </div>
              </div>
            </DialogTitle>

            <DialogContent className="space-y-4 pt-4">
              {errorMsg && (
                <MessageBar intent="error">
                  <MessageBarBody>{errorMsg}</MessageBarBody>
                </MessageBar>
              )}

              <div className="p-4 rounded-lg bg-muted border border-border space-y-2 text-caption1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Guest</span>
                  <span className="font-semibold text-foreground">
                    {booking.providerName || 'Verified Guest'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar16Regular className="text-brand-fg" />
                    <span>Schedule</span>
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatBookingDate(booking.startTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock16Regular className="text-brand-fg" />
                    <span>Time window</span>
                  </span>
                  <span className="font-mono tabular text-foreground">
                    {formatBookingTime(booking.startTime, booking.endTime)}
                  </span>
                </div>

                {booking.totalAmount > 0 && (
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-muted-foreground">Order total</span>
                    <span className="font-mono tabular font-semibold text-foreground">
                      {formatINR(booking.totalAmount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-accent-light border border-border flex items-start gap-3">
                <ShieldCheckmark20Regular className="text-brand-fg shrink-0 mt-0.5" />
                <div className="text-caption1 space-y-1">
                  <span className="font-semibold text-foreground block">
                    {isConfirmed ? 'Protected escrow refund' : 'Safe cancellation'}
                  </span>
                  <p className="text-muted-foreground">
                    {isConfirmed
                      ? 'Your escrow payment is protected. Cancelling will automatically refund eligible funds directly to your wallet according to the platform cancellation policy.'
                      : isPending
                      ? 'No payment has been charged for this booking yet. Cancelling will immediately release the reserved time slot for other members.'
                      : 'Cancelling will update this session and release any associated holds.'}
                  </p>
                </div>
              </div>

              <Field label="Reason for cancellation" required>
                <RadioGroup
                  value={selectedReason}
                  onChange={(_, data) => setSelectedReason(data.value)}
                >
                  {CANCELLATION_REASONS.map((reason) => (
                    <Radio key={reason} value={reason} label={reason} />
                  ))}
                </RadioGroup>
              </Field>

              <Field label="Additional details / comments (optional)">
                <Textarea
                  rows={2}
                  value={customNotes}
                  onChange={(_, data) => setCustomNotes(data.value)}
                  placeholder="Let the guest know why plans changed..."
                />
              </Field>
            </DialogContent>

            <DialogActions className="pt-4">
              <Button
                appearance="secondary"
                size="large"
                className="min-h-11"
                disabled={isCancelling}
                onClick={onClose}
              >
                Keep booking
              </Button>
              <Button
                type="submit"
                appearance="primary"
                size="large"
                className="min-h-11 bg-destructive text-destructive-foreground"
                disabled={isCancelling}
                icon={isCancelling ? <Spinner size="tiny" /> : undefined}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm cancellation'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
