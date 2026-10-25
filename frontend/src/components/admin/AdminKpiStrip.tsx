import React from 'react';
import {
  BanknotesIcon,
  CurrencyRupeeIcon,
  LockClosedIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { formatINR } from '../../utils/currency';
import type { PlatformMisReport } from '../../store/adminApi';

interface AdminKpiStripProps {
  misData?: PlatformMisReport;
  isLoading?: boolean;
}

export const AdminKpiStrip: React.FC<AdminKpiStripProps> = ({
  misData,
  isLoading = false,
}) => {
  const kpis = [
    {
      id: 'gmv',
      title: 'Gross Merchandise Value',
      value: formatINR(misData?.totalGmv ?? 0),
      subtitle: 'All-time platform booking volume',
      icon: CurrencyRupeeIcon,
      tone: 'neutral',
      badge: 'GMV',
    },
    {
      id: 'take',
      title: 'Net Platform Take (15%)',
      value: formatINR(misData?.totalPlatformRevenue ?? 0),
      subtitle: 'Retained marketplace fee cut',
      icon: BanknotesIcon,
      tone: 'accent',
      badge: 'Take-Rate',
    },
    {
      id: 'escrow',
      title: 'Companion Escrow Locked',
      value: formatINR(misData?.activeEscrowLocked ?? 0),
      subtitle: 'Protected in RBI-compliant escrow',
      icon: LockClosedIcon,
      tone: 'warning',
      badge: 'Protected',
    },
    {
      id: 'fulfillment',
      title: 'Fulfillment Rate',
      value: `${misData?.completionRatePercent ?? 100}%`,
      subtitle: `${misData?.completedBookings ?? 0} Completed / ${misData?.totalBookings ?? 0} Total`,
      icon: CheckBadgeIcon,
      tone: 'success',
      badge: 'Lifecycle',
    },
  ];

  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isAccent = kpi.tone === 'accent';
        const isWarning = kpi.tone === 'warning';
        const isSuccess = kpi.tone === 'success';

        return (
          <div
            key={kpi.id}
            className={`p-4 sm:p-5 rounded-2xl bg-card border transition-all shadow-2xs hover:shadow-xs relative overflow-hidden group ${
              isAccent
                ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60'
                : 'border-border/80 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isAccent
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : isWarning
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : isSuccess
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              {isLoading ? (
                <div className="h-7 w-24 bg-muted/60 animate-pulse rounded-md" />
              ) : (
                <span
                  className={`text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums ${
                    isAccent
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-foreground'
                  }`}
                >
                  {kpi.value}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="text-[11px] text-muted-foreground font-medium truncate">
                {kpi.subtitle}
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  isAccent
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    : isSuccess
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {kpi.badge}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
};

