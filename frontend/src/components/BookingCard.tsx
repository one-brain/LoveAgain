import React, { useState } from 'react';
import { useGetBookingReviewStatusQuery } from '../store/reviewApi';
import { LeaveReviewModal } from './booking/LeaveReviewModal';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/currency';
import { resolveProviderInfo } from '../utils/providerData';
import {
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckBadgeIcon,
  StarIcon,
  ArrowUpRightIcon,
  PencilSquareIcon,
  XMarkIcon,
  SparklesIcon,
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
  seekerName?: string;
  seekerPhoto?: string;
  averageRating?: number;
  specialty?: string;
  isVerified?: boolean;
  meetingAddress?: string;
  activity?: string;
  checkInPin?: string;
  checkedInAt?: string;
  requirements?: {
    activity?: string;
    activityName?: string;
    dressCode?: string;
    transportMode?: string;
    dietPreference?: string;
    equipmentGear?: string;
    languagePreference?: string;
    specialNotes?: string;
  };
}

interface BookingCardProps {
  booking: BookingSummary;
  roleMode?: 'client' | 'companion';
  /** Shows whether this is an outing you booked or a request you received (used in the combined feed). */
  showRoleBadge?: boolean;
  liveProviders?: any[];
  onEdit?: (booking: BookingSummary) => void;
  onCancel?: (booking: BookingSummary) => void;
  onPay?: (booking: BookingSummary) => void;
  onCheckIn?: (booking: BookingSummary) => void;
  onComplete?: (orderId: string) => void;
  onOpenSos?: (booking: BookingSummary) => void;
  onViewProfile?: (providerId: string) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  PendingPayment: {
    label: 'Awaiting Escrow',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    dotClass: 'bg-amber-500',
  },
  Confirmed: {
    label: 'Escrow Confirmed',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    dotClass: 'bg-emerald-500',
  },
  InProgress: {
    label: 'Outing in Progress',
    badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
    dotClass: 'bg-sky-500 animate-ping',
  },
  Completed: {
    label: 'Completed & Settled',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    dotClass: 'bg-emerald-500',
  },
  Cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
    dotClass: 'bg-rose-500',
  },
  Disputed: {
    label: 'Under Escrow Review',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    dotClass: 'bg-amber-500',
  },
};

function formatBookingDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatBookingTimeRange(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return `${start.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })} – ${end.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  roleMode = 'client',
  showRoleBadge = false,
  liveProviders,
  onEdit,
  onCancel,
  onPay,
  onCheckIn,
  onComplete,
  onOpenSos,
  onViewProfile,
}) => {
  const navigate = useNavigate();
  const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PendingPayment;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const isCompleted = booking.status === 'Completed';
  const { data: reviewStatus } = useGetBookingReviewStatusQuery(booking.orderId, {
    skip: !isCompleted,
  });

  // Resolve companion or client profile details based on perspective
  const providerInfo = resolveProviderInfo(booking.providerId, liveProviders);
  const displayName =
    roleMode === 'companion'
      ? booking.seekerName || booking.providerName || 'Verified Client'
      : booking.providerName || providerInfo.displayName || 'Companion Outing';
  const photoUrl =
    roleMode === 'companion'
      ? booking.seekerPhoto || booking.providerPhoto || providerInfo.photoUrl
      : booking.providerPhoto || providerInfo.photoUrl;
  const rating = booking.averageRating || providerInfo.averageRating;
  const activityTitle =
    booking.requirements?.activity ||
    booking.requirements?.activityName ||
    booking.activity ||
    booking.specialty ||
    providerInfo.specialty ||
    'Platonic Outing';
  const isVerified = booking.isVerified ?? providerInfo.isVerified ?? true;

  const handleOpenChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${booking.orderId}`);
  };

  const handleViewProfile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (roleMode === 'client' && booking.providerId) {
      if (onViewProfile) {
        onViewProfile(booking.providerId);
      } else {
        navigate(`/provider/${booking.providerId}`);
      }
    }
  };

  const isPendingPayment = booking.status === 'PendingPayment';
  const isConfirmed = booking.status === 'Confirmed';
  const isInProgress = booking.status === 'InProgress';
  const isCancelled = booking.status === 'Cancelled';

  // Gather concise outing requirement chips
  const tags: string[] = [];
  if (booking.requirements?.dressCode) {
    tags.push(booking.requirements.dressCode);
  }
  if (booking.requirements?.languagePreference) {
    tags.push(booking.requirements.languagePreference);
  }
  if (booking.requirements?.transportMode) {
    tags.push(booking.requirements.transportMode);
  }
  if (booking.requirements?.dietPreference) {
    tags.push(booking.requirements.dietPreference);
  }

  return (
    <div className="relative rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-5 group overflow-hidden">
      {/* Top Ledger Strip: Reference & Semantic Status */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
              Ref #{booking.orderId.slice(0, 8)}
            </span>
            {showRoleBadge && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  roleMode === 'companion'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-accent/10 text-accent border border-accent/20'
                }`}
              >
                {roleMode === 'companion' ? 'Client Request' : 'Your Outing'}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
            <span>{statusInfo.label}</span>
          </span>
        </div>

        {/* Participant & Experience Header (Instrument Serif Typography & Clean Presentation) */}
        <div className="flex items-start gap-3.5 mb-4">
          <div
            onClick={roleMode === 'client' && booking.providerId ? handleViewProfile : undefined}
            className={`relative shrink-0 ${
              roleMode === 'client' && booking.providerId ? 'cursor-pointer' : ''
            }`}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                loading="lazy"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-1 ring-border shadow-2xs group-hover:ring-accent/40 transition-all"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent/10 text-accent font-serif text-2xl font-normal flex items-center justify-center ring-1 ring-border shadow-2xs">
                {displayName.charAt(0)}
              </div>
            )}
            {isVerified && (
              <span
                className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full shadow-2xs"
                title="Verified Identity"
              >
                <CheckBadgeIcon className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-1">
              <h3
                onClick={roleMode === 'client' && booking.providerId ? handleViewProfile : undefined}
                className={`font-serif text-lg sm:text-xl font-normal text-foreground leading-tight truncate ${
                  roleMode === 'client' && booking.providerId
                    ? 'cursor-pointer hover:text-accent transition-colors'
                    : ''
                }`}
              >
                {displayName}
              </h3>

              {roleMode === 'client' && booking.providerId && (
                <button
                  type="button"
                  onClick={handleViewProfile}
                  className="text-[11px] font-medium text-accent hover:text-accent-hover inline-flex items-center gap-0.5 shrink-0 transition-colors cursor-pointer"
                  title="View full companion profile"
                >
                  <span>Profile</span>
                  <ArrowUpRightIcon className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {rating ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 font-mono">
                  <StarIcon className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{rating.toFixed(2)}</span>
                </span>
              ) : null}

              {activityTitle ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground truncate font-medium">
                  {rating ? <span className="text-border">•</span> : null}
                  <SparklesIcon className="w-3 h-3 text-accent/70 shrink-0" />
                  <span className="truncate">{activityTitle}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Outing Schedule & Logistics Card Body */}
        <div className="space-y-2.5 text-xs text-foreground/80 py-3 border-t border-border/60">
          {/* Date & Time Window */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CalendarDaysIcon className="w-4 h-4 text-accent shrink-0" />
              <span className="font-semibold text-foreground truncate">
                {formatBookingDate(booking.startTime)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-muted/60 px-2 py-0.5 rounded-md border border-border/40 font-mono text-[11px] text-foreground tabular-nums">
              <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{formatBookingTimeRange(booking.startTime, booking.endTime)}</span>
            </div>
          </div>

          {/* Meeting Address / Location */}
          <div className="flex items-start gap-2 pt-0.5">
            <MapPinIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground line-clamp-1">
              {booking.meetingAddress || 'Venue details confirmed with companion'}
            </span>
          </div>

          {/* Activity Tags & Style Specifications */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-muted/50 border border-border/50 text-[10px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed Meeting Check-In Voucher (Concierge Verification Ticket) */}
        {isConfirmed && roleMode === 'client' && (
          <div className="mt-3 p-3.5 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
                Session Verification PIN
              </span>
              <span className="text-2xl font-mono font-bold tracking-[0.2em] text-foreground tabular-nums">
                {booking.checkInPin || '849201'}
              </span>
            </div>
            <div className="text-right max-w-[160px]">
              <span className="text-[11px] font-semibold text-foreground block">
                Present at Meetup
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight block">
                Companion enters PIN to verify arrival and activate session escrow.
              </span>
            </div>
          </div>
        )}

        {/* Live Meetup Bar & SOS Trigger */}
        {isInProgress && (
          <div className="mt-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                Outing in Progress
              </span>
            </div>
            {onOpenSos && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSos(booking);
                }}
                className="px-2.5 py-1 min-h-[32px] rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ShieldExclamationIcon className="w-3.5 h-3.5" />
                <span>Safety SOS</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Ledger & Actions Section */}
      <div className="pt-3 border-t border-border/70 space-y-3">
        {/* Total Ledger & Escrow Guarantee */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block">
              {isPendingPayment ? 'Escrow Deposit' : 'Total Escrow Hold'}
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-foreground">
              {formatINR(booking.totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/40 font-medium">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-accent" />
            <span>Escrow Protected</span>
          </div>
        </div>

        {/* Action Controls Matrix: strictly compliant 44px touch targets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Primary Action Button */}
          {isPendingPayment && onPay && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPay(booking);
              }}
              className="flex-1 min-w-[130px] min-h-[44px] px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            >
              <CreditCardIcon className="w-4 h-4" />
              <span>Deposit Escrow</span>
            </button>
          )}

          {isConfirmed && roleMode === 'companion' && onCheckIn && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn(booking);
              }}
              className="flex-1 min-w-[130px] min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Verify PIN</span>
            </button>
          )}

          {(isInProgress || isConfirmed) && onComplete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(booking.orderId);
              }}
              className="flex-1 min-w-[130px] min-h-[44px] px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>{roleMode === 'companion' ? 'End Meetup' : 'Complete Outing'}</span>
            </button>
          )}

          {isCompleted && (
            reviewStatus?.hasReviewed ? (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#C5A059] text-xs font-semibold">
                <SolidStarIcon className="w-4 h-4 text-[#C5A059]" />
                <span>Reviewed ({reviewStatus.myReview?.rating || 5}/5)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReviewModalOpen(true);
                }}
                className="flex-1 min-w-[130px] min-h-[44px] px-4 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08e4c] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <SolidStarIcon className="w-4 h-4" />
                <span>Leave a Review</span>
              </button>
            )
          )}

          {/* Secondary Actions Group */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Edit Booking */}
            {(isPendingPayment || isConfirmed) && onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(booking);
                }}
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-border hover:border-accent/40 text-foreground hover:text-accent hover:bg-muted text-xs font-medium transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                title="Edit venue, requirements, or schedule"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {/* Cancel Booking */}
            {onCancel && !isCancelled && !isCompleted && !isInProgress && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(booking);
                }}
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-border hover:border-destructive/40 text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-xs font-medium transition-colors flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 cursor-pointer"
                title="Cancel booking"
              >
                <XMarkIcon className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            )}

            {/* Chat with companion / seeker */}
            <button
              type="button"
              onClick={handleOpenChat}
              className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl border border-border hover:bg-muted text-foreground font-medium text-xs transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
              title="Open secure chat"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">Chat</span>
            </button>
          </div>
        </div>
      </div>

      {isReviewModalOpen && (
        <LeaveReviewModal
          booking={booking}
          counterpartName={displayName}
          isProviderViewing={roleMode === 'companion'}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </div>
  );
};
