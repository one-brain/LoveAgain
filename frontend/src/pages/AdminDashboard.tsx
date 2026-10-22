import React, { useState } from 'react';
import {
  useGetAdminVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetAdminUsersQuery,
  useGetAdminMisQuery,
  useGetAdminPayoutsQuery,
  useProcessAdminPayoutMutation,
  type AdminVerificationItem,
} from '../store/adminApi';
import {
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'payouts' | 'mis'>('verifications');
  const [verificationFilter, setVerificationFilter] = useState<'All' | 'PendingReview' | 'Approved' | 'Rejected'>('PendingReview');
  const [userSearch, setUserSearch] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<AdminVerificationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [payoutUtr, setPayoutUtr] = useState('');
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  // Queries
  const { data: verificationsData, isLoading: isLoadingVerifications, refetch: refetchVerifications } = useGetAdminVerificationsQuery(
    verificationFilter === 'All' ? {} : { status: verificationFilter }
  );
  const { data: usersData } = useGetAdminUsersQuery({ search: userSearch });
  const { data: misData, refetch: refetchMis } = useGetAdminMisQuery();
  const { data: payoutsData, refetch: refetchPayouts } = useGetAdminPayoutsQuery();

  // Mutations
  const [approveVerification, { isLoading: isApproving }] = useApproveVerificationMutation();
  const [rejectVerification, { isLoading: isRejecting }] = useRejectVerificationMutation();
  const [processPayout, { isLoading: isProcessingPayout }] = useProcessAdminPayoutMutation();

  const handleApprove = async (profileId: string) => {
    try {
      await approveVerification(profileId).unwrap();
      refetchVerifications();
      refetchMis();
      setSelectedVerification(null);
    } catch (err) {
      alert('Failed to approve application.');
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectReason.trim()) {
      alert('Please enter a rejection reason for the applicant.');
      return;
    }
    try {
      await rejectVerification({ profileId: selectedVerification.profileId, reason: rejectReason }).unwrap();
      refetchVerifications();
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedVerification(null);
    } catch (err) {
      alert('Failed to reject application.');
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayoutId) return;
    try {
      await processPayout({ payoutId: selectedPayoutId, utrReference: payoutUtr || undefined }).unwrap();
      refetchPayouts();
      refetchMis();
      setSelectedPayoutId(null);
      setPayoutUtr('');
    } catch (err) {
      alert('Failed to process payout.');
    }
  };

  const handleExportCsv = () => {
    window.open('/api/v1/payments/admin/mis/export', '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold mb-2">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Cue Back-Office Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Platform Operations & MIS Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage companion verifications, user directories, escrow settlements, and executive growth metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/80 hover:bg-muted font-semibold text-sm text-foreground shadow-xs transition-all"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-accent" />
            <span>Export MIS Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross Merchandise Value</span>
          <div className="text-2xl font-black text-foreground mt-1 flex items-baseline gap-1">
            <span>₹{(misData?.totalGmv ?? 145000).toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
            All-time platform bookings volume
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-accent/20 bg-accent/5 shadow-xs">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Net Platform Revenue (15%)</span>
          <div className="text-2xl font-black text-accent mt-1 flex items-baseline gap-1">
            <span>₹{(misData?.totalPlatformRevenue ?? 21750).toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-semibold mt-1 inline-block">
            Direct realized commission
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Escrow Liquidity Locked</span>
          <div className="text-2xl font-black text-foreground mt-1 flex items-baseline gap-1">
            <span>₹{(misData?.activeEscrowLocked ?? 12500).toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 inline-block">
            Funds in ongoing escrow holds
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Booking Success Rate</span>
          <div className="text-2xl font-black text-foreground mt-1 flex items-baseline gap-1">
            <span>{misData?.completionRatePercent ?? 94.2}%</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
            {misData?.completedBookings ?? 42} Completed / {misData?.totalBookings ?? 45} Total
          </span>
        </div>
      </div>

      {/* Tabs Segmented Control */}
      <div className="flex border-b border-border/80 mb-6 space-x-6">
        {[
          { key: 'verifications', label: 'Companion Verifications', count: verificationsData?.length },
          { key: 'users', label: 'Users Directory' },
          { key: 'payouts', label: 'Payouts & Withdrawals', count: payoutsData?.filter(p => p.status === 'Pending').length },
          { key: 'mis', label: 'MIS Business Reports' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab.key
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.key ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div>
          {/* Subfilter */}
          <div className="flex items-center gap-2 mb-6">
            {(['All', 'PendingReview', 'Approved', 'Rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setVerificationFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  verificationFilter === filter
                    ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                    : 'bg-card text-muted-foreground border-border/80 hover:bg-muted'
                }`}
              >
                {filter === 'PendingReview' ? 'Pending Review' : filter}
              </button>
            ))}
          </div>

          {isLoadingVerifications ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : verificationsData?.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border/80 rounded-2xl p-8">
              <ShieldCheckIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-base font-bold text-foreground">No applications in this queue</p>
              <p className="text-xs text-muted-foreground mt-1">All companion verification requests have been cleared.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {verificationsData?.map((item) => (
                <div
                  key={item.profileId}
                  className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-accent/40 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.photoUrl || item.selfieVerificationUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={item.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-border"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-foreground">{item.fullName}</h3>
                          <p className="text-xs text-muted-foreground">{item.email}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : item.status === 'Rejected'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold py-2 px-3 rounded-xl bg-muted/40 mb-3">
                      <span>Hourly Rate:</span>
                      <span className="font-mono text-accent font-bold">₹{item.hourlyRate.toLocaleString('en-IN')}/hr</span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {item.bio || 'No bio submitted.'}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.specialties?.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground/80">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedVerification(item)}
                      className="flex-1 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      <span>Inspect KYC</span>
                    </button>

                    {item.status !== 'Approved' && (
                      <button
                        onClick={() => handleApprove(item.profileId)}
                        disabled={isApproving}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-xs transition-all disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}

                    {item.status !== 'Rejected' && (
                      <button
                        onClick={() => {
                          setSelectedVerification(item);
                          setShowRejectModal(true);
                        }}
                        className="px-3 py-2 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 font-semibold text-xs transition-all"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border/80 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Showing {usersData?.length || 0} registered accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Roles</th>
                  <th className="px-4 py-3.5">Companion Status</th>
                  <th className="px-4 py-3.5">Trust Score</th>
                  <th className="px-4 py-3.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {usersData?.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold flex items-center justify-center text-xs">
                        {user.firstName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        {user.roles.map((r) => (
                          <span key={r} className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-foreground">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.hasCompanionProfile ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.companionStatus === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}>
                          {user.companionStatus}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Client Only</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                        {user.trustScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Companion UPI Payout Requests</h2>
            <span className="text-xs text-muted-foreground">Automated settlement queue via UPI VPA</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Companion</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">UPI Destination</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Requested At</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payoutsData?.map((payout) => (
                  <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-foreground">{payout.userName}</p>
                      <p className="text-[11px] text-muted-foreground">{payout.userEmail}</p>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-sm text-foreground">
                      ₹{payout.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-accent">
                      {payout.destination}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        payout.status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-[11px]">
                      {new Date(payout.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {payout.status === 'Pending' ? (
                        <button
                          onClick={() => {
                            setSelectedPayoutId(payout.id);
                            setPayoutUtr(`UTR${Date.now().toString().slice(-8)}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs hover:opacity-95 shadow-xs"
                        >
                          Process Payout
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MIS REPORTS */}
      {activeTab === 'mis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs">
              <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4 text-accent" />
                <span>Daily Booking Volume & Revenue Trajectory</span>
              </h3>
              <div className="space-y-3">
                {misData?.dailyTrends?.map((d) => (
                  <div key={d.date} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground/80 w-16">{d.date}</span>
                    <div className="flex-1 mx-3 bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-accent h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(15, (d.gmv / 50000) * 100))}%` }}
                      />
                    </div>
                    <div className="text-right font-mono font-bold">
                      <span className="text-foreground">₹{d.gmv.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground text-[10px] ml-1.5">({d.bookingsCount} bks)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Demand */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs">
              <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
                <BuildingLibraryIcon className="w-4 h-4 text-accent" />
                <span>Top Specialty Categories by Market Volume</span>
              </h3>
              <div className="space-y-3">
                {misData?.topSpecialties?.map((cat) => (
                  <div key={cat.specialty} className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-foreground">{cat.specialty}</p>
                      <p className="text-[10px] text-muted-foreground">{cat.bookingsCount} completed bookings</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-accent">
                      ₹{cat.totalVolume.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Inspection Modal */}
      {selectedVerification && !showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">KYC & Document Verification</h2>
                <p className="text-xs text-muted-foreground">{selectedVerification.fullName} ({selectedVerification.email})</p>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground mb-2 block">1. Live Face Selfie</span>
                <div className="rounded-2xl overflow-hidden aspect-square border border-border bg-muted">
                  <img
                    src={selectedVerification.selfieVerificationUrl || selectedVerification.photoUrl || ''}
                    alt="Applicant Selfie"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground mb-2 block">2. Government ID Proof</span>
                <div className="rounded-2xl overflow-hidden aspect-square border border-border bg-muted">
                  <img
                    src={selectedVerification.idProofUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'}
                    alt="Government ID"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs mb-6 space-y-1">
              <p><strong className="text-foreground">Bio:</strong> {selectedVerification.bio}</p>
              <p><strong className="text-foreground">Proposed Hourly Rate:</strong> ₹{selectedVerification.hourlyRate}/hr</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 font-semibold text-xs transition-all"
              >
                Reject with Feedback
              </button>
              <button
                onClick={() => handleApprove(selectedVerification.profileId)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md transition-all"
              >
                Approve & Publish to Discovery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-2">Provide Rejection Reason</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Explain why this profile cannot be approved so the user can make corrections.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., Government ID is blurry, Selfie face does not match ID photograph, etc."
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-accent mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Payout Modal */}
      {selectedPayoutId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-2">Confirm UPI Settlement</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter the bank UTR / RazorpayX transaction ID for record-keeping:
            </p>

            <input
              type="text"
              value={payoutUtr}
              onChange={(e) => setPayoutUtr(e.target.value)}
              placeholder="UTR1234567890"
              className="w-full p-3 rounded-xl border border-border bg-background font-mono text-xs focus:ring-2 focus:ring-accent mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedPayoutId(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayout}
                disabled={isProcessingPayout}
                className="px-5 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs"
              >
                Mark Processed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
