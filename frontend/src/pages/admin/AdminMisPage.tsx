import React, { useState, useCallback } from 'react';
import { useGetAdminMisQuery } from '../../store/adminApi';
import {
  Button,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  ArrowSync16Regular,
  ArrowDownload16Regular,
} from '@fluentui/react-icons';
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {toast && (
        <div role="status" aria-live="polite" className="mb-4">
          <MessageBar intent={toast.type === 'success' ? 'success' : 'error'}>
            <MessageBarBody>{toast.message}</MessageBarBody>
          </MessageBar>
        </div>
      )}

      <AdminPageHeader
        title="Platform performance & analytics"
        description="Key business metrics: total booking volume, 15% platform service fees, protected payment reserves, and popular activities."
        actions={
          <>
            <Button
              appearance="outline"
              size="medium"
              icon={<ArrowSync16Regular className={isFetching ? 'animate-spin' : ''} />}
              onClick={() => refetchMis()}
              disabled={isFetching}
            >
              {isFetching ? 'Refreshing...' : 'Refresh metrics'}
            </Button>
            <Button
              appearance="primary"
              size="medium"
              icon={<ArrowDownload16Regular />}
              onClick={handleExportCsv}
            >
              Export report (CSV)
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <AdminKpiStrip misData={misData} isLoading={isLoadingMis} />
      </div>

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
