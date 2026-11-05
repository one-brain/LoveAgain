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
      title: 'Total Booking Value',
      value: formatINR(misData?.totalGmv ?? 0),
      subtitle: 'All-time value of meetups booked',
      icon: CurrencyRupeeIcon,
      tone: 'neutral',
      badge: 'GMV Ledger',
    },
    {
      id: 'take',
      title: 'Platform Service Fees (15%)',
      value: formatINR(misData?.totalPlatformRevenue ?? 0),
      subtitle: 'Platform share supporting safety & support',
      icon: BanknotesIcon,
      tone: 'accent',
      badge: 'Platform Take',
    },
    {
      id: 'escrow',
      title: 'Protected Payments Held',
      value: formatINR(misData?.activeEscrowLocked ?? 0),
      subtitle: 'Held safely until meetups are completed',
      icon: LockClosedIcon,
      tone: 'warning',
      badge: 'Escrow Vault',
    },
    {
      id: 'fulfillment',
      title: 'Completed Meetups',
      value: `${misData?.completionRatePercent ?? 100}%`,
      subtitle: `${misData?.completedBookings ?? 0} Completed / ${misData?.totalBookings ?? 0} Total`,
      icon: CheckBadgeIcon,
      tone: 'success',
      badge: 'Completion',
    },
  ];

  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isAccent = kpi.tone === 'accent';
        const isWarning = kpi.tone === 'warning';
        const isSuccess = kpi.tone === 'success';

        return (
          <div
            key={kpi.id}
            className="p-5 rounded-2xl bg-card border border-border/80 hover:border-border transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between group"
          >
            {/* Top Row: Title + Uniform Icon Box */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-sans leading-snug">
                  {kpi.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                    isAccent
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : isWarning
                      ? 'bg-accent-champagne/15 text-accent-champagne border border-accent-champagne/30'
                      : isSuccess
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-muted/70 text-muted-foreground border border-border/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Main Metric Value */}
              <div className="flex items-baseline gap-2 mb-1">
                {isLoading ? (
                  <div className="h-8 w-28 bg-muted/60 animate-pulse rounded-md" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                    {kpi.value}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Subtitle + Uniform Subtly Pill Badge */}
            <div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground font-sans truncate" title={kpi.subtitle}>
                {kpi.subtitle}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono shrink-0 whitespace-nowrap border ${
                  isAccent
                    ? 'bg-accent/10 text-accent border-accent/25'
                    : isWarning
                    ? 'bg-accent-champagne/15 text-accent-champagne border-accent-champagne/30'
                    : isSuccess
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-muted/80 text-muted-foreground border-border/70'
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

