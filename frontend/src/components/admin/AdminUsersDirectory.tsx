import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  ProgressBar,
  Spinner,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components';
import {
  Search16Regular,
  Eye16Regular,
  ShieldCheckmark20Regular,
  MoreHorizontal16Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';
import {
  useGetAdminUserStatsQuery,
  type AdminUserItem,
  type AdminUserStats,
} from '../../store/adminApi';
import { Pagination } from '../ui/Pagination';

interface AdminUsersDirectoryProps {
  users: AdminUserItem[];
  isLoading: boolean;
  onToggleSuspend: (userId: string) => Promise<void>;
  isTogglingSuspend: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  roleFilter?: 'All' | 'Guests' | 'Hosts' | 'Suspended' | 'Companions' | 'Clients';
  onRoleFilterChange?: (role: 'All' | 'Guests' | 'Hosts' | 'Suspended') => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  stats?: AdminUserStats;
}

const isUserGuest = (u: AdminUserItem) =>
  Boolean(
    u.hasCompanionProfile ||
      u.roles?.includes('Companion') ||
      u.roles?.includes('Provider') ||
      u.roles?.includes('Guest')
  );
const isUserAdmin = (u: AdminUserItem) =>
  Boolean(u.roles?.includes('Admin') || u.email?.toLowerCase() === 'admin@cue.local');
const isUserHost = (u: AdminUserItem) => !isUserGuest(u) && !isUserAdmin(u);
const isUserSuspended = (u: AdminUserItem) => u.trustScore < 0;

export const AdminUsersDirectory: React.FC<AdminUsersDirectoryProps> = ({
  users,
  isLoading,
  onToggleSuspend,
  isTogglingSuspend,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  roleFilter,
  onRoleFilterChange,
  search,
  onSearchChange,
  stats,
}) => {
  const navigate = useNavigate();
  const [localRoleFilter, setLocalRoleFilter] = useState<
    'All' | 'Guests' | 'Hosts' | 'Suspended'
  >('All');
  const [localSearch, setLocalSearch] = useState('');
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(20);

  const { data: queryStats } = useGetAdminUserStatsQuery(undefined, {
    skip: Boolean(stats),
  });
  const effectiveStats = stats || queryStats;

  const activeRoleFilter: 'All' | 'Guests' | 'Hosts' | 'Suspended' =
    roleFilter === 'Companions'
      ? 'Guests'
      : roleFilter === 'Clients'
      ? 'Hosts'
      : roleFilter ?? localRoleFilter;

  const activeSearch = search !== undefined ? search : localSearch;

  const isServerPaged = Boolean(onPageChange);
  const isServerFiltered = Boolean(onRoleFilterChange);
  const activePage = isServerPaged ? (page ?? 1) : localPage;
  const activePageSize = isServerPaged ? (pageSize ?? 20) : localPageSize;

  const [cachedCounts, setCachedCounts] = useState<{
    All?: number;
    Guests?: number;
    Hosts?: number;
    Suspended?: number;
  }>({});

  useEffect(() => {
    if (effectiveStats) {
      setCachedCounts({
        All: effectiveStats.total,
        Guests: effectiveStats.guests ?? effectiveStats.companions,
        Hosts: effectiveStats.hosts ?? effectiveStats.clients,
        Suspended: effectiveStats.suspended,
      });
    } else if (isServerFiltered && totalCount !== undefined) {
      setCachedCounts((prev) => ({
        ...prev,
        [activeRoleFilter]: totalCount,
      }));
    }
  }, [effectiveStats, isServerFiltered, activeRoleFilter, totalCount]);

  const handleRoleSelect = (newRole: 'All' | 'Guests' | 'Hosts' | 'Suspended') => {
    if (onRoleFilterChange) {
      onRoleFilterChange(newRole);
      onPageChange?.(1);
    } else {
      setLocalRoleFilter(newRole);
      setLocalPage(1);
    }
  };

  const handleSearchInput = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
      onPageChange?.(1);
    } else {
      setLocalSearch(val);
      setLocalPage(1);
    }
  };

  const handlePageChange = (p: number) => {
    if (onPageChange) {
      onPageChange(p);
    } else {
      setLocalPage(p);
    }
  };

  const handlePageSizeChange = (ps: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(ps);
    } else {
      setLocalPageSize(ps);
      setLocalPage(1);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (isServerFiltered) {
      if (!onSearchChange && activeSearch) {
        const q = activeSearch.trim().toLowerCase();
        return (
          user.firstName?.toLowerCase().includes(q) ||
          user.lastName?.toLowerCase().includes(q) ||
          user.email?.toLowerCase().includes(q)
        );
      }
      return true;
    }

    const suspended = isUserSuspended(user);
    const guest = isUserGuest(user);
    const host = isUserHost(user);

    const matchesRole =
      activeRoleFilter === 'All'
        ? true
        : activeRoleFilter === 'Guests'
        ? guest
        : activeRoleFilter === 'Hosts'
        ? host
        : activeRoleFilter === 'Suspended'
        ? suspended
        : true;

    const q = activeSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q);

    return matchesRole && matchesSearch;
  });

  const displayedUsers = isServerPaged
    ? filteredUsers
    : filteredUsers.slice((activePage - 1) * activePageSize, activePage * activePageSize);

  const activeTotalCount = isServerPaged
    ? (totalCount ?? filteredUsers.length)
    : filteredUsers.length;
  const activeTotalPages = isServerPaged
    ? (totalPages ?? Math.max(1, Math.ceil(activeTotalCount / activePageSize)))
    : Math.max(1, Math.ceil(activeTotalCount / activePageSize));

  const pillCounts: Record<'All' | 'Guests' | 'Hosts' | 'Suspended', number | undefined> = {
    All:
      effectiveStats?.total ??
      cachedCounts.All ??
      (isServerPaged || isServerFiltered ? undefined : users.length),
    Guests:
      effectiveStats?.guests ??
      effectiveStats?.companions ??
      cachedCounts.Guests ??
      (isServerPaged || isServerFiltered ? undefined : users.filter(isUserGuest).length),
    Hosts:
      effectiveStats?.hosts ??
      effectiveStats?.clients ??
      cachedCounts.Hosts ??
      (isServerPaged || isServerFiltered ? undefined : users.filter(isUserHost).length),
    Suspended:
      effectiveStats?.suspended ??
      cachedCounts.Suspended ??
      (isServerPaged || isServerFiltered ? undefined : users.filter(isUserSuspended).length),
  };

  const handleSuspendAction = async (userId: string) => {
    setActionUserId(userId);
    try {
      await onToggleSuspend(userId);
    } finally {
      setActionUserId(null);
    }
  };

  const rolePills: { key: 'All' | 'Guests' | 'Hosts' | 'Suspended'; label: string; count?: number }[] = [
    { key: 'All', label: 'All accounts', count: pillCounts.All },
    { key: 'Guests', label: 'Guests', count: pillCounts.Guests },
    { key: 'Hosts', label: 'Hosts', count: pillCounts.Hosts },
    { key: 'Suspended', label: 'Suspended', count: pillCounts.Suspended },
  ];

  return (
    <section aria-label="Users and Moderation Directory" className="space-y-4">
      {/* Controls & Search Strip */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <TabList
            size="small"
            selectedValue={activeRoleFilter}
            onTabSelect={(_e, data) =>
              handleRoleSelect(data.value as 'All' | 'Guests' | 'Hosts' | 'Suspended')
            }
          >
            {rolePills.map((pill) => (
              <Tab key={pill.key} value={pill.key}>
                <span className="flex items-center gap-1.5">
                  <span>{pill.label}</span>
                  {pill.count !== undefined && (
                    <Badge
                      appearance="tint"
                      color={pill.key === 'Suspended' && pill.count > 0 ? 'danger' : 'informative'}
                      size="small"
                      className="tabular"
                    >
                      {pill.count}
                    </Badge>
                  )}
                </span>
              </Tab>
            ))}
          </TabList>
        </div>

        <Input
          size="small"
          contentBefore={<Search16Regular />}
          contentAfter={
            activeSearch ? (
              <Button
                appearance="transparent"
                size="small"
                icon={<Dismiss16Regular />}
                onClick={() => handleSearchInput('')}
                aria-label="Clear search"
              />
            ) : undefined
          }
          value={activeSearch}
          onChange={(_e, data) => handleSearchInput(data.value)}
          placeholder="Search by name or email..."
          className="w-full sm:w-64"
        />
      </Card>

      {/* Directory Table */}
      <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-0">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner label="Loading user accounts directory..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 p-8">
            <ShieldCheckmark20Regular className="text-muted-foreground mx-auto mb-3" />
            <h3 className="text-body1 font-semibold text-foreground">
              No accounts match this query
            </h3>
            <p className="text-caption1 text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your filter or search keywords.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table size="small" aria-label="User directory table">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>User identity</TableHeaderCell>
                  <TableHeaderCell>Assigned roles</TableHeaderCell>
                  <TableHeaderCell>Guest status</TableHeaderCell>
                  <TableHeaderCell>Trust score</TableHeaderCell>
                  <TableHeaderCell>Registered</TableHeaderCell>
                  <TableHeaderCell>Moderation action</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedUsers.map((user) => {
                  const isSuspended = user.trustScore < 0;
                  const isUserAnAdmin =
                    user.roles?.includes('Admin') ||
                    user.email?.toLowerCase() === 'admin@cue.local';
                  const isActing = actionUserId === user.id && isTogglingSuspend;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <TableCellLayout
                          media={
                            <Avatar
                              size={28}
                              name={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                              color={isUserAnAdmin ? 'gold' : 'brand'}
                            />
                          }
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                              <span>
                                {user.firstName} {user.lastName}
                              </span>
                              {isSuspended && (
                                <Badge appearance="filled" color="danger" size="small">
                                  Suspended
                                </Badge>
                              )}
                            </p>
                            <p className="text-caption1 text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((r) => (
                              <Badge
                                key={r}
                                appearance={r === 'Admin' ? 'tint' : 'outline'}
                                color={r === 'Admin' ? 'warning' : 'informative'}
                                size="small"
                              >
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          {user.hasCompanionProfile ? (
                            <Badge
                              appearance="tint"
                              color={
                                user.companionStatus === 'Approved'
                                  ? 'success'
                                  : user.companionStatus === 'Rejected' ||
                                    user.companionStatus === 'Suspended'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="small"
                            >
                              {user.companionStatus === 'Approved'
                                ? 'Verified guest'
                                : user.companionStatus === 'PendingReview'
                                ? 'Review pending'
                                : user.companionStatus === 'Suspended'
                                ? 'Guest suspended'
                                : user.companionStatus}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-caption1">
                              {isUserAnAdmin ? 'Administrator' : 'Host account'}
                            </span>
                          )}
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <div className="flex items-center gap-2">
                            <Badge
                              appearance="tint"
                              color={
                                isSuspended
                                  ? 'danger'
                                  : user.trustScore >= 80
                                  ? 'success'
                                  : 'warning'
                              }
                              size="small"
                              className="tabular"
                            >
                              {isSuspended ? 'Suspended' : `${user.trustScore}/100`}
                            </Badge>
                            {!isSuspended && (
                              <div className="w-12 hidden sm:block">
                                <ProgressBar
                                  value={Math.max(0.1, Math.min(1, user.trustScore / 100))}
                                  color={user.trustScore >= 80 ? 'success' : 'warning'}
                                />
                              </div>
                            )}
                          </div>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="text-caption1 text-muted-foreground tabular">
                            {new Date(user.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <div className="flex items-center justify-end gap-1.5">
                            {user.hasCompanionProfile && (
                              <Link
                                to={`/provider/${user.id}`}
                                className="px-2.5 py-1 rounded-md text-caption1 font-semibold bg-muted hover:bg-subtle text-foreground border border-border inline-flex items-center gap-1"
                                title="Inspect companion public profile"
                              >
                                <Eye16Regular className="text-brand-fg" />
                                <span>Inspect</span>
                              </Link>
                            )}

                            {isUserAnAdmin ? (
                              <Badge appearance="tint" color="warning" size="small">
                                Protected admin
                              </Badge>
                            ) : (
                              <>
                                <Button
                                  appearance="outline"
                                  size="small"
                                  disabled={isActing}
                                  onClick={() => handleSuspendAction(user.id)}
                                  className={isSuspended ? 'text-success' : 'text-destructive'}
                                >
                                  {isActing
                                    ? 'Updating...'
                                    : isSuspended
                                    ? 'Reinstate'
                                    : 'Suspend'}
                                </Button>

                                <Menu>
                                  <MenuTrigger disableButtonEnhancement>
                                    <Button
                                      appearance="subtle"
                                      size="small"
                                      icon={<MoreHorizontal16Regular />}
                                      aria-label="More account actions"
                                    />
                                  </MenuTrigger>
                                  <MenuPopover>
                                    <MenuList>
                                      {user.hasCompanionProfile && (
                                        <MenuItem
                                          icon={<Eye16Regular />}
                                          onClick={() => navigate(`/provider/${user.id}`)}
                                        >
                                          Inspect public profile
                                        </MenuItem>
                                      )}
                                      <MenuItem onClick={() => handleSuspendAction(user.id)}>
                                        {isSuspended ? 'Reinstate account' : 'Suspend account'}
                                      </MenuItem>
                                    </MenuList>
                                  </MenuPopover>
                                </Menu>
                              </>
                            )}
                          </div>
                        </TableCellLayout>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Pagination
          currentPage={activePage}
          totalPages={activeTotalPages}
          totalCount={activeTotalCount}
          pageSize={activePageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </Card>
    </section>
  );
};
