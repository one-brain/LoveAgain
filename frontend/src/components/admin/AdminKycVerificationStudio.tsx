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
  Textarea,
} from '@fluentui/react-components';
import {
  ShieldCheckmark20Regular,
  CheckmarkCircle16Regular,
  DismissCircle16Regular,
  Search16Regular,
  ContactCard20Regular,
  FullScreenMaximize16Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';
import type { AdminKycVerificationItem } from '../../store/adminApi';
import { Pagination } from '../ui/Pagination';

interface AdminKycVerificationStudioProps {
  kycItems: AdminKycVerificationItem[];
  isLoading: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
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
  const [selectedItem, setSelectedItem] = useState<AdminKycVerificationItem | null>(null);
  const [selectedItemForReject, setSelectedItemForReject] =
    useState<AdminKycVerificationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [comparisonModalItem, setComparisonModalItem] =
    useState<AdminKycVerificationItem | null>(null);
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

  const displayedItems = isServerPaged
    ? filteredItems
    : filteredItems.slice((activePage - 1) * activePageSize, activePage * activePageSize);

  const activeTotalCount = isServerPaged
    ? (totalCount ?? filteredItems.length)
    : filteredItems.length;
  const activeTotalPages = isServerPaged
    ? (totalPages ?? Math.max(1, Math.ceil(activeTotalCount / activePageSize)))
    : Math.max(1, Math.ceil(activeTotalCount / activePageSize));

  const pendingCount = kycItems.filter((v) => v.status === 'PendingReview').length;
  const approvedCount = kycItems.filter((v) => v.status === 'Approved').length;
  const rejectedCount = kycItems.filter((v) => v.status === 'Rejected').length;

  useEffect(() => {
    if (displayedItems.length > 0 && !selectedItem) {
      setSelectedItem(displayedItems[0]);
    }
  }, [displayedItems, selectedItem]);

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
    } catch {
      // handled by parent
    }
  };

  const handleApproveItem = async (item: AdminKycVerificationItem) => {
    try {
      await onApprove(item.id);
      if (comparisonModalItem?.id === item.id) {
        setComparisonModalItem(null);
      }
    } catch {
      // handled by parent
    }
  };

  const filterTabs: {
    key: 'PendingReview' | 'All' | 'Approved' | 'Rejected';
    label: string;
    count: number;
  }[] = [
    { key: 'PendingReview', label: 'Pending review', count: pendingCount },
    { key: 'All', label: 'All', count: kycItems.length },
    { key: 'Approved', label: 'Approved', count: approvedCount },
    { key: 'Rejected', label: 'Rejected', count: rejectedCount },
  ];

  const activeDetail =
    (selectedItem && displayedItems.find((i) => i.id === selectedItem.id)) ||
    selectedItem ||
    displayedItems[0] ||
    null;

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <Card className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-card p-3 rounded-2xl border border-border shadow-sm">
        <div className="overflow-x-auto">
          <TabList
            size="small"
            selectedValue={filter}
            onTabSelect={(_e, data) =>
              setFilter(data.value as 'All' | 'PendingReview' | 'Approved' | 'Rejected')
            }
          >
            {filterTabs.map((tab) => (
              <Tab key={tab.key} value={tab.key}>
                <span className="flex items-center gap-1.5">
                  <span>{tab.label}</span>
                  <Badge
                    appearance="tint"
                    color={
                      tab.key === 'PendingReview' && tab.count > 0 ? 'warning' : 'informative'
                    }
                    size="small"
                    className="tabular"
                  >
                    {tab.count}
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
          placeholder="Search by user or document..."
          className="w-full sm:w-64"
        />
      </Card>

      {/* Master-Detail Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner label="Loading KYC documents..." />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="bg-card rounded-2xl border border-border p-12 text-center max-w-lg mx-auto space-y-2 shadow-sm">
          <ContactCard20Regular className="text-muted-foreground mx-auto" />
          <h3 className="text-body1 font-semibold text-foreground">No KYC submissions found</h3>
          <p className="text-caption1 text-muted-foreground">
            {filter === 'PendingReview'
              ? 'All user identity documents have been reviewed.'
              : 'No documents match the current search or status filter.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Master Queue List */}
          <div className="lg:col-span-5 space-y-3">
            {displayedItems.map((item) => {
              const isSelected = activeDetail?.id === item.id;
              const statusColor: 'success' | 'danger' | 'warning' =
                item.status === 'Approved'
                  ? 'success'
                  : item.status === 'Rejected'
                  ? 'danger'
                  : 'warning';

              return (
                <Card
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`rounded-2xl p-4 shadow-sm cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-accent-light border-brand-stroke'
                      : 'bg-card border-border hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        size={36}
                        name={item.fullName}
                        image={item.photoUrl ? { src: item.photoUrl } : undefined}
                      />
                      <div>
                        <h4 className="text-body1 font-semibold text-foreground leading-tight">
                          {item.fullName}
                        </h4>
                        <p className="text-caption1 text-muted-foreground">{item.email}</p>
                        {item.phone && (
                          <p className="text-caption2 text-muted-foreground tabular">
                            {item.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <Badge appearance="tint" color={statusColor} size="small">
                      {item.status === 'PendingReview' ? 'Pending review' : item.status}
                    </Badge>
                  </div>

                  <div className="bg-muted rounded-md p-2.5 border border-border text-caption1 space-y-1 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Document type:</span>
                      <span className="font-semibold text-foreground">{item.documentType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Document number:</span>
                      <span className="font-mono font-semibold text-foreground tabular">
                        {item.documentNumberMasked}
                      </span>
                    </div>
                  </div>

                  {item.status === 'Rejected' && item.rejectionReason && (
                    <div className="mb-3 p-2 rounded-md bg-destructive-light border border-border text-caption1 text-destructive">
                      <span className="font-semibold">Rejection note: </span>
                      {item.rejectionReason}
                    </div>
                  )}

                  <div
                    className="pt-2.5 border-t border-border flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<FullScreenMaximize16Regular />}
                      onClick={() => setComparisonModalItem(item)}
                    >
                      Side-by-side
                    </Button>

                    <div className="flex items-center gap-1.5">
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
                      <Button
                        appearance="primary"
                        size="small"
                        icon={<CheckmarkCircle16Regular />}
                        disabled={isApproving || item.status === 'Approved'}
                        onClick={() => handleApproveItem(item)}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Detail Inspector Card */}
          {activeDetail && (
            <Card className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5 lg:sticky lg:top-20">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <ShieldCheckmark20Regular className="text-brand-fg" />
                  <div>
                    <h3 className="text-subtitle1 font-semibold text-foreground">
                      {activeDetail.fullName}
                    </h3>
                    <p className="text-caption1 text-muted-foreground tabular">
                      {activeDetail.documentType} · Document #{activeDetail.documentNumberMasked}
                    </p>
                  </div>
                </div>
                <Button
                  appearance="outline"
                  size="small"
                  icon={<FullScreenMaximize16Regular />}
                  onClick={() => setComparisonModalItem(activeDetail)}
                >
                  Full comparison
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <span className="text-caption1 font-semibold text-foreground block">
                    Front of ID card
                  </span>
                  <div
                    className="rounded-lg overflow-hidden border border-border bg-muted aspect-4/3 cursor-pointer"
                    onClick={() =>
                      setActiveImagePreview({
                        url: activeDetail.frontImageUrl,
                        label: `${activeDetail.fullName} - Front ID`,
                      })
                    }
                  >
                    <img
                      src={activeDetail.frontImageUrl}
                      alt="Front ID"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-caption1 font-semibold text-foreground block">
                    Back of ID card
                  </span>
                  <div
                    className="rounded-lg overflow-hidden border border-border bg-muted aspect-4/3 cursor-pointer"
                    onClick={() =>
                      setActiveImagePreview({
                        url: activeDetail.backImageUrl,
                        label: `${activeDetail.fullName} - Back ID`,
                      })
                    }
                  >
                    <img
                      src={activeDetail.backImageUrl}
                      alt="Back ID"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-caption1 font-semibold text-foreground block">
                    Live facial selfie
                  </span>
                  <div
                    className="rounded-lg overflow-hidden border border-border bg-muted aspect-4/3 cursor-pointer"
                    onClick={() =>
                      setActiveImagePreview({
                        url: activeDetail.selfieImageUrl,
                        label: `${activeDetail.fullName} - Live selfie`,
                      })
                    }
                  >
                    <img
                      src={activeDetail.selfieImageUrl}
                      alt="Live Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  appearance="outline"
                  icon={<DismissCircle16Regular />}
                  disabled={isRejecting}
                  onClick={() => handleOpenReject(activeDetail)}
                  className="text-destructive min-h-11"
                >
                  Reject
                </Button>
                <Button
                  appearance="primary"
                  icon={<CheckmarkCircle16Regular />}
                  disabled={isApproving || activeDetail.status === 'Approved'}
                  onClick={() => handleApproveItem(activeDetail)}
                  className="min-h-11"
                >
                  Approve ID
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

      {/* Side-by-Side Comparison Dialog */}
      <Dialog
        open={Boolean(comparisonModalItem)}
        onOpenChange={(_e, data) => {
          if (!data.open) setComparisonModalItem(null);
        }}
      >
        <DialogSurface className="max-w-5xl">
          {comparisonModalItem && (
            <DialogBody>
              <DialogTitle
                action={
                  <Button
                    appearance="subtle"
                    icon={<Dismiss16Regular />}
                    onClick={() => setComparisonModalItem(null)}
                    aria-label="Close comparison dialog"
                  />
                }
              >
                Identity verification comparison: {comparisonModalItem.fullName}
              </DialogTitle>
              <DialogContent className="space-y-4">
                <p className="text-caption1 text-muted-foreground tabular">
                  {comparisonModalItem.documentType} · Document #
                  {comparisonModalItem.documentNumberMasked}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-caption1 font-semibold text-foreground">
                      Front of ID card
                    </span>
                    <img
                      src={comparisonModalItem.frontImageUrl}
                      alt="Front of ID"
                      className="w-full rounded-lg border border-border object-contain max-h-80 cursor-pointer"
                      onClick={() =>
                        setActiveImagePreview({
                          url: comparisonModalItem.frontImageUrl,
                          label: 'Front ID',
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-caption1 font-semibold text-foreground">
                      Back of ID card
                    </span>
                    <img
                      src={comparisonModalItem.backImageUrl}
                      alt="Back of ID"
                      className="w-full rounded-lg border border-border object-contain max-h-80 cursor-pointer"
                      onClick={() =>
                        setActiveImagePreview({
                          url: comparisonModalItem.backImageUrl,
                          label: 'Back ID',
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-caption1 font-semibold text-foreground">
                      Live facial selfie
                    </span>
                    <img
                      src={comparisonModalItem.selfieImageUrl}
                      alt="Live facial selfie"
                      className="w-full rounded-lg border border-border object-contain max-h-80 cursor-pointer"
                      onClick={() =>
                        setActiveImagePreview({
                          url: comparisonModalItem.selfieImageUrl,
                          label: 'Live selfie',
                        })
                      }
                    />
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  appearance="outline"
                  onClick={() => handleOpenReject(comparisonModalItem)}
                  className="text-destructive"
                >
                  Reject
                </Button>
                <Button
                  appearance="primary"
                  icon={<CheckmarkCircle16Regular />}
                  disabled={isApproving || comparisonModalItem.status === 'Approved'}
                  onClick={() => handleApproveItem(comparisonModalItem)}
                >
                  Approve ID
                </Button>
              </DialogActions>
            </DialogBody>
          )}
        </DialogSurface>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog
        open={Boolean(selectedItemForReject)}
        onOpenChange={(_e, data) => {
          if (!data.open) setSelectedItemForReject(null);
        }}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Reject identity verification</DialogTitle>
            <DialogContent className="space-y-4">
              {selectedItemForReject && (
                <p className="text-caption1 text-muted-foreground">
                  Provide actionable feedback for{' '}
                  <strong className="text-foreground">{selectedItemForReject.fullName}</strong>.
                  They will be notified and asked to resubmit.
                </p>
              )}

              <div className="space-y-1.5">
                <span className="text-caption1 font-semibold text-muted-foreground block">
                  Quick templates
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {KYC_REJECTION_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectReason(tmpl)}
                      className="text-caption2 text-left px-2.5 py-1.5 rounded-md bg-muted hover:bg-subtle border border-border text-foreground transition-colors"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Specific rejection reason" required>
                <Textarea
                  value={rejectReason}
                  onChange={(_e, data) => setRejectReason(data.value)}
                  rows={3}
                  placeholder="Describe clearly why the documents could not be verified..."
                />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="outline" onClick={() => setSelectedItemForReject(null)}>
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

      {/* High-Res Image Lightbox Dialog */}
      <Dialog
        open={Boolean(activeImagePreview)}
        onOpenChange={(_e, data) => {
          if (!data.open) setActiveImagePreview(null);
        }}
      >
        <DialogSurface className="max-w-4xl">
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
                  className="max-h-[80vh] w-auto mx-auto rounded-lg object-contain"
                />
              )}
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
