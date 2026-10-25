import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  useGetProviderIncomingBookingsQuery,
  useGetSeekerOutgoingBookingsQuery,
  useGetMyProfileQuery,
  useCancelBookingMutation,
} from '../store/bookingApi';
import { useListProvidersQuery } from '../store/discoveryApi';
import { BookingCard, type BookingSummary } from '../components/BookingCard';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
import { CheckInModal } from '../components/CheckInModal';
import { OutingSosModal } from '../components/OutingSosModal';
import { ProviderProfileModal } from '../components/booking/ProviderProfileModal';
import { useCompleteBookingMutation } from '../store/bookingApi';
import { SelectDropdown, type DropdownOption } from '../components/ui/Dropdown';
import { setSpecialties } from '../store/slices/profileSlice';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ClockIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';

const DEMO_BOOKINGS: BookingSummary[] = [
  {
    orderId: 'c8f921ab-3e2a',
    providerId: 'sample-1',
    seekerId: 'user-self',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 + 7200000).toISOString(),
    status: 'Confirmed',
    totalAmount: 3000,
    providerName: 'Elena Rostova',
    providerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    averageRating: 4.98,
    specialty: 'Tennis & Art Gallery',
    isVerified: true,
    meetingAddress: 'Central Tennis Club, Court 4',
    activity: 'Tennis Coaching',
  },
  {
    orderId: 'a12b45cd-7f89',
    providerId: 'sample-2',
    seekerId: 'user-self',
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 172800000 + 7200000).toISOString(),
    status: 'Completed',
    totalAmount: 3600,
    providerName: 'Marcus Vance',
    providerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    averageRating: 4.95,
    specialty: 'Photography & Culinary',
    isVerified: true,
    meetingAddress: 'Little Italy Market Stroll',
    activity: 'Street Food Crawl',
  },
];

const SORT_BOOKING_OPTIONS: DropdownOption[] = [
  { value: 'date-asc', label: 'Soonest First' },
  { value: 'date-desc', label: 'Latest First' },
  { value: 'price-desc', label: 'Highest Amount' },
];

const STATUS_FILTER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Confirmed', label: 'Confirmed', description: 'Active & ready' },
  { value: 'PendingPayment', label: 'Pending Escrow', description: 'Awaiting payment' },
  { value: 'InProgress', label: 'In Progress', description: 'Active right now' },
  { value: 'Completed', label: 'Completed', description: 'Finished sessions' },
  { value: 'Cancelled', label: 'Cancelled', description: 'Terminated sessions' },
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
  const { data: liveProviders } = useListProvidersQuery({});

  const [cancelBooking] = useCancelBookingMutation();

  // Tab & display state
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'calendar'>('upcoming');
  const [calendarView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingSort, setBookingSort] = useState('date-asc');
  const [checkoutBooking, setCheckoutBooking] = useState<BookingSummary | null>(null);
  const [completeBooking] = useCompleteBookingMutation();
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
        refetchProviderBookings();
        refetchSeekerBookings();
      } catch (err: any) {
        alert(err?.data?.error || 'Failed to complete session');
      }
    }
  };

  const handleOpenSos = (b: BookingSummary) => {
    setSosBooking(b);
  };

  // Initialize specialties
  useEffect(() => {
    if (profileData?.profile?.specialties) {
      dispatch(setSpecialties(profileData.profile.specialties));
    }
  }, [profileData, dispatch]);

  const [roleMode, setRoleMode] = useState<'client' | 'companion'>('client');
  const companionStatus = profileData?.profile?.status;

  // Use live data if fetched; fallback to showcase demo bookings only before initial fetch
  const bookings: BookingSummary[] = useMemo(() => {
    if (roleMode === 'companion') {
      if (!isLoadingProvider && providerBookingsData !== undefined) {
        return providerBookingsData?.bookings || [];
      }
      return [];
    } else {
      if (!isLoadingSeeker && seekerBookingsData !== undefined) {
        return seekerBookingsData?.bookings || [];
      }
      return DEMO_BOOKINGS;
    }
  }, [providerBookingsData, seekerBookingsData, roleMode, isLoadingProvider, isLoadingSeeker]);

  const isLoading = roleMode === 'companion' ? isLoadingProvider : isLoadingSeeker;

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
      {/* Unified Dual-Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/80 max-w-md w-full">
          <button
            type="button"
            onClick={() => setRoleMode('client')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              roleMode === 'client'
                ? 'bg-card text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>My Bookings (Client)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-mono">
              {seekerBookingsData?.bookings?.length ?? DEMO_BOOKINGS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleMode('companion')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              roleMode === 'companion'
                ? 'bg-card text-foreground shadow-sm border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5 text-accent" />
            <span>Incoming Requests</span>
            {providerBookingsData?.bookings?.length ? (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
                {providerBookingsData.bookings.length}
              </span>
            ) : null}
          </button>
        </div>

        <Link
          to="/discovery"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-transform hover:scale-[1.02]"
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
                : 'Complete your companion application with hourly rates, specialties, and KYC to receive incoming bookings.'}
            </p>
          </div>
          <Link
            to="/apply-companion"
            className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs shadow-xs shrink-0"
          >
            {companionStatus === 'PendingReview' ? 'View Review Status' : 'Apply to Become Companion'}
          </Link>
        </div>
      )}

      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            {roleMode === 'companion' ? 'Incoming Client Requests' : 'My Experience Bookings'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {roleMode === 'companion'
              ? 'Review booking requests from clients, accept sessions, and monitor pending earnings.'
              : 'Track active appointments, manage escrow payments, and coordinate with companions.'}
          </p>
        </div>
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
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                <div className="w-13 h-13 rounded-xl bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="w-28 h-4 bg-muted rounded" />
                  <div className="w-20 h-3 bg-muted rounded" />
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
                      roleMode={roleMode}
                      liveProviders={liveProviders}
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

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {pastBookings.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-card border border-border p-8 sm:p-12 space-y-4 max-w-lg mx-auto shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                    <ClockIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">No Past Outings Yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {roleMode === 'companion'
                        ? 'Completed client sessions and settled escrow payout receipts will be archived here.'
                        : 'Your completed companion experiences and escrow receipts will appear here after sessions conclude.'}
                    </p>
                  </div>
                  {roleMode === 'client' && (
                    <Link
                      to="/discovery"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs hover:bg-accent-hover transition-colors"
                    >
                      <span>Explore Verified Companions</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastBookings.map((b) => (
                    <BookingCard
                      key={b.orderId}
                      booking={b}
                      roleMode={roleMode}
                      liveProviders={liveProviders}
                      onOpenSos={handleOpenSos}
                      onViewProfile={(id) => setPreviewProviderId(id)}
                    />
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
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[90px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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
                          roleMode={roleMode}
                          liveProviders={liveProviders}
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
    </div>
  );
};

export default Bookings;
