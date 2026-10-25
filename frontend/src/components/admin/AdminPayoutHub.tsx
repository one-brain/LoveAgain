import React, { useState } from 'react';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { AdminPayoutItem } from '../../store/adminApi';
import { formatINR } from '../../utils/currency';

interface AdminPayoutHubProps {
  payouts: AdminPayoutItem[];
  isLoading: boolean;
  onProcessPayout: (payoutId: string, utr: string) => Promise<void>;
  isProcessing: boolean;
  onRefresh: () => void;
}

export const AdminPayoutHub: React.FC<AdminPayoutHubProps> = ({
  payouts,
  isLoading,
  onProcessPayout,
  isProcessing,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('Pending');
  const [selectedPayout, setSelectedPayout] = useState<AdminPayoutItem | null>(null);
  const [payoutUtr, setPayoutUtr] = useState('');
  const [copiedVpa, setCopiedVpa] = useState<string | null>(null);

  const filteredPayouts = payouts.filter((p) => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  const pendingPayouts = payouts.filter((p) => p.status === 'Pending');
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPayouts = payouts.filter((p) => p.status === 'Completed');
  const completedAmount = completedPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleOpenProcess = (payout: AdminPayoutItem) => {
    setSelectedPayout(payout);
    setPayoutUtr(`UTR${Date.now().toString().slice(-8)}`);
  };

  const handleConfirmProcess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPayout) return;
    await onProcessPayout(selectedPayout.id, payoutUtr.trim());
    setSelectedPayout(null);
    setPayoutUtr('');
  };

  const handleCopyVpa = (vpa: string) => {
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(vpa);
    setTimeout(() => setCopiedVpa(null), 2000);
  };

  return (
    <section aria-label="UPI Payouts and Settlements Hub" className="space-y-4">
      {/* Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 p-3 sm:p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'Pending', label: 'Pending Settlement', count: pendingPayouts.length },
            { key: 'Completed', label: 'Settled Payouts', count: completedPayouts.length },
            { key: 'All', label: 'All Requests', count: payouts.length },
          ].map((pill) => {
            const isActive = filter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setFilter(pill.key as any)}
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
                      isActive
                        ? 'bg-background/20 text-accent-foreground'
                        : pill.key === 'Pending' && pill.count > 0
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {pill.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-2xs self-end sm:self-center"
          title="Refresh Payout Queue"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Mini Settlements Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border/70 p-3 rounded-2xl text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
            Pending Disbursal Queue
          </span>
          <p className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
            {formatINR(pendingAmount)} ({pendingPayouts.length} transfers)
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
            Total Settled Disbursals
          </span>
          <p className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {formatINR(completedAmount)} ({completedPayouts.length} transfers)
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Settlement Rail</span>
          <p className="font-medium text-xs text-foreground mt-0.5">
            Instant UPI VPA / RazorpayX Payouts
          </p>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground font-medium">Checking payout settlements queue...</p>
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="text-center py-16 p-8">
            <BanknotesIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">No payout records in this queue</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {filter === 'Pending'
                ? 'All companion payout requests have been settled.'
                : 'No payout records match this filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Companion</th>
                  <th className="px-4 py-3.5">Net Disbursal Amount</th>
                  <th className="px-4 py-3.5">UPI Destination VPA</th>
                  <th className="px-4 py-3.5">Settlement Status</th>
                  <th className="px-4 py-3.5">Requested At</th>
                  <th className="px-5 py-3.5 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayouts.map((payout) => {
                  const isPending = payout.status === 'Pending';

                  return (
                    <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-foreground">{payout.userName}</p>
                        <p className="text-[11px] text-muted-foreground">{payout.userEmail}</p>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-sm text-foreground tabular-nums">
                        {formatINR(payout.amount)}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-accent">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-muted/60 border border-border/60">
                          <span>{payout.destination}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyVpa(payout.destination)}
                            title="Copy UPI VPA"
                            className="p-1 rounded text-muted-foreground hover:text-foreground"
                          >
                            {copiedVpa === payout.destination ? (
                              <CheckIcon className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <ClipboardDocumentIcon className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            isPending
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                            }`}
                          />
                          <span>{payout.status}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground text-[11px] whitespace-nowrap">
                        {new Date(payout.createdAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleOpenProcess(payout)}
                            className="px-3.5 py-1.5 rounded-xl bg-accent text-accent-foreground font-bold text-xs hover:opacity-95 shadow-xs transition-all active:scale-95"
                          >
                            Disburse UPI
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            <span>Settled</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UTR Settlement Modal */}
      {selectedPayout && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payout-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 id="payout-modal-title" className="text-base font-bold text-foreground mb-1">
              Confirm UPI Payout Settlement
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Disbursing <strong>{formatINR(selectedPayout.amount)}</strong> to companion{' '}
              <strong>{selectedPayout.userName}</strong> ({selectedPayout.destination}).
            </p>

            <form onSubmit={handleConfirmProcess}>
              <div className="mb-4">
                <label htmlFor="payout-utr-input" className="text-xs font-semibold text-foreground block mb-1">
                  Bank UTR / RazorpayX Payout Reference:
                </label>
                <input
                  id="payout-utr-input"
                  type="text"
                  value={payoutUtr}
                  onChange={(e) => setPayoutUtr(e.target.value)}
                  placeholder="UTR1234567890"
                  className="w-full p-3 rounded-xl border border-border/80 bg-background font-mono text-xs text-foreground focus:ring-2 focus:ring-accent focus:outline-hidden"
                  autoFocus
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  A unique settlement tracking ID generated for auditing and reconciliation.
                </span>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !payoutUtr.trim()}
                  className="px-5 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Settling...' : 'Confirm Disbursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

