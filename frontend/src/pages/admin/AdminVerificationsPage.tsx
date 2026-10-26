import React, { useState, useCallback } from 'react';
import {
  useGetAdminVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
} from '../../store/adminApi';
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminVerificationStudio } from '../../components/admin/AdminVerificationStudio';

export const AdminVerificationsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const {
    data: verificationsData,
    isLoading: isLoadingVerifications,
    refetch: refetchVerifications,
    isFetching,
  } = useGetAdminVerificationsQuery({});

  const [approveVerification, { isLoading: isApproving }] = useApproveVerificationMutation();
  const [rejectVerification, { isLoading: isRejecting }] = useRejectVerificationMutation();

  const handleApprove = async (profileId: string) => {
    try {
      await approveVerification(profileId).unwrap();
      refetchVerifications();
      showToast('Companion verification approved and published to discovery.');
    } catch {
      showToast('Failed to approve companion application.', 'error');
    }
  };

  const handleReject = async (profileId: string, reason: string) => {
    try {
      await rejectVerification({ profileId, reason }).unwrap();
      refetchVerifications();
      showToast('Companion application rejected with feedback sent to user.');
    } catch {
      showToast('Failed to reject application.', 'error');
    }
  };

  const pendingCount = verificationsData?.filter((v) => v.status === 'PendingReview').length ?? 0;

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
        title="Companion Verifications & KYC Studio"
        description="Review incoming companion credentials, inspect government identity proofs and liveness selfie captures, and publish approved profiles to the public discovery gallery."
        badge={
          pendingCount > 0 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{pendingCount} Pending Review</span>
            </div>
          ) : undefined
        }
        actions={
          <button
            type="button"
            onClick={() => refetchVerifications()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 text-muted-foreground ${isFetching ? 'animate-spin text-accent' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh Queue'}</span>
          </button>
        }
      />

      {/* Full-Bleed Studio View */}
      <main>
        <AdminVerificationStudio
          verifications={verificationsData ?? []}
          isLoading={isLoadingVerifications}
          onApprove={handleApprove}
          onReject={handleReject}
          isApproving={isApproving}
          isRejecting={isRejecting}
        />
      </main>
    </div>
  );
};

export default AdminVerificationsPage;

