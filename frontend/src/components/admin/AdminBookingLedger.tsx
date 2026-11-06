import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
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
  ArrowSync16Regular,
  Search16Regular,
  Copy16Regular,
  Checkmark16Regular,
  Eye16Regular,
  MoreHorizontal16Regular,
  Dismiss16Regular,
} from '@fluentui/react-icons';
import type { AdminBookingLedgerItem } from '../../store/adminApi';
import { formatINR } from '../../utils/currency';
import { Pagination } from '../ui/Pagination';

interface AdminBookingLedgerProps {
  bookings: AdminBookingLedgerItem[];
  isLoading: boolean;
  onRefresh: () => void;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const AdminBookingLedger: React.FC<AdminBookingLedgerProps> = ({
  bookings,
  isLoading,
  onRefresh,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const isEscrowStatus = (status?: string) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return (
      s === 'confirmed' ||
      s === 'inprogress' ||
      s === 'inescrow' ||
      s === 'pending' ||
      s === 'pendingpayment'
    );
  };

  const filteredBookings = bookings.filter((b) => {
    const rawId = b.bookingId || b.id || '';
    const status = (b.status || '').toLowerCase();
    const seeker = (b.seekerName || '').toLowerCase();
    const provider = (b.providerName || '').toLowerCase();

    const matchesFilter =
      statusFilter === 'All'
        ? true
        : statusFilter === 'InEscrow'
        ? isEscrowStatus(b.status)
        : statusFilter === 'Disputed'
        ? status === 'disputed'
        : status === statusFilter.toLowerCase();

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || rawId.toLowerCase().includes(q) || seeker.includes(q) || provider.includes(q);

    return matchesFilter && matchesSearch;
  });

  const displayedBookings = isServerPaged
    ? filteredBookings
    : filteredBookings.slice((activePage - 1) * activePageSize, activePage * activePageSize);

  const activeTotalCount = isServerPaged
    ? (totalCount ?? filteredBookings.length)
    : filteredBookings.length;
  const activeTotalPages = isServerPaged
    ? (totalPages ?? Math.max(1, Math.ceil(activeTotalCount / activePageSize)))
    : Math.max(1, Math.ceil(activeTotalCount / activePageSize));

  const totalGmv = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPlatformFee = filteredBookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);
  const totalProviderNet = filteredBookings.reduce(
    (sum, b) => sum + (b.providerEarnings || 0),
    0
  );

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filterTabs = [
    { key: 'All', label: 'All bookings', count: bookings.length },
    {
      key: 'InEscrow',
      label: 'In escrow / active',
      count: bookings.filter((b) => isEscrowStatus(b.status)).length,
    },
    {
      key: 'Completed',
      label: 'Completed',
      count: bookings.filter((b) => b.status === 'Completed').length,
    },
    {
      key: 'Cancelled',
      label: 'Cancelled',
      count: bookings.filter((b) => b.status === 'Cancelled').length,
    },
    {
      key: 'Disputed',
      label: 'Disputed',
      count: bookings.filter((b) => b.status === 'Disputed').length,
    },
  ];

  return (
    <section aria-label="Bookings and Revenue Ledger" className="space-y-4">
      {/* Controls & Search Strip */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <TabList
            size="small"
            selectedValue={statusFilter}
            onTabSelect={(_e, data) => setStatusFilter(String(data.value))}
          >
            {filterTabs.map((pill) => (
              <Tab key={pill.key} value={pill.key}>
                <span className="flex items-center gap-1.5">
                  <span>{pill.label}</span>
                  <Badge appearance="tint" color="informative" size="small" className="tabular">
                    {pill.count}
                  </Badge>
                </span>
              </Tab>
            ))}
          </TabList>
        </div>

        <div className="flex items-center gap-2">
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
            placeholder="Search by ID, host, guest..."
            className="w-full sm:w-64"
          />

          <Button
            appearance="outline"
            size="small"
            icon={<ArrowSync16Regular />}
            onClick={onRefresh}
            title="Refresh ledger"
            aria-label="Refresh ledger"
          />
        </div>
      </Card>

      {/* Mini Financial Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border border-border p-3 rounded-2xl shadow-sm">
          <span className="text-caption1 font-semibold text-muted-foreground">
            Showing records
          </span>
          <p className="font-mono font-semibold text-subtitle2 text-foreground mt-0.5 tabular">
            {filteredBookings.length} bookings
          </p>
        </Card>
        <Card className="bg-card border border-border p-3 rounded-2xl shadow-sm">
          <span className="text-caption1 font-semibold text-muted-foreground">
            Total booking amount
          </span>
          <p className="font-mono font-semibold text-subtitle2 text-foreground mt-0.5 tabular">
            {formatINR(totalGmv)}
          </p>
        </Card>
        <Card className="bg-card border border-border p-3 rounded-2xl shadow-sm">
          <span className="text-caption1 font-semibold text-warning">Platform fee (15%)</span>
          <p className="font-mono font-semibold text-subtitle2 text-warning mt-0.5 tabular">
            {formatINR(totalPlatformFee)}
          </p>
        </Card>
        <Card className="bg-card border border-border p-3 rounded-2xl shadow-sm">
          <span className="text-caption1 font-semibold text-success">Guest earnings (85%)</span>
          <p className="font-mono font-semibold text-subtitle2 text-success mt-0.5 tabular">
            {formatINR(totalProviderNet)}
          </p>
        </Card>
      </div>

      {/* Fluent Table Ledger */}
      <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-0">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spinner label="Loading platform bookings..." />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 p-8">
            <Money20Regular className="text-muted-foreground mx-auto mb-3" />
            <h3 className="text-body1 font-semibold text-foreground">No booking records found</h3>
            <p className="text-caption1 text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? 'No bookings match your current search query.'
                : 'No transactions exist for this filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table size="small" aria-label="Bookings ledger table">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Booking ID</TableHeaderCell>
                  <TableHeaderCell>Host</TableHeaderCell>
                  <TableHeaderCell>Guest</TableHeaderCell>
                  <TableHeaderCell>Total amount</TableHeaderCell>
                  <TableHeaderCell>Platform fee (15%)</TableHeaderCell>
                  <TableHeaderCell>Guest earnings (85%)</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedBookings.map((b) => {
                  const displayId = b.bookingId || b.id || 'N/A';
                  const isCompleted = b.status === 'Completed';
                  const isCancelled = b.status === 'Cancelled';
                  const isDisputed = b.status === 'Disputed';
                  const isInEscrow = isEscrowStatus(b.status);

                  const badgeColor: 'success' | 'danger' | 'warning' | 'informative' =
                    isCompleted
                      ? 'success'
                      : isCancelled || isDisputed
                      ? 'danger'
                      : isInEscrow
                      ? 'warning'
                      : 'informative';

                  return (
                    <TableRow key={displayId}>
                      <TableCell>
                        <TableCellLayout>
                          <div className="flex items-center gap-1 font-mono text-caption1 tabular">
                            <span>
                              {displayId.length > 8 ? `${displayId.slice(0, 8)}...` : displayId}
                            </span>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={
                                copiedId === displayId ? (
                                  <Checkmark16Regular className="text-success" />
                                ) : (
                                  <Copy16Regular />
                                )
                              }
                              onClick={() => handleCopy(displayId)}
                              title="Copy full Booking ID"
                              aria-label="Copy full Booking ID"
                            />
                          </div>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="font-semibold text-foreground">{b.seekerName}</span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="font-semibold text-foreground">{b.providerName}</span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="font-mono font-semibold text-foreground tabular">
                            {formatINR(b.totalAmount)}
                          </span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="font-mono font-semibold text-warning tabular">
                            {formatINR(b.platformFee)}
                          </span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="font-mono font-semibold text-success tabular">
                            {formatINR(b.providerEarnings)}
                          </span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <Badge appearance="tint" color={badgeColor} size="small">
                            {b.status}
                          </Badge>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <span className="text-caption1 text-muted-foreground tabular">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </TableCellLayout>
                      </TableCell>

                      <TableCell>
                        <TableCellLayout>
                          <Menu>
                            <MenuTrigger disableButtonEnhancement>
                              <Button
                                appearance="subtle"
                                size="small"
                                icon={<MoreHorizontal16Regular />}
                                aria-label="Booking actions"
                              />
                            </MenuTrigger>
                            <MenuPopover>
                              <MenuList>
                                <MenuItem
                                  icon={<Copy16Regular />}
                                  onClick={() => handleCopy(displayId)}
                                >
                                  Copy booking ID
                                </MenuItem>
                                {b.providerId && (
                                  <MenuItem
                                    icon={<Eye16Regular />}
                                    onClick={() => navigate(`/provider/${b.providerId}`)}
                                  >
                                    View guest profile
                                  </MenuItem>
                                )}
                              </MenuList>
                            </MenuPopover>
                          </Menu>
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
