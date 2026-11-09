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
  Badge,
  Button,
  MessageBar,
  MessageBarBody,
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  ShieldCheckmark16Regular,
  ArrowSync16Regular,
  ContactCard20Regular,
  People20Regular,
} from '@fluentui/react-icons';
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

  const [companionPage, setCompanionPage] = useState(1);
  const [companionPageSize, setCompanionPageSize] = useState(20);

  const [kycPage, setKycPage] = useState(1);
  const [kycPageSize, setKycPageSize] = useState(20);

  const {
    data: verificationsData,
    isLoading: isLoadingVerifications,
    refetch: refetchVerifications,
    isFetching: isFetchingVerifications,
  } = useGetAdminVerificationsQuery({ page: companionPage, pageSize: companionPageSize });

  const {
    data: kycData,
    isLoading: isLoadingKyc,
    refetch: refetchKyc,
    isFetching: isFetchingKyc,
  } = useGetAdminKycVerificationsQuery({ page: kycPage, pageSize: kycPageSize });

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
      showToast('User identity verification approved successfully (+20 trust score).');
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

  const pendingCompanionCount =
    verificationsData?.items?.filter((v) => v.status === 'PendingReview').length ??
    verificationsData?.totalCount ??
    0;
  const pendingKycCount =
    kycData?.items?.filter((k) => k.status === 'PendingReview').length ??
    kycData?.totalCount ??
    0;
  const isFetching = isFetchingVerifications || isFetchingKyc;

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
        title="Trust & verification center"
        description="Review companion applications, verify user government identity cards (KYC), and ensure safety standards across the platform."
        badge={
          pendingCompanionCount + pendingKycCount > 0 ? (
            <Badge
              appearance="tint"
              color="warning"
              icon={<ShieldCheckmark16Regular />}
              className="tabular"
            >
              {pendingCompanionCount + pendingKycCount} total pending
            </Badge>
          ) : undefined
        }
        actions={
          <Button
            appearance="outline"
            size="medium"
            icon={<ArrowSync16Regular className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => {
              refetchVerifications();
              refetchKyc();
            }}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh queues'}
          </Button>
        }
      />

      {/* Top Queue Switcher Tabs */}
      <div className="mb-5 border-b border-border pb-1">
        <TabList
          selectedValue={activeQueue}
          onTabSelect={(_e, data) => setActiveQueue(data.value as 'companions' | 'kyc')}
        >
          <Tab value="companions" icon={<People20Regular />}>
            <span className="flex items-center gap-1.5">
              <span>Companion applications</span>
              {pendingCompanionCount > 0 && (
                <Badge appearance="tint" color="warning" size="small" className="tabular">
                  {pendingCompanionCount}
                </Badge>
              )}
            </span>
          </Tab>
          <Tab value="kyc" icon={<ContactCard20Regular />}>
            <span className="flex items-center gap-1.5">
              <span>User identity KYC</span>
              {pendingKycCount > 0 && (
                <Badge appearance="tint" color="warning" size="small" className="tabular">
                  {pendingKycCount}
                </Badge>
              )}
            </span>
          </Tab>
        </TabList>
      </div>

      {/* Main Studio View */}
      <main>
        {activeQueue === 'companions' ? (
          <AdminVerificationStudio
            verifications={verificationsData?.items ?? []}
            isLoading={isLoadingVerifications}
            onApprove={handleApprove}
            onReject={handleReject}
            isApproving={isApproving}
            isRejecting={isRejecting}
            page={companionPage}
            pageSize={companionPageSize}
            totalCount={verificationsData?.totalCount ?? 0}
            totalPages={verificationsData?.totalPages ?? 1}
            onPageChange={setCompanionPage}
            onPageSizeChange={(sz) => {
              setCompanionPageSize(sz);
              setCompanionPage(1);
            }}
          />
        ) : (
          <AdminKycVerificationStudio
            kycItems={kycData?.items ?? []}
            isLoading={isLoadingKyc}
            onApprove={handleApproveKyc}
            onReject={handleRejectKyc}
            isApproving={isApprovingKyc}
            isRejecting={isRejectingKyc}
            page={kycPage}
            pageSize={kycPageSize}
            totalCount={kycData?.totalCount ?? 0}
            totalPages={kycData?.totalPages ?? 1}
            onPageChange={setKycPage}
            onPageSizeChange={(sz) => {
              setKycPageSize(sz);
              setKycPage(1);
            }}
          />
        )}
      </main>
    </div>
  );
};

export default AdminVerificationsPage;
