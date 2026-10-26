import React, { useState, useCallback, useEffect } from 'react';
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
      showToast('MIS Ledger exported successfully.');
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

  const pendingVerificationsCount = verificationsData?.filter((v) => v.status === 'PendingReview').length ?? 0;
  const pendingPayoutsCount = payoutsData?.filter((p) => p.status === 'Pending').length ?? 0;

  const tabs: {
    key: TabKey;
    label: string;
    shortLabel: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    shortcut: string;
    count?: number;
    badgeTone?: 'accent' | 'amber';
  }[] = [
    {
      key: 'verifications',
      label: 'Companion Verifications',
      shortLabel: 'Verifications',
      description: 'KYC identity review, government ID inspection and public profile approval',
      icon: ShieldCheckIcon,
      shortcut: '1',
      count: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
      badgeTone: 'amber',
    },
    {
      key: 'bookings',
      label: 'Bookings & Escrow Ledger',
      shortLabel: 'Bookings',
      description: 'Escrow vault holds, booking lifecycle transitions and financial audit trail',
      icon: BanknotesIcon,
      shortcut: '2',
      count: bookingsData?.length,
      badgeTone: 'accent',
    },
    {
      key: 'users',
      label: 'Users Directory',
      shortLabel: 'Users',
      description: 'Seeker and companion account directory, trust score moderation and role controls',
      icon: UsersIcon,
      shortcut: '3',
      count: usersData?.length,
      badgeTone: 'accent',
    },
    {
      key: 'payouts',
      label: 'UPI Payout Settlements',
      shortLabel: 'Payouts',
      description: 'Companion banking disbursements, UPI transfers and settlement reconciliation',
      icon: CurrencyRupeeIcon,
      shortcut: '4',
      count: pendingPayoutsCount > 0 ? pendingPayoutsCount : undefined,
      badgeTone: 'amber',
    },
    {
      key: 'mis',
      label: 'MIS Trajectory & Analytics',
      shortLabel: 'Analytics',
      description: 'Gross Merchandise Value (GMV), 15% platform take, volume trends and specialty performance',
      icon: ChartBarIcon,
      shortcut: '5',
    },
    {
      key: 'profile',
      label: 'Admin Identity & Security',
      shortLabel: 'Admin Security',
      description: 'Administrator credentials, password rotation, contact information and audit session telemetry',
      icon: UserCircleIcon,
      shortcut: '6',
    },
  ];

  const currentTabConfig = tabs.find((t) => t.key === activeTab) ?? tabs[0];

  // Number key shortcuts (1-6) when not focused in an input
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

  // Arrow key navigation inside tablist
  const handleTabListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = validTabs.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % validTabs.length;
      handleTabChange(validTabs[nextIndex]);
      document.getElementById(`admin-tab-${validTabs[nextIndex]}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + validTabs.length) % validTabs.length;
      handleTabChange(validTabs[prevIndex]);
      document.getElementById(`admin-tab-${validTabs[prevIndex]}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleTabChange(validTabs[0]);
      document.getElementById(`admin-tab-${validTabs[0]}`)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      handleTabChange(validTabs[validTabs.length - 1]);
      document.getElementById(`admin-tab-${validTabs[validTabs.length - 1]}`)?.focus();
    }
  };

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

      {/* Redesigned High-Density Command Tab Ribbon */}
      <div className="mb-6">
        <div
          role="tablist"
          aria-label="Admin Operations Navigation"
          onKeyDown={handleTabListKeyDown}
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/40 border border-border/80 shadow-2xs overflow-x-auto no-scrollbar scroll-smooth"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                id={`admin-tab-${tab.key}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`admin-panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-150 shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'bg-card text-foreground shadow-xs ring-1 ring-border/80 font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 ${
                    isActive
                      ? 'text-accent'
                      : tab.badgeTone === 'amber' && tab.count
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
                  }`}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>

                {/* Counter Badges */}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tabular-nums transition-colors ${
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

                {/* Keyboard Shortcut Indicator Chip */}
                <kbd
                  aria-hidden="true"
                  className={`hidden xl:inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-mono tabular-nums border transition-opacity ${
                    isActive
                      ? 'bg-accent/10 border-accent/30 text-accent font-bold'
                      : 'bg-muted/70 border-border/70 text-muted-foreground/80 opacity-60 group-hover:opacity-100'
                  }`}
                >
                  {tab.shortcut}
                </kbd>

                {/* Subtle active indicator pill */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full animate-in fade-in-0 duration-150" />
                )}
              </button>
            );
          })}
        </div>

        {/* Operational Context Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border/50 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 animate-pulse" />
            <span className="font-semibold text-foreground">{currentTabConfig.label}:</span>
            <span className="truncate">{currentTabConfig.description}</span>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0 text-[11px] text-muted-foreground/80 font-mono">
            <span>Keys <kbd className="px-1 py-0.5 rounded bg-muted border border-border/70 text-[10px]">1-6</kbd> switch</span>
            <span>•</span>
            <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border/70 text-[10px]">←</kbd> <kbd className="px-1 py-0.5 rounded bg-muted border border-border/70 text-[10px]">→</kbd> navigate</span>
          </div>
        </div>
      </div>

      {/* Active Studio Views */}
      <main>
        {activeTab === 'verifications' && (
          <section
            role="tabpanel"
            id="admin-panel-verifications"
            aria-labelledby="admin-tab-verifications"
            tabIndex={0}
            className="animate-in fade-in-50 duration-150 outline-hidden"
          >
            <AdminVerificationStudio
              verifications={verificationsData ?? []}
              isLoading={isLoadingVerifications}
              onApprove={handleApproveVerification}
              onReject={handleRejectVerification}
              isApproving={isApproving}
              isRejecting={isRejecting}
            />
          </section>
        )}

        {activeTab === 'bookings' && (
          <section
            role="tabpanel"
            id="admin-panel-bookings"
            aria-labelledby="admin-tab-bookings"
            tabIndex={0}
            className="animate-in fade-in-50 duration-150 outline-hidden"
          >
            <AdminBookingLedger
              bookings={bookingsData ?? []}
              isLoading={isLoadingBookings}
              onRefresh={refetchBookings}
            />
          </section>
        )}

        {activeTab === 'users' && (
          <section
            role="tabpanel"
            id="admin-panel-users"
            aria-labelledby="admin-tab-users"
            tabIndex={0}
            className="animate-in fade-in-50 duration-150 outline-hidden"
          >
            <AdminUsersDirectory
              users={usersData ?? []}
              isLoading={isLoadingUsers}
              onToggleSuspend={handleToggleSuspendUser}
              isTogglingSuspend={isTogglingSuspend}
            />
          </section>
        )}

        {activeTab === 'payouts' && (
          <section
            role="tabpanel"
            id="admin-panel-payouts"
            aria-labelledby="admin-tab-payouts"
            tabIndex={0}
            className="animate-in fade-in-50 duration-150 outline-hidden"
          >
            <AdminPayoutHub
              payouts={payoutsData ?? []}
              isLoading={isLoadingPayouts}
              onProcessPayout={handleProcessPayout}
              isProcessing={isProcessingPayout}
              onRefresh={refetchPayouts}
            />
          </section>
        )}

        {activeTab === 'mis' && (
          <section
            role="tabpanel"
            id="admin-panel-mis"
            aria-labelledby="admin-tab-mis"
            tabIndex={0}
            className="animate-in fade-in-50 duration-150 outline-hidden"
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
            className="animate-in fade-in-50 duration-150 outline-hidden"
          >
            <AdminProfileView onBackToDashboard={() => handleTabChange('verifications')} />
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
