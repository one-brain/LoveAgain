import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
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
        <div className={`bg-card/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/80 shadow-md text-foreground ${className}`}>
          <div className="text-2xl font-bold font-serif text-foreground">
            {formatINR(rate)}
            <span className="text-xs font-normal text-muted-foreground">/hr</span>
          </div>
        </div>
      );
    }

    if (variant === 'row-item') {
      return (
        <span className={`font-mono font-semibold text-foreground ${className}`}>
          {formatRate(rate)}
        </span>
      );
    }

    // Default: 'card-badge'
    return (
      <div
        className={`bg-card/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-foreground border border-border shadow-xs ${className}`}
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
        className={`group bg-card/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/80 hover:border-accent/60 shadow-md text-foreground transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
            <LockClosedIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-widest text-foreground group-hover:text-accent transition-colors">
              ₹••••
              <span className="text-xs font-normal text-muted-foreground ml-1">/hr</span>
            </div>
            <div className="text-[10px] font-semibold text-accent -mt-0.5">
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
        className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent hover:underline cursor-pointer ${className}`}
      >
        <LockClosedIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="tracking-widest">₹••••/hr</span>
        <span className="text-[10px] text-muted-foreground font-sans">(Locked)</span>
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
      className={`group bg-card/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-foreground border border-border/90 hover:border-accent/70 hover:shadow-sm shadow-xs transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-accent/50 ${className}`}
    >
      <LockClosedIcon className="w-3 h-3 text-accent group-hover:scale-110 transition-transform shrink-0" />
      <span className="font-mono tracking-widest text-[11px] font-bold text-foreground group-hover:text-accent transition-colors">
        ₹••••
      </span>
      <span className="text-[10px] text-muted-foreground">/hr</span>
    </div>
  );
};

