import React from 'react';
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  Spinner,
} from '@fluentui/react-components';
import {
  DataBarVertical20Regular,
  Building20Regular,
  ArrowDownload16Regular,
  ArrowTrending20Regular,
} from '@fluentui/react-icons';
import type { PlatformMisReport } from '../../store/adminApi';
import { formatINR } from '../../utils/currency';

interface AdminMisAnalyticsProps {
  misData?: PlatformMisReport;
  isLoading: boolean;
  onExportCsv: () => void;
}

export const AdminMisAnalytics: React.FC<AdminMisAnalyticsProps> = ({
  misData,
  isLoading,
  onExportCsv,
}) => {
  const maxTrendGmv = Math.max(...(misData?.dailyTrends?.map((d) => d.gmv) || [50000]), 10000);

  return (
    <section aria-label="Platform Performance Reports" className="space-y-4">
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-body1 font-semibold text-foreground flex items-center gap-1.5">
            <ArrowTrending20Regular className="text-brand-fg" />
            <span>Platform growth & daily trends</span>
          </h2>
          <p className="text-caption1 text-muted-foreground mt-0.5">
            Daily booking volume, popular categories, and platform service fee earnings.
          </p>
        </div>

        <Button
          appearance="outline"
          size="small"
          icon={<ArrowDownload16Regular />}
          onClick={onExportCsv}
        >
          Export platform report (CSV)
        </Button>
      </Card>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner label="Aggregating analytics data..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily Trajectory Card */}
          <Card className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-body1 text-foreground flex items-center gap-2">
                <DataBarVertical20Regular className="text-brand-fg" />
                <span>Daily booking volume & revenue</span>
              </h3>
              <Badge appearance="outline" color="informative" size="small">
                Last 7 days
              </Badge>
            </div>

            {!misData?.dailyTrends || misData.dailyTrends.length === 0 ? (
              <div className="py-12 text-center text-caption1 text-muted-foreground">
                No daily trend records recorded yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {misData.dailyTrends.map((d) => {
                  const ratio =
                    d.gmv > 0 ? Math.min(1, Math.max(0.06, d.gmv / maxTrendGmv)) : 0;

                  return (
                    <div key={d.date} className="text-caption1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground tabular">{d.date}</span>
                        <div className="font-mono tabular">
                          <span className="font-semibold text-foreground">
                            {formatINR(d.gmv)}
                          </span>
                          <span className="text-muted-foreground ml-1.5">
                            ({d.bookingsCount} {d.bookingsCount === 1 ? 'booking' : 'bookings'})
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={ratio} thickness="large" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Specialty Categories Ranking */}
          <Card className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-body1 text-foreground flex items-center gap-2">
                <Building20Regular className="text-brand-fg" />
                <span>Top specialty categories by market volume</span>
              </h3>
              <Badge appearance="outline" color="informative" size="small">
                Ranked
              </Badge>
            </div>

            {!misData?.topSpecialties || misData.topSpecialties.length === 0 ? (
              <div className="py-12 text-center text-caption1 text-muted-foreground">
                No specialty bookings recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {misData.topSpecialties.map((cat, idx) => (
                  <div
                    key={cat.specialty}
                    className="p-3 rounded-lg bg-muted border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center font-mono font-semibold text-caption1 text-muted-foreground tabular">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-body1 text-foreground">
                          {cat.specialty}
                        </p>
                        <p className="text-caption1 text-muted-foreground tabular">
                          {cat.bookingsCount} completed{' '}
                          {cat.bookingsCount === 1 ? 'booking' : 'bookings'}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-body1 font-semibold text-brand-fg tabular">
                      {formatINR(cat.totalVolume)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </section>
  );
};
