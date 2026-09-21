import React, { useEffect } from 'react';
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
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2" style={{ color: '#1A1614' }}>
                  {bookings.length} {isProvider ? 'Incoming' : 'Your'} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                </h2>
                <div className="text-sm" style={{ color: '#746B66' }}>
                  {isProvider
                    ? 'These are booking requests from seekers for your services.'
                    : 'These are the services you have booked from providers.'}
                </div>
              </div>

              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <BookingCard
                    key={booking.orderId}
                    booking={booking}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t" style={{ borderColor: '#E7E3E0' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm" style={{ color: '#746B66' }}>
          LoveAgain © {new Date().getFullYear()} • Connecting seekers with trusted providers
        </div>
      </footer>
    </div>
  );
};

export default Bookings;