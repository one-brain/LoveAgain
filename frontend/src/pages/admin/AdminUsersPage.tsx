import React, { useState, useCallback } from 'react';
import {
  useGetAdminUsersQuery,
  useToggleUserSuspendMutation,
} from '../../store/adminApi';
import {
  UsersIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminUsersDirectory } from '../../components/admin/AdminUsersDirectory';

export const AdminUsersPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
    isFetching,
  } = useGetAdminUsersQuery({});

  const [toggleUserSuspend, { isLoading: isTogglingSuspend }] = useToggleUserSuspendMutation();

  const handleToggleSuspendUser = async (userId: string) => {
    try {
      const res = await toggleUserSuspend(userId).unwrap();
      refetchUsers();
      showToast(res.isSuspended ? 'User account suspended.' : 'User account reinstated.');
    } catch {
      showToast('Failed to update user account moderation state.', 'error');
    }
  };

  const totalUsers = usersData?.length ?? 0;
  const suspendedCount = usersData?.filter((u) => u.trustScore < 0).length ?? 0;

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
        title="User Directory"
        description="View registered clients, companions, and platform administrators. Check verification status, trust ratings, and manage account access."
        badge={
          suspendedCount > 0 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/30">
              <ExclamationTriangleIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{suspendedCount} Suspended</span>
            </div>
          ) : totalUsers > 0 ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30 font-mono">
              <UsersIcon className="w-3.5 h-3.5" />
              <span>{totalUsers} Registered Accounts</span>
            </div>
          ) : undefined
        }
        actions={
          <button
            type="button"
            onClick={() => refetchUsers()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 text-muted-foreground ${isFetching ? 'animate-spin text-accent' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh Directory'}</span>
          </button>
        }
      />

      {/* Full-Bleed Users Directory */}
      <main>
        <AdminUsersDirectory
          users={usersData ?? []}
          isLoading={isLoadingUsers}
          onToggleSuspend={handleToggleSuspendUser}
          isTogglingSuspend={isTogglingSuspend}
        />
      </main>
    </div>
  );
};

export default AdminUsersPage;

