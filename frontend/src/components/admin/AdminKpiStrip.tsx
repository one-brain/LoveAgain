import React from 'react';
import { Badge, Card, Skeleton, SkeletonItem } from '@fluentui/react-components';
import {
  Money20Regular,
  LockClosed20Regular,
  CheckmarkStarburst20Regular,
  DataBarVertical20Regular,
} from '@fluentui/react-icons';
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
  const kpis: {
    id: string;
    title: string;
    value: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeColor: 'informative' | 'brand' | 'warning' | 'success';
    badge: string;
  }[] = [
    {
      id: 'gmv',
      title: 'Total booking value',
      value: formatINR(misData?.totalGmv ?? 0),
      subtitle: 'All-time value of outings booked',
      icon: DataBarVertical20Regular,
      badgeColor: 'informative',
      badge: 'GMV ledger',
    },
    {
      id: 'take',
      title: 'Platform service fees (15%)',
      value: formatINR(misData?.totalPlatformRevenue ?? 0),
      subtitle: 'Platform share supporting safety & support',
      icon: Money20Regular,
      badgeColor: 'brand',
      badge: 'Platform take',
    },
    {
      id: 'escrow',
      title: 'Protected payments held',
      value: formatINR(misData?.activeEscrowLocked ?? 0),
      subtitle: 'Held safely until outings are completed',
      icon: LockClosed20Regular,
      badgeColor: 'warning',
      badge: 'Escrow vault',
    },
    {
      id: 'fulfillment',
      title: 'Completed outings',
      value: `${misData?.completionRatePercent ?? 100}%`,
      subtitle: `${misData?.completedBookings ?? 0} completed / ${misData?.totalBookings ?? 0} total`,
      icon: CheckmarkStarburst20Regular,
      badgeColor: 'success',
      badge: 'Completion',
    },
  ];

  return (
    <section
      aria-label="Key Performance Indicators"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
    >
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <Card
            key={kpi.id}
            className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-caption1 font-semibold text-muted-foreground">
                  {kpi.title}
                </span>
                <Icon className="text-brand-fg shrink-0" />
              </div>

              <div className="mb-1">
                {isLoading ? (
                  <Skeleton>
                    <SkeletonItem size={28} />
                  </Skeleton>
                ) : (
                  <span className="text-title2 font-semibold font-mono text-foreground tabular">
                    {kpi.value}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5 mt-2 border-t border-border">
              <span
                className="text-caption1 text-muted-foreground truncate tabular"
                title={kpi.subtitle}
              >
                {kpi.subtitle}
              </span>
              <Badge appearance="tint" color={kpi.badgeColor} size="small">
                {kpi.badge}
              </Badge>
            </div>
          </Card>
        );
      })}
    </section>
  );
};
