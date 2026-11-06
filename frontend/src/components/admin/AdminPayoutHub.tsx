import React, { useState } from 'react';
import {
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
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
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
  Money20Regular,
  CheckmarkCircle16Regular,
  Copy16Regular,
  Checkmark16Regular,
  ArrowSync16Regular,
  MoreHorizontal16Regular,
} from '@fluentui/react-icons';
import type { AdminPayoutItem } from '../../store/adminApi';
import { formatINR } from '../../utils/currency';
import { Pagination } from '../ui/Pagination';

interface AdminPayoutHubProps {
  payouts: AdminPayoutItem[];
  isLoading: boolean;
  onProcessPayout: (payoutId: string, utr: string) => Promise<void>;
  isProcessing: boolean;
  onRefresh: () => void;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const AdminPayoutHub: React.FC<AdminPayoutHubProps> = ({
  payouts,
  isLoading,
  onProcessPayout,
  isProcessing,
  onRefresh,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('Pending');
  const [selectedPayout, setSelectedPayout] = useState<AdminPayoutItem | null>(null);
  const [payoutUtr, setPayoutUtr] = useState('');
  const [copiedVpa, setCopiedVpa] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
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

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleCopyVpa = (vpa: string) => {
    navigator.clipboard.writeText(vpa);
    setCopiedVpa(vpa);
    setTimeout(() => setCopiedVpa(null), 2000);
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  const displayedPayouts = isServerPaged
    ? filteredPayouts
    : filteredPayouts.slice((activePage - 1) * activePageSize, activePage * activePageSize);

  const activeTotalCount = isServerPaged
    ? (totalCount ?? filteredPayouts.length)
    : filteredPayouts.length;
  const activeTotalPages = isServerPaged
    ? (totalPages ?? Math.max(1, Math.ceil(activeTotalCount / activePageSize)))
    : Math.max(1, Math.ceil(activeTotalCount / activePageSize));

  const pendingPayouts = payouts.filter((p) => p.status === 'Pending');
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPayouts = payouts.filter((p) => p.status === 'Completed');
  const completedAmount = completedPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleOpenProcess = (payout: AdminPayoutItem) => {
    setSelectedPayout(payout);
    setPayoutUtr(`UTR${Date.now().toString().slice(-8)}`);
  };

  const handleConfirmProcess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPayout) return;
    await onProcessPayout(selectedPayout.id, payoutUtr.trim());
    setSelectedPayout(null);
    setPayoutUtr('');
  };

  const filterTabs: { key: 'Pending' | 'Completed' | 'All'; label: string; count: number }[] = [
    { key: 'Pending', label: 'Pending settlement', count: pendingPayouts.length },
    { key: 'Completed', label: 'Settled payouts', count: completedPayouts.length },
    { key: 'All', label: 'All requests', count: payouts.length },
  ];

  return (
    <section aria-label="UPI Payouts and Settlements Hub" className="space-y-4">
      {/* Controls Strip */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <TabList
            size="small"
            selectedValue={filter}
            onTabSelect={(_e, data) => setFilter(data.value as 'All' | 'Pending' | 'Completed')}
          >
            {filterTabs.map((pill) => (
              <Tab key={pill.key} value={pill.key}>
                <span className="flex items-center gap-1.5">
                  <span>{pill.label}</span>
                  <Badge
                    appearance="tint"
                    color={pill.key === 'Pending' && pill.count > 0 ? 'warning' : 'informative'}
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

        <Button
          appearance="outline"
          size="small"
          icon={<ArrowSync16Regular />}
          onClick={onRefresh}
          title="Refresh payout queue"
          aria-label="Refresh payout queue"
        />
      </Card>

      {/* Mini Settlements Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border border-border p-3 rounded-2xl shadow-sm">
          <span className="text-caption1 font-semibold text-warning">Pending disbursal queue</span>
          <p className="font-mono font-semibold text-subtitle2 text-warning mt-0.5 tabular">
            {formatINR(pendingAmount)} ({pendingPayouts.length} transfers)
          </p>
        </Card>
        <Card className="bg-card border border-border p-3 rounded-2xl shadow-sm">
          <span className="text-caption1 font-semibold text-success">
            Total settled disbursals
          </span>
          <p className="font-mono font-semibold text-subtitle2 text-success mt-0.5 tabular">
            {formatINR(completedAmount)} ({completedPayouts.length} transfers)
          </p>
        </Card>
        <Card className="bg-card border border-border p-3 rounded-2xl shadow-sm">
          <span className="text-caption1 font-semibold text-muted-foreground">
            Settlement rail
          </span>
          <p className="font-semibold text-body1 text-foreground mt-0.5">
            Instant UPI VPA / RazorpayX payouts
          </p>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-0">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner label="Checking payout settlements queue..." />
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="text-center py-16 p-8">
            <Money20Regular className="text-muted-foreground mx-auto mb-3" />
            <h3 className="text-body1 font-semibold text-foreground">
              No payout records in this queue
            </h3>
            <p className="text-caption1 text-muted-foreground mt-1 max-w-sm mx-auto">
              {filter === 'Pending'
                ? 'All guest payout requests have been settled.'
                : 'No payout records match this filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table size="small" aria-label="Payout settlements table">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Guest</TableHeaderCell>
                  <TableHeaderCell>Net disbursal amount</TableHeaderCell>
                  <TableHeaderCell>UPI destination VPA</TableHeaderCell>
                  <TableHeaderCell>Settlement status</TableHeaderCell>
                  <TableHeaderCell>Requested at</TableHeaderCell>
                  <TableHeaderCell>Settlement action</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPayouts.map((payout) => {
                  const isPending = payout.status === 'Pending';

                  return (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <TableCellLayout>
                          <div>
                            <p className="font-semibold text-foreground">{payout.userName}</p>
                            <p className="text-caption1 text-muted-foreground">
                              {payout.userEmail}
                            </p>
                          </div>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="font-mono font-semibold text-body1 text-foreground tabular">
                            {formatINR(payout.amount)}
                          </span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <div className="inline-flex items-center gap-1 font-mono text-caption1 text-brand-fg bg-muted px-2 py-0.5 rounded border border-border">
                            <span>{payout.destination}</span>
                            <Button
                              appearance="transparent"
                              size="small"
                              icon={
                                copiedVpa === payout.destination ? (
                                  <Checkmark16Regular className="text-success" />
                                ) : (
                                  <Copy16Regular />
                                )
                              }
                              onClick={() => handleCopyVpa(payout.destination)}
                              title="Copy UPI VPA"
                              aria-label="Copy UPI VPA"
                            />
                          </div>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <Badge
                            appearance="tint"
                            color={isPending ? 'warning' : 'success'}
                            size="small"
                          >
                            {payout.status}
                          </Badge>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="text-caption1 text-muted-foreground tabular">
                            {new Date(payout.createdAt).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <Button
                                appearance="primary"
                                size="small"
                                onClick={() => handleOpenProcess(payout)}
                              >
                                Settle UPI
                              </Button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <Badge
                                  appearance="tint"
                                  color="success"
                                  size="small"
                                  icon={<CheckmarkCircle16Regular />}
                                >
                                  Completed
                                </Badge>
                                {payout.razorpayPayoutId && (
                                  <span className="text-caption2 font-mono tabular text-muted-foreground">
                                    UTR: {payout.razorpayPayoutId}
                                  </span>
                                )}
                              </div>
                            )}

                            <Menu>
                              <MenuTrigger disableButtonEnhancement>
                                <Button
                                  appearance="subtle"
                                  size="small"
                                  icon={<MoreHorizontal16Regular />}
                                  aria-label="Payout actions"
                                />
                              </MenuTrigger>
                              <MenuPopover>
                                <MenuList>
                                  <MenuItem
                                    icon={<Copy16Regular />}
                                    onClick={() => handleCopyVpa(payout.destination)}
                                  >
                                    Copy UPI VPA
                                  </MenuItem>
                                  {payout.razorpayPayoutId && (
                                    <MenuItem
                                      icon={<Copy16Regular />}
                                      onClick={() => handleCopyUtr(payout.razorpayPayoutId!)}
                                    >
                                      Copy UTR ({copiedUtr === payout.razorpayPayoutId ? 'Copied' : payout.razorpayPayoutId})
                                    </MenuItem>
                                  )}
                                  {isPending && (
                                    <MenuItem onClick={() => handleOpenProcess(payout)}>
                                      Settle UPI
                                    </MenuItem>
                                  )}
                                </MenuList>
                              </MenuPopover>
                            </Menu>
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

      {/* UTR Settlement Dialog */}
      <Dialog
        open={Boolean(selectedPayout)}
        onOpenChange={(_e, data) => {
          if (!data.open) setSelectedPayout(null);
        }}
      >
        <DialogSurface>
          <form onSubmit={handleConfirmProcess}>
            <DialogBody>
              <DialogTitle>Confirm UPI payout settlement</DialogTitle>
              <DialogContent className="space-y-4">
                {selectedPayout && (
                  <p className="text-caption1 text-muted-foreground">
                    Disbursing{' '}
                    <strong className="text-foreground tabular">
                      {formatINR(selectedPayout.amount)}
                    </strong>{' '}
                    to guest <strong className="text-foreground">{selectedPayout.userName}</strong> (
                    <span className="font-mono">{selectedPayout.destination}</span>).
                  </p>
                )}

                <Field
                  label="Bank UTR / RazorpayX payout reference"
                  hint="A unique settlement tracking ID generated for auditing and reconciliation."
                >
                  <Input
                    id="payout-utr-input"
                    value={payoutUtr}
                    onChange={(_e, data) => setPayoutUtr(data.value)}
                    placeholder="UTR1234567890"
                    className="font-mono tabular"
                    autoFocus
                  />
                </Field>
              </DialogContent>
              <DialogActions>
                <Button
                  type="button"
                  appearance="outline"
                  onClick={() => setSelectedPayout(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  appearance="primary"
                  disabled={isProcessing || !payoutUtr.trim()}
                >
                  {isProcessing ? 'Settling...' : 'Settle UPI'}
                </Button>
              </DialogActions>
            </DialogBody>
          </form>
        </DialogSurface>
      </Dialog>
    </section>
  );
};
