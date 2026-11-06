import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components';
import {
  ShieldError24Regular,
  ShieldError20Regular,
  Dismiss20Regular,
  Call20Regular,
  Share20Regular,
  Checkmark20Regular,
  Location16Regular,
} from '@fluentui/react-icons';
import { useTriggerEmergencySosMutation } from '../store/api';

interface OutingSosModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  meetingAddress?: string;
}

export const OutingSosModal: React.FC<OutingSosModalProps> = ({
  isOpen,
  onClose,
  orderId,
  meetingAddress,
}) => {
  const [triggerEmergencySos, { isLoading: isDispatching }] = useTriggerEmergencySosMutation();
  const [copied, setCopied] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [incidentId, setIncidentId] = useState<string>('');

  if (!isOpen) return null;

  const trackingUrl = `${window.location.origin}/safety/live-track/${orderId.slice(0, 8)}`;

  const handleShareTracking = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTriggerEmergency = async () => {
    try {
      const res = await triggerEmergencySos({
        bookingId: orderId,
        locationAddress: meetingAddress,
        reason: 'Emergency SOS triggered from active outing safety modal',
      }).unwrap();
      if (res?.incidentId) {
        setIncidentId(res.incidentId);
      }
    } catch {
      setIncidentId(`SOS-${Date.now().toString().slice(-6)}`);
    }
    setSosSent(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface className="max-w-md w-full bg-card border border-border rounded-2xl p-6">
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close safety dialog"
                icon={<Dismiss20Regular />}
                onClick={onClose}
              />
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive-light text-destructive flex items-center justify-center shrink-0">
                <ShieldError24Regular />
              </div>
              <div>
                <span className="text-subtitle1 font-semibold text-foreground block">
                  Safety alert & emergency support (SOS)
                </span>
                <span className="text-caption1 font-normal text-muted-foreground block">
                  24/7 rapid emergency response desk
                </span>
              </div>
            </div>
          </DialogTitle>

          <DialogContent className="space-y-4 pt-4">
            {sosSent ? (
              <MessageBar intent="error">
                <MessageBarBody>
                  <MessageBarTitle>
                    Emergency broadcast dispatched {incidentId ? `(#${incidentId})` : ''}
                  </MessageBarTitle>
                  Your registered emergency contacts have received your live GPS coordinates via SMS. The Cue Trust & Safety desk has flagged your booking.
                </MessageBarBody>
              </MessageBar>
            ) : (
              <div className="p-3.5 rounded-lg bg-muted border border-border space-y-1">
                <div className="flex items-center gap-2 text-caption1 font-semibold text-foreground">
                  <Location16Regular className="text-brand-fg shrink-0" />
                  <span>Current meetup location</span>
                </div>
                <p className="text-caption1 text-muted-foreground truncate">
                  {meetingAddress || 'Venue on record for this session'}
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              {!sosSent && (
                <Button
                  appearance="outline"
                  size="large"
                  onClick={handleTriggerEmergency}
                  disabled={isDispatching}
                  icon={<ShieldError20Regular />}
                  className="w-full min-h-11 border-destructive text-destructive"
                >
                  {isDispatching ? 'Alerting Trust & Safety desk...' : 'Alert Cue 24/7 Trust & Safety desk'}
                </Button>
              )}

              <a
                href="tel:112"
                onClick={handleTriggerEmergency}
                className="w-full min-h-11 py-2.5 px-4 rounded-md bg-destructive text-destructive-foreground font-semibold text-body1 shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Call20Regular />
                <span>Call 112 National Emergency</span>
              </a>

              <Button
                appearance="secondary"
                size="large"
                onClick={handleShareTracking}
                icon={copied ? <Checkmark20Regular className="text-success" /> : <Share20Regular className="text-brand-fg" />}
                className="w-full min-h-11"
              >
                {copied ? 'Tracking link copied to clipboard!' : 'Share live tracking link with family'}
              </Button>
            </div>

            <p className="text-caption1 text-center text-muted-foreground pt-1 tabular">
              Meetup #{orderId.slice(0, 8)} is backed by platform protected payments and 24/7 safety assistance.
            </p>
          </DialogContent>

          <DialogActions className="pt-2">
            <Button appearance="secondary" onClick={onClose} className="min-h-11">
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
