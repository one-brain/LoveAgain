import React from 'react';
import { SignalIcon } from '@heroicons/react/24/outline';

interface AdminPageHeaderProps {
  category?: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  category = 'Back-Office Operations',
  title,
  description,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-border/80">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            {category}
          </span>
          <span className="text-muted-foreground/60">•</span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
            <SignalIcon className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Telemetry Live</span>
          </div>
          {badge}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-serif">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;

