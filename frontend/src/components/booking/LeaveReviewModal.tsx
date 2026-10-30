import React, { useState } from 'react';
import { StarIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useSubmitReviewMutation } from '../../store/reviewApi';
import type { BookingSummary } from '../../store/bookingApi';

interface LeaveReviewModalProps {
  booking: BookingSummary;
  counterpartName: string;
  isProviderViewing?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Disappointing',
  2: 'Fair Experience',
  3: 'Good Experience',
  4: 'Very Good Experience',
  5: 'Exceptional Experience',
};

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  booking,
  counterpartName,
  isProviderViewing = false,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [timelinessScore, setTimelinessScore] = useState<number>(5);
  const [communicationScore, setCommunicationScore] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  const activeStarCount = hoverRating ?? rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 5) {
      setSubmitError('Please provide at least a short comment (5 characters or more).');
      return;
    }

    try {
      await submitReview({
        orderId: booking.orderId,
        rating,
        comment: trimmedComment,
        timelinessScore,
        communicationScore,
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.data?.error || err?.data?.message || 'Failed to submit review. Please try again.';
      setSubmitError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-card text-card-foreground border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60 bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                Safe Escrow Verified
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground mt-1">
              {isProviderViewing ? `Rate Client Experience` : `Review Your Experience`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              With <span className="font-semibold text-foreground">{counterpartName}</span> &bull; Order{' '}
              <span className="font-mono text-[11px]">#{booking.orderId.slice(0, 8)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close review modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {submitError && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {submitError}
            </div>
          )}

          {/* Primary Star Rating */}
          <div className="text-center space-y-2 py-2 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overall Rating
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= activeStarCount;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="w-11 h-11 flex items-center justify-center rounded-xl hover:scale-110 active:scale-95 transition-all text-amber-500"
                    aria-label={`Rate ${star} stars out of 5`}
                  >
                    {isFilled ? (
                      <StarIcon className="w-8 h-8 text-[#C5A059] drop-shadow-sm" />
                    ) : (
                      <StarOutlineIcon className="w-8 h-8 text-muted-foreground/40" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="font-serif text-base font-semibold text-foreground">
              {RATING_LABELS[activeStarCount] || 'Rate your session'}
            </p>
          </div>

          {/* Sub-Score Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timeliness */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Timeliness & Punctuality</span>
                <span className="font-mono text-xs font-bold text-[#C5A059]">{timelinessScore}/5</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTimelinessScore(num)}
                    className={`flex-1 min-h-[44px] rounded-xl text-xs font-mono font-bold transition-all ${
                      timelinessScore === num
                        ? 'bg-accent text-accent-foreground shadow-sm ring-2 ring-accent/30'
                        : 'bg-card text-muted-foreground hover:bg-muted border border-border/60'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Communication */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Communication & Respect</span>
                <span className="font-mono text-xs font-bold text-[#C5A059]">{communicationScore}/5</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCommunicationScore(num)}
                    className={`flex-1 min-h-[44px] rounded-xl text-xs font-mono font-bold transition-all ${
                      communicationScore === num
                        ? 'bg-accent text-accent-foreground shadow-sm ring-2 ring-accent/30'
                        : 'bg-card text-muted-foreground hover:bg-muted border border-border/60'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="review-comment" className="text-xs font-bold text-foreground">
                Written Feedback
              </label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {comment.length}/500
              </span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isProviderViewing
                  ? 'Share notes on client etiquette, punctuality, and meeting experience...'
                  : 'Describe your experience with your companion, conversational flow, venue atmosphere, and overall professionalism...'
              }
              className="w-full px-4 py-3 rounded-2xl bg-muted/30 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent resize-none transition-all"
            />
          </div>

          {/* Trust Ledger Advisory */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
            <ShieldCheckIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              Your review is permanently linked to verified escrow booking{' '}
              <strong className="text-foreground">#{booking.orderId.slice(0, 8)}</strong>. Reviews maintain safety and integrity across the Cue community.
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="min-h-[44px] px-5 rounded-2xl border border-border font-medium text-sm text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || comment.trim().length < 5}
              className="min-h-[44px] px-6 rounded-2xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Verified Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

