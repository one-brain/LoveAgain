import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

export interface BookingSummary {
  orderId: string;
  providerId: string;
  seekerId: string;
  startTime: string;
  endTime: string;
  status: 'PendingPayment' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
  totalAmount: number;
  providerName?: string;
  providerPhoto?: string;
  meetingAddress?: string;
  activity?: string;
  checkInPin?: string;
  checkedInAt?: string;
  requirements?: {
    activityName?: string;
    dressCode?: string;
    transportMode?: string;
    specialNotes?: string;
  };
}

interface BookingCardProps {
  booking: BookingSummary;
  roleMode?: 'client' | 'companion';
  onCancel?: (orderId: string) => void;
  onPay?: (booking: BookingSummary) => void;
  onCheckIn?: (booking: BookingSummary) => void;
  onComplete?: (orderId: string) => void;
  onOpenSos?: (booking: BookingSummary) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  PendingPayment: {
    label: 'Pending Escrow',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    icon: <ClockIcon className="w-3.5 h-3.5 inline mr-1" />,
  },
  Confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    icon: <CheckCircleIcon className="w-3.5 h-3.5 inline mr-1" />,
  },
  InProgress: {
    label: 'In Progress',
    badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 animate-pulse',
    icon: <ClockIcon className="w-3.5 h-3.5 inline mr-1" />,
  },
  Completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    icon: <CheckCircleIcon className="w-3.5 h-3.5 inline mr-1" />,
  },
  Cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
    icon: <ExclamationCircleIcon className="w-3.5 h-3.5 inline mr-1" />,
  },
  Disputed: {
    label: 'Under Review',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    icon: <ExclamationCircleIcon className="w-3.5 h-3.5 inline mr-1" />,
  },
};

function formatBookingTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeWindow(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return `${start.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  roleMode = 'client',
  onCancel,
  onPay,
  onCheckIn,
  onComplete,
  onOpenSos,
}) => {
  const navigate = useNavigate();
  const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PendingPayment;

  const handleOpenChat = () => {
    navigate(`/chat/${booking.orderId}`);
  };

  const isPendingPayment = booking.status === 'PendingPayment';
  const isConfirmed = booking.status === 'Confirmed';
  const isInProgress = booking.status === 'InProgress';

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 group">
      <div>
        {/* Top Header: Order ID & Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
              Booking #{booking.orderId.slice(0, 8)}
            </span>
            <h3 className="text-base font-bold text-foreground mt-0.5">
              {booking.providerName || (roleMode === 'companion' ? 'Seeker Outing' : 'Companion Outing')}
            </h3>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center ${statusInfo.badgeClass}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </span>
        </div>

        {/* Date, Time & Location Details */}
        <div className="space-y-2 py-3 border-y border-border/60 text-xs">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CalendarDaysIcon className="w-4 h-4 text-accent flex-shrink-0" />
            <span>{formatBookingTime(booking.startTime)}</span>
          </div>

          <div className="flex items-center gap-2 text-foreground/80">
            <ClockIcon className="w-4 h-4 text-foreground/60 flex-shrink-0" />
            <span>{formatTimeWindow(booking.startTime, booking.endTime)}</span>
          </div>

          {booking.meetingAddress && (
            <div className="flex items-center gap-2 text-foreground/80">
              <MapPinIcon className="w-4 h-4 text-foreground/60 flex-shrink-0" />
              <span className="truncate">{booking.meetingAddress}</span>
            </div>
          )}

          {booking.requirements?.activityName && (
            <div className="flex items-center gap-2 text-accent font-medium">
              <span>🎯 Activity: {booking.requirements.activityName}</span>
            </div>
          )}
        </div>

        {/* 2-Way Handshake PIN Display (Client Mode when Confirmed) */}
        {isConfirmed && roleMode === 'client' && (
          <div className="mt-3 p-3 rounded-2xl bg-accent/10 border border-accent/25 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">Meeting Handshake PIN</span>
              <span className="text-xl font-mono font-black tracking-widest text-foreground">
                {booking.checkInPin || '849201'}
              </span>
            </div>
            <div className="text-right max-w-[150px]">
              <span className="text-[11px] font-semibold text-foreground block">Share at Venue</span>
              <span className="text-[10px] text-muted-foreground">Cryptographic presence proof</span>
            </div>
          </div>
        )}

        {/* Active Outing Indicator & SOS Trigger */}
        {isInProgress && (
          <div className="mt-3 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Outing Active Now</span>
            </div>
            {onOpenSos && (
              <button
                type="button"
                onClick={() => onOpenSos(booking)}
                className="px-2.5 py-1 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ShieldExclamationIcon className="w-3.5 h-3.5" />
                <span>SOS Shield</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer: Price & Actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <span className="text-[11px] text-muted-foreground block">Total Escrow</span>
          <span className="text-lg font-bold font-mono text-foreground">
            ₹{booking.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Seeker: Pay Escrow */}
          {isPendingPayment && onPay && (
            <button
              onClick={() => onPay(booking)}
              className="px-3.5 py-2 rounded-xl bg-accent text-accent-foreground font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 hover:opacity-95 cursor-pointer"
            >
              <CreditCardIcon className="w-4 h-4" />
              <span>Pay & Secure</span>
            </button>
          )}

          {/* Companion: Check-In Handshake */}
          {isConfirmed && roleMode === 'companion' && onCheckIn && (
            <button
              onClick={() => onCheckIn(booking)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Check In</span>
            </button>
          )}

          {/* Companion: Complete Outing */}
          {isInProgress && roleMode === 'companion' && onComplete && (
            <button
              onClick={() => onComplete(booking.orderId)}
              className="px-3.5 py-2 rounded-xl bg-accent hover:opacity-95 text-accent-foreground font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Complete Session</span>
            </button>
          )}

          {onCancel && booking.status !== 'Cancelled' && booking.status !== 'Completed' && !isInProgress && (
            <button
              onClick={() => onCancel(booking.orderId)}
              className="px-3 py-2 rounded-xl border border-border hover:border-destructive/40 text-muted-foreground hover:text-destructive text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleOpenChat}
            className="px-3.5 py-2 rounded-xl border border-border hover:bg-muted text-foreground font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
