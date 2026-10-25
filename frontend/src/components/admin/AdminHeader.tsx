import React from 'react';
import {
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  SignalIcon,
} from '@heroicons/react/24/outline';

interface AdminHeaderProps {
  onRefreshAll: () => void;
  onExportCsv: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onRefreshAll,
  onExportCsv,
  isRefreshing = false,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-border/70">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-tight">
            <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
            <span>Cue Back-Office Command Center</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
            <SignalIcon className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Gateway Online • Live Telemetry</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-serif">
          Operations, KYC & Revenue Studio
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Real-time companion credential inspection, escrow booking settlement, user trust moderation, and financial ledger control.
        </p>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
        <button
          type="button"
          onClick={onRefreshAll}
          disabled={isRefreshing}
          aria-label="Refresh platform telemetry"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowPathIcon className={`w-3.5 h-3.5 text-muted-foreground ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
        </button>

        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowDownTrayIcon className="w-3.5 h-3.5" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>
    </header>
  );
};
