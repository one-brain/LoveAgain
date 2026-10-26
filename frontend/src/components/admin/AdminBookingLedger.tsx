import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BanknotesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type { AdminBookingLedgerItem } from '../../store/adminApi';
import { formatINR } from '../../utils/currency';

interface AdminBookingLedgerProps {
  bookings: AdminBookingLedgerItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminBookingLedger: React.FC<AdminBookingLedgerProps> = ({
  bookings,
  isLoading,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isEscrowStatus = (status: string) => {
    const s = status.toLowerCase();
    return s === 'confirmed' || s === 'inprogress' || s === 'inescrow' || s === 'pending' || s === 'pendingpayment';
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      statusFilter === 'All'
        ? true
        : statusFilter === 'InEscrow'
        ? isEscrowStatus(b.status)
        : statusFilter === 'Disputed'
        ? b.status.toLowerCase() === 'disputed'
        : b.status.toLowerCase() === statusFilter.toLowerCase();

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      b.bookingId.toLowerCase().includes(q) ||
      b.seekerName.toLowerCase().includes(q) ||
      b.providerName.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const totalGmv = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPlatformFee = filteredBookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);
  const totalProviderNet = filteredBookings.reduce((sum, b) => sum + (b.providerEarnings || 0), 0);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section aria-label="Bookings and Revenue Ledger" className="space-y-4">
      {/* Controls & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 p-3 sm:p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'All', label: 'All Bookings', count: bookings.length },
            { key: 'InEscrow', label: 'In Escrow / Active', count: bookings.filter((b) => isEscrowStatus(b.status)).length },
            { key: 'Completed', label: 'Completed', count: bookings.filter((b) => b.status === 'Completed').length },
            { key: 'Cancelled', label: 'Cancelled', count: bookings.filter((b) => b.status === 'Cancelled').length },
            {
              key: 'Disputed',
              label: 'Disputed',
              count: bookings.filter((b) => b.status === 'Disputed').length,
            },
          ].map((pill) => {
            const isActive = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                    : 'bg-card text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{pill.label}</span>
                {pill.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-background/20 text-accent-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {pill.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, seeker, companion..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border/80 bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-accent"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs"
            title="Refresh Ledger"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Financial Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card border border-border/70 p-3 rounded-2xl text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Showing Records</span>
          <p className="font-mono font-bold text-sm text-foreground mt-0.5 tabular-nums">
            {filteredBookings.length} bookings
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Filtered Gross GMV</span>
          <p className="font-mono font-bold text-sm text-foreground mt-0.5 tabular-nums">
            {formatINR(totalGmv)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
            Platform Take (15%)
          </span>
          <p className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
            {formatINR(totalPlatformFee)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
            Companion Net (85%)
          </span>
          <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {formatINR(totalProviderNet)}
          </p>
        </div>
      </div>

      {/* Tabular Ledger Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground font-medium">Fetching escrow ledger transactions...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 p-8">
            <BanknotesIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">No booking records found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search ? 'No bookings match your current search query.' : 'No transactions exist for this filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Booking / Order ID</th>
                  <th className="px-4 py-3.5">Seeker</th>
                  <th className="px-4 py-3.5">Companion</th>
                  <th className="px-4 py-3.5 text-right">Gross GMV</th>
                  <th className="px-4 py-3.5 text-right">Cue Take (15%)</th>
                  <th className="px-4 py-3.5 text-right">Companion Net (85%)</th>
                  <th className="px-4 py-3.5">Escrow State</th>
                  <th className="px-5 py-3.5">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBookings.map((b) => {
                  const isCompleted = b.status === 'Completed';
                  const isCancelled = b.status === 'Cancelled';
                  const isDisputed = b.status === 'Disputed';
                  const isInEscrow = isEscrowStatus(b.status);

                  return (
                    <tr key={b.bookingId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span>{b.bookingId.slice(0, 8)}...</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(b.bookingId)}
                            title="Copy full Booking ID"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === b.bookingId ? (
                              <CheckIcon className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <ClipboardDocumentIcon className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-foreground">
                        {b.seekerName}
                      </td>

                      <td className="px-4 py-3.5 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground">{b.providerName}</span>
                          <Link
                            to={`/provider/${b.providerId}`}
                            title="View Companion Discovery Profile"
                            className="p-1 rounded text-accent hover:bg-accent/10 transition-colors"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-foreground text-right tabular-nums">
                        {formatINR(b.totalAmount)}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-amber-600 dark:text-amber-400 text-right tabular-nums">
                        {formatINR(b.platformFee)}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right tabular-nums">
                        {formatINR(b.providerEarnings)}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : isCancelled
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : isDisputed
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 ring-1 ring-rose-500/20 font-extrabold'
                              : isInEscrow
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isCancelled
                                ? 'bg-rose-500'
                                : isDisputed
                                ? 'bg-rose-600 animate-ping'
                                : isInEscrow
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-muted-foreground'
                            }`}
                          />
                          <span>{b.status}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground text-[11px] whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

