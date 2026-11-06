import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  TabList,
  Tab,
  Button,
  Badge,
} from '@fluentui/react-components';
import {
  Calendar20Regular,
  Calendar24Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  Clock24Regular,
  Clock16Regular,
  ArrowUpRight16Regular,
  ShieldCheckmark20Regular,
  ShieldCheckmark16Regular,
  CheckmarkCircle20Regular,
  CheckmarkCircle24Regular,
  DismissCircle20Regular,
  Filter16Regular,
  Dismiss16Regular,
  People20Regular,
} from '@fluentui/react-icons';
import {
  useGetProviderIncomingBookingsQuery,
  useGetSeekerOutgoingBookingsQuery,
  useGetMyProfileQuery,
} from '../store/bookingApi';
import { useListProvidersQuery } from '../store/discoveryApi';
import { BookingCard, type BookingSummary } from '../components/BookingCard';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
import { CheckInModal } from '../components/CheckInModal';
import { CompleteOutingModal } from '../components/booking/CompleteOutingModal';
import { OutingSosModal } from '../components/OutingSosModal';
import { ProviderProfileModal } from '../components/booking/ProviderProfileModal';
import { EditBookingModal } from '../components/booking/EditBookingModal';
import { CancelBookingModal } from '../components/booking/CancelBookingModal';
import { SelectDropdown, type DropdownOption } from '../components/ui/Dropdown';
import { setSpecialties } from '../store/slices/profileSlice';

const SORT_BOOKING_OPTIONS: DropdownOption[] = [
  { value: 'date-asc', label: 'Soonest first' },
  { value: 'date-desc', label: 'Latest first' },
  { value: 'price-desc', label: 'Highest amount' },
];

const UPCOMING_STATUS_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All active statuses' },
  { value: 'Confirmed', label: 'Confirmed', description: 'Active & ready' },
  { value: 'PendingPayment', label: 'Pending payment', description: 'Awaiting escrow' },
  { value: 'InProgress', label: 'In progress', description: 'Active right now' },
];

const CANCELLED_STATUS_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All inactive statuses' },
  { value: 'Cancelled', label: 'Cancelled', description: 'Terminated sessions' },
  { value: 'Disputed', label: 'Disputed', description: 'Under dispute review' },
];

type ViewMode = 'all' | 'client' | 'companion';
type BookingsTab = 'upcoming' | 'completed' | 'cancelled' | 'calendar';
type PerspectiveBooking = BookingSummary & { perspective: 'client' | 'companion' };

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function parseDateSafely(val?: string | null): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function sortAndFilterBookings<T extends BookingSummary>(
  list: T[],
  allowedStatuses: string[],
  statusFilter: string,
  sortOrder: string,
  defaultDirection: 'asc' | 'desc'
): T[] {
  let filtered = list.filter((b) => allowedStatuses.includes(b.status));
  if (statusFilter !== 'all') {
    filtered = filtered.filter((b) => b.status === statusFilter);
  }
  return [...filtered].sort((a, b) => {
    if (sortOrder === 'price-desc') return (b.totalAmount || 0) - (a.totalAmount || 0);
    const dateA = parseDateSafely(a.startTime);
    const dateB = parseDateSafely(b.startTime);
    const timeA = dateA ? dateA.getTime() : 0;
    const timeB = dateB ? dateB.getTime() : 0;
    const isDesc =
      sortOrder === 'date-desc' || (sortOrder !== 'date-asc' && defaultDirection === 'desc');
    return isDesc ? timeB - timeA : timeA - timeB;
  });
}

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  bookings: PerspectiveBooking[];
}

const Bookings: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const { data: profileData } = useGetMyProfileQuery(undefined, { skip: !user });

  const {
    data: providerBookingsData,
    isLoading: isLoadingProvider,
    refetch: refetchProviderBookings,
  } = useGetProviderIncomingBookingsQuery(user?.id || '', { skip: !user?.id });
  const {
    data: seekerBookingsData,
    isLoading: isLoadingSeeker,
    refetch: refetchSeekerBookings,
  } = useGetSeekerOutgoingBookingsQuery(user?.id || '', { skip: !user?.id });

  const { data: rawLiveProviders } = useListProvidersQuery({ pageSize: 120 });
  const liveProviders = Array.isArray(rawLiveProviders) ? rawLiveProviders : rawLiveProviders?.items;

  const [activeTab, setActiveTab] = useState<BookingsTab>('upcoming');
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingSort, setBookingSort] = useState('date-asc');
  const [checkoutBooking, setCheckoutBooking] = useState<BookingSummary | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingSummary | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<BookingSummary | null>(null);
  const [completingBooking, setCompletingBooking] = useState<BookingSummary | null>(null);
  const [checkInBooking, setCheckInBooking] = useState<BookingSummary | null>(null);
  const [sosBooking, setSosBooking] = useState<BookingSummary | null>(null);
  const [previewProviderId, setPreviewProviderId] = useState<string | null>(null);

  const handleCheckIn = (b: BookingSummary) => {
    setCheckInBooking(b);
  };

  const handleOpenComplete = (b: BookingSummary) => {
    setCompletingBooking(b);
  };

  const handleCompleteSuccess = async () => {
    setCompletingBooking(null);
    await Promise.all([refetchProviderBookings(), refetchSeekerBookings()]);
    setStatusFilter('all');
    setActiveTab('completed');
  };

  const handleOpenSos = (b: BookingSummary) => {
    setSosBooking(b);
  };

  const handleCancel = (booking: BookingSummary) => {
    setCancellingBooking(booking);
  };

  const handleTabChange = (tab: BookingsTab) => {
    setActiveTab(tab);
    setStatusFilter('all');
  };

  useEffect(() => {
    if (profileData?.profile?.specialties) {
      dispatch(setSpecialties(profileData.profile.specialties));
    }
  }, [profileData, dispatch]);

  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view');
  const viewMode: ViewMode =
    viewParam === 'incoming' ? 'companion' : viewParam === 'client' ? 'client' : 'all';
  const roleMode: 'client' | 'companion' = viewMode === 'companion' ? 'companion' : 'client';

  const setViewMode = (mode: ViewMode) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (mode === 'all') next.delete('view');
        else next.set('view', mode === 'companion' ? 'incoming' : 'client');
        return next;
      },
      { replace: true }
    );
  };

  const companionStatus = profileData?.profile?.status;

  const rawClientList: BookingSummary[] = useMemo(
    () => seekerBookingsData?.bookings || [],
    [seekerBookingsData]
  );
  const rawCompanionList: BookingSummary[] = useMemo(
    () => providerBookingsData?.bookings || [],
    [providerBookingsData]
  );

  const allBookingsMap = useMemo(() => {
    const map = new Map<string, PerspectiveBooking>();

    for (const b of rawClientList) {
      map.set(b.orderId, {
        ...b,
        perspective: 'client',
      });
    }

    for (const b of rawCompanionList) {
      const existing = map.get(b.orderId);
      if (existing) {
        const isProvider = b.providerId === user?.id;
        map.set(b.orderId, {
          ...existing,
          ...b,
          perspective: isProvider ? 'companion' : 'client',
        });
      } else {
        map.set(b.orderId, {
          ...b,
          perspective: 'companion',
        });
      }
    }

    return map;
  }, [rawClientList, rawCompanionList, user?.id]);

  const allUniqueBookings = useMemo(() => Array.from(allBookingsMap.values()), [allBookingsMap]);

  const totalAllCount = allUniqueBookings.length;
  const clientCount = useMemo(
    () => allUniqueBookings.filter((b) => b.perspective === 'client').length,
    [allUniqueBookings]
  );
  const companionCount = useMemo(
    () => allUniqueBookings.filter((b) => b.perspective === 'companion').length,
    [allUniqueBookings]
  );

  const bookings: PerspectiveBooking[] = useMemo(() => {
    if (viewMode === 'client') {
      return allUniqueBookings.filter((b) => b.perspective === 'client');
    }
    if (viewMode === 'companion') {
      return allUniqueBookings.filter((b) => b.perspective === 'companion');
    }
    return allUniqueBookings;
  }, [viewMode, allUniqueBookings]);

  const isLoading =
    viewMode === 'companion'
      ? isLoadingProvider
      : viewMode === 'client'
      ? isLoadingSeeker
      : isLoadingProvider || isLoadingSeeker;

  const totalUpcomingCount = useMemo(
    () => bookings.filter((b) => ['PendingPayment', 'Confirmed', 'InProgress'].includes(b.status)).length,
    [bookings]
  );
  const totalCompletedCount = useMemo(
    () => bookings.filter((b) => b.status === 'Completed').length,
    [bookings]
  );
  const totalCancelledCount = useMemo(
    () => bookings.filter((b) => ['Cancelled', 'Disputed'].includes(b.status)).length,
    [bookings]
  );

  const upcomingBookings = useMemo(
    () =>
      sortAndFilterBookings(
        bookings,
        ['PendingPayment', 'Confirmed', 'InProgress'],
        activeTab === 'upcoming' ? statusFilter : 'all',
        bookingSort,
        'asc'
      ),
    [bookings, activeTab, statusFilter, bookingSort]
  );

  const completedBookings = useMemo(
    () =>
      sortAndFilterBookings(
        bookings,
        ['Completed'],
        'all',
        bookingSort,
        'desc'
      ),
    [bookings, bookingSort]
  );

  const cancelledBookings = useMemo(
    () =>
      sortAndFilterBookings(
        bookings,
        ['Cancelled', 'Disputed'],
        activeTab === 'cancelled' ? statusFilter : 'all',
        bookingSort,
        'desc'
      ),
    [bookings, activeTab, statusFilter, bookingSort]
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarDate((prev) => {
      const nextMonth = new Date(prev.getFullYear(), prev.getMonth() + (direction === 'next' ? 1 : -1), 1);
      const today = new Date();
      if (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() === today.getMonth()) {
        setSelectedDate(today);
      } else {
        setSelectedDate(nextMonth);
      }
      return nextMonth;
    });
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCalendarDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const handleSelectCalendarDay = (cellDate: Date) => {
    setSelectedDate(cellDate);
    if (cellDate.getMonth() !== calendarDate.getMonth() || cellDate.getFullYear() !== calendarDate.getFullYear()) {
      setCalendarDate(new Date(cellDate.getFullYear(), cellDate.getMonth(), 1));
    }
  };

  const monthGridCells = useMemo((): CalendarCell[] => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];
    const today = new Date();

    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      cells.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, today),
        isSelected: isSameDay(d, selectedDate),
        bookings: bookings.filter((b) => {
          const parsed = parseDateSafely(b.startTime);
          return parsed ? isSameDay(parsed, d) : false;
        }),
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push({
        date: d,
        isCurrentMonth: true,
        isToday: isSameDay(d, today),
        isSelected: isSameDay(d, selectedDate),
        bookings: bookings.filter((b) => {
          const parsed = parseDateSafely(b.startTime);
          return parsed ? isSameDay(parsed, d) : false;
        }),
      });
    }

    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let day = 1; day <= remaining; day++) {
        const d = new Date(year, month + 1, day);
        cells.push({
          date: d,
          isCurrentMonth: false,
          isToday: isSameDay(d, today),
          isSelected: isSameDay(d, selectedDate),
          bookings: bookings.filter((b) => {
            const parsed = parseDateSafely(b.startTime);
            return parsed ? isSameDay(parsed, d) : false;
          }),
        });
      }
    }

    return cells;
  }, [calendarDate, bookings, selectedDate]);

  const selectedDayBookings = useMemo(() => {
    return bookings.filter((b) => {
      const parsed = parseDateSafely(b.startTime);
      return parsed ? isSameDay(parsed, selectedDate) : false;
    });
  }, [bookings, selectedDate]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border text-center shadow-md space-y-4">
          <div className="w-14 h-14 rounded-lg bg-accent-light text-brand-fg flex items-center justify-center mx-auto">
            <Clock24Regular />
          </div>
          <h2 className="text-title3 font-semibold text-foreground">Sign in to view bookings</h2>
          <p className="text-body1 text-muted-foreground">
            Please log in to your Cue account to view your scheduled outings and active chat orders.
          </p>
          <Button
            appearance="primary"
            size="large"
            onClick={() => navigate('/login')}
            className="w-full min-h-11"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Unified View Switcher: All | As Host | As Guest */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <TabList
          aria-label="Booking view"
          selectedValue={viewMode}
          onTabSelect={(_, data) => setViewMode(data.value as ViewMode)}
        >
          <Tab value="all">
            <span className="flex items-center gap-2">
              <span>All bookings</span>
              <Badge appearance="tint" color="brand" className="tabular">
                {totalAllCount}
              </Badge>
            </span>
          </Tab>
          <Tab value="client">
            <span className="flex items-center gap-2">
              <span>As host</span>
              <Badge appearance="tint" color="brand" className="tabular">
                {clientCount}
              </Badge>
            </span>
          </Tab>
          <Tab value="companion">
            <span className="flex items-center gap-2">
              <span>As guest</span>
              <Badge appearance="tint" color="success" className="tabular">
                {companionCount}
              </Badge>
            </span>
          </Tab>
        </TabList>

        <Button
          appearance="primary"
          size="large"
          icon={<People20Regular />}
          onClick={() => navigate('/discovery')}
          className="min-h-11 self-start sm:self-auto"
        >
          Explore
        </Button>
      </div>

      {/* Mode Description & Unverified Banner */}
      {roleMode === 'companion' && companionStatus !== 'Approved' && (
        <div className="p-5 rounded-2xl bg-warning-light border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-body1 text-foreground flex items-center gap-2">
              <Clock16Regular className="text-warning" />
              <span>
                {companionStatus === 'PendingReview' ? 'Guest application in review' : 'Start earning as a guest'}
              </span>
            </h3>
            <p className="text-caption1 text-muted-foreground mt-0.5">
              {companionStatus === 'PendingReview'
                ? 'Your profile & ID verification are being reviewed by the Cue safety team. Turnaround is ~24 hours.'
                : 'Complete your guest application with hourly rates, activities, and identity verification to receive incoming bookings.'}
            </p>
          </div>
          <Button
            appearance="primary"
            size="large"
            onClick={() => navigate('/apply-companion')}
            className="min-h-11 shrink-0"
          >
            {companionStatus === 'PendingReview' ? 'Application' : 'Become a host'}
          </Button>
        </div>
      )}

      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-title1 font-semibold text-foreground">
            My experience bookings
          </h1>
          <p className="text-body1 text-muted-foreground mt-1">
            {viewMode === 'companion'
              ? 'Requests hosts have sent you. Accept sessions, verify Meeting PINs, and track pending earnings.'
              : viewMode === 'client'
              ? 'Outings you are hosting with guests. Pay, check in, and coordinate in chat.'
              : 'Every booking you are part of, whether you are hosting or attending as a guest.'}
          </p>
        </div>
      </div>

      {/* 4-Tab Navigation & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
        <TabList
          selectedValue={activeTab}
          onTabSelect={(_, data) => handleTabChange(data.value as BookingsTab)}
          className="overflow-x-auto"
        >
          <Tab value="upcoming" icon={<Clock24Regular />}>
            <span className="flex items-center gap-2">
              <span>Upcoming & active</span>
              <Badge appearance="tint" color="brand" className="tabular">
                {totalUpcomingCount}
              </Badge>
            </span>
          </Tab>
          <Tab value="completed" icon={<CheckmarkCircle20Regular />}>
            <span className="flex items-center gap-2">
              <span>Completed</span>
              <Badge appearance="tint" color="success" className="tabular">
                {totalCompletedCount}
              </Badge>
            </span>
          </Tab>
          <Tab value="cancelled" icon={<DismissCircle20Regular />}>
            <span className="flex items-center gap-2">
              <span>Cancelled</span>
              <Badge appearance="tint" color="danger" className="tabular">
                {totalCancelledCount}
              </Badge>
            </span>
          </Tab>
          <Tab value="calendar" icon={<Calendar20Regular />}>
            Month calendar
          </Tab>
        </TabList>

        {activeTab !== 'calendar' && (
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {activeTab === 'upcoming' && (
              <SelectDropdown
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={UPCOMING_STATUS_OPTIONS}
                size="sm"
                className="w-full sm:w-48"
              />
            )}
            {activeTab === 'cancelled' && (
              <SelectDropdown
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={CANCELLED_STATUS_OPTIONS}
                size="sm"
                className="w-full sm:w-48"
              />
            )}
            <SelectDropdown
              value={bookingSort}
              onChange={(val) => setBookingSort(val)}
              options={SORT_BOOKING_OPTIONS}
              size="sm"
              className="w-full sm:w-44"
              align="right"
            />
          </div>
        )}
      </div>

      {/* Active Filter Pill & Status Indicator */}
      {statusFilter !== 'all' && activeTab !== 'calendar' && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-accent-light border border-border text-caption1 text-foreground">
          <div className="flex items-center gap-2">
            <Filter16Regular className="text-brand-fg" />
            <span>
              Filtered by <strong>{statusFilter}</strong> — showing{' '}
              <span className="font-mono tabular font-semibold">
                {activeTab === 'upcoming'
                  ? upcomingBookings.length
                  : cancelledBookings.length}
              </span>{' '}
              of{' '}
              <span className="font-mono tabular font-semibold">
                {activeTab === 'upcoming'
                  ? totalUpcomingCount
                  : totalCancelledCount}
              </span>{' '}
              outings
            </span>
          </div>
          <Button
            appearance="subtle"
            size="small"
            icon={<Dismiss16Regular />}
            onClick={() => setStatusFilter('all')}
          >
            Clear filter
          </Button>
        </div>
      )}

      {/* Escrow Protection & Cancellation Policy Bar */}
      <div className="px-4 py-2.5 rounded-lg bg-card border border-border flex items-center justify-between gap-3 text-caption1 text-muted-foreground shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheckmark16Regular className="text-trust shrink-0" />
          <span>All bookings are held safely under 100% escrow protection. Funds are released only after meetup completion.</span>
        </div>
        <Link to="/cancellation-policy" className="text-brand-fg underline font-semibold shrink-0">
          Cancellation policy
        </Link>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-20 h-5 bg-muted rounded-full" />
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-muted shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <div className="w-32 h-5 bg-muted rounded" />
                  <div className="w-24 h-3.5 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2 py-3 border-y border-border">
                <div className="w-32 h-3.5 bg-muted rounded" />
                <div className="w-40 h-3.5 bg-muted rounded" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="w-16 h-5 bg-muted rounded" />
                <div className="w-24 h-8 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Tab 1: Upcoming & Active */}
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              {upcomingBookings.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-card border border-border p-8 sm:p-12 max-w-lg mx-auto shadow-sm space-y-4">
                  <div className="w-14 h-14 rounded-lg bg-accent-light text-brand-fg flex items-center justify-center mx-auto">
                    <Calendar24Regular />
                  </div>
                  <div>
                    <h3 className="text-subtitle1 font-semibold text-foreground">
                      {statusFilter !== 'all' ? 'No bookings match filter' : 'No upcoming bookings'}
                    </h3>
                    <p className="text-body1 text-muted-foreground mt-1">
                      {statusFilter !== 'all'
                        ? `There are no outings currently in "${statusFilter}" status.`
                        : 'You do not have any pending or confirmed outings right now. Discover verified guests to schedule an experience.'}
                    </p>
                  </div>
                  {statusFilter !== 'all' ? (
                    <Button
                      appearance="primary"
                      size="large"
                      onClick={() => setStatusFilter('all')}
                      className="min-h-11"
                    >
                      Show all
                    </Button>
                  ) : (
                    <Button
                      appearance="primary"
                      size="large"
                      icon={<People20Regular />}
                      onClick={() => navigate('/discovery')}
                      className="min-h-11"
                    >
                      Explore
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingBookings.map((b) => (
                    <BookingCard
                      key={b.orderId}
                      booking={b}
                      roleMode={b.perspective}
                      showRoleBadge={viewMode === 'all'}
                      liveProviders={liveProviders}
                      onEdit={(bkg) => setEditingBooking(bkg)}
                      onCancel={handleCancel}
                      onPay={(bkg) => setCheckoutBooking(bkg)}
                      onCheckIn={handleCheckIn}
                      onComplete={handleOpenComplete}
                      onOpenSos={handleOpenSos}
                      onViewProfile={(id) => setPreviewProviderId(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Completed */}
          {activeTab === 'completed' && (
            <div className="space-y-6">
              {completedBookings.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-card border border-border p-8 sm:p-12 space-y-4 max-w-lg mx-auto shadow-sm">
                  <div className="w-14 h-14 rounded-lg bg-success-light text-success flex items-center justify-center mx-auto">
                    <CheckmarkCircle24Regular />
                  </div>
                  <div>
                    <h3 className="text-subtitle1 font-semibold text-foreground">No completed outings yet</h3>
                    <p className="text-body1 text-muted-foreground mt-1">
                      {roleMode === 'companion'
                        ? 'Successfully fulfilled hosted outings, payment disbursements, and ratings will appear here.'
                        : 'Your safely concluded meetups, review ratings, and escrow release receipts will appear here once an outing finishes.'}
                    </p>
                  </div>
                  {roleMode === 'client' && (
                    <Button
                      appearance="primary"
                      size="large"
                      icon={<ArrowUpRight16Regular />}
                      iconPosition="after"
                      onClick={() => navigate('/discovery')}
                      className="min-h-11"
                    >
                      Explore
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedBookings.map((b) => (
                    <BookingCard
                      key={b.orderId}
                      booking={b}
                      roleMode={b.perspective}
                      showRoleBadge={viewMode === 'all'}
                      liveProviders={liveProviders}
                      onOpenSos={handleOpenSos}
                      onViewProfile={(id) => setPreviewProviderId(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Cancelled */}
          {activeTab === 'cancelled' && (
            <div className="space-y-6">
              {cancelledBookings.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-card border border-border p-8 sm:p-12 space-y-4 max-w-lg mx-auto shadow-sm">
                  <div className="w-14 h-14 rounded-lg bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                    <ShieldCheckmark20Regular />
                  </div>
                  <div>
                    <h3 className="text-subtitle1 font-semibold text-foreground">
                      {statusFilter !== 'all' ? 'No bookings match filter' : 'No cancelled or disputed outings'}
                    </h3>
                    <p className="text-body1 text-muted-foreground mt-1">
                      {statusFilter !== 'all'
                        ? `There are no outings matching status "${statusFilter}".`
                        : 'All your bookings remain active or completed smoothly. If any cancellation or dispute ever occurs, our 100% Escrow Guarantee ensures instant, transparent refunds.'}
                    </p>
                  </div>
                  {statusFilter !== 'all' ? (
                    <Button
                      appearance="primary"
                      size="large"
                      onClick={() => setStatusFilter('all')}
                      className="min-h-11"
                    >
                      Show all
                    </Button>
                  ) : (
                    <Button
                      appearance="outline"
                      size="large"
                      icon={<ArrowUpRight16Regular />}
                      iconPosition="after"
                      onClick={() => navigate('/cancellation-policy')}
                      className="min-h-11"
                    >
                      Escrow policy
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cancelledBookings.map((b) => (
                    <BookingCard
                      key={b.orderId}
                      booking={b}
                      roleMode={b.perspective}
                      showRoleBadge={viewMode === 'all'}
                      liveProviders={liveProviders}
                      onOpenSos={handleOpenSos}
                      onViewProfile={(id) => setPreviewProviderId(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Month Calendar Schedule View */}
          {activeTab === 'calendar' && (
            <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-sm space-y-6">
              {/* Calendar Month Navigation Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    appearance="outline"
                    icon={<ChevronLeft20Regular />}
                    onClick={() => navigateMonth('prev')}
                    aria-label="Previous month"
                    className="min-h-11 min-w-11"
                  />
                  <h2 className="text-subtitle1 font-semibold text-foreground min-w-[200px] text-center">
                    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <Button
                    appearance="outline"
                    icon={<ChevronRight20Regular />}
                    onClick={() => navigateMonth('next')}
                    aria-label="Next month"
                    className="min-h-11 min-w-11"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                  <div className="flex items-center gap-3 text-caption1 text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-success inline-block" />
                      <span>Active</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-warning inline-block" />
                      <span>Pending</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-trust inline-block" />
                      <span>Completed</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-destructive inline-block" />
                      <span>Cancelled</span>
                    </span>
                  </div>

                  <Button
                    appearance="outline"
                    size="large"
                    onClick={handleJumpToToday}
                    className="min-h-11"
                  >
                    Today
                  </Button>
                </div>
              </div>

              {/* Weekday Column Headers */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 text-center">
                {WEEKDAY_NAMES.map((name) => (
                  <div
                    key={name}
                    className="py-1 text-caption1 font-mono font-semibold text-muted-foreground"
                  >
                    {name}
                  </div>
                ))}
              </div>

              {/* 7-Column Full Month Matrix Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                {monthGridCells.map((cell) => {
                  return (
                    <button
                      key={cell.date.toISOString()}
                      type="button"
                      onClick={() => handleSelectCalendarDay(cell.date)}
                      className={`min-h-[64px] sm:min-h-[76px] p-2 rounded-lg border text-center transition-colors flex flex-col items-center justify-between min-w-[44px] cursor-pointer ${
                        cell.isSelected
                          ? 'border-accent bg-accent-light text-foreground'
                          : cell.isCurrentMonth
                          ? 'border-border bg-background hover:bg-muted text-foreground'
                          : 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`text-caption1 font-mono tabular ${
                            cell.isToday
                              ? 'w-6 h-6 rounded-full bg-accent text-accent-foreground font-semibold flex items-center justify-center'
                              : cell.isSelected
                              ? 'font-semibold text-foreground'
                              : cell.isCurrentMonth
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                        {cell.bookings.length > 0 && (
                          <span className="text-caption2 font-mono tabular font-semibold text-muted-foreground">
                            {cell.bookings.length}
                          </span>
                        )}
                      </div>

                      {/* Status Dots */}
                      <div className="h-3 flex items-center justify-center gap-1 w-full overflow-hidden">
                        {cell.bookings.slice(0, 3).map((b, idx) => {
                          let dotColor = 'bg-accent';
                          if (b.status === 'Confirmed' || b.status === 'InProgress') dotColor = 'bg-success';
                          else if (b.status === 'PendingPayment') dotColor = 'bg-warning';
                          else if (b.status === 'Completed') dotColor = 'bg-trust';
                          else if (b.status === 'Cancelled' || b.status === 'Disputed') dotColor = 'bg-destructive';

                          return (
                            <span
                              key={`${b.orderId}-${idx}`}
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
                              title={`${b.providerName || 'Session'}: ${b.status}`}
                            />
                          );
                        })}
                        {cell.bookings.length > 3 && (
                          <span className="text-caption2 font-mono font-semibold text-muted-foreground">
                            +
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Schedule Inspector */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-subtitle2 font-semibold text-foreground">
                    Outings on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <span className="text-caption1 font-mono text-muted-foreground tabular">
                    {selectedDayBookings.length} {selectedDayBookings.length === 1 ? 'outing' : 'outings'} scheduled
                  </span>
                </div>

                {selectedDayBookings.length === 0 ? (
                  <div className="py-10 text-center rounded-lg bg-muted border border-border p-6">
                    <p className="text-body1 text-muted-foreground">
                      No sessions scheduled for this date.
                    </p>
                    <p className="text-caption1 text-muted-foreground mt-1">
                      Click any highlighted date above to view its scheduled outings.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedDayBookings.map((b) => (
                      <BookingCard
                        key={b.orderId}
                        booking={b}
                        roleMode={b.perspective}
                        showRoleBadge={viewMode === 'all'}
                        liveProviders={liveProviders}
                        onEdit={(bkg) => setEditingBooking(bkg)}
                        onCancel={handleCancel}
                        onPay={(bkg) => setCheckoutBooking(bkg)}
                        onCheckIn={handleCheckIn}
                        onComplete={handleOpenComplete}
                        onOpenSos={handleOpenSos}
                        onViewProfile={(id) => setPreviewProviderId(id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Pop-up Data View: Guest Profile Modal */}
      {previewProviderId && (
        <ProviderProfileModal
          isOpen={Boolean(previewProviderId)}
          onClose={() => setPreviewProviderId(null)}
          providerId={previewProviderId}
          liveProviders={liveProviders}
        />
      )}

      {checkInBooking && (
        <CheckInModal
          isOpen={true}
          onClose={() => setCheckInBooking(null)}
          orderId={checkInBooking.orderId}
          clientName={checkInBooking.seekerName || 'Host'}
          hostName={checkInBooking.seekerName || 'Host'}
          meetingAddress={checkInBooking.meetingAddress}
          onSuccess={() => {
            refetchProviderBookings();
            refetchSeekerBookings();
          }}
        />
      )}

      {completingBooking && (
        <CompleteOutingModal
          isOpen={true}
          onClose={() => setCompletingBooking(null)}
          orderId={completingBooking.orderId}
          companionName={completingBooking.providerName}
          guestName={completingBooking.providerName}
          meetingAddress={completingBooking.meetingAddress}
          onSuccess={handleCompleteSuccess}
        />
      )}

      {sosBooking && (
        <OutingSosModal
          isOpen={true}
          onClose={() => setSosBooking(null)}
          orderId={sosBooking.orderId}
          meetingAddress={sosBooking.meetingAddress}
        />
      )}

      {checkoutBooking && (
        <BookingCheckoutModal
          orderId={checkoutBooking.orderId}
          totalAmount={checkoutBooking.totalAmount}
          providerName={checkoutBooking.providerName}
          isOpen={true}
          onClose={() => setCheckoutBooking(null)}
          onSuccess={() => {
            setCheckoutBooking(null);
            refetchProviderBookings();
            refetchSeekerBookings();
          }}
        />
      )}

      {editingBooking && (
        <EditBookingModal
          isOpen={true}
          onClose={() => {
            setEditingBooking(null);
            refetchProviderBookings();
            refetchSeekerBookings();
          }}
          booking={editingBooking}
        />
      )}

      {cancellingBooking && (
        <CancelBookingModal
          isOpen={true}
          onClose={() => setCancellingBooking(null)}
          booking={cancellingBooking}
          onSuccess={() => {
            setCancellingBooking(null);
            refetchProviderBookings();
            refetchSeekerBookings();
          }}
        />
      )}
    </div>
  );
};

export default Bookings;
