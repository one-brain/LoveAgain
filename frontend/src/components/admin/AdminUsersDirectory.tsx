import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import type { AdminUserItem } from '../../store/adminApi';

interface AdminUsersDirectoryProps {
  users: AdminUserItem[];
  isLoading: boolean;
  onToggleSuspend: (userId: string) => Promise<void>;
  isTogglingSuspend: boolean;
}

export const AdminUsersDirectory: React.FC<AdminUsersDirectoryProps> = ({
  users,
  isLoading,
  onToggleSuspend,
  isTogglingSuspend,
}) => {
  const [roleFilter, setRoleFilter] = useState<'All' | 'Companions' | 'Seekers' | 'Suspended'>('All');
  const [search, setSearch] = useState('');
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const isSuspended = user.trustScore < 0;
    const isCompanion = user.hasCompanionProfile || user.roles?.includes('Companion') || user.roles?.includes('Provider');
    const isSeeker = !isCompanion && !user.roles?.includes('Admin');

    const matchesRole =
      roleFilter === 'All'
        ? true
        : roleFilter === 'Companions'
        ? isCompanion
        : roleFilter === 'Seekers'
        ? isSeeker
        : roleFilter === 'Suspended'
        ? isSuspended
        : true;

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q);

    return matchesRole && matchesSearch;
  });

  const handleSuspendAction = async (userId: string) => {
    setActionUserId(userId);
    try {
      await onToggleSuspend(userId);
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <section aria-label="Users and Moderation Directory" className="space-y-4">
      {/* Controls & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 p-3 sm:p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'All', label: 'All Accounts', count: users.length },
            {
              key: 'Companions',
              label: 'Companions',
              count: users.filter((u) => u.hasCompanionProfile || u.roles?.includes('Companion')).length,
            },
            {
              key: 'Seekers',
              label: 'Seekers',
              count: users.filter(
                (u) => !u.hasCompanionProfile && !u.roles?.includes('Companion') && !u.roles?.includes('Admin')
              ).length,
            },
            {
              key: 'Suspended',
              label: 'Suspended',
              count: users.filter((u) => u.trustScore < 0).length,
            },
          ].map((pill) => {
            const isActive = roleFilter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setRoleFilter(pill.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                    : 'bg-card text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{pill.label}</span>
                {pill.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-background/20 text-accent-foreground'
                        : pill.key === 'Suspended' && pill.count > 0
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {pill.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border/80 bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-accent"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-muted-foreground font-medium">Loading user accounts directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 p-8">
            <ShieldCheckIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">No accounts match this query</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your filter or search keywords.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-4 py-3.5">Assigned Roles</th>
                  <th className="px-4 py-3.5">Companion Status</th>
                  <th className="px-4 py-3.5">Trust Score</th>
                  <th className="px-4 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => {
                  const isSuspended = user.trustScore < 0;
                  const isUserAnAdmin =
                    user.roles?.includes('Admin') || user.email?.toLowerCase() === 'admin@cue.local';
                  const isActing = actionUserId === user.id && isTogglingSuspend;

                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                              isUserAnAdmin
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-accent/15 text-accent'
                            }`}
                          >
                            {user.firstName?.[0] || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground flex items-center gap-1.5 truncate">
                              <span>
                                {user.firstName} {user.lastName}
                              </span>
                              {isSuspended && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[9px] font-extrabold uppercase shrink-0">
                                  Suspended
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                r === 'Admin'
                                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold'
                                  : 'bg-muted text-foreground/80 border-border/60'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {user.hasCompanionProfile ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                              user.companionStatus === 'Approved'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
                                user.companionStatus === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>{user.companionStatus}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            {isUserAnAdmin ? 'Superuser Admin' : 'Seeker Only'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold tabular-nums ${
                              isSuspended
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                : user.trustScore >= 80
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {user.trustScore}/100
                          </span>
                          {!isSuspended && (
                            <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  user.trustScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.max(10, Math.min(100, user.trustScore))}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-muted-foreground text-[11px] whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.hasCompanionProfile && (
                            <Link
                              to={`/provider/${user.id}`}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all border border-border/80 inline-flex items-center gap-1 shadow-2xs"
                              title="Inspect Companion Public Profile"
                            >
                              <EyeIcon className="w-3.5 h-3.5 text-accent" />
                              <span>Inspect</span>
                            </Link>
                          )}

                          {isUserAnAdmin ? (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                              Protected Admin
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSuspendAction(user.id)}
                              disabled={isActing}
                              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                                isSuspended
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                              } disabled:opacity-50`}
                            >
                              {isActing
                                ? 'Updating...'
                                : isSuspended
                                ? 'Reinstate'
                                : 'Suspend'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
