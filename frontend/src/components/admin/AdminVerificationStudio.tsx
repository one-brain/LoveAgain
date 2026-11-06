import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  Spinner,
  Tab,
  TabList,
  Tag,
  Textarea,
} from '@fluentui/react-components';
import {
  ShieldCheckmark20Regular,
  Image16Regular,
  Eye16Regular,
  CheckmarkCircle16Regular,
  DismissCircle16Regular,
  Search16Regular,
  ContactCard20Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';
import type { AdminVerificationItem } from '../../store/adminApi';
import { formatRate } from '../../utils/currency';
import { Pagination } from '../ui/Pagination';

interface AdminVerificationStudioProps {
  verifications: AdminVerificationItem[];
  isLoading: boolean;
  onApprove: (profileId: string) => Promise<void>;
  onReject: (profileId: string, reason: string) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const [filter, setFilter] = useState<'All' | 'PendingReview' | 'Approved' | 'Rejected'>(
    'PendingReview'
  );
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<AdminVerificationItem | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeImagePreview, setActiveImagePreview] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(20);

  const isServerPaged = Boolean(onPageChange);
  const activePage = isServerPaged ? (page ?? 1) : localPage;
  const activePageSize = isServerPaged ? (pageSize ?? 20) : localPageSize;

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

  const normalizeStatus = (
    status: any
  ): 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended' => {
    if (status === 1 || status === '1' || status === 'Draft') return 'Draft';
    if (status === 2 || status === '2' || status === 'PendingReview') return 'PendingReview';
    if (status === 3 || status === '3' || status === 'Approved') return 'Approved';
    if (status === 4 || status === '4' || status === 'Rejected') return 'Rejected';
    if (status === 5 || status === '5' || status === 'Suspended') return 'Suspended';
    return (status as any) || 'PendingReview';
  };

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

  const displayedItems = isServerPaged
    ? filteredItems
    : filteredItems.slice((activePage - 1) * activePageSize, activePage * activePageSize);

  const activeTotalCount = isServerPaged
    ? (totalCount ?? filteredItems.length)
    : filteredItems.length;
  const activeTotalPages = isServerPaged
    ? (totalPages ?? Math.max(1, Math.ceil(activeTotalCount / activePageSize)))
    : Math.max(1, Math.ceil(activeTotalCount / activePageSize));

  const pendingCount = verifications.filter(
    (v) => normalizeStatus(v.status) === 'PendingReview'
  ).length;
  const approvedCount = verifications.filter(
    (v) => normalizeStatus(v.status) === 'Approved'
  ).length;
  const rejectedCount = verifications.filter(
    (v) => normalizeStatus(v.status) === 'Rejected'
  ).length;

  useEffect(() => {
    if (displayedItems.length > 0 && !selectedItem) {
      setSelectedItem(displayedItems[0]);
    }
  }, [displayedItems, selectedItem]);

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
      setRejectReason('');
    } catch {
      // Keep rejection modal open on error
    }
  };

  const filterTabs: {
    key: 'PendingReview' | 'Approved' | 'Rejected' | 'All';
    label: string;
    count: number;
  }[] = [
    { key: 'PendingReview', label: 'Pending review', count: pendingCount },
    { key: 'Approved', label: 'Approved', count: approvedCount },
    { key: 'Rejected', label: 'Rejected', count: rejectedCount },
    { key: 'All', label: 'All applications', count: verifications.length },
  ];

  const activeDetail =
    (selectedItem &&
      displayedItems.find((i) => i.profileId === selectedItem.profileId)) ||
    selectedItem ||
    displayedItems[0] ||
    null;

  return (
    <section aria-label="Companion Verification Studio" className="space-y-4">
      {/* Controls & Search Strip */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <TabList
            size="small"
            selectedValue={filter}
            onTabSelect={(_e, data) =>
              setFilter(data.value as 'All' | 'PendingReview' | 'Approved' | 'Rejected')
            }
          >
            {filterTabs.map((pill) => (
              <Tab key={pill.key} value={pill.key}>
                <span className="flex items-center gap-1.5">
                  <span>{pill.label}</span>
                  <Badge
                    appearance="tint"
                    color={
                      pill.key === 'PendingReview' && pill.count > 0 ? 'warning' : 'informative'
                    }
                    size="small"
                    className="tabular"
                  >
                    {pill.count}
                  </Badge>
                </span>
              </Tab>
            ))}
          </TabList>
        </div>

        <Input
          size="small"
          contentBefore={<Search16Regular />}
          contentAfter={
            search ? (
              <Button
                appearance="transparent"
                size="small"
                icon={<Dismiss16Regular />}
                onClick={() => setSearch('')}
                aria-label="Clear search"
              />
            ) : undefined
          }
          value={search}
          onChange={(_e, data) => setSearch(data.value)}
          placeholder="Search by name, email, specialty..."
          className="w-full sm:w-64"
        />
      </Card>

      {/* Master-Detail Verification Layout */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner label="Loading applicant credentials..." />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="text-center py-16 bg-card border border-border rounded-2xl p-8 shadow-sm">
          <ShieldCheckmark20Regular className="text-muted-foreground mx-auto mb-3" />
          <h3 className="text-body1 font-semibold text-foreground">
            No guest applications in this queue
          </h3>
          <p className="text-caption1 text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? 'No applicants matched your search criteria. Try a different keyword.'
              : filter === 'PendingReview'
              ? 'All applicant verification requests have been thoroughly reviewed.'
              : 'No records exist under this status filter.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Master List (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            {displayedItems.map((item) => {
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
              const isSelected = activeDetail?.profileId === item.profileId;

              const statusColor: 'success' | 'danger' | 'warning' =
                itemStatus === 'Approved'
                  ? 'success'
                  : itemStatus === 'Rejected'
                  ? 'danger'
                  : 'warning';

              return (
                <Card
                  key={item.profileId}
                  onClick={() => setSelectedItem(item)}
                  className={`rounded-2xl p-4 shadow-sm cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-accent-light border-brand-stroke'
                      : 'bg-card border-border hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        size={36}
                        shape="square"
                        name={item.displayName || item.fullName}
                        image={{ src: primaryAvatar }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-body1 text-foreground truncate">
                            {item.displayName || item.fullName}
                          </h4>
                          {item.displayName && item.displayName !== item.fullName && (
                            <span
                              className="text-caption2 text-muted-foreground truncate"
                              title={item.fullName}
                            >
                              ({item.fullName})
                            </span>
                          )}
                        </div>
                        <p className="text-caption1 text-muted-foreground truncate">
                          {item.email}
                        </p>
                      </div>
                    </div>

                    <Badge appearance="tint" color={statusColor} size="small">
                      {itemStatus === 'PendingReview' ? 'Pending review' : itemStatus}
                    </Badge>
                  </div>

                  {itemStatus === 'Rejected' && item.rejectionReason && (
                    <div className="mb-2.5 p-2 rounded-md bg-destructive-light border border-border text-caption1 text-destructive">
                      <span className="font-semibold">Rejection reason: </span>
                      <span>{item.rejectionReason}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-caption1 py-1.5 px-2.5 rounded-md bg-muted border border-border mb-2">
                    <span className="text-muted-foreground">Proposed rate:</span>
                    <span className="font-mono text-brand-fg font-semibold tabular">
                      {formatRate(item.hourlyRate)}
                    </span>
                  </div>

                  <p className="text-caption1 text-muted-foreground line-clamp-2 mb-2">
                    {item.bio || 'No public bio submitted.'}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.specialties?.length ? (
                      item.specialties.slice(0, 4).map((s) => (
                        <Tag key={s} size="extra-small" appearance="outline">
                          {s}
                        </Tag>
                      ))
                    ) : (
                      <span className="text-caption2 text-muted-foreground">
                        General companionship
                      </span>
                    )}
                  </div>

                  <div
                    className="pt-2.5 border-t border-border flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Eye16Regular />}
                      onClick={() => setSelectedItem(item)}
                      className="flex-1"
                    >
                      Inspect
                    </Button>

                    {itemStatus === 'Rejected' ? (
                      <Button
                        appearance="primary"
                        size="small"
                        icon={<CheckmarkCircle16Regular />}
                        disabled={isApproving}
                        onClick={() => onApprove(item.profileId)}
                      >
                        Re-approve
                      </Button>
                    ) : (
                      <>
                        {itemStatus !== 'Approved' && (
                          <Button
                            appearance="primary"
                            size="small"
                            icon={<CheckmarkCircle16Regular />}
                            disabled={isApproving}
                            onClick={() => onApprove(item.profileId)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          appearance="outline"
                          size="small"
                          icon={<DismissCircle16Regular />}
                          disabled={isRejecting}
                          onClick={() => handleOpenReject(item)}
                          className="text-destructive"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Detail Inspector Pane (Right Column) */}
          {activeDetail && (
            <Card className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 lg:sticky lg:top-20">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-light text-brand-fg flex items-center justify-center shrink-0">
                    <ContactCard20Regular />
                  </div>
                  <div>
                    <h3 className="text-subtitle1 font-semibold text-foreground">
                      {activeDetail.displayName || activeDetail.fullName}
                    </h3>
                    <p className="text-caption1 text-muted-foreground">
                      Legal: {activeDetail.fullName} · {activeDetail.email}
                    </p>
                  </div>
                </div>

                <Badge
                  appearance="tint"
                  color={
                    normalizeStatus(activeDetail.status) === 'Approved'
                      ? 'success'
                      : normalizeStatus(activeDetail.status) === 'Rejected'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {normalizeStatus(activeDetail.status) === 'PendingReview'
                    ? 'Pending review'
                    : normalizeStatus(activeDetail.status)}
                </Badge>
              </div>

              {/* 1. Public Browse Gallery Strip (3 Photos) */}
              <div className="p-4 rounded-lg bg-muted border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-caption1 font-semibold text-foreground flex items-center gap-1.5">
                    <Image16Regular className="text-brand-fg" />
                    <span>Public browse profile gallery (up to 3 photos)</span>
                  </span>
                  <span className="text-caption2 text-muted-foreground">Click to zoom</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((idx) => {
                    const images =
                      activeDetail.profileImages && activeDetail.profileImages.length > 0
                        ? activeDetail.profileImages
                        : activeDetail.photoUrl
                        ? [activeDetail.photoUrl]
                        : [];
                    const url = images[idx];

                    return (
                      <div
                        key={idx}
                        className="rounded-lg overflow-hidden aspect-square border border-border bg-card relative cursor-pointer"
                        onClick={() =>
                          url &&
                          setActiveImagePreview({ url, label: `Public photo #${idx + 1}` })
                        }
                      >
                        {url ? (
                          <>
                            <img
                              src={url}
                              alt={`Profile gallery photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-primary/75 text-primary-foreground text-caption2 font-mono tabular">
                              #{idx + 1}
                            </span>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2 text-center text-caption2">
                            <Image16Regular className="mb-1" />
                            <span>Slot #{idx + 1} empty</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Side-by-Side Verification: Selfie vs Government ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption1 font-semibold text-foreground">
                      Live identity selfie
                    </span>
                    <Badge appearance="tint" color="success" size="small">
                      Liveness check
                    </Badge>
                  </div>
                  <div
                    className="rounded-lg overflow-hidden aspect-4/3 border border-border bg-muted cursor-pointer relative"
                    onClick={() => {
                      const u =
                        activeDetail.selfieVerificationUrl ||
                        activeDetail.photoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
                      setActiveImagePreview({ url: u, label: 'Live identity selfie' });
                    }}
                  >
                    <img
                      src={
                        activeDetail.selfieVerificationUrl ||
                        activeDetail.photoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
                      }
                      alt="Applicant selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption1 font-semibold text-foreground">
                      Government photo ID proof
                    </span>
                    <Badge appearance="tint" color="warning" size="small">
                      Identity document
                    </Badge>
                  </div>
                  <div
                    className="rounded-lg overflow-hidden aspect-4/3 border border-border bg-muted cursor-pointer relative"
                    onClick={() => {
                      const u =
                        activeDetail.idProofUrl ||
                        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600';
                      setActiveImagePreview({ url: u, label: 'Government photo ID proof' });
                    }}
                  >
                    <img
                      src={
                        activeDetail.idProofUrl ||
                        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'
                      }
                      alt="Government ID"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Applicant Profile Details */}
              <div className="p-4 rounded-lg bg-muted border border-border text-caption1 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p>
                    <strong className="text-foreground">Display name:</strong>{' '}
                    {activeDetail.displayName || activeDetail.fullName}
                  </p>
                  <p>
                    <strong className="text-foreground">Proposed hourly rate:</strong>{' '}
                    <span className="font-mono text-brand-fg font-semibold tabular">
                      {formatRate(activeDetail.hourlyRate)}
                    </span>
                  </p>
                </div>

                <div>
                  <strong className="text-foreground">Bio:</strong>{' '}
                  <span className="text-muted-foreground">
                    {activeDetail.bio || 'No bio provided'}
                  </span>
                </div>

                <div>
                  <strong className="text-foreground">Specialties:</strong>{' '}
                  <span className="text-foreground">
                    {activeDetail.specialties?.join(', ') || 'General companionship'}
                  </span>
                </div>

                {activeDetail.rejectionReason && (
                  <div className="p-2.5 rounded-md bg-destructive-light border border-border text-destructive">
                    <strong>Previous rejection reason:</strong> {activeDetail.rejectionReason}
                  </div>
                )}
              </div>

              {/* Detail Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  appearance="outline"
                  icon={<DismissCircle16Regular />}
                  onClick={() => handleOpenReject(activeDetail)}
                  className="text-destructive min-h-11"
                >
                  {normalizeStatus(activeDetail.status) === 'Rejected'
                    ? 'Update reason'
                    : 'Reject'}
                </Button>

                <Button
                  appearance="primary"
                  icon={<CheckmarkCircle16Regular />}
                  disabled={isApproving}
                  onClick={() => onApprove(activeDetail.profileId)}
                  className="min-h-11"
                >
                  {normalizeStatus(activeDetail.status) === 'Rejected'
                    ? 'Re-approve'
                    : 'Approve & publish'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      <Card className="mt-4 rounded-2xl overflow-hidden border border-border bg-card shadow-sm p-0">
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

      {/* Reject Reason Dialog */}
      <Dialog
        open={showRejectModal && Boolean(selectedItem)}
        onOpenChange={(_e, data) => {
          if (!data.open) setShowRejectModal(false);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Provide rejection reason</DialogTitle>
            <DialogContent className="space-y-4">
              {selectedItem && (
                <p className="text-caption1 text-muted-foreground">
                  Applicant:{' '}
                  <strong className="text-foreground">
                    {selectedItem.displayName || selectedItem.fullName}
                  </strong>
                </p>
              )}

              <div className="space-y-1.5">
                <span className="text-caption1 font-semibold text-muted-foreground block">
                  Quick reason templates
                </span>
                <div className="space-y-1.5">
                  {REJECTION_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRejectReason(tpl)}
                      className="w-full text-left p-2 rounded-md border border-border bg-muted hover:bg-subtle text-caption1 text-foreground transition-colors"
                    >
                      · {tpl}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Custom feedback / correction notes" required>
                <Textarea
                  id="rejection-textarea"
                  rows={3}
                  value={rejectReason}
                  onChange={(_e, data) => setRejectReason(data.value)}
                  placeholder="Explain what needs to be fixed for the guest application to be approved..."
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                disabled={isRejecting || !rejectReason.trim()}
                onClick={handleConfirmReject}
                className="bg-destructive text-destructive-foreground"
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Full-Screen Zoom Lightbox Dialog */}
      <Dialog
        open={Boolean(activeImagePreview)}
        onOpenChange={(_e, data) => {
          if (!data.open) setActiveImagePreview(null);
        }}
      >
        <DialogSurface className="max-w-3xl">
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss16Regular />}
                  onClick={() => setActiveImagePreview(null)}
                  aria-label="Close image preview"
                />
              }
            >
              {activeImagePreview?.label}
            </DialogTitle>
            <DialogContent>
              {activeImagePreview && (
                <img
                  src={activeImagePreview.url}
                  alt={activeImagePreview.label}
                  className="max-h-[75vh] w-auto mx-auto rounded-lg object-contain"
                />
              )}
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </section>
  );
};
