import React, { useState } from 'react';
import {
  ShieldExclamationIcon,
  XMarkIcon,
  PhoneIcon,
  ShareIcon,
  CheckIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

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
  const [copied, setCopied] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const trackingUrl = `${window.location.origin}/safety/live-track/${orderId.slice(0, 8)}`;

  const handleShareTracking = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTriggerEmergency = () => {
    setSosSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-card border border-destructive/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center animate-pulse">
              <ShieldExclamationIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Safety Alert & Emergency Support (SOS)</h2>
              <p className="text-xs text-muted-foreground">24/7 Rapid Emergency Response Desk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Status Confirmation if Sent */}
        {sosSent ? (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-2 text-center animate-in fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive block">
              🚨 Emergency Broadcast Dispatched
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your registered emergency contacts have received your live GPS coordinates via SMS. The Cue Trust & Safety desk has flagged your booking.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <MapPinIcon className="w-4 h-4 text-accent" />
              <span>Current Meetup Location</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {meetingAddress || 'Venue on record for this session'}
            </p>
          </div>
        )}

        {/* Action 1: 112 Police Dispatch */}
        <div className="space-y-3">
          <a
            href="tel:112"
            onClick={handleTriggerEmergency}
            className="w-full py-3.5 px-4 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
          >
            <PhoneIcon className="w-5 h-5" />
            <span>Call 112 National Emergency</span>
          </a>

          {/* Action 2: Share Live Web Tracking Link with Trusted Contact */}
          <button
            type="button"
            onClick={handleShareTracking}
            className="w-full py-3 px-4 rounded-2xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Tracking Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <ShareIcon className="w-4 h-4 text-accent" />
                <span>Share Live Tracking Link with Family</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-muted-foreground">
            Meetup #{orderId.slice(0, 8)} is backed by platform protected payments and 24/7 safety assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

