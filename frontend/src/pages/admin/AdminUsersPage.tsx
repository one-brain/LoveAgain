import React, { useState, useCallback } from 'react';
import {
  useGetAdminUsersQuery,
  useGetAdminUserStatsQuery,
  useToggleUserSuspendMutation,
} from '../../store/adminApi';
import {
  Badge,
  Button,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  People16Regular,
  ArrowSync16Regular,
  Warning16Regular,
} from '@fluentui/react-icons';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminUsersDirectory } from '../../components/admin/AdminUsersDirectory';

export const AdminUsersPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [role, setRole] = useState<'All' | 'Guests' | 'Hosts' | 'Suspended'>('All');
  const [search, setSearch] = useState('');

  const { data: userStats } = useGetAdminUserStatsQuery();

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
    isFetching,
  } = useGetAdminUsersQuery({
    page,
    pageSize,
    role: role === 'All' ? undefined : role,
    search: search.trim() || undefined,
  });

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

  const totalUsers = userStats?.total ?? (role === 'All' ? usersData?.totalCount ?? 0 : 0);
  const suspendedCount = userStats?.suspended ?? 0;

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
        title="User directory"
        description="View registered hosts, guests, and platform administrators. Check verification status, trust ratings, and manage account access."
        badge={
          suspendedCount > 0 ? (
            <Badge appearance="tint" color="danger" icon={<Warning16Regular />} className="tabular">
              {suspendedCount} suspended
            </Badge>
          ) : totalUsers > 0 ? (
            <Badge appearance="tint" color="brand" icon={<People16Regular />} className="tabular">
              {totalUsers} registered accounts
            </Badge>
          ) : undefined
        }
        actions={
          <Button
            appearance="outline"
            size="medium"
            icon={<ArrowSync16Regular className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => refetchUsers()}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh directory'}
          </Button>
        }
      />

      <main>
        <AdminUsersDirectory
          users={usersData?.items ?? []}
          isLoading={isLoadingUsers}
          onToggleSuspend={handleToggleSuspendUser}
          isTogglingSuspend={isTogglingSuspend}
          page={page}
          pageSize={pageSize}
          totalCount={usersData?.totalCount ?? 0}
          totalPages={usersData?.totalPages ?? 1}
          onPageChange={setPage}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
          roleFilter={role}
          onRoleFilterChange={(r) => {
            setRole(r);
            setPage(1);
          }}
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          stats={userStats}
        />
      </main>
    </div>
  );
};

export default AdminUsersPage;
