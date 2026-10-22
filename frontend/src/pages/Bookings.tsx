import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  useGetProviderIncomingBookingsQuery,
  useGetSeekerOutgoingBookingsQuery,
  useGetMyProfileQuery,
  useCancelBookingMutation,
} from '../store/bookingApi';
import { BookingCard, type BookingSummary } from '../components/BookingCard';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
import { SelectDropdown, type DropdownOption } from '../components/ui/Dropdown';
import { setSpecialties } from '../store/slices/profileSlice';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const DEMO_BOOKINGS: BookingSummary[] = [
  {
    orderId: 'c8f921ab-3e2a',
    providerId: 'sample-1',
    seekerId: 'user-self',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
    status: 'Confirmed',
    totalAmount: 90,
    providerName: 'Elena Rostova',
    meetingAddress: 'Central Tennis Club, Court 4',
  },
  {
    orderId: 'a12b45cd-7f89',
    providerId: 'sample-2',
    seekerId: 'user-self',
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 172800000 + 7200000).toISOString(),
    status: 'Completed',
    totalAmount: 110,
    providerName: 'Marcus Vance',
    meetingAddress: 'Little Italy Market Stroll',
  },
];

const SORT_BOOKING_OPTIONS: DropdownOption[] = [
  { value: 'date-asc', label: 'Soonest First', icon: '📅' },
  { value: 'date-desc', label: 'Latest First', icon: '🗓️' },
  { value: 'price-desc', label: 'Highest Amount', icon: '💰' },
];

const STATUS_FILTER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All Statuses', icon: '📋' },
  { value: 'Confirmed', label: 'Confirmed', icon: '🟢', description: 'Active & ready' },
  { value: 'PendingPayment', label: 'Pending Escrow', icon: '⏳', description: 'Awaiting payment' },
  { value: 'InProgress', label: 'In Progress', icon: '⚡', description: 'Active right now' },
  { value: 'Completed', label: 'Completed', icon: '✓', description: 'Finished sessions' },
  { value: 'Cancelled', label: 'Cancelled', icon: '✕', description: 'Terminated sessions' },
];

function sortAndFilterBookings(
  list: BookingSummary[],
  allowedStatuses: string[],
  statusFilter: string,
  sortOrder: string,
  defaultDirection: 'asc' | 'desc'
): BookingSummary[] {
  let filtered = list.filter((b) => allowedStatuses.includes(b.status));
  if (statusFilter !== 'all') {
    filtered = filtered.filter((b) => b.status === statusFilter);
  }
  return [...filtered].sort((a, b) => {
    if (sortOrder === 'price-desc') return (b.totalAmount || 0) - (a.totalAmount || 0);
    const timeA = new Date(a.startTime).getTime();
    const timeB = new Date(b.startTime).getTime();
    const isDesc =
      sortOrder === 'date-desc' || (sortOrder !== 'date-asc' && defaultDirection === 'desc');
    return isDesc ? timeB - timeA : timeA - timeB;
  });
}

const Bookings: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  // Fetch profile to determine user type
  const { data: profileData, isSuccess: isProfileSuccess } = useGetMyProfileQuery(undefined, { skip: !user });
  const isProvider = isProfileSuccess && profileData?.profile !== undefined;

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

  const [cancelBooking] = useCancelBookingMutation();

  // Tab & display state
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'calendar'>('upcoming');
  const [calendarView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingSort, setBookingSort] = useState('date-asc');
  const [checkoutBooking, setCheckoutBooking] = useState<BookingSummary | null>(null);

  // Initialize specialties
  useEffect(() => {
    if (profileData?.profile?.specialties) {
      dispatch(setSpecialties(profileData.profile.specialties));
    }
  }, [profileData, dispatch]);

  // Use live data if fetched; fallback to showcase demo bookings only before initial fetch
  const bookings: BookingSummary[] = useMemo(() => {
    const hasFetched = isProvider
      ? (!isLoadingProvider && providerBookingsData !== undefined)
      : (!isLoadingSeeker && seekerBookingsData !== undefined);

    const list = isProvider
      ? (providerBookingsData?.bookings || [])
      : (seekerBookingsData?.bookings || []);

    if (hasFetched) return list;
    return DEMO_BOOKINGS;
  }, [providerBookingsData, seekerBookingsData, isProvider, isLoadingProvider, isLoadingSeeker]);

  const isLoading = isProvider ? isLoadingProvider : isLoadingSeeker;

  // Segregate, filter and sort bookings
  const upcomingBookings = useMemo(
    () =>
      sortAndFilterBookings(
        bookings,
        ['PendingPayment', 'Confirmed', 'InProgress'],
        statusFilter,
        bookingSort,
        'asc'
      ),
    [bookings, statusFilter, bookingSort]
  );

  const pastBookings = useMemo(
    () =>
      sortAndFilterBookings(
        bookings,
        ['Completed', 'Cancelled', 'Disputed'],
        statusFilter,
        bookingSort,
        'desc'
      ),
    [bookings, statusFilter, bookingSort]
  );

  const handleCancel = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? Escrow funds will be refunded according to cancellation policy.')) {
      try {
        await cancelBooking({ orderId, reason: 'Seeker requested cancellation' }).unwrap();
      } catch (err) {
        console.warn('Cancel API warning:', err);
      }
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    const startDate = new Date(selectedDate);
    const dayOfWeek = startDate.getDay();
    const sunday = new Date(startDate);
    sunday.setDate(startDate.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

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
            className="inline-block w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-xs hover:bg-accent-hover transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
            {isProvider ? 'Provider Hub' : 'Member Hub'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            {isProvider ? 'Incoming Bookings' : 'My Experience Bookings'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your companion schedule, monitor escrow releases, and join real-time chats.
          </p>
        </div>

        <Link
          to="/discovery"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-transform hover:scale-[1.02]"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Find New Companion</span>
        </Link>
      </div>

      {/* Tabs and Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        {/* Tabs Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>Upcoming & Active</span>
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-card/30 font-bold">
              {upcomingBookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <span>History & Completed</span>
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-card/30 font-bold">
              {pastBookings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4" />
            <span>Schedule View</span>
          </button>
        </div>

        {/* Dropdowns Filter & Sort */}
        {activeTab !== 'calendar' && (
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <SelectDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={STATUS_FILTER_OPTIONS}
              size="sm"
              className="w-full sm:w-44"
            />
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

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Retrieving booking status...</p>
        </div>
      ) : (
        <>
          {/* Upcoming Tab */}
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              {upcomingBookings.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-card border border-border p-12">
                  <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                    <CalendarDaysIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">No upcoming bookings</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                    You do not have any pending or confirmed companion sessions right now.
                  </p>
                  <Link
                    to="/discovery"
                    className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs"
                  >
                    Explore Companions
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingBookings.map((b) => (
                    <BookingCard
                      key={b.orderId}
                      booking={b}
                      onCancel={handleCancel}
                      onPay={(bkg) => setCheckoutBooking(bkg)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {pastBookings.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-card border border-border p-12">
                  <p className="text-sm text-muted-foreground">No completed bookings yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastBookings.map((b) => (
                    <BookingCard key={b.orderId} booking={b} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {activeTab === 'calendar' && (
            <div className="bg-card rounded-3xl border border-border p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-foreground"
                    aria-label="Previous date"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-bold font-serif text-foreground">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => navigateDate('next')}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-foreground"
                    aria-label="Next date"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* 7 Days Strip */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {calendarDays.map((day) => {
                  const isSelected = day.toDateString() === selectedDate.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();
                  const dayBookings = bookings.filter(
                    (b) => new Date(b.startTime).toDateString() === day.toDateString()
                  );

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[90px] ${
                        isSelected
                          ? 'border-accent bg-accent/15 text-foreground ring-1 ring-accent'
                          : 'border-border bg-background hover:border-accent/40 text-foreground'
                      }`}
                    >
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span
                        className={`text-lg font-bold my-1 ${
                          isToday ? 'text-accent' : 'text-foreground'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      <div className="h-4 flex items-center justify-center">
                        {dayBookings.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-accent" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day's Schedule List */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-bold text-foreground mb-4">
                  Schedule for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>

                {bookings.filter((b) => new Date(b.startTime).toDateString() === selectedDate.toDateString()).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    No sessions scheduled for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings
                      .filter((b) => new Date(b.startTime).toDateString() === selectedDate.toDateString())
                      .map((b) => (
                        <BookingCard
                          key={b.orderId}
                          booking={b}
                          onCancel={handleCancel}
                          onPay={(bkg) => setCheckoutBooking(bkg)}
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
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
    </div>
  );
};

export default Bookings;
