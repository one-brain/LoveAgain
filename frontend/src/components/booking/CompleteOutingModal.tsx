import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Field,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components';
import {
  ShieldCheckmark24Regular,
  CheckmarkCircle20Regular,
  Dismiss20Regular,
  Location16Regular,
  ShieldCheckmark16Regular,
} from '@fluentui/react-icons';
import { useCompleteBookingMutation } from '../../store/bookingApi';
import { useReleaseEscrowMutation } from '../../store/paymentApi';

interface CompleteOutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  companionName?: string;
  guestName?: string;
  meetingAddress?: string;
  onSuccess?: () => void;
}

export const CompleteOutingModal: React.FC<CompleteOutingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  companionName,
  guestName,
  meetingAddress,
  onSuccess,
}) => {
  const displayName = guestName || companionName || 'Guest';
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
      setErrorMsg(err?.data?.error || err?.message || 'Invalid completion PIN. Please ask your guest to verify.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className="max-w-md w-full bg-card border border-border rounded-2xl p-6">
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Close complete outing dialog"
                  icon={<Dismiss20Regular />}
                  onClick={onClose}
                />
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-light text-success flex items-center justify-center shrink-0">
                  <ShieldCheckmark24Regular />
                </div>
                <div>
                  <span className="text-subtitle1 font-semibold text-foreground block">
                    Complete outing & settle
                  </span>
                  <span className="text-caption1 font-normal text-muted-foreground block">
                    Verify safe conclusion with {displayName}
                  </span>
                </div>
              </div>
            </DialogTitle>

            <DialogContent className="space-y-4 pt-4">
              {meetingAddress && (
                <div className="p-3 rounded-lg bg-muted border border-border flex items-center gap-2 text-caption1 text-foreground">
                  <Location16Regular className="text-brand-fg shrink-0" />
                  <span className="truncate">{meetingAddress}</span>
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-accent-light border border-border space-y-1">
                <div className="flex items-center gap-1.5 text-caption1 font-semibold text-brand-fg">
                  <ShieldCheckmark16Regular />
                  <span>Mutual verification handshake</span>
                </div>
                <p className="text-caption1 text-muted-foreground">
                  Ask {displayName} for their <strong>6-digit Outing Completion PIN</strong>. Entering this PIN verifies that your meetup concluded safely and initiates the release of escrow funds.
                </p>
              </div>

              <Field label="Enter guest's completion PIN" required>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(_, data) => {
                    const val = data.value.replace(/\D/g, '');
                    setPin(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="••••••"
                  autoFocus
                  size="large"
                  className="w-full text-center font-mono tabular text-title3 font-semibold"
                />
              </Field>

              {errorMsg && (
                <MessageBar intent="error">
                  <MessageBarBody>{errorMsg}</MessageBarBody>
                </MessageBar>
              )}
            </DialogContent>

            <DialogActions className="pt-4">
              <Button
                appearance="secondary"
                size="large"
                className="min-h-11"
                disabled={isLoading}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                appearance="primary"
                size="large"
                className="min-h-11"
                disabled={isLoading || pin.trim().length !== 6}
                icon={isLoading ? <Spinner size="tiny" /> : <CheckmarkCircle20Regular />}
              >
                {isLoading ? 'Settling...' : 'Release escrow'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
