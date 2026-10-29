import React, { useState, useCallback } from 'react';
import {
  useGetAdminVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetAdminKycVerificationsQuery,
  useApproveAdminKycMutation,
  useRejectAdminKycMutation,
} from '../../store/adminApi';
import {
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminVerificationStudio } from '../../components/admin/AdminVerificationStudio';
import { AdminKycVerificationStudio } from '../../components/admin/AdminKycVerificationStudio';

export const AdminVerificationsPage: React.FC = () => {
  const [activeQueue, setActiveQueue] = useState<'companions' | 'kyc'>('companions');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const {
    data: verificationsData,
    isLoading: isLoadingVerifications,
    refetch: refetchVerifications,
    isFetching: isFetchingVerifications,
  } = useGetAdminVerificationsQuery({});

  const {
    data: kycData,
    isLoading: isLoadingKyc,
    refetch: refetchKyc,
    isFetching: isFetchingKyc,
  } = useGetAdminKycVerificationsQuery();

  const [approveVerification, { isLoading: isApproving }] = useApproveVerificationMutation();
  const [rejectVerification, { isLoading: isRejecting }] = useRejectVerificationMutation();

  const [approveAdminKyc, { isLoading: isApprovingKyc }] = useApproveAdminKycMutation();
  const [rejectAdminKyc, { isLoading: isRejectingKyc }] = useRejectAdminKycMutation();

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

  const handleApproveKyc = async (id: string) => {
    try {
      await approveAdminKyc(id).unwrap();
      refetchKyc();
      showToast('User identity verification approved successfully (+20 Trust Score).');
    } catch {
      showToast('Failed to approve KYC document.', 'error');
    }
  };

  const handleRejectKyc = async (id: string, reason: string) => {
    try {
      await rejectAdminKyc({ id, reason }).unwrap();
      refetchKyc();
      showToast('KYC document rejected with reason provided.');
    } catch {
      showToast('Failed to reject KYC document.', 'error');
    }
  };

  const pendingCompanionCount = verificationsData?.filter((v) => v.status === 'PendingReview').length ?? 0;
  const pendingKycCount = kycData?.filter((k) => k.status === 'PendingReview').length ?? 0;
  const isFetching = isFetchingVerifications || isFetchingKyc;

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
        title="Trust & Verification Center"
        description="Review companion applications, verify user government identity cards (KYC), and ensure safety standards across the platform."
        badge={
          (pendingCompanionCount + pendingKycCount) > 0 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{pendingCompanionCount + pendingKycCount} Total Pending</span>
            </div>
          ) : undefined
        }
        actions={
          <button
            type="button"
            onClick={() => {
              refetchVerifications();
              refetchKyc();
            }}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 text-muted-foreground ${isFetching ? 'animate-spin text-accent' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh Queues'}</span>
          </button>
        }
      />

      {/* Top Queue Switcher Tabs */}
      <div className="flex items-center gap-3 mb-6 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveQueue('companions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeQueue === 'companions'
              ? 'bg-foreground text-background shadow-xs'
              : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserGroupIcon className="w-4 h-4" />
          <span>Companion Applications</span>
          {pendingCompanionCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeQueue === 'companions' ? 'bg-background text-foreground' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              {pendingCompanionCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveQueue('kyc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeQueue === 'kyc'
              ? 'bg-foreground text-background shadow-xs'
              : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <IdentificationIcon className="w-4 h-4" />
          <span>User Identity KYC</span>
          {pendingKycCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeQueue === 'kyc' ? 'bg-background text-foreground' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              {pendingKycCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Studio View */}
      <main>
        {activeQueue === 'companions' ? (
          <AdminVerificationStudio
            verifications={verificationsData ?? []}
            isLoading={isLoadingVerifications}
            onApprove={handleApprove}
            onReject={handleReject}
            isApproving={isApproving}
            isRejecting={isRejecting}
          />
        ) : (
          <AdminKycVerificationStudio
            kycItems={kycData ?? []}
            isLoading={isLoadingKyc}
            onApprove={handleApproveKyc}
            onReject={handleRejectKyc}
            isApproving={isApprovingKyc}
            isRejecting={isRejectingKyc}
          />
        )}
      </main>
    </div>
  );
};

export default AdminVerificationsPage;

