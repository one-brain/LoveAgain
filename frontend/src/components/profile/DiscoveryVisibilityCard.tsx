import React, { useState } from 'react';
import {
  Button,
  Card,
  Badge,
  Switch,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Eye20Regular,
  EyeOff20Regular,
  ArrowSync16Regular,
} from '@fluentui/react-icons';
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
        text: 'Visibility toggle is available once your guest application is approved by safety review.',
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
          ? 'Profile is now live and visible to clients in discovery.'
          : 'Profile is now paused and hidden from discovery searches.',
      });
      onToggleSuccess?.(nextState);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.data?.error || 'Failed to update visibility status. Please try again.',
      });
    }
  };

  if (compact) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          {isActive ? (
            <Badge appearance="tint" color="success" icon={<Eye20Regular />}>
              Live on discovery
            </Badge>
          ) : (
            <Badge appearance="tint" color="warning" icon={<EyeOff20Regular />}>
              Visibility paused
            </Badge>
          )}

          {isApproved && (
            <Button
              appearance={isActive ? 'outline' : 'primary'}
              size="small"
              disabled={isUpdating}
              onClick={handleToggle}
              icon={isUpdating ? <ArrowSync16Regular className="animate-spin" /> : undefined}
            >
              {isUpdating ? 'Updating...' : isActive ? 'Pause profile' : 'Resume live'}
            </Button>
          )}
        </div>

        {feedback && (
          <p
            className={`text-caption1 ${
              feedback.type === 'success' ? 'text-success' : 'text-destructive'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`p-1.5 rounded-md ${
                isActive ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
              }`}
            >
              {isActive ? <Eye20Regular /> : <EyeOff20Regular />}
            </span>
            <h3 className="text-subtitle2 font-semibold text-foreground">Discovery visibility</h3>
            {isActive ? (
              <Badge appearance="tint" color="success">
                Live on discovery
              </Badge>
            ) : (
              <Badge appearance="tint" color="warning">
                Hidden from discovery
              </Badge>
            )}
          </div>
          <p className="text-caption1 text-muted-foreground leading-relaxed max-w-2xl">
            {isActive
              ? 'Your profile is currently discoverable by seekers looking for companions in your city and service area. Incoming booking requests can be received.'
              : 'Your profile is currently paused and hidden from discovery searches. Existing confirmed bookings and chat messages are completely unaffected.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Switch
            checked={isActive}
            disabled={isUpdating || !isApproved}
            onChange={handleToggle}
            label={isActive ? 'Visible' : 'Paused'}
          />
          <Button
            appearance={isActive ? 'outline' : 'primary'}
            icon={isActive ? <EyeOff20Regular /> : <Eye20Regular />}
            onClick={handleToggle}
            disabled={isUpdating || !isApproved}
            className="min-h-11"
          >
            {isUpdating
              ? 'Updating...'
              : isActive
              ? 'Pause profile'
              : 'Go live'}
          </Button>
        </div>
      </div>

      {feedback && (
        <MessageBar intent={feedback.type === 'success' ? 'success' : 'error'}>
          <MessageBarBody>{feedback.text}</MessageBarBody>
        </MessageBar>
      )}
    </Card>
  );
};
