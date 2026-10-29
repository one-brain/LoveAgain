import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  ExclamationCircleIcon,
  UserIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { AdminKycVerificationItem } from '../../store/adminApi';

interface AdminKycVerificationStudioProps {
  kycItems: AdminKycVerificationItem[];
  isLoading: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
}

const KYC_REJECTION_TEMPLATES = [
  'Government ID image is blurred, cut off, or illegible.',
  'Live selfie facial features do not match the photo on the ID document.',
  'ID document appears expired, altered, or fraudulent.',
  'Document number entered does not match the uploaded identity card.',
  'Incomplete submission: both front and back sides of ID are mandatory.',
];

export const AdminKycVerificationStudio: React.FC<AdminKycVerificationStudioProps> = ({
  kycItems,
  isLoading,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) => {
  const [filter, setFilter] = useState<'All' | 'PendingReview' | 'Approved' | 'Rejected'>('PendingReview');
  const [search, setSearch] = useState('');
  const [selectedItemForReject, setSelectedItemForReject] = useState<AdminKycVerificationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [comparisonModalItem, setComparisonModalItem] = useState<AdminKycVerificationItem | null>(null);
  const [activeImagePreview, setActiveImagePreview] = useState<{ url: string; label: string } | null>(null);

  const filteredItems = kycItems.filter((item) => {
    const matchesFilter = filter === 'All' ? true : item.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.fullName?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.documentNumberMasked?.toLowerCase().includes(q) ||
      item.documentType?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = kycItems.filter((v) => v.status === 'PendingReview').length;
  const approvedCount = kycItems.filter((v) => v.status === 'Approved').length;
  const rejectedCount = kycItems.filter((v) => v.status === 'Rejected').length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeImagePreview) setActiveImagePreview(null);
        else if (comparisonModalItem) setComparisonModalItem(null);
        else if (selectedItemForReject) setSelectedItemForReject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImagePreview, comparisonModalItem, selectedItemForReject]);

  const handleOpenReject = (item: AdminKycVerificationItem) => {
    setSelectedItemForReject(item);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!selectedItemForReject || !rejectReason.trim()) return;
    try {
      await onReject(selectedItemForReject.id, rejectReason.trim());
      setSelectedItemForReject(null);
      if (comparisonModalItem?.id === selectedItemForReject.id) {
        setComparisonModalItem(null);
      }
    } catch {}
  };

  const handleApproveItem = async (item: AdminKycVerificationItem) => {
    try {
      await onApprove(item.id);
      if (comparisonModalItem?.id === item.id) {
        setComparisonModalItem(null);
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {(['PendingReview', 'All', 'Approved', 'Rejected'] as const).map((tab) => {
            const count =
              tab === 'PendingReview' ? pendingCount : tab === 'Approved' ? approvedCount : tab === 'Rejected' ? rejectedCount : kycItems.length;
            const label = tab === 'PendingReview' ? 'Pending Review' : tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filter === tab
                    ? 'bg-foreground text-background shadow-xs'
                    : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    filter === tab ? 'bg-background text-foreground' : 'bg-background/80 text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <MagnifyingGlassIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or document..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card rounded-2xl border border-border p-5 space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded-md w-3/4" />
              <div className="h-32 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-card rounded-3xl border border-dashed border-border/80 p-12 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <IdentificationIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No KYC submissions found</h3>
          <p className="text-xs text-muted-foreground">
            {filter === 'PendingReview'
              ? 'Great work! All user identity documents have been reviewed.'
              : 'No documents match the current search or status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl border border-border/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0 overflow-hidden">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                      ) : (
                        item.fullName?.charAt(0) || <UserIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">{item.fullName}</h4>
                      <p className="text-[11px] text-muted-foreground">{item.email}</p>
                      {item.phone && <p className="text-[10px] text-muted-foreground/80">{item.phone}</p>}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                      item.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : item.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {item.status === 'PendingReview' ? 'Pending Review' : item.status}
                  </span>
                </div>

                {/* Document Metadata */}
                <div className="bg-muted/40 rounded-xl p-3 border border-border/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Document Type:</span>
                    <span className="font-semibold text-foreground">{item.documentType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Document Number:</span>
                    <span className="font-mono font-bold text-foreground">{item.documentNumberMasked}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Submitted:</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Thumbnail Previews: Front, Back, Selfie */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveImagePreview({ url: item.frontImageUrl, label: `${item.fullName} - Front ID` })}
                    className="group relative aspect-4/3 rounded-lg overflow-hidden border border-border bg-muted/60 cursor-pointer"
                  >
                    <img src={item.frontImageUrl} alt="Front ID" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-medium">Front</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveImagePreview({ url: item.backImageUrl, label: `${item.fullName} - Back ID` })}
                    className="group relative aspect-4/3 rounded-lg overflow-hidden border border-border bg-muted/60 cursor-pointer"
                  >
                    <img src={item.backImageUrl} alt="Back ID" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-medium">Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveImagePreview({ url: item.selfieImageUrl, label: `${item.fullName} - Live Selfie` })}
                    className="group relative aspect-4/3 rounded-lg overflow-hidden border border-border bg-muted/60 cursor-pointer"
                  >
                    <img src={item.selfieImageUrl} alt="Live Selfie" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 font-medium">Selfie</span>
                  </button>
                </div>

                {/* If rejected, show rejection reason note */}
                {item.status === 'Rejected' && item.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300">
                    <span className="font-bold">Rejection Note: </span>
                    {item.rejectionReason}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setComparisonModalItem(item)}
                  className="px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <ArrowsPointingOutIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Side-by-Side</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenReject(item)}
                    disabled={isRejecting}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveItem(item)}
                    disabled={isApproving || item.status === 'Approved'}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Side-by-Side Full-Screen Comparison Modal */}
      {comparisonModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-accent" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Identity Verification Comparison: {comparisonModalItem.fullName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {comparisonModalItem.documentType} • Document #{comparisonModalItem.documentNumberMasked}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setComparisonModalItem(null)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-Side Images */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/10">
              <div className="space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Front of ID Card</span>
                  <button
                    type="button"
                    onClick={() => setActiveImagePreview({ url: comparisonModalItem.frontImageUrl, label: 'Front ID' })}
                    className="text-[10px] text-accent font-semibold hover:underline"
                  >
                    Zoom in
                  </button>
                </div>
                <div className="rounded-2xl overflow-hidden border border-border bg-black/5 dark:bg-black/40 aspect-3/4 flex items-center justify-center shadow-xs">
                  <img
                    src={comparisonModalItem.frontImageUrl}
                    alt="Front of ID"
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setActiveImagePreview({ url: comparisonModalItem.frontImageUrl, label: 'Front ID' })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Back of ID Card</span>
                  <button
                    type="button"
                    onClick={() => setActiveImagePreview({ url: comparisonModalItem.backImageUrl, label: 'Back ID' })}
                    className="text-[10px] text-accent font-semibold hover:underline"
                  >
                    Zoom in
                  </button>
                </div>
                <div className="rounded-2xl overflow-hidden border border-border bg-black/5 dark:bg-black/40 aspect-3/4 flex items-center justify-center shadow-xs">
                  <img
                    src={comparisonModalItem.backImageUrl}
                    alt="Back of ID"
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setActiveImagePreview({ url: comparisonModalItem.backImageUrl, label: 'Back ID' })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Live Facial Selfie</span>
                  <button
                    type="button"
                    onClick={() => setActiveImagePreview({ url: comparisonModalItem.selfieImageUrl, label: 'Live Selfie' })}
                    className="text-[10px] text-accent font-semibold hover:underline"
                  >
                    Zoom in
                  </button>
                </div>
                <div className="rounded-2xl overflow-hidden border border-border bg-black/5 dark:bg-black/40 aspect-3/4 flex items-center justify-center shadow-xs ring-2 ring-accent/20">
                  <img
                    src={comparisonModalItem.selfieImageUrl}
                    alt="Live Facial Selfie"
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setActiveImagePreview({ url: comparisonModalItem.selfieImageUrl, label: 'Live Selfie' })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-border flex items-center justify-between bg-card">
              <span className="text-xs text-muted-foreground">
                Examine facial structure, portrait on ID card, and document holograms carefully before approving.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenReject(comparisonModalItem)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  Reject Submission
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveItem(comparisonModalItem)}
                  disabled={isApproving || comparisonModalItem.status === 'Approved'}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Verify & Approve User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedItemForReject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <ExclamationCircleIcon className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold">Reject Identity Verification</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Provide actionable feedback for <span className="font-semibold text-foreground">{selectedItemForReject.fullName}</span>. They will be notified and asked to resubmit.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">Quick Templates</label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {KYC_REJECTION_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(tmpl)}
                    className="text-[10px] text-left px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border text-foreground transition-colors cursor-pointer"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">Specific Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Describe clearly why the documents could not be verified..."
                className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemForReject(null)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single High-Res Image Lightbox */}
      {activeImagePreview && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
              <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full font-semibold">
                {activeImagePreview.label}
              </span>
              <button
                type="button"
                onClick={() => setActiveImagePreview(null)}
                className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <img
              src={activeImagePreview.url}
              alt={activeImagePreview.label}
              className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};
