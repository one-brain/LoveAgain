import React from 'react';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { formatRate, formatINR } from '../../utils/currency';

export interface RateBadgeProps {
  rate: number | string | undefined | null;
  isAuthenticated: boolean;
  variant?: 'card-badge' | 'detail-header' | 'row-item';
  onAuthPrompt?: (e: React.MouseEvent) => void;
  className?: string;
}

export const RateBadge: React.FC<RateBadgeProps> = ({
  rate,
  isAuthenticated,
  variant = 'card-badge',
  onAuthPrompt,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated && onAuthPrompt) {
      e.stopPropagation();
      e.preventDefault();
      onAuthPrompt(e);
    }
  };

  if (isAuthenticated) {
    if (variant === 'detail-header') {
      return (
        <div className={`bg-card px-4 py-2 rounded-2xl border border-border shadow-sm text-foreground ${className}`}>
          <div className="text-title3 font-semibold font-mono tabular text-foreground">
            {formatINR(rate)}
            <span className="text-caption1 font-normal text-muted-foreground">/hr</span>
          </div>
        </div>
      );
    }

    if (variant === 'row-item') {
      return (
        <span className={`font-mono tabular font-semibold text-foreground ${className}`}>
          {formatRate(rate)}
        </span>
      );
    }

    // Default: 'card-badge'
    return (
      <div
        className={`inline-flex items-center bg-card/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-caption1 font-semibold font-mono tabular text-foreground border border-border shadow-xs ${className}`}
      >
        {formatRate(rate)}
      </div>
    );
  }

  // Masked rate for guests / unauthenticated users
  if (variant === 'detail-header') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onAuthPrompt) {
            e.preventDefault();
            onAuthPrompt(e as unknown as React.MouseEvent);
          }
        }}
        title="Sign in to view hourly rate"
        className={`group bg-card px-4 py-2 rounded-2xl border border-border hover:border-border-strong shadow-sm text-foreground transition-colors cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-accent-light text-brand-fg">
            <LockClosed16Regular />
          </div>
          <div>
            <div className="text-title3 font-semibold font-mono tabular text-foreground group-hover:text-brand-fg transition-colors">
              ₹••••
              <span className="text-caption1 font-normal text-muted-foreground ml-1">/hr</span>
            </div>
            <div className="text-caption2 font-semibold text-brand-fg">
              Sign in to reveal rate
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'row-item') {
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onAuthPrompt) {
            e.preventDefault();
            onAuthPrompt(e as unknown as React.MouseEvent);
          }
        }}
        title="Sign in to view hourly rate"
        className={`inline-flex items-center gap-1.5 font-mono tabular text-caption1 font-semibold text-brand-fg hover:underline cursor-pointer ${className}`}
      >
        <LockClosed16Regular className="shrink-0" />
        <span>₹••••/hr</span>
        <span className="text-caption2 text-muted-foreground font-sans">(Locked)</span>
      </span>
    );
  }

  // Default: 'card-badge'
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onAuthPrompt) {
          e.preventDefault();
          onAuthPrompt(e as unknown as React.MouseEvent);
        }
      }}
      title="Sign in to view hourly rate"
      className={`group inline-flex items-center gap-1.5 bg-card/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-caption1 font-semibold text-foreground border border-border hover:border-border-strong shadow-xs transition-colors cursor-pointer ${className}`}
    >
      <LockClosed16Regular className="text-brand-fg shrink-0" />
      <span className="font-mono tabular text-caption1 font-semibold text-foreground group-hover:text-brand-fg transition-colors">
        ₹••••
      </span>
      <span className="text-caption2 text-muted-foreground">/hr</span>
    </div>
  );
};
