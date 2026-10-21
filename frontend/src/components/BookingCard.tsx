import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
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
}

interface BookingCardProps {
  booking: BookingSummary;
  onCancel?: (orderId: string) => void;
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
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeWindow(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel }) => {
  const navigate = useNavigate();
  const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PendingPayment;

  const handleOpenChat = () => {
    navigate(`/chat/${booking.orderId}`);
  };

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
              {booking.providerName || 'Companion Experience'}
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
        </div>
      </div>

      {/* Footer: Price & Actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <span className="text-[11px] text-muted-foreground block">Total Escrow</span>
          <span className="text-lg font-bold font-serif text-foreground">
            ${booking.totalAmount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
            <button
              onClick={() => onCancel(booking.orderId)}
              className="px-3 py-2 rounded-xl border border-border hover:border-destructive/40 text-muted-foreground hover:text-destructive text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleOpenChat}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Open Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
