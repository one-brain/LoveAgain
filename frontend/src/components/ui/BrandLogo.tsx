import React from 'react';
import { Badge } from '@fluentui/react-components';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  isAdmin?: boolean;
  className?: string;
}

/**
 * Canonical Cue Brand Lockup (Fluent 2)
 * - Geometric Monogram: Cue Bordeaux (#881337) shield, open "C" connection arc,
 *   and Warm Trust Gold (#FBBF24) verification spark + nexus dot.
 * - Wordmark: Fluent Semibold with optional architectural divider and descriptor.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  subtitle,
  isAdmin = false,
  className = '',
}) => {
  const iconDimensions =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const wordmarkClass =
    size === 'sm'
      ? 'text-subtitle2 font-semibold tracking-tight text-foreground'
      : size === 'lg'
      ? 'text-title2 font-semibold tracking-tight text-foreground'
      : 'text-subtitle1 font-semibold tracking-tight text-foreground';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${iconDimensions} rounded-lg bg-accent flex items-center justify-center shrink-0 shadow-xs`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="36" height="36" rx="8" fill="currentColor" className="text-accent" />
          <rect
            x="0.75"
            y="0.75"
            width="34.5"
            height="34.5"
            rx="7.25"
            stroke="#FFFFFF"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          <path
            d="M23.5 11.75C21.85 10.35 19.68 9.5 17.25 9.5C12.14 9.5 8 13.31 8 18C8 22.69 12.14 26.5 17.25 26.5C20.22 26.5 22.86 25.21 24.5 23.2"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M25.5 9.5L26.65 12.35L29.5 13.5L26.65 14.65L25.5 17.5L24.35 14.65L21.5 13.5L24.35 12.35L25.5 9.5Z"
            fill="#FBBF24"
          />
          <circle cx="17.5" cy="18" r="2.1" fill="#FDE68A" />
        </svg>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <span className={wordmarkClass}>
          Cue<span className="text-trust">.</span>
        </span>

        {isAdmin && (
          <Badge appearance="tint" color="brand" size="small">
            Command
          </Badge>
        )}

        {subtitle && (
          <>
            <span className="hidden sm:inline-block h-3.5 w-px bg-border" aria-hidden="true" />
            <span className="text-caption1 font-semibold text-muted-foreground hidden sm:inline truncate">
              {subtitle}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
