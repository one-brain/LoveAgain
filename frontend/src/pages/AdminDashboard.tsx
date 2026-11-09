import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useGetAdminVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetAdminUsersQuery,
  useGetAdminUserStatsQuery,
  useToggleUserSuspendMutation,
  useGetAdminMisQuery,
  useGetAdminPayoutsQuery,
  useProcessAdminPayoutMutation,
  useGetAdminBookingsQuery,
} from '../store/adminApi';
import {
  Badge,
  Card,
  MessageBar,
  MessageBarBody,
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  ShieldCheckmark20Regular,
  Money20Regular,
  People20Regular,
  DataBarVertical20Regular,
  PersonCircle20Regular,
  Calendar20Regular,
} from '@fluentui/react-icons';
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
  const validTabs: TabKey[] = ['verifications', 'bookings', 'users', 'payouts', 'mis', 'profile'];
  const rawTab = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = rawTab && validTabs.includes(rawTab) ? rawTab : 'verifications';

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const handleTabChange = (tab: TabKey) => {
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

  const [verificationsPage, setVerificationsPage] = useState(1);
  const [verificationsPageSize, setVerificationsPageSize] = useState(20);

  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsPageSize, setBookingsPageSize] = useState(20);

  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(20);
  const [usersRole, setUsersRole] = useState<'All' | 'Guests' | 'Hosts' | 'Suspended'>('All');
  const [usersSearch, setUsersSearch] = useState('');

  const [payoutsPage, setPayoutsPage] = useState(1);
  const [payoutsPageSize, setPayoutsPageSize] = useState(20);

  const { data: userStats } = useGetAdminUserStatsQuery();

  const {
    data: verificationsData,
    isLoading: isLoadingVerifications,
    refetch: refetchVerifications,
  } = useGetAdminVerificationsQuery({ page: verificationsPage, pageSize: verificationsPageSize });

  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
  } = useGetAdminBookingsQuery({ page: bookingsPage, pageSize: bookingsPageSize });

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery({
    page: usersPage,
    pageSize: usersPageSize,
    role: usersRole === 'All' ? undefined : usersRole,
    search: usersSearch.trim() || undefined,
  });

  const {
    data: payoutsData,
    isLoading: isLoadingPayouts,
    refetch: refetchPayouts,
  } = useGetAdminPayoutsQuery({ page: payoutsPage, pageSize: payoutsPageSize });

  const {
    data: misData,
    isLoading: isLoadingMis,
    refetch: refetchMis,
  } = useGetAdminMisQuery();

  const [approveVerification, { isLoading: isApproving }] = useApproveVerificationMutation();
  const [rejectVerification, { isLoading: isRejecting }] = useRejectVerificationMutation();
  const [processPayout, { isLoading: isProcessingPayout }] = useProcessAdminPayoutMutation();
  const [toggleUserSuspend, { isLoading: isTogglingSuspend }] = useToggleUserSuspendMutation();

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
      showToast('MIS ledger exported successfully.');
    } catch {
      showToast('Failed to export MIS report.', 'error');
    }
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

  const pendingVerificationsCount =
    verificationsData?.items?.filter((v) => v.status === 'PendingReview').length ??
    verificationsData?.totalCount ??
    0;
  const pendingPayoutsCount =
    payoutsData?.items?.filter((p) => p.status === 'Pending').length ??
    payoutsData?.totalCount ??
    0;

  const tabs: {
    key: TabKey;
    label: string;
    description: string;
    icon: React.ReactElement;
    shortcut: string;
    count?: number;
    badgeTone?: 'brand' | 'warning';
  }[] = [
    {
      key: 'verifications',
      label: 'Verifications',
      description: 'KYC identity review, government ID inspection and public profile approval',
      icon: <ShieldCheckmark20Regular />,
      shortcut: '1',
      count: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
      badgeTone: 'warning',
    },
    {
      key: 'bookings',
      label: 'Bookings',
      description: 'Escrow vault holds, booking lifecycle transitions and financial audit trail',
      icon: <Calendar20Regular />,
      shortcut: '2',
      count: bookingsData?.totalCount,
      badgeTone: 'brand',
    },
    {
      key: 'users',
      label: 'Users',
      description: 'Host and guest account directory, trust score moderation and role controls',
      icon: <People20Regular />,
      shortcut: '3',
      count: userStats?.total ?? (usersRole === 'All' ? usersData?.totalCount : undefined),
      badgeTone: 'brand',
    },
    {
      key: 'payouts',
      label: 'Settlements',
      description: 'Guest banking disbursements, UPI transfers and settlement reconciliation',
      icon: <Money20Regular />,
      shortcut: '4',
      count: pendingPayoutsCount > 0 ? pendingPayoutsCount : undefined,
      badgeTone: 'warning',
    },
    {
      key: 'mis',
      label: 'Analytics',
      description:
        'Gross Merchandise Value (GMV), 15% platform take, volume trends and specialty performance',
      icon: <DataBarVertical20Regular />,
      shortcut: '5',
    },
    {
      key: 'profile',
      label: 'Admin identity',
      description:
        'Administrator credentials, password rotation, contact information and audit session telemetry',
      icon: <PersonCircle20Regular />,
      shortcut: '6',
    },
  ];

  const currentTabConfig = tabs.find((t) => t.key === activeTab) ?? tabs[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const keyMap: Record<string, TabKey> = {
        '1': 'verifications',
        '2': 'bookings',
        '3': 'users',
        '4': 'payouts',
        '5': 'mis',
        '6': 'profile',
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        handleTabChange(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {toast && (
        <div role="status" aria-live="polite" className="mb-4">
          <MessageBar intent={toast.type === 'success' ? 'success' : 'error'}>
            <MessageBarBody>{toast.message}</MessageBarBody>
          </MessageBar>
        </div>
      )}

      <AdminHeader
        onRefreshAll={handleRefreshAll}
        onExportCsv={handleExportCsv}
        isRefreshing={isRefreshingAll}
      />

      <AdminKpiStrip misData={misData} isLoading={isLoadingMis} />

      <div className="mb-6 space-y-2.5">
        <Card className="bg-card border border-border rounded-2xl p-2 shadow-sm overflow-x-auto">
          <TabList
            selectedValue={activeTab}
            onTabSelect={(_e, data) => handleTabChange(data.value as TabKey)}
            aria-label="Admin Operations Navigation"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                id={`admin-tab-${tab.key}`}
                value={tab.key}
                icon={tab.icon}
              >
                <span className="flex items-center gap-1.5">
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <Badge
                      appearance="tint"
                      color={tab.badgeTone === 'warning' ? 'warning' : 'brand'}
                      size="small"
                      className="tabular"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </span>
              </Tab>
            ))}
          </TabList>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2 rounded-lg bg-card border border-border text-caption1 text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-foreground">{currentTabConfig.label}:</span>
            <span className="truncate">{currentTabConfig.description}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0 text-caption2 text-muted-foreground font-mono tabular">
            <span>Shortcuts: 1–6</span>
          </div>
        </div>
      </div>

      <main>
        {activeTab === 'verifications' && (
          <section
            role="tabpanel"
            id="admin-panel-verifications"
            aria-labelledby="admin-tab-verifications"
            tabIndex={0}
          >
            <AdminVerificationStudio
              verifications={verificationsData?.items ?? []}
              isLoading={isLoadingVerifications}
              onApprove={handleApproveVerification}
              onReject={handleRejectVerification}
              isApproving={isApproving}
              isRejecting={isRejecting}
              page={verificationsPage}
              pageSize={verificationsPageSize}
              totalCount={verificationsData?.totalCount ?? 0}
              totalPages={verificationsData?.totalPages ?? 1}
              onPageChange={setVerificationsPage}
              onPageSizeChange={(sz) => {
                setVerificationsPageSize(sz);
                setVerificationsPage(1);
              }}
            />
          </section>
        )}

        {activeTab === 'bookings' && (
          <section
            role="tabpanel"
            id="admin-panel-bookings"
            aria-labelledby="admin-tab-bookings"
            tabIndex={0}
          >
            <AdminBookingLedger
              bookings={bookingsData?.items ?? []}
              isLoading={isLoadingBookings}
              onRefresh={refetchBookings}
              page={bookingsPage}
              pageSize={bookingsPageSize}
              totalCount={bookingsData?.totalCount ?? 0}
              totalPages={bookingsData?.totalPages ?? 1}
              onPageChange={setBookingsPage}
              onPageSizeChange={(sz) => {
                setBookingsPageSize(sz);
                setBookingsPage(1);
              }}
            />
          </section>
        )}

        {activeTab === 'users' && (
          <section
            role="tabpanel"
            id="admin-panel-users"
            aria-labelledby="admin-tab-users"
            tabIndex={0}
          >
            <AdminUsersDirectory
              users={usersData?.items ?? []}
              isLoading={isLoadingUsers}
              onToggleSuspend={handleToggleSuspendUser}
              isTogglingSuspend={isTogglingSuspend}
              page={usersPage}
              pageSize={usersPageSize}
              totalCount={usersData?.totalCount ?? 0}
              totalPages={usersData?.totalPages ?? 1}
              onPageChange={setUsersPage}
              onPageSizeChange={(sz) => {
                setUsersPageSize(sz);
                setUsersPage(1);
              }}
              roleFilter={usersRole}
              onRoleFilterChange={(r) => {
                setUsersRole(r);
                setUsersPage(1);
              }}
              search={usersSearch}
              onSearchChange={(s) => {
                setUsersSearch(s);
                setUsersPage(1);
              }}
              stats={userStats}
            />
          </section>
        )}

        {activeTab === 'payouts' && (
          <section
            role="tabpanel"
            id="admin-panel-payouts"
            aria-labelledby="admin-tab-payouts"
            tabIndex={0}
          >
            <AdminPayoutHub
              payouts={payoutsData?.items ?? []}
              isLoading={isLoadingPayouts}
              onProcessPayout={handleProcessPayout}
              isProcessing={isProcessingPayout}
              onRefresh={refetchPayouts}
              page={payoutsPage}
              pageSize={payoutsPageSize}
              totalCount={payoutsData?.totalCount ?? 0}
              totalPages={payoutsData?.totalPages ?? 1}
              onPageChange={setPayoutsPage}
              onPageSizeChange={(sz) => {
                setPayoutsPageSize(sz);
                setPayoutsPage(1);
              }}
            />
          </section>
        )}

        {activeTab === 'mis' && (
          <section
            role="tabpanel"
            id="admin-panel-mis"
            aria-labelledby="admin-tab-mis"
            tabIndex={0}
          >
            <AdminMisAnalytics
              misData={misData}
              isLoading={isLoadingMis}
              onExportCsv={handleExportCsv}
            />
          </section>
        )}

        {activeTab === 'profile' && (
          <section
            role="tabpanel"
            id="admin-panel-profile"
            aria-labelledby="admin-tab-profile"
            tabIndex={0}
          >
            <AdminProfileView onBackToDashboard={() => handleTabChange('verifications')} />
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
