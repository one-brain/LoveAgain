import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useGetAdminVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetAdminUsersQuery,
  useToggleUserSuspendMutation,
  useGetAdminMisQuery,
  useGetAdminPayoutsQuery,
  useProcessAdminPayoutMutation,
  useGetAdminBookingsQuery,
} from '../store/adminApi';
import {
  ShieldCheckIcon,
  BanknotesIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminKpiStrip } from '../components/admin/AdminKpiStrip';
import { AdminVerificationStudio } from '../components/admin/AdminVerificationStudio';
import { AdminBookingLedger } from '../components/admin/AdminBookingLedger';
import { AdminUsersDirectory } from '../components/admin/AdminUsersDirectory';
import { AdminPayoutHub } from '../components/admin/AdminPayoutHub';
import { AdminMisAnalytics } from '../components/admin/AdminMisAnalytics';
import { AdminProfileView } from '../components/admin/AdminProfileView';

type TabKey = 'verifications' | 'bookings' | 'users' | 'payouts' | 'mis' | 'profile';

export const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as TabKey | null;

  const validTabs: TabKey[] = ['verifications', 'bookings', 'users', 'payouts', 'mis', 'profile'];
  const [activeTab, setActiveTab] = useState<TabKey>(
    initialTab && validTabs.includes(initialTab) ? initialTab : 'verifications'
  );

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  // Sync state with URL search params
  useEffect(() => {
    const t = searchParams.get('tab') as TabKey | null;
    if (t && validTabs.includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'verifications') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // RTK Queries
  const {
    data: verificationsData,
    isLoading: isLoadingVerifications,
    refetch: refetchVerifications,
  } = useGetAdminVerificationsQuery({});

  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
  } = useGetAdminBookingsQuery({});

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery({});

  const {
    data: payoutsData,
    isLoading: isLoadingPayouts,
    refetch: refetchPayouts,
  } = useGetAdminPayoutsQuery();

  const {
    data: misData,
    isLoading: isLoadingMis,
    refetch: refetchMis,
  } = useGetAdminMisQuery();

  // Mutations
  const [approveVerification, { isLoading: isApproving }] = useApproveVerificationMutation();
  const [rejectVerification, { isLoading: isRejecting }] = useRejectVerificationMutation();
  const [processPayout, { isLoading: isProcessingPayout }] = useProcessAdminPayoutMutation();
  const [toggleUserSuspend, { isLoading: isTogglingSuspend }] = useToggleUserSuspendMutation();

  // Handlers
  const handleApproveVerification = async (profileId: string) => {
    try {
      await approveVerification(profileId).unwrap();
      refetchVerifications();
      refetchMis();
      refetchUsers();
      showToast('Companion verification approved and published to discovery.');
    } catch {
      showToast('Failed to approve companion application.', 'error');
    }
  };

  const handleRejectVerification = async (profileId: string, reason: string) => {
    try {
      await rejectVerification({ profileId, reason }).unwrap();
      refetchVerifications();
      refetchUsers();
      showToast('Companion application rejected with feedback sent to user.');
    } catch {
      showToast('Failed to reject application.', 'error');
    }
  };

  const handleProcessPayout = async (payoutId: string, utr: string) => {
    try {
      await processPayout({ payoutId, utrReference: utr || undefined }).unwrap();
      refetchPayouts();
      refetchMis();
      showToast('Companion UPI payout processed successfully.');
    } catch {
      showToast('Failed to process payout.', 'error');
    }
  };

  const handleToggleSuspendUser = async (userId: string) => {
    try {
      const res = await toggleUserSuspend(userId).unwrap();
      refetchUsers();
      showToast(res.isSuspended ? 'User account suspended.' : 'User account reinstated.');
    } catch {
      showToast('Failed to update user account moderation state.', 'error');
    }
  };

  const handleExportCsv = () => {
    window.open('/api/v1/payments/admin/mis/export', '_blank');
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    try {
      await Promise.all([
        refetchVerifications(),
        refetchBookings(),
        refetchUsers(),
        refetchPayouts(),
        refetchMis(),
      ]);
      showToast('All administrative studio feeds synchronized.');
    } catch {
      showToast('Sync completed with partial network feedback.', 'error');
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const pendingVerificationsCount = verificationsData?.filter((v) => v.status === 'PendingReview').length ?? 0;
  const pendingPayoutsCount = payoutsData?.filter((p) => p.status === 'Pending').length ?? 0;

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeTone?: 'accent' | 'amber';
  }[] = [
    {
      key: 'verifications',
      label: 'Companion Verifications',
      icon: ShieldCheckIcon,
      count: pendingVerificationsCount > 0 ? pendingVerificationsCount : verificationsData?.length,
      badgeTone: pendingVerificationsCount > 0 ? 'amber' : 'accent',
    },
    {
      key: 'bookings',
      label: 'Bookings & Escrow Ledger',
      icon: BanknotesIcon,
      count: bookingsData?.length,
      badgeTone: 'accent',
    },
    {
      key: 'users',
      label: 'Users Directory',
      icon: UsersIcon,
      count: usersData?.length,
      badgeTone: 'accent',
    },
    {
      key: 'payouts',
      label: 'UPI Payout Settlements',
      icon: CurrencyRupeeIcon,
      count: pendingPayoutsCount > 0 ? pendingPayoutsCount : undefined,
      badgeTone: 'amber',
    },
    {
      key: 'mis',
      label: 'MIS Trajectory & Analytics',
      icon: ChartBarIcon,
    },
    {
      key: 'profile',
      label: 'Admin Identity & Security',
      icon: UserCircleIcon,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
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

      {/* Header */}
      <AdminHeader
        onRefreshAll={handleRefreshAll}
        onExportCsv={handleExportCsv}
        isRefreshing={isRefreshingAll}
      />

      {/* KPI Cards Strip */}
      <AdminKpiStrip misData={misData} isLoading={isLoadingMis} />

      {/* High-Density Navigation Tabs */}
      <nav
        aria-label="Admin Navigation Tabs"
        className="flex border-b border-border/80 mb-6 space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`pb-3 pt-1 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? 'border-accent text-accent font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums ${
                    isActive
                      ? 'bg-accent/15 text-accent'
                      : tab.badgeTone === 'amber'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Studio Views */}
      <main>
        {activeTab === 'verifications' && (
          <AdminVerificationStudio
            verifications={verificationsData ?? []}
            isLoading={isLoadingVerifications}
            onApprove={handleApproveVerification}
            onReject={handleRejectVerification}
            isApproving={isApproving}
            isRejecting={isRejecting}
          />
        )}

        {activeTab === 'bookings' && (
          <AdminBookingLedger
            bookings={bookingsData ?? []}
            isLoading={isLoadingBookings}
            onRefresh={refetchBookings}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersDirectory
            users={usersData ?? []}
            isLoading={isLoadingUsers}
            onToggleSuspend={handleToggleSuspendUser}
            isTogglingSuspend={isTogglingSuspend}
          />
        )}

        {activeTab === 'payouts' && (
          <AdminPayoutHub
            payouts={payoutsData ?? []}
            isLoading={isLoadingPayouts}
            onProcessPayout={handleProcessPayout}
            isProcessing={isProcessingPayout}
            onRefresh={refetchPayouts}
          />
        )}

        {activeTab === 'mis' && (
          <AdminMisAnalytics
            misData={misData}
            isLoading={isLoadingMis}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'profile' && <AdminProfileView />}
      </main>
    </div>
  );
};

export default AdminDashboard;
