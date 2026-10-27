import React, { useState, useCallback } from 'react';
import { useGetAdminMisQuery } from '../../store/adminApi';
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminKpiStrip } from '../../components/admin/AdminKpiStrip';
import { AdminMisAnalytics } from '../../components/admin/AdminMisAnalytics';

export const AdminMisPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const {
    data: misData,
    isLoading: isLoadingMis,
    refetch: refetchMis,
    isFetching,
  } = useGetAdminMisQuery();

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
      a.download = `cue_mis_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Platform report exported successfully.');
    } catch {
      showToast('Failed to export report.', 'error');
    }
  };

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
        title="Platform Performance & Analytics"
        description="Key business metrics: Total booking volume, 15% platform service fees, protected payment reserves, and popular activities."
        actions={
          <>
            <button
              type="button"
              onClick={() => refetchMis()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 text-muted-foreground ${isFetching ? 'animate-spin text-accent' : ''}`} />
              <span>{isFetching ? 'Refreshing...' : 'Refresh Metrics'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              <span>Export Report (CSV)</span>
            </button>
          </>
        }
      />

      {/* KPI Overview Cards */}
      <div className="mb-8">
        <AdminKpiStrip misData={misData} isLoading={isLoadingMis} />
      </div>

      {/* Full-Bleed MIS Analytics */}
      <main>
        <AdminMisAnalytics
          misData={misData}
          isLoading={isLoadingMis}
          onExportCsv={handleExportCsv}
        />
      </main>
    </div>
  );
};

export default AdminMisPage;

