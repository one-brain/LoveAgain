import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Tag } from '@fluentui/react-components';
import {
  Chat20Regular,
  Calendar16Regular,
  Clock16Regular,
  Location16Regular,
  CheckmarkCircle20Regular,
  Payment20Regular,
  ShieldCheckmark20Regular,
  ShieldCheckmark16Regular,
  ShieldError16Regular,
  CheckmarkStarburst16Filled,
  Star16Filled,
  ArrowUpRight16Regular,
  Edit16Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';
import { useGetBookingReviewStatusQuery } from '../store/reviewApi';
import { LeaveReviewModal } from './booking/LeaveReviewModal';
import { formatINR } from '../utils/currency';
import { resolveProviderInfo } from '../utils/providerData';

export interface BookingSummary {
  orderId: string;
  providerId: string;
  seekerId: string;
  startTime: string;
  endTime: string;
  status: 'PendingPayment' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
  totalAmount: number;
  platformFee?: number;
  providerEarnings?: number;
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
  completionPin?: string;
  checkedInAt?: string;
  cancellationReason?: string;
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
  onComplete?: (booking: BookingSummary) => void;
  onOpenSos?: (booking: BookingSummary) => void;
  onViewProfile?: (providerId: string) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: 'warning' | 'success' | 'informative' | 'danger' | 'brand' }
> = {
  PendingPayment: {
    label: 'Awaiting escrow',
    color: 'warning',
  },
  Confirmed: {
    label: 'Escrow confirmed',
    color: 'success',
  },
  InProgress: {
    label: 'Outing in progress',
    color: 'informative',
  },
  Completed: {
    label: 'Completed & settled',
    color: 'success',
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'danger',
  },
  Disputed: {
    label: 'Under escrow review',
    color: 'warning',
  },
};

function formatBookingDate(dateStr?: string | null): string {
  if (!dateStr) return 'Date TBD';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Date TBD';
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatBookingTimeRange(startStr?: string | null, endStr?: string | null): string {
  if (!startStr || !endStr) return 'Flexible hours';
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Flexible hours';
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

  const isCompanionView = roleMode === 'companion';
  const providerInfo = resolveProviderInfo(booking.providerId, liveProviders);

  const displayName = isCompanionView
    ? (booking.seekerName || 'Verified Host')
    : (booking.providerName || providerInfo.displayName || 'Verified Guest');

  const photoUrl = isCompanionView
    ? (booking.seekerPhoto || undefined)
    : (booking.providerPhoto || providerInfo.photoUrl);

  const rating = isCompanionView ? undefined : (booking.averageRating || providerInfo.averageRating);

  const activityTitle =
    booking.requirements?.activity ||
    booking.requirements?.activityName ||
    booking.activity ||
    booking.specialty ||
    providerInfo.specialty ||
    'Platonic Outing';

  const isVerified = isCompanionView
    ? true
    : (booking.isVerified ?? providerInfo.isVerified ?? true);

  const handleOpenChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${booking.orderId}`);
  };

  const handleViewProfile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isCompanionView && booking.providerId) {
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
  const isDisputed = booking.status === 'Disputed';

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
    <div className="relative rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between gap-5 overflow-hidden">
      {/* Top Ledger Strip: Reference & Semantic Status */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-caption1 font-mono tabular text-muted-foreground">
              Ref #{booking.orderId.slice(0, 8)}
            </span>
            {showRoleBadge && (
              <Badge
                appearance="tint"
                color={isCompanionView ? 'success' : 'brand'}
              >
                {isCompanionView ? 'Attending as guest' : 'Hosting outing'}
              </Badge>
            )}
          </div>

          <Badge appearance="tint" color={statusInfo.color}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Participant & Experience Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <div
            onClick={!isCompanionView && booking.providerId ? handleViewProfile : undefined}
            className={`relative shrink-0 ${
              !isCompanionView && booking.providerId ? 'cursor-pointer' : ''
            }`}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName}
                loading="lazy"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-accent-light text-brand-fg text-title3 font-semibold flex items-center justify-center border border-border">
                {displayName.charAt(0)}
              </div>
            )}
            {isVerified && (
              <span
                className="absolute -bottom-1 -right-1 bg-trust-light text-trust border border-trust-border p-0.5 rounded-full shadow-xs"
                title="Verified Identity"
              >
                <CheckmarkStarburst16Filled />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-1">
              <h3
                onClick={!isCompanionView && booking.providerId ? handleViewProfile : undefined}
                className={`text-subtitle2 font-semibold text-foreground truncate ${
                  !isCompanionView && booking.providerId
                    ? 'cursor-pointer hover:text-brand-fg transition-colors'
                    : ''
                }`}
              >
                {displayName}
              </h3>

              {!isCompanionView && booking.providerId && (
                <button
                  type="button"
                  onClick={handleViewProfile}
                  className="text-caption1 font-semibold text-brand-fg inline-flex items-center gap-0.5 shrink-0 cursor-pointer"
                  title="View full guest profile"
                >
                  <span>Profile</span>
                  <ArrowUpRight16Regular />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {rating ? (
                <span className="inline-flex items-center gap-1 text-caption1 font-semibold text-trust font-mono tabular">
                  <Star16Filled />
                  <span>{rating.toFixed(2)}</span>
                </span>
              ) : null}

              {activityTitle ? (
                <span className="inline-flex items-center gap-1 text-caption1 text-muted-foreground truncate">
                  {rating ? <span className="text-border">•</span> : null}
                  <span className="truncate">{activityTitle}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Outing Schedule & Logistics Card Body */}
        <div className="space-y-2.5 text-caption1 text-foreground py-3 border-t border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar16Regular className="text-brand-fg shrink-0" />
              <span className="font-semibold text-foreground truncate">
                {formatBookingDate(booking.startTime)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-muted px-2 py-0.5 rounded border border-border font-mono text-caption1 text-foreground tabular">
              <Clock16Regular className="text-muted-foreground" />
              <span>{formatBookingTimeRange(booking.startTime, booking.endTime)}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-0.5">
            <Location16Regular className="text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground line-clamp-1">
              {booking.meetingAddress || 'Venue details confirmed with guest'}
            </span>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, idx) => (
                <Tag key={idx} size="extra-small" appearance="outline">
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed Meeting Check-In Voucher */}
        {isConfirmed && !isCompanionView && (
          <div className="mt-3 p-3.5 rounded-lg bg-accent-light border border-border flex items-center justify-between gap-3">
            <div>
              <span className="text-caption2 font-mono text-brand-fg font-semibold block">
                Session arrival PIN
              </span>
              <span className="text-title3 font-mono font-semibold tracking-widest text-foreground tabular">
                {booking.checkInPin ? booking.checkInPin : '••••••'}
              </span>
            </div>
            <div className="text-right max-w-[170px]">
              <span className="text-caption1 font-semibold text-foreground block">
                {booking.checkInPin ? 'Present at meetup' : 'Check-in security'}
              </span>
              <span className="text-caption2 text-muted-foreground block">
                {booking.checkInPin
                  ? 'Present this 6-digit PIN to guest upon arrival to begin your outing.'
                  : 'PIN generated securely upon arrival check-in.'}
              </span>
            </div>
          </div>
        )}

        {/* In-Progress Outing Completion Voucher */}
        {isInProgress && isCompanionView && (
          <div className="mt-3 p-3.5 rounded-lg bg-accent-light border border-border flex items-center justify-between gap-3">
            <div>
              <span className="text-caption2 font-mono text-brand-fg font-semibold block">
                Outing completion PIN
              </span>
              <span className="text-title3 font-mono font-semibold tracking-widest text-foreground tabular">
                {booking.completionPin ? booking.completionPin : '••••••'}
              </span>
            </div>
            <div className="text-right max-w-[180px]">
              <span className="text-caption1 font-semibold text-foreground block">
                {booking.completionPin ? 'Provide to host' : 'Escrow release code'}
              </span>
              <span className="text-caption2 text-muted-foreground block">
                {booking.completionPin
                  ? 'Disclose this PIN to host when outing concludes to authorize escrow release.'
                  : 'PIN available during active session.'}
              </span>
            </div>
          </div>
        )}

        {/* Cancelled or Disputed Status Banner */}
        {(isCancelled || isDisputed) && (
          <div className="mt-3 p-3 rounded-lg bg-muted border border-border space-y-1.5 text-caption1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheckmark16Regular className="text-trust" />
                <span>100% escrow protected</span>
              </span>
              <span className="text-caption1 font-mono text-muted-foreground">
                {booking.status}
              </span>
            </div>
            <p className="text-caption1 text-muted-foreground">
              {booking.cancellationReason
                ? `Cancellation note: "${booking.cancellationReason}"`
                : 'Session ended prior to fulfillment. Funds held in the escrow vault were returned to your wallet or original payment method.'}
            </p>
          </div>
        )}

        {/* Live Meetup Bar & SOS Trigger */}
        {isInProgress && (
          <div className="mt-3 p-3 rounded-lg bg-accent-light border border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-fg" />
              <span className="text-caption1 font-semibold text-brand-fg">
                Outing in progress
              </span>
            </div>
            {onOpenSos && (
              <Button
                appearance="outline"
                size="small"
                icon={<ShieldError16Regular />}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSos(booking);
                }}
                className="text-destructive border-destructive"
              >
                Safety SOS
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Card Ledger & Actions Section */}
      <div className="pt-3 border-t border-border space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-caption2 text-muted-foreground font-semibold block">
              {isPendingPayment ? 'Escrow deposit' : 'Total escrow hold'}
            </span>
            <span className="text-subtitle1 font-semibold font-mono tabular text-foreground">
              {formatINR(booking.totalAmount)}
            </span>
          </div>

          <Badge
            appearance="tint"
            color="warning"
            icon={<ShieldCheckmark16Regular />}
            className="bg-trust-light text-trust border border-trust-border"
          >
            Escrow protected
          </Badge>
        </div>

        {/* Action Controls Matrix: strictly compliant 44px touch targets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isPendingPayment && !isCompanionView && onPay && (
            <Button
              appearance="primary"
              size="large"
              icon={<Payment20Regular />}
              onClick={(e) => {
                e.stopPropagation();
                onPay(booking);
              }}
              className="flex-1 min-w-[130px] min-h-11"
            >
              Fund escrow
            </Button>
          )}

          {isConfirmed && isCompanionView && onCheckIn && (
            <Button
              appearance="primary"
              size="large"
              icon={<ShieldCheckmark20Regular />}
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn(booking);
              }}
              className="flex-1 min-w-[130px] min-h-11"
            >
              Verify PIN
            </Button>
          )}

          {isInProgress && !isCompanionView && onComplete && (
            <Button
              appearance="primary"
              size="large"
              icon={<CheckmarkCircle20Regular />}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(booking);
              }}
              className="flex-1 min-w-[150px] min-h-11"
            >
              Release escrow
            </Button>
          )}

          {isCompleted && (
            reviewStatus?.hasReviewed ? (
              <div className="flex items-center gap-1.5 px-3 py-2 min-h-11 rounded-md bg-trust-light border border-trust-border text-trust text-caption1 font-semibold tabular">
                <Star16Filled />
                <span>Reviewed ({reviewStatus.myReview?.rating || 5}/5)</span>
              </div>
            ) : (
              <Button
                appearance="primary"
                size="large"
                icon={<Star16Filled />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReviewModalOpen(true);
                }}
                className="flex-1 min-w-[130px] min-h-11"
              >
                Review
              </Button>
            )
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            {(isPendingPayment || isConfirmed) && !isCompanionView && onEdit && (
              <Button
                appearance="outline"
                size="large"
                icon={<Edit16Regular />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(booking);
                }}
                title="Edit venue, requirements, or schedule"
                className="min-h-11"
              >
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}

            {onCancel && !isCancelled && !isDisputed && !isCompleted && !isInProgress && (
              <Button
                appearance="outline"
                size="large"
                icon={<Dismiss16Regular />}
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(booking);
                }}
                title="Cancel booking"
                className="min-h-11 text-destructive border-border"
              >
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            )}

            <Button
              appearance="outline"
              size="large"
              icon={<Chat20Regular className="text-brand-fg" />}
              onClick={handleOpenChat}
              title="Open secure chat"
              className="min-h-11"
            >
              <span className="hidden sm:inline">Chat</span>
            </Button>
          </div>
        </div>
      </div>

      {isReviewModalOpen && (
        <LeaveReviewModal
          booking={booking}
          counterpartName={displayName}
          isProviderViewing={isCompanionView}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </div>
  );
};
