import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Textarea,
  Field,
  Badge,
  MessageBar,
  MessageBarBody,
  ToggleButton,
  Spinner,
} from '@fluentui/react-components';
import {
  Star24Filled,
  Star24Regular,
  Dismiss20Regular,
  ShieldCheckmark16Regular,
} from '@fluentui/react-icons';
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
  2: 'Fair experience',
  3: 'Good experience',
  4: 'Very good experience',
  5: 'Exceptional experience',
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
    <Dialog open={true} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface
        className="max-w-lg w-full bg-card text-card-foreground border border-border rounded-2xl p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Close review modal"
                  icon={<Dismiss20Regular />}
                  onClick={onClose}
                />
              }
            >
              <div>
                <div className="mb-1">
                  <Badge
                    appearance="tint"
                    color="warning"
                    icon={<ShieldCheckmark16Regular />}
                    className="bg-trust-light text-trust border border-trust-border"
                  >
                    Safe escrow verified
                  </Badge>
                </div>
                <span className="text-subtitle1 font-semibold text-foreground block">
                  {isProviderViewing ? 'Rate host experience' : 'Review your outing'}
                </span>
                <span className="text-caption1 font-normal text-muted-foreground block">
                  With <strong className="text-foreground font-semibold">{counterpartName}</strong> • Order{' '}
                  <span className="font-mono tabular">#{booking.orderId.slice(0, 8)}</span>
                </span>
              </div>
            </DialogTitle>

            <DialogContent className="space-y-5 pt-4">
              {submitError && (
                <MessageBar intent="error">
                  <MessageBarBody>{submitError}</MessageBarBody>
                </MessageBar>
              )}

              {/* Primary Star Rating */}
              <div className="text-center space-y-2 py-3 bg-muted rounded-lg border border-border">
                <p className="text-caption1 font-semibold text-muted-foreground">
                  Overall rating
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
                        className="w-11 h-11 flex items-center justify-center rounded-md transition-colors text-trust cursor-pointer"
                        aria-label={`Rate ${star} stars out of 5`}
                      >
                        {isFilled ? (
                          <Star24Filled className="text-trust" />
                        ) : (
                          <Star24Regular className="text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-body2 font-semibold text-foreground">
                  {RATING_LABELS[activeStarCount] || 'Rate your session'}
                </p>
              </div>

              {/* Sub-Score Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-muted border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption1 font-semibold text-foreground">Timeliness & punctuality</span>
                    <span className="font-mono tabular text-caption1 font-semibold text-trust">{timelinessScore}/5</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <ToggleButton
                        key={num}
                        size="small"
                        checked={timelinessScore === num}
                        appearance={timelinessScore === num ? 'primary' : 'outline'}
                        onClick={() => setTimelinessScore(num)}
                        className="flex-1 min-h-11 font-mono tabular"
                      >
                        {num}
                      </ToggleButton>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-muted border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption1 font-semibold text-foreground">Communication & respect</span>
                    <span className="font-mono tabular text-caption1 font-semibold text-trust">{communicationScore}/5</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <ToggleButton
                        key={num}
                        size="small"
                        checked={communicationScore === num}
                        appearance={communicationScore === num ? 'primary' : 'outline'}
                        onClick={() => setCommunicationScore(num)}
                        className="flex-1 min-h-11 font-mono tabular"
                      >
                        {num}
                      </ToggleButton>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Textarea */}
              <Field
                label="Written feedback"
                hint={<span className="font-mono tabular">{comment.length}/500</span>}
              >
                <Textarea
                  id="review-comment"
                  rows={4}
                  maxLength={500}
                  value={comment}
                  onChange={(_, data) => setComment(data.value)}
                  placeholder={
                    isProviderViewing
                      ? 'Share notes on host etiquette, punctuality, and outing experience...'
                      : 'Describe your experience with your guest, conversational flow, venue atmosphere, and overall professionalism...'
                  }
                />
              </Field>

              <div className="p-3.5 rounded-lg bg-trust-light border border-trust-border text-caption1 text-muted-foreground flex items-start gap-2.5">
                <ShieldCheckmark16Regular className="text-trust shrink-0 mt-0.5" />
                <span>
                  Your review is permanently linked to verified escrow booking{' '}
                  <strong className="text-foreground font-semibold tabular">#{booking.orderId.slice(0, 8)}</strong>. Reviews maintain safety and integrity across the Cue community.
                </span>
              </div>
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
                disabled={isLoading || comment.trim().length < 5}
                icon={isLoading ? <Spinner size="tiny" /> : undefined}
              >
                {isLoading ? 'Posting...' : 'Post review'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};
