import React, { useState, useCallback } from 'react';
import { useGetAdminBookingsQuery } from '../../store/adminApi';
import {
  Badge,
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Money16Regular,
  ArrowSync16Regular,
  ArrowDownload16Regular,
  Warning16Regular,
} from '@fluentui/react-icons';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminBookingLedger } from '../../components/admin/AdminBookingLedger';

export const AdminBookingsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    refetch: refetchBookings,
    isFetching,
  } = useGetAdminBookingsQuery({ page, pageSize });

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
      showToast('Bookings report exported successfully.');
    } catch {
      showToast('Failed to export ledger report.', 'error');
    }
  };

  const totalBookings = bookingsData?.totalCount ?? 0;
  const disputedCount =
    bookingsData?.items?.filter((b) => (b.status || '').toLowerCase() === 'disputed').length ?? 0;

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
        title="Platform bookings & payments"
        description="Monitor all platform bookings, protected payments, meeting statuses, and 85/15 fee splits."
        badge={
          disputedCount > 0 ? (
            <Badge appearance="tint" color="danger" icon={<Warning16Regular />} className="tabular">
              {disputedCount} disputed
            </Badge>
          ) : totalBookings > 0 ? (
            <Badge appearance="tint" color="brand" icon={<Money16Regular />} className="tabular">
              {totalBookings} orders logged
            </Badge>
          ) : undefined
        }
        actions={
          <>
            <Button
              appearance="outline"
              size="medium"
              icon={<ArrowSync16Regular className={isFetching ? 'animate-spin' : ''} />}
              onClick={() => refetchBookings()}
              disabled={isFetching}
            >
              {isFetching ? 'Refreshing...' : 'Sync ledger'}
            </Button>
            <Button
              appearance="primary"
              size="medium"
              icon={<ArrowDownload16Regular />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
          </>
        }
      />

      {isBookingsError && !isLoadingBookings && (
        <MessageBar intent="error" className="mb-6">
          <MessageBarBody>
            Unable to load booking transactions. There was a problem communicating with the ledger service.
          </MessageBarBody>
          <MessageBarActions>
            <Button appearance="outline" size="small" onClick={() => refetchBookings()}>
              Retry connection
            </Button>
          </MessageBarActions>
        </MessageBar>
      )}

      <main>
        <AdminBookingLedger
          bookings={bookingsData?.items ?? []}
          isLoading={isLoadingBookings}
          onRefresh={refetchBookings}
          page={page}
          pageSize={pageSize}
          totalCount={bookingsData?.totalCount ?? 0}
          totalPages={bookingsData?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
        />
      </main>
    </div>
  );
};

export default AdminBookingsPage;
