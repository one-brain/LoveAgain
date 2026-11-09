import React, { useState, useCallback } from 'react';
import {
  useGetAdminPayoutsQuery,
  useProcessAdminPayoutMutation,
} from '../../store/adminApi';
import {
  Badge,
  Button,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Money16Regular,
  ArrowSync16Regular,
} from '@fluentui/react-icons';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminPayoutHub } from '../../components/admin/AdminPayoutHub';

export const AdminPayoutsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: payoutsData,
    isLoading: isLoadingPayouts,
    refetch: refetchPayouts,
    isFetching,
  } = useGetAdminPayoutsQuery({ page, pageSize });

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

  const pendingCount =
    payoutsData?.items?.filter((p) => p.status === 'Pending').length ??
    payoutsData?.totalCount ??
    0;

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
        title="Companion earnings withdrawals"
        description="Process and track companion withdrawal requests to bank accounts and UPI IDs with automated UTR verification."
        badge={
          pendingCount > 0 ? (
            <Badge appearance="tint" color="warning" icon={<Money16Regular />} className="tabular">
              {pendingCount} pending withdrawals
            </Badge>
          ) : undefined
        }
        actions={
          <Button
            appearance="outline"
            size="medium"
            icon={<ArrowSync16Regular className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => refetchPayouts()}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Sync payouts'}
          </Button>
        }
      />

      <main>
        <AdminPayoutHub
          payouts={payoutsData?.items ?? []}
          isLoading={isLoadingPayouts}
          onProcessPayout={handleProcessPayout}
          isProcessing={isProcessingPayout}
          onRefresh={refetchPayouts}
          page={page}
          pageSize={pageSize}
          totalCount={payoutsData?.totalCount ?? 0}
          totalPages={payoutsData?.totalPages ?? 1}
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

export default AdminPayoutsPage;
