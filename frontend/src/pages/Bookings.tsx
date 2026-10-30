import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useGetProviderIncomingBookingsQuery,
  useGetSeekerOutgoingBookingsQuery,
  useGetMyProfileQuery,
  useCompleteBookingMutation,
} from '../store/bookingApi';
import { useReleaseEscrowMutation } from '../store/paymentApi';
import { useListProvidersQuery } from '../store/discoveryApi';
import { BookingCard, type BookingSummary } from '../components/BookingCard';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
import { CheckInModal } from '../components/CheckInModal';
import { OutingSosModal } from '../components/OutingSosModal';
import { ProviderProfileModal } from '../components/booking/ProviderProfileModal';
import { EditBookingModal } from '../components/booking/EditBookingModal';
import { CancelBookingModal } from '../components/booking/CancelBookingModal';
import { SelectDropdown, type DropdownOption } from '../components/ui/Dropdown';
import { setSpecialties } from '../store/slices/profileSlice';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ClockIcon,
  ArrowUpRightIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const SORT_BOOKING_OPTIONS: DropdownOption[] = [
  { value: 'date-asc', label: 'Soonest First' },
  { value: 'date-desc', label: 'Latest First' },
  { value: 'price-desc', label: 'Highest Amount' },
];

const UPCOMING_STATUS_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All Active Statuses' },
  { value: 'Confirmed', label: 'Confirmed', description: 'Active & ready' },
  { value: 'PendingPayment', label: 'Pending Payment', description: 'Awaiting escrow' },
  { value: 'InProgress', label: 'In Progress', description: 'Active right now' },
];

const CANCELLED_STATUS_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All Inactive Statuses' },
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
  const { user } = useSelector((state: any) => state.auth);

  // Fetch profile to determine user type
  const { data: profileData } = useGetMyProfileQuery(undefined, { skip: !user });

  // Fetch bookings data
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

  // Query live backend providers to enrich candidate profiles
  const { data: rawLiveProviders } = useListProvidersQuery({ pageSize: 120 });
  const liveProviders = Array.isArray(rawLiveProviders) ? rawLiveProviders : rawLiveProviders?.items;

  // Tab & display state
  const [activeTab, setActiveTab] = useState<BookingsTab>('upcoming');
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingSort, setBookingSort] = useState('date-asc');
  const [checkoutBooking, setCheckoutBooking] = useState<BookingSummary | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingSummary | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<BookingSummary | null>(null);
  const [completeBooking] = useCompleteBookingMutation();
  const [releaseEscrow] = useReleaseEscrowMutation();
  const [checkInBooking, setCheckInBooking] = useState<BookingSummary | null>(null);
  const [sosBooking, setSosBooking] = useState<BookingSummary | null>(null);
  const [previewProviderId, setPreviewProviderId] = useState<string | null>(null);

  const handleCheckIn = (b: BookingSummary) => {
    setCheckInBooking(b);
  };

  const handleComplete = async (orderId: string) => {
    if (window.confirm('Confirm that this outing experience has completed safely? This will finalize the session and release escrow funds.')) {
      try {
        await completeBooking(orderId).unwrap();
        try {
          await releaseEscrow({ orderId }).unwrap();
        } catch {
          // Ignore if escrow was already processed
        }
        await Promise.all([refetchProviderBookings(), refetchSeekerBookings()]);
        setStatusFilter('all');
        setActiveTab('completed');
      } catch (err: any) {
        alert(err?.data?.error || 'Failed to complete session');
      }
    }
  };

  const handleOpenSos = (b: BookingSummary) => {
    setSosBooking(b);
  };

  const handleCancel = (booking: BookingSummary) => {
    setCancellingBooking(booking);
  };

  // Switch tab helper resets status filter
  const handleTabChange = (tab: BookingsTab) => {
    setActiveTab(tab);
    setStatusFilter('all');
  };

  // Initialize specialties
  useEffect(() => {
    if (profileData?.profile?.specialties) {
      dispatch(setSpecialties(profileData.profile.specialties));
    }
  }, [profileData, dispatch]);

  // View mode is synced with ?view=all|client|incoming for deep linking
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

  // Deterministic Single Source of Truth for Bookings with perspective resolution
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

    // First process seeker outgoing bookings (user is seeker / client)
    for (const b of rawClientList) {
      map.set(b.orderId, {
        ...b,
        perspective: 'client',
      });
    }

    // Process provider incoming bookings (user is provider / companion)
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

  // Exact counts for the top view mode switcher
  const totalAllCount = allUniqueBookings.length;
  const clientCount = useMemo(
    () => allUniqueBookings.filter((b) => b.perspective === 'client').length,
    [allUniqueBookings]
  );
  const companionCount = useMemo(
    () => allUniqueBookings.filter((b) => b.perspective === 'companion').length,
    [allUniqueBookings]
  );

  // Active perspective-filtered bookings
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

  // Unchanging category totals for tab counts (not affected by intra-tab status filter)
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

  // Filtered and sorted booking lists for active tab rendering
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

  // Month navigation: synchronizes both visible month and day selector
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
    // If the clicked cell belongs to adjacent month padding, flip calendar month
    if (cellDate.getMonth() !== calendarDate.getMonth() || cellDate.getFullYear() !== calendarDate.getFullYear()) {
      setCalendarDate(new Date(cellDate.getFullYear(), cellDate.getMonth(), 1));
    }
  };

  // Generate 7-column matrix for full month
  const monthGridCells = useMemo((): CalendarCell[] => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayIndex = firstDayOfMonth.getDay(); // 0 for Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];
    const today = new Date();

    // Previous month padding
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

    // Current month days
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

    // Next month padding to complete trailing week row
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

  // Selected date bookings
  const selectedDayBookings = useMemo(() => {
    return bookings.filter((b) => {
      const parsed = parseDateSafely(b.startTime);
      return parsed ? isSameDay(parsed, selectedDate) : false;
    });
  }, [bookings, selectedDate]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-card border border-border text-center shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mx-auto">
            <ClockIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-foreground">Sign In to View Bookings</h2>
          <p className="text-sm text-muted-foreground">
            Please log in to your Cue account to view your scheduled companions and active chat orders.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3 min-h-[44px] rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-xs hover:bg-accent-hover transition-colors flex items-center justify-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Unified View Switcher: All | My Outings | Incoming Requests */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Booking view"
          className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/80 max-w-xl w-full"
        >
          {(
            [
              { mode: 'all', label: 'All Bookings', count: totalAllCount },
              { mode: 'client', label: 'My Outings', count: clientCount },
              { mode: 'companion', label: 'Incoming Requests', count: companionCount },
            ] as { mode: ViewMode; label: string; count: number }[]
          ).map(({ mode, label, count }) => {
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setViewMode(mode)}
                className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-card text-foreground shadow-sm border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode === 'companion' && <SparklesIcon className="w-3.5 h-3.5 text-accent" />}
                <span>{label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono tabular-nums ${
                    mode === 'companion'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-accent/15 text-accent'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <Link
          to="/discovery"
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-transform hover:scale-[1.02]"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Find New Companion</span>
        </Link>
      </div>

      {/* Mode Description & Unverified Banner */}
      {roleMode === 'companion' && companionStatus !== 'Approved' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-amber-500" />
              <span>{companionStatus === 'PendingReview' ? 'Companion Application In Review' : 'Start Earning as a Companion'}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {companionStatus === 'PendingReview'
                ? 'Your profile & ID verification are being reviewed by the Cue safety team. Turnaround is ~24 hours.'
                : 'Complete your companion application with hourly rates, activities, and identity verification to receive incoming bookings.'}
            </p>
          </div>
          <Link
            to="/apply-companion"
            className="px-4 py-2 min-h-[44px] flex items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs shrink-0"
          >
            {companionStatus === 'PendingReview' ? 'View Review Status' : 'Apply to Become Companion'}
          </Link>
        </div>
      )}

      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            My Experience Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {viewMode === 'companion'
              ? 'Requests clients have sent you. Accept sessions, verify Meeting PINs, and track pending earnings.'
              : viewMode === 'client'
              ? 'Outings you booked with companions. Pay, check in, and coordinate in chat.'
              : 'Every booking you are part of, whether you booked a companion or a client booked you.'}
          </p>
        </div>
      </div>

      {/* 4-Tab Navigation & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
        {/* 4 Segmented Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {/* 1. Upcoming & Active */}
          <button
            type="button"
            onClick={() => handleTabChange('upcoming')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Upcoming & Active</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums ${
                activeTab === 'upcoming' ? 'bg-card/30 text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {totalUpcomingCount}
            </span>
          </button>

          {/* 2. Completed */}
          <button
            type="button"
            onClick={() => handleTabChange('completed')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>Completed</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums ${
                activeTab === 'completed' ? 'bg-card/30 text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {totalCompletedCount}
            </span>
          </button>

          {/* 3. Cancelled */}
          <button
            type="button"
            onClick={() => handleTabChange('cancelled')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cancelled'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <XCircleIcon className="w-4 h-4" />
            <span>Cancelled</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-mono font-bold tabular-nums ${
                activeTab === 'cancelled' ? 'bg-card/30 text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {totalCancelledCount}
            </span>
          </button>

          {/* 4. Calendar Mode */}
          <button
            type="button"
            onClick={() => handleTabChange('calendar')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4" />
            <span>Month Calendar</span>
          </button>
        </div>

        {/* Dropdowns Filter & Sort */}
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
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-accent" />
            <span>
              Filtered by <strong>{statusFilter}</strong> — showing{' '}
              <span className="font-mono font-bold">
                {activeTab === 'upcoming'
                  ? upcomingBookings.length
                  : cancelledBookings.length}
              </span>{' '}
              of{' '}
              <span className="font-mono font-bold">
                {activeTab === 'upcoming'
                  ? totalUpcomingCount
                  : totalCancelledCount}
              </span>{' '}
              outings
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className="flex items-center gap-1 text-accent font-semibold hover:underline cursor-pointer"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            <span>Clear filter</span>
          </button>
        </div>
      )}

      {/* Escrow Protection & Cancellation Policy Bar */}
      <div className="px-4 py-2.5 rounded-xl bg-card border border-border/80 flex items-center justify-between gap-3 text-xs text-muted-foreground shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>All bookings are held safely under 100% Escrow Protection. Funds are released only after meetup completion.</span>
        </div>
        <Link to="/cancellation-policy" className="text-accent underline font-medium hover:text-accent-hover shrink-0">
          Cancellation Policy
        </Link>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 bg-muted rounded-md" />
                <div className="w-20 h-5 bg-muted rounded-full" />
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <div className="w-32 h-5 bg-muted rounded" />
                  <div className="w-24 h-3.5 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2 py-3 border-y border-border/60">
                <div className="w-32 h-3.5 bg-muted rounded" />
                <div className="w-40 h-3.5 bg-muted rounded" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="w-16 h-5 bg-muted rounded" />
                <div className="w-24 h-8 bg-muted rounded-xl" />
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
                <div className="py-16 text-center rounded-3xl bg-card border border-border p-8 sm:p-12 max-w-lg mx-auto shadow-xs space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
                    <CalendarDaysIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-serif">
                      {statusFilter !== 'all' ? 'No Bookings Match Filter' : 'No Upcoming Bookings'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {statusFilter !== 'all'
                        ? `There are no outings currently in "${statusFilter}" status.`
                        : 'You do not have any pending or confirmed companion sessions right now. Browse our verified companions to schedule an outing.'}
                    </p>
                  </div>
                  {statusFilter !== 'all' ? (
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs hover:bg-accent-hover transition-colors cursor-pointer"
                    >
                      <span>Show All Active Statuses</span>
                    </button>
                  ) : (
                    <Link
                      to="/discovery"
                      className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs hover:bg-accent-hover transition-colors"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      <span>Explore Companions</span>
                    </Link>
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
                      onComplete={handleComplete}
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
                <div className="py-16 text-center rounded-3xl bg-card border border-border p-8 sm:p-12 space-y-4 max-w-lg mx-auto shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircleIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-serif">No Completed Outings Yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {roleMode === 'companion'
                        ? 'Successfully fulfilled client outings, payment disbursements, and ratings will appear here.'
                        : 'Your safely concluded meetups, review ratings, and escrow release receipts will appear here once an outing finishes.'}
                    </p>
                  </div>
                  {roleMode === 'client' && (
                    <Link
                      to="/discovery"
                      className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs hover:bg-accent-hover transition-colors"
                    >
                      <span>Explore Verified Companions</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </Link>
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
                <div className="py-16 text-center rounded-3xl bg-card border border-border p-8 sm:p-12 space-y-4 max-w-lg mx-auto shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                    <ShieldCheckIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-serif">
                      {statusFilter !== 'all' ? 'No Bookings Match Filter' : 'No Cancelled or Disputed Outings'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {statusFilter !== 'all'
                        ? `There are no outings matching status "${statusFilter}".`
                        : 'All your bookings remain active or completed smoothly. If any cancellation or dispute ever occurs, our 100% Escrow Guarantee ensures instant, transparent refunds.'}
                    </p>
                  </div>
                  {statusFilter !== 'all' ? (
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs hover:bg-accent-hover transition-colors cursor-pointer"
                    >
                      <span>Show All Inactive Statuses</span>
                    </button>
                  ) : (
                    <Link
                      to="/cancellation-policy"
                      className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl border border-border text-foreground hover:bg-muted font-semibold text-xs shadow-xs transition-colors"
                    >
                      <span>Read Escrow & Cancellation Policy</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </Link>
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
            <div className="bg-card rounded-3xl border border-border p-5 sm:p-7 shadow-xs space-y-6">
              {/* Calendar Month Navigation Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-border hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Previous month"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground min-w-[200px]">
                    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-border hover:bg-muted text-foreground flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Next month"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>Active</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      <span>Pending</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C5A059] inline-block" />
                      <span>Completed</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      <span>Cancelled</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleJumpToToday}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Weekday Column Headers */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 text-center">
                {WEEKDAY_NAMES.map((name) => (
                  <div
                    key={name}
                    className="py-1 text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground"
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
                      className={`min-h-[64px] sm:min-h-[76px] p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-w-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        cell.isSelected
                          ? 'border-accent bg-accent/15 text-foreground ring-2 ring-accent shadow-xs'
                          : cell.isCurrentMonth
                          ? 'border-border bg-background hover:border-accent/40 text-foreground'
                          : 'border-border/40 bg-muted/20 text-muted-foreground/60 hover:opacity-80'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`text-xs font-mono tabular-nums leading-none ${
                            cell.isToday
                              ? 'w-6 h-6 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center'
                              : cell.isSelected
                              ? 'font-bold text-foreground'
                              : cell.isCurrentMonth
                              ? 'font-medium text-foreground'
                              : 'text-muted-foreground/60'
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                        {cell.bookings.length > 0 && (
                          <span className="text-[10px] font-mono font-bold text-muted-foreground leading-none">
                            {cell.bookings.length}
                          </span>
                        )}
                      </div>

                      {/* Status Dots */}
                      <div className="h-3 flex items-center justify-center gap-1 w-full overflow-hidden">
                        {cell.bookings.slice(0, 3).map((b, idx) => {
                          let dotColor = 'bg-accent';
                          if (b.status === 'Confirmed' || b.status === 'InProgress') dotColor = 'bg-emerald-500';
                          else if (b.status === 'PendingPayment') dotColor = 'bg-amber-500';
                          else if (b.status === 'Completed') dotColor = 'bg-[#C5A059]';
                          else if (b.status === 'Cancelled' || b.status === 'Disputed') dotColor = 'bg-rose-500';

                          return (
                            <span
                              key={`${b.orderId}-${idx}`}
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`}
                              title={`${b.providerName || 'Session'}: ${b.status}`}
                            />
                          );
                        })}
                        {cell.bookings.length > 3 && (
                          <span className="text-[9px] font-mono font-bold text-muted-foreground leading-none">
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
                  <h3 className="text-base sm:text-lg font-bold font-serif text-foreground">
                    Outings on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {selectedDayBookings.length} {selectedDayBookings.length === 1 ? 'outing' : 'outings'} scheduled
                  </span>
                </div>

                {selectedDayBookings.length === 0 ? (
                  <div className="py-10 text-center rounded-2xl bg-muted/30 border border-border/70 p-6">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      No sessions scheduled for this date.
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Click any highlighted date above to view its scheduled companion meetups.
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
                        onComplete={handleComplete}
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

      {/* Pop-up Data View: Companion Profile Modal */}
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
          clientName={checkInBooking.providerName || 'Client'}
          meetingAddress={checkInBooking.meetingAddress}
          onSuccess={() => {
            refetchProviderBookings();
            refetchSeekerBookings();
          }}
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
