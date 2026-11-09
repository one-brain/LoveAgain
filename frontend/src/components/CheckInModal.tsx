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
  ShieldCheckmark20Regular,
  Dismiss20Regular,
  Location16Regular,
  CheckmarkCircle16Regular,
} from '@fluentui/react-icons';
import { useCheckInBookingMutation } from '../store/bookingApi';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  clientName?: string;
  hostName?: string;
  meetingAddress?: string;
  onSuccess?: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  orderId,
  clientName,
  hostName,
  meetingAddress,
  onSuccess,
}) => {
  const displayName = hostName || clientName || 'Host';
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
      setErrorMsg(err?.data?.error || err?.message || 'Invalid check-in PIN. Please ask your host to verify.');
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
                  aria-label="Close check-in dialog"
                  icon={<Dismiss20Regular />}
                  onClick={onClose}
                />
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-light text-brand-fg flex items-center justify-center shrink-0">
                  <ShieldCheckmark24Regular />
                </div>
                <div>
                  <span className="text-subtitle1 font-semibold text-foreground block">
                    Venue check-in handshake
                  </span>
                  <span className="text-caption1 font-normal text-muted-foreground block">
                    Verify physical presence with {displayName}
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
                  <CheckmarkCircle16Regular />
                  <span>Two-way verification handshake</span>
                </div>
                <p className="text-caption1 text-muted-foreground">
                  Ask {displayName} to open their Cue Bookings screen and read or show the 6-digit Meeting PIN.
                </p>
              </div>

              <Field label="Enter host's 6-digit meeting PIN" required>
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
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                appearance="primary"
                size="large"
                className="min-h-11"
                disabled={isLoading || pin.length !== 6}
                icon={isLoading ? <Spinner size="tiny" /> : <ShieldCheckmark20Regular />}
              >
                {isLoading ? 'Verifying...' : 'Start outing'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
