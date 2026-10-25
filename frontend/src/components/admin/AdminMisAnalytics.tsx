import React from 'react';
import {
  ChartBarIcon,
  BuildingLibraryIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
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
    <section aria-label="MIS Reports and Trajectory" className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 p-4 rounded-2xl shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ArrowTrendingUpIcon className="w-4 h-4 text-accent" />
            <span>Marketplace Growth & Financial Trajectory</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily demand distribution, category volume analytics, and platform fee yield.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs"
        >
          <ArrowDownTrayIcon className="w-3.5 h-3.5 text-accent" />
          <span>Export MIS Report (CSV)</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-muted-foreground font-medium">Aggregating analytics data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Trajectory Card */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4 text-accent" />
                <span>Daily Booking Volume & Revenue Trajectory</span>
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono">Last 7 Days</span>
            </div>

            {(!misData?.dailyTrends || misData.dailyTrends.length === 0) ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No daily trend records recorded yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {misData.dailyTrends.map((d) => {
                  const percentage = Math.min(100, Math.max(12, (d.gmv / maxTrendGmv) * 100));

                  return (
                    <div key={d.date} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{d.date}</span>
                        <div className="font-mono tabular-nums">
                          <span className="font-bold text-foreground">{formatINR(d.gmv)}</span>
                          <span className="text-muted-foreground text-[10px] ml-1.5">
                            ({d.bookingsCount} {d.bookingsCount === 1 ? 'booking' : 'bookings'})
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Specialty Categories Ranking */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <BuildingLibraryIcon className="w-4 h-4 text-accent" />
                <span>Top Specialty Categories by Market Volume</span>
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono">Ranked</span>
            </div>

            {(!misData?.topSpecialties || misData.topSpecialties.length === 0) ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No specialty bookings recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {misData.topSpecialties.map((cat, idx) => (
                  <div
                    key={cat.specialty}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-card border border-border/80 flex items-center justify-center font-mono font-bold text-xs text-muted-foreground">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground">{cat.specialty}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {cat.bookingsCount} completed {cat.bookingsCount === 1 ? 'booking' : 'bookings'}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-sm font-bold text-accent tabular-nums">
                      {formatINR(cat.totalVolume)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
