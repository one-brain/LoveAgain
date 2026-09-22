import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetProviderIncomingBookingsQuery, useGetSeekerOutgoingBookingsQuery, useGetMyProfileQuery } from '../store/bookingApi';
import { BookingCard } from '../components/BookingCard';
import { setSpecialties } from '../store/slices/profileSlice';

const Bookings: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  // Fetch profile to determine user type
  const { data: profileData, isSuccess: isProfileSuccess } = useGetMyProfileQuery(undefined, { skip: !user });
  const isProvider = isProfileSuccess && profileData?.profile !== undefined;

  // Fetch data based on user role
  const { data: providerBookingsData, isLoading: isLoadingProvider } = useGetProviderIncomingBookingsQuery(
    user?.id || ''
  );
  const { data: seekerBookingsData, isLoading: isLoadingSeeker } = useGetSeekerOutgoingBookingsQuery(
    user?.id || ''
  );

  // Initialize specialties from profile data
  useEffect(() => {
    if (profileData?.profile?.specialties) {
      dispatch(setSpecialties(profileData.profile.specialties));
    }
  }, [profileData, dispatch]);

  // Calendar state
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: '#746B66' }}>Please log in to view your bookings</p>
          <Link to="/login" className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#C65D28', color: '#FFFFFF' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const bookings = isProvider ? (providerBookingsData?.bookings || []) : (seekerBookingsData?.bookings || []);
  const isLoading = isProvider ? isLoadingProvider : isLoadingSeeker;

  // Helper function to check if a booking is in selected range
  const isInSelectedRange = (bookingStart: string, range: 'day' | 'week' | 'month'): boolean => {
    const bookingDate = new Date(bookingStart);
    const selected = new Date(selectedDate);

    switch (range) {
      case 'day':
        return bookingDate.toDateString() === selected.toDateString();
      case 'week': {
        const startOfWeek = new Date(selected);
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(selected.getDate() - selected.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
      }
      case 'month':
        return bookingDate.getMonth() === selected.getMonth() && bookingDate.getFullYear() === selected.getFullYear();
      default:
        return false;
    }
  };

  // Filter bookings based on selected range
  const activeBookings = bookings.filter(booking => {
    const isInRange = isInSelectedRange(booking.startTime, view);
    const isActiveStatus = ['PendingPayment', 'Confirmed', 'InProgress'].includes(booking.status);
    return isInRange && isActiveStatus;
  });

  const historicBookings = bookings.filter(booking => {
    const isInRange = isInSelectedRange(booking.startTime, view);
    const isHistoricStatus = ['Completed', 'Cancelled', 'Disputed'].includes(booking.status);
    return isHistoricStatus || !isInRange;
  });

  // Calendar navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    switch (view) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    setSelectedDate(newDate);
  };

  // Generate calendar days for display
  const generateCalendarDays = () => {
    const days = [];
    const startDate = new Date(selectedDate);

    switch (view) {
      case 'day':
        days.push(new Date(startDate));
        break;
      case 'week': {
        const dayOfWeek = startDate.getDay();
        const sunday = new Date(startDate);
        sunday.setDate(startDate.getDate() - dayOfWeek);

        for (let i = 0; i < 7; i++) {
          const day = new Date(sunday);
          day.setDate(sunday.getDate() + i);
          days.push(day);
        }
        break;
      }
      case 'month': {
        const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        const startOffset = firstDay.getDay();

        // Add days from previous month to fill the first row
        for (let i = startOffset - 1; i >= 0; i--) {
          const day = new Date(startDate);
          day.setDate(firstDay.getDate() - i - 1);
          days.push(day);
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
          const day = new Date(startDate.getFullYear(), startDate.getMonth(), i);
          days.push(day);
        }

        // Fill remaining days to complete the grid
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
          const day = new Date(lastDay);
          day.setDate(lastDay.getDate() + i);
          days.push(day);
        }
        break;
      }
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-6xl mx-auto py-6 px-6">
          <h1 className="text-3xl font-semibold" style={{ color: '#1A1614' }}>
            {isProvider ? 'Incoming Bookings' : 'My Bookings'}
          </h1>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          {isLoading ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full border-4 border-opacity-20 border-t-current h-8 w-8" style={{ borderColor: '#C65D28', borderTopColor: '#1A1614' }}></div>
              <span className="ml-3 text-sm" style={{ color: '#746B66' }}>Loading...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#746B66' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2" style={{ color: '#1A1614' }}>
                {isProvider ? 'No incoming bookings yet' : 'No bookings found'}
              </p>
              <p className="text-sm max-w-md text-center" style={{ color: '#746B66' }}>
                {isProvider
                  ? 'Your services are live! Seekers will book you and their requests will appear here.'
                  : 'Start browsing services to make your first booking.'}
              </p>
              {isProvider && (
                <Link to="/profile" className="mt-6 inline-block rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#C65D28', color: '#FFFFFF' }}>
                  Manage Your Services
                </Link>
              )}
              {!isProvider && (
                <Link to="/discovery" className="mt-6 inline-block rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#C65D28', color: '#FFFFFF' }}>
                  Browse Services
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Calendar Navigation */}
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <h2 className="text-lg font-semibold" style={{ color: '#1A1614' }}>
                    {view === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    {view === 'week' && `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                    {view === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setView('day')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'day' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => setView('week')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setView('month')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                    >
                      Month
                    </button>
                  </div>

                  <button
                    onClick={() => navigateDate('next')}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Days Display */}
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs font-medium text-center py-2" style={{ color: '#746B66' }}>{day}</div>
                  ))}
                  {calendarDays.map((day, index) => {
                    const hasBookings = bookings.some(booking => new Date(booking.startTime).toDateString() === day.toDateString());
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    const isCurrentMonth = day.getMonth() === selectedDate.getMonth() && day.getFullYear() === selectedDate.getFullYear();

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`p-2 text-sm rounded-lg transition-all ${isSelected ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-gray-100'} ${!isCurrentMonth ? 'text-gray-400' : ''}`}
                      >
                        {day.getDate()}
                        {hasBookings && (
                          <div className="w-1 h-1 bg-current mx-auto mt-1 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active/Upcoming Bookings Section */}
              {activeBookings.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A1614' }}>
                    Active / Upcoming Bookings
                  </h2>
                  <div className="space-y-4">
                    {activeBookings.map((booking: any) => (
                      <BookingCard
                        key={booking.orderId}
                        booking={booking}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Historic / Completed Bookings Section */}
              {historicBookings.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A1614' }}>
                    Historic / Completed Bookings
                  </h2>
                  <div className="space-y-4">
                    {historicBookings.map((booking: any) => (
                      <BookingCard
                        key={booking.orderId}
                        booking={booking}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="border-t" style={{ borderColor: '#E7E3E0' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm" style={{ color: '#746B66' }}>
          © 2025 Cue - Companion Booking Platform
        </div>
      </footer>
    </div>
  );
};

export default Bookings;
