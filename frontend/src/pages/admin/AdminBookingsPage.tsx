import React, { useState, useCallback } from 'react';
import { useGetAdminBookingsQuery } from '../../store/adminApi';
import {
  BanknotesIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminBookingLedger } from '../../components/admin/AdminBookingLedger';

export const AdminBookingsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    refetch: refetchBookings,
    isFetching,
  } = useGetAdminBookingsQuery({});

  const handleExportCsv = async () => {
    try {
      const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('cue_token') ||
        sessionStorage.getItem('cue_token');
      const response = await fetch('/api/v1/payments/admin/mis/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cue_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Booking and escrow ledger exported successfully.');
    } catch {
      showToast('Failed to export ledger report.', 'error');
    }
  };

  const totalBookings = bookingsData?.length ?? 0;
  const disputedCount = bookingsData?.filter((b) => (b.status || '').toLowerCase() === 'disputed').length ?? 0;

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
        title="Bookings & Escrow Audit Ledger"
        description="Monitor end-to-end platform reservation lifecycles, active escrow liquidity locked in vaults, dispute alerts, and 85/15 fund settlement transitions."
        badge={
          disputedCount > 0 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/30">
              <ExclamationTriangleIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{disputedCount} Disputed</span>
            </div>
          ) : totalBookings > 0 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30 font-mono">
              <BanknotesIcon className="w-3.5 h-3.5" />
              <span>{totalBookings} Orders Logged</span>
            </div>
          ) : undefined
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => refetchBookings()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 text-muted-foreground ${isFetching ? 'animate-spin text-accent' : ''}`} />
              <span>{isFetching ? 'Refreshing...' : 'Sync Ledger'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      {/* Error state if API call failed */}
      {isBookingsError && !isLoadingBookings && (
        <div className="mb-6 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Unable to load booking transactions</h4>
              <p className="text-xs text-muted-foreground mt-0.5">There was a problem communicating with the ledger service. Please verify your connection or privileges.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetchBookings()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs hover:bg-rose-600 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Retry Connection
          </button>
        </div>
      )}

      {/* Full-Bleed Ledger View */}
      <main>
        <AdminBookingLedger
          bookings={bookingsData ?? []}
          isLoading={isLoadingBookings}
          onRefresh={refetchBookings}
        />
      </main>
    </div>
  );
};

export default AdminBookingsPage;

