import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  PhotoIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { AdminVerificationItem } from '../../store/adminApi';
import { formatRate } from '../../utils/currency';

interface AdminVerificationStudioProps {
  verifications: AdminVerificationItem[];
  isLoading: boolean;
  onApprove: (profileId: string) => Promise<void>;
  onReject: (profileId: string, reason: string) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
}

const REJECTION_TEMPLATES = [
  'Government ID is blurry, unreadable, or missing required edges.',
  'Live identity selfie face does not match the photograph on the Government ID.',
  'Public browse gallery photos do not meet quality guidelines (low resolution, obstructed face, or improper framing).',
  'Profile bio is incomplete or hourly rate is inconsistent with service standards.',
  'Suspected duplicate account or unverified identity credentials.',
];

export const AdminVerificationStudio: React.FC<AdminVerificationStudioProps> = ({
  verifications,
  isLoading,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) => {
  const [filter, setFilter] = useState<'All' | 'PendingReview' | 'Approved' | 'Rejected'>('PendingReview');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<AdminVerificationItem | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeImagePreview, setActiveImagePreview] = useState<{ url: string; label: string } | null>(null);

  const normalizeStatus = (status: any): 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended' => {
    if (status === 1 || status === '1' || status === 'Draft') return 'Draft';
    if (status === 2 || status === '2' || status === 'PendingReview') return 'PendingReview';
    if (status === 3 || status === '3' || status === 'Approved') return 'Approved';
    if (status === 4 || status === '4' || status === 'Rejected') return 'Rejected';
    if (status === 5 || status === '5' || status === 'Suspended') return 'Suspended';
    return (status as any) || 'PendingReview';
  };

  // Filter & Search
  const filteredItems = verifications.filter((item) => {
    const itemStatus = normalizeStatus(item.status);
    const matchesFilter = filter === 'All' ? true : itemStatus === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.fullName?.toLowerCase().includes(q) ||
      item.displayName?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.specialties?.some((s) => s.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = verifications.filter((v) => normalizeStatus(v.status) === 'PendingReview').length;
  const approvedCount = verifications.filter((v) => normalizeStatus(v.status) === 'Approved').length;
  const rejectedCount = verifications.filter((v) => normalizeStatus(v.status) === 'Rejected').length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeImagePreview) {
          setActiveImagePreview(null);
        } else if (showRejectModal) {
          setShowRejectModal(false);
        } else if (selectedItem) {
          setSelectedItem(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImagePreview, showRejectModal, selectedItem]);

  const handleOpenReject = (item: AdminVerificationItem) => {
    setSelectedItem(item);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedItem || !rejectReason.trim()) return;
    try {
      await onReject(selectedItem.profileId, rejectReason.trim());
      setShowRejectModal(false);
      setSelectedItem(null);
      setRejectReason('');
    } catch {
      // Keep rejection modal open to preserve user feedback on network failure
    }
  };

  return (
    <section aria-label="Companion Verification Studio" className="space-y-4">
      {/* Controls & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 p-3 sm:p-4 rounded-2xl shadow-2xs">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'PendingReview', label: 'Pending Review', count: pendingCount },
            { key: 'Approved', label: 'Approved', count: approvedCount },
            { key: 'Rejected', label: 'Rejected', count: rejectedCount },
            { key: 'All', label: 'All Applications', count: verifications.length },
          ].map((pill) => {
            const isActive = filter === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setFilter(pill.key as any)}
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
                        : pill.key === 'PendingReview' && pill.count > 0
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
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

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, specialty..."
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

      {/* Grid of Applications */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-muted-foreground font-medium">Loading applicant credentials...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/80 rounded-2xl p-8">
          <ShieldCheckIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">No companion applications in this queue</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? 'No applicants matched your search criteria. Try a different keyword.'
              : filter === 'PendingReview'
              ? 'All applicant verification requests have been thoroughly reviewed.'
              : 'No records exist under this status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const galleryImages =
              item.profileImages && item.profileImages.length > 0
                ? item.profileImages
                : item.photoUrl
                ? [item.photoUrl]
                : [];
            const primaryAvatar =
              galleryImages[0] ||
              item.selfieVerificationUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

            const itemStatus = normalizeStatus(item.status);

            return (
              <div
                key={item.profileId}
                className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-accent/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Identity Header & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={primaryAvatar}
                        alt={item.displayName || item.fullName}
                        className="w-11 h-11 rounded-xl object-cover border border-border/80 shrink-0 bg-muted"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground truncate">
                            {item.displayName || item.fullName}
                          </h4>
                          {item.displayName && item.displayName !== item.fullName && (
                            <span className="text-[10px] text-muted-foreground truncate" title={item.fullName}>
                              ({item.fullName})
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{item.email}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        itemStatus === 'Approved'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : itemStatus === 'Rejected'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                      }`}
                    >
                      {itemStatus === 'PendingReview' ? 'Pending Review' : itemStatus}
                    </span>
                  </div>

                  {/* Rejection Reason Callout on Card */}
                  {itemStatus === 'Rejected' && item.rejectionReason && (
                    <div className="mb-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300">
                      <span className="font-semibold block text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400">Rejection Reason</span>
                      <p className="italic leading-snug mt-0.5">{item.rejectionReason}</p>
                    </div>
                  )}

                  {/* 3-Photo Browse Profile Strip */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold mb-1.5">
                      <span className="flex items-center gap-1">
                        <PhotoIcon className="w-3.5 h-3.5 text-accent" />
                        <span>Public Discovery Gallery ({galleryImages.length}/3)</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">Click to inspect</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((idx) => {
                        const imgUrl = galleryImages[idx];
                        return imgUrl ? (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setSelectedItem(item)}
                            className="aspect-square rounded-xl overflow-hidden border border-border/80 bg-muted/40 relative group cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <img
                              src={imgUrl}
                              alt={`Browse photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-[9px] text-white font-mono">
                              #{idx + 1}
                            </span>
                          </button>
                        ) : (
                          <div
                            key={idx}
                            className="aspect-square rounded-xl border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center text-[10px] text-muted-foreground"
                          >
                            <span>Slot #{idx + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hourly Rate & Bio */}
                  <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-muted/40 border border-border/60 mb-2.5">
                    <span className="text-muted-foreground font-medium">Proposed Rate:</span>
                    <span className="font-mono text-accent font-bold tabular-nums">
                      {formatRate(item.hourlyRate)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                    {item.bio || 'No public bio submitted.'}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.specialties?.length ? (
                      item.specialties.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-foreground/80"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground">General Companionship</span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-border/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-muted/70 hover:bg-muted text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <EyeIcon className="w-3.5 h-3.5 text-accent" />
                    <span>Review Details</span>
                  </button>

                  {itemStatus === 'Rejected' ? (
                    <button
                      type="button"
                      onClick={() => onApprove(item.profileId)}
                      disabled={isApproving}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50 flex items-center gap-1"
                      title="Re-approve and publish to Discovery"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      <span>Re-Approve</span>
                    </button>
                  ) : (
                    <>
                      {itemStatus !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() => onApprove(item.profileId)}
                          disabled={isApproving}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenReject(item)}
                        disabled={isRejecting}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-xs transition-all flex items-center gap-1"
                      >
                        <XCircleIcon className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side-by-Side KYC & Gallery Modal */}
      {selectedItem && !showRejectModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kyc-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <IdentificationIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="kyc-modal-title" className="text-base sm:text-lg font-bold text-foreground">
                    Companion Application & ID Verification
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedItem.displayName ? `${selectedItem.displayName} • Legal: ` : ''}
                    {selectedItem.fullName} ({selectedItem.email})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 1. Public Browse Gallery Strip (3 Photos) */}
            <div className="mb-6 p-4 rounded-2xl bg-muted/30 border border-border/70">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <PhotoIcon className="w-4 h-4 text-accent" />
                  <span>Public Browse Profile Gallery (Up to 3 Photos)</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Visible to seekers during search and discovery
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => {
                  const images =
                    selectedItem.profileImages && selectedItem.profileImages.length > 0
                      ? selectedItem.profileImages
                      : selectedItem.photoUrl
                      ? [selectedItem.photoUrl]
                      : [];
                  const url = images[idx];

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl overflow-hidden aspect-square border border-border/80 bg-muted relative group cursor-pointer"
                      onClick={() => url && setActiveImagePreview({ url, label: `Public Photo #${idx + 1}` })}
                    >
                      {url ? (
                        <>
                          <img
                            src={url}
                            alt={`Profile Gallery photo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
                            Photo #{idx + 1}
                          </span>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 p-2 text-center text-xs">
                          <PhotoIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span>Slot #{idx + 1} Empty</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Side-by-Side Verification: Selfie vs Government ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-card border border-border/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Live Identity Selfie
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Liveness Check
                  </span>
                </div>
                <div
                  className="rounded-2xl overflow-hidden aspect-4/3 border border-border/80 bg-muted cursor-pointer group relative"
                  onClick={() => {
                    const u =
                      selectedItem.selfieVerificationUrl ||
                      selectedItem.photoUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
                    setActiveImagePreview({ url: u, label: 'Live Identity Selfie' });
                  }}
                >
                  <img
                    src={
                      selectedItem.selfieVerificationUrl ||
                      selectedItem.photoUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
                    }
                    alt="Applicant Selfie"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Click to zoom
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Government Photo ID Proof
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    Identity Document
                  </span>
                </div>
                <div
                  className="rounded-2xl overflow-hidden aspect-4/3 border border-border/80 bg-muted cursor-pointer group relative"
                  onClick={() => {
                    const u =
                      selectedItem.idProofUrl ||
                      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600';
                    setActiveImagePreview({ url: u, label: 'Government Photo ID Proof' });
                  }}
                >
                  <img
                    src={
                      selectedItem.idProofUrl ||
                      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'
                    }
                    alt="Government ID"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Click to zoom
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Applicant Profile Details */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs mb-6 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p>
                  <strong className="text-foreground">Display Name:</strong>{' '}
                  {selectedItem.displayName || selectedItem.fullName}
                </p>
                <p>
                  <strong className="text-foreground">Proposed Hourly Rate:</strong>{' '}
                  <span className="font-mono text-accent font-bold tabular-nums">
                    {formatRate(selectedItem.hourlyRate)}
                  </span>
                </p>
              </div>

              <div>
                <strong className="text-foreground">Bio:</strong>{' '}
                <span className="text-muted-foreground">{selectedItem.bio || 'No bio provided'}</span>
              </div>

              <div>
                <strong className="text-foreground">Specialties:</strong>{' '}
                <span className="text-foreground/90">
                  {selectedItem.specialties?.join(', ') || 'General Companionship'}
                </span>
              </div>

              {selectedItem.rejectionReason && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                  <strong>Previous Rejection Reason:</strong> {selectedItem.rejectionReason}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
              {normalizeStatus(selectedItem.status) !== 'Rejected' ? (
                <button
                  type="button"
                  onClick={() => handleOpenReject(selectedItem)}
                  className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-xs transition-all"
                >
                  Reject with Feedback
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenReject(selectedItem)}
                  className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-xs transition-all"
                >
                  Update Rejection Reason
                </button>
              )}

              <button
                type="button"
                onClick={async () => {
                  await onApprove(selectedItem.profileId);
                  setSelectedItem(null);
                }}
                disabled={isApproving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>
                  {normalizeStatus(selectedItem.status) === 'Rejected'
                    ? 'Re-Approve & Publish to Discovery'
                    : 'Approve & Publish to Discovery'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal with Fast Templates */}
      {showRejectModal && selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ExclamationCircleIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 id="reject-modal-title" className="text-base font-bold text-foreground">
                  Provide Rejection Reason
                </h3>
                <p className="text-xs text-muted-foreground">
                  Applicant: {selectedItem.displayName || selectedItem.fullName}
                </p>
              </div>
            </div>

            {/* Quick Reason Templates */}
            <div className="my-3">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Quick Reason Templates (Click to fill)
              </span>
              <div className="space-y-1.5">
                {REJECTION_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRejectReason(tpl)}
                    className="w-full text-left p-2 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted text-[11px] text-foreground transition-all leading-snug font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    • {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="mb-4">
              <label htmlFor="rejection-textarea" className="text-xs font-semibold text-foreground block mb-1">
                Custom Feedback / Correction Notes:
              </label>
              <textarea
                id="rejection-textarea"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain what needs to be fixed for the companion application to be approved..."
                className="w-full p-3 rounded-xl border border-border/80 bg-background text-foreground text-xs focus:ring-2 focus:ring-accent focus:outline-hidden"
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {isRejecting ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Zoom Lightbox Modal */}
      {activeImagePreview && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setActiveImagePreview(null)}
        >
          <div
            className="max-w-3xl max-h-[90vh] bg-card/10 p-2 rounded-2xl relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 px-2 text-white">
              <span className="text-xs font-bold font-mono">{activeImagePreview.label}</span>
              <button
                type="button"
                onClick={() => setActiveImagePreview(null)}
                className="px-2 py-0.5 rounded bg-black/60 text-white text-xs font-bold hover:bg-black/90"
              >
                Close ✕
              </button>
            </div>
            <img
              src={activeImagePreview.url}
              alt={activeImagePreview.label}
              className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};
