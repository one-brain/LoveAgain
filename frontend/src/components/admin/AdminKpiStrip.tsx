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
      badge: 'Total Value',
    },
    {
      id: 'take',
      title: 'Platform Service Fees (15%)',
      value: formatINR(misData?.totalPlatformRevenue ?? 0),
      subtitle: 'Platform share supporting safety & support',
      icon: BanknotesIcon,
      tone: 'accent',
      badge: 'Service Fee',
    },
    {
      id: 'escrow',
      title: 'Protected Payments Held',
      value: formatINR(misData?.activeEscrowLocked ?? 0),
      subtitle: 'Held safely until meetups are completed',
      icon: LockClosedIcon,
      tone: 'warning',
      badge: 'Safe Escrow',
    },
    {
      id: 'fulfillment',
      title: 'Completed Meetups',
      value: `${misData?.completionRatePercent ?? 100}%`,
      subtitle: `${misData?.completedBookings ?? 0} Completed / ${misData?.totalBookings ?? 0} Total`,
      icon: CheckBadgeIcon,
      tone: 'success',
      badge: 'Success Rate',
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
                ? 'border-accent/40 bg-accent/5 hover:border-accent/60'
                : isWarning
                ? 'border-accent-champagne/40 bg-accent-champagne/5 hover:border-accent-champagne/60'
                : 'border-border/80 hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate font-sans">
                {kpi.title}
              </span>
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isAccent
                    ? 'bg-accent/15 text-accent'
                    : isWarning
                    ? 'bg-accent-champagne/15 text-accent-champagne'
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
                  className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums ${
                    isAccent
                      ? 'text-accent'
                      : isWarning
                      ? 'text-accent-champagne'
                      : 'text-foreground'
                  }`}
                >
                  {kpi.value}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span className="text-[11px] text-muted-foreground font-medium truncate font-sans">
                {kpi.subtitle}
              </span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono ${
                  isAccent
                    ? 'bg-accent/15 text-accent'
                    : isWarning
                    ? 'bg-accent-champagne/20 text-accent-champagne'
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

