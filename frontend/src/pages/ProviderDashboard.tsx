import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetProviderIncomingBookingsQuery, useAddServiceSpecialtyMutation, useRemoveServiceSpecialtyMutation, useGetMyProfileQuery } from '../store/bookingApi';
import { ServiceManagement } from '../components/ServiceManagement';
import { BookingCard } from '../components/BookingCard';
import { setSpecialties } from '../store/slices/profileSlice';

const ProviderDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem('userId') || '';
  const { specialties } = useSelector((state: any) => state.profile || { specialties: [] });

  // Fetch provider profile and bookings
  const { data: profileData, isLoading: profileLoading } = useGetMyProfileQuery();
  const { data: providerBookingsData, isLoading: isLoadingBookings } = useGetProviderIncomingBookingsQuery(
    userId
  );

  // Service management mutations
  const [addService] = useAddServiceSpecialtyMutation();
  const [removeService] = useRemoveServiceSpecialtyMutation();

  // Initialize specialties from profile data
  useEffect(() => {
    if (profileData?.profile?.specialties) {
      dispatch(setSpecialties(profileData.profile.specialties));
    }
  }, [profileData, dispatch]);

  const providerBookings = providerBookingsData?.bookings || [];

  const handleAddService = async (specialty: string) => {
    try {
      const result = await addService({ specialty }).unwrap();
      dispatch(setSpecialties(result.specialties));
    } catch {
      // Error already handled by RTK Query
    }
  };

  const handleRemoveService = async (specialty: string) => {
    try {
      const result = await removeService({ specialty }).unwrap();
      dispatch(setSpecialties(result.specialties));
    } catch {
      // Error already handled by RTK Query
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="text-lg" style={{ color: '#746B66' }}>Loading...</div>
      </div>
    );
  }

  const isProvider = profileData?.profile !== undefined;

  if (!isProvider) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
        <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
          <div className="max-w-6xl mx-auto py-6 px-6">
            <h1 className="text-3xl font-semibold" style={{ color: '#1A1614' }}>Provider Dashboard</h1>
          </div>
        </header>
        <main className="py-12">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p style={{ color: '#746B66' }}>Create your provider profile first.</p>
            <Link to="/profile" className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#C65D28', color: '#FFFFFF' }}>
              Create Profile
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-6xl mx-auto py-6 px-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold" style={{ color: '#1A1614' }}>Provider Dashboard</h1>
          <Link to="/profile" className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#C65D28', color: '#FFFFFF' }}>
            Profile Settings
          </Link>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
            <div className="p-8 space-y-8">
              {/* Service Management */}
              <section>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#1A1614' }}>Manage Your Services</h2>
                <ServiceManagement
                  specialties={specialties}
                  onAddService={handleAddService}
                  onRemoveService={handleRemoveService}
                />
              </section>

              {/* Stats */}
              <section className="grid gap-6 sm:grid-cols-3">
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#FEF3EE' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#C65D28' }}>Upcoming this week</h3>
                  <p className="text-3xl font-semibold" style={{ color: '#1A1614' }}>
                    {providerBookings.filter(b => new Date(b.startTime) > new Date()).length}
                  </p>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F0F9F1' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#378742' }}>Active Services</h3>
                  <p className="text-3xl font-semibold" style={{ color: '#1A1614' }}>{specialties.length}</p>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: '#E8F4F8' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#2B8CB8' }}>Avg. Response Time</h3>
                  <p className="text-3xl font-semibold" style={{ color: '#1A1614' }}>2h</p>
                </div>
              </section>

              {/* Incoming Bookings */}
              <section>
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#1A1614' }}>
                  Incoming Bookings {providerBookings.length > 0 && `(${providerBookings.length})`}
                </h2>
                {isLoadingBookings ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full border-4 border-opacity-20 border-t-current h-8 w-8" style={{ borderColor: '#C65D28', borderTopColor: '#1A1614' }}></div>
                    <span className="ml-3 text-sm" style={{ color: '#746B66' }}>Loading bookings...</span>
                  </div>
                ) : providerBookings.length === 0 ? (
                  <div className="min-h-[200px] flex flex-col items-center justify-center py-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 mb-4">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#746B66' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-2" style={{ color: '#1A1614' }}>No incoming bookings yet</p>
                    <p className="text-sm max-w-md text-center" style={{ color: '#746B66' }}>
                      Your services are live! Seekers will book you and their requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {providerBookings.map((booking: any) => (
                      <BookingCard
                        key={booking.orderId}
                        booking={booking}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;