import React, { useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useActivateProfileMutation } from '../../store/api';

interface DiscoveryVisibilityCardProps {
  isActive?: boolean;
  isApproved?: boolean;
  compact?: boolean;
  onToggleSuccess?: (newActive: boolean) => void;
}

export const DiscoveryVisibilityCard: React.FC<DiscoveryVisibilityCardProps> = ({
  isActive = true,
  isApproved = true,
  compact = false,
  onToggleSuccess,
}) => {
  const [activateProfile, { isLoading: isUpdating }] = useActivateProfileMutation();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = async () => {
    if (!isApproved) {
      setFeedback({
        type: 'error',
        text: 'Visibility toggle is available once your Companion application is approved by safety review.',
      });
      return;
    }

    setFeedback(null);
    const nextState = !isActive;

    try {
      await activateProfile({ active: nextState }).unwrap();
      setFeedback({
        type: 'success',
        text: nextState
          ? 'Profile is now Live and visible to clients in Discovery.'
          : 'Profile is now Paused and hidden from Discovery searches.',
      });
      onToggleSuccess?.(nextState);

      // Auto clear toast after 4s
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.data?.error || 'Failed to update visibility status. Please try again.',
      });
    }
  };

  // Compact Mode (for header in Profile / Settings)
  if (compact) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live on Discovery</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <EyeSlashIcon className="w-3.5 h-3.5" />
              <span>Visibility Paused</span>
            </span>
          )}

          {isApproved && (
            <button
              type="button"
              onClick={handleToggle}
              disabled={isUpdating}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                isActive
                  ? 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                  : 'border-accent bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs'
              }`}
            >
              {isUpdating ? (
                <span className="flex items-center gap-1">
                  <ArrowPathIcon className="w-3 h-3 animate-spin" />
                  <span>Updating...</span>
                </span>
              ) : isActive ? (
                <span>Pause Profile ⏸️</span>
              ) : (
                <span>Resume Live ▶️</span>
              )}
            </button>
          )}
        </div>

        {feedback && (
          <p
            className={`text-[11px] font-medium ${
              feedback.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    );
  }

  // Full Card Mode (for Companion Dashboard)
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {isActive ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
            </span>
            <h3 className="text-base font-bold text-foreground">Discovery Visibility</h3>
            {isActive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live on Discovery
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1">
                ⏸️ Hidden from Discovery
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            {isActive
              ? 'Your profile is currently discoverable by seekers looking for companions in your city and service area. Incoming booking requests can be received.'
              : 'Your profile is currently paused and hidden from Discovery searches. Existing confirmed bookings and chat messages are completely unaffected.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isUpdating || !isApproved}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shrink-0 ${
            isActive
              ? 'border border-border bg-card hover:bg-muted text-foreground'
              : 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs'
          } disabled:opacity-50`}
        >
          {isUpdating ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
              <span>Updating Visibility...</span>
            </>
          ) : isActive ? (
            <>
              <EyeSlashIcon className="w-4 h-4 text-muted-foreground" />
              <span>Pause Discovery Visibility</span>
            </>
          ) : (
            <>
              <EyeIcon className="w-4 h-4" />
              <span>Go Live / Resume Visibility</span>
            </>
          )}
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
};
