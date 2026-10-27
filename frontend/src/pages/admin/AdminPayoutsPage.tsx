import React, { useState, useCallback } from 'react';
import {
  useGetAdminPayoutsQuery,
  useProcessAdminPayoutMutation,
} from '../../store/adminApi';
import {
  CurrencyRupeeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminPayoutHub } from '../../components/admin/AdminPayoutHub';

export const AdminPayoutsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const {
    data: payoutsData,
    isLoading: isLoadingPayouts,
    refetch: refetchPayouts,
    isFetching,
  } = useGetAdminPayoutsQuery();

  const [processPayout, { isLoading: isProcessingPayout }] = useProcessAdminPayoutMutation();

  const handleProcessPayout = async (payoutId: string, utr: string) => {
    try {
      await processPayout({ payoutId, utrReference: utr || undefined }).unwrap();
      refetchPayouts();
      showToast('Companion UPI payout processed successfully.');
    } catch {
      showToast('Failed to process payout.', 'error');
    }
  };

  const pendingCount = payoutsData?.filter((p) => p.status === 'Pending').length ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in-50 duration-150">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs sm:text-sm font-semibold transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-card border-emerald-500/40 text-foreground ring-2 ring-emerald-500/20'
              : 'bg-card border-rose-500/40 text-foreground ring-2 ring-rose-500/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        title="Companion Earnings Withdrawals"
        description="Process and track companion withdrawal requests to bank accounts and UPI IDs with automated UTR verification."
        badge={
          pendingCount > 0 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
              <CurrencyRupeeIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{pendingCount} Pending Withdrawals</span>
            </div>
          ) : undefined
        }
        actions={
          <button
            type="button"
            onClick={() => refetchPayouts()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 text-muted-foreground ${isFetching ? 'animate-spin text-accent' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Sync Payouts'}</span>
          </button>
        }
      />

      {/* Full-Bleed Payout Hub */}
      <main>
        <AdminPayoutHub
          payouts={payoutsData ?? []}
          isLoading={isLoadingPayouts}
          onProcessPayout={handleProcessPayout}
          isProcessing={isProcessingPayout}
          onRefresh={refetchPayouts}
        />
      </main>
    </div>
  );
};

export default AdminPayoutsPage;

