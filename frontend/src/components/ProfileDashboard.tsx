import React from 'react';
import { useSelector } from 'react-redux';
import { useAddServiceSpecialtyMutation, useRemoveServiceSpecialtyMutation, useGetProviderIncomingBookingsQuery } from '../store/bookingApi';
import { ServiceManagement } from './ServiceManagement';
import { BookingCard } from './BookingCard';

export const ProfileDashboard: React.FC = () => {
  const { specialties } = useSelector((state: any) => state.profile || { specialties: [] });
  const userId = localStorage.getItem('userId') || '';

  // Service management mutations
  const [addService] = useAddServiceSpecialtyMutation();
  const [removeService] = useRemoveServiceSpecialtyMutation();

  // Bookings
  const { data: providerBookings, isLoading: isLoadingBookings } = useGetProviderIncomingBookingsQuery(
    userId
  );

  // Handler functions for service management
  const handleAddService = async (specialty: string) => {
    try {
      await addService({ specialty }).unwrap();
    } catch {
      // Error handling - RTK Query already shows errors
    }
  };

  const handleRemoveService = async (specialty: string) => {
    try {
      await removeService({ specialty }).unwrap();
    } catch {
      // Error handling - RTK Query already shows errors
    }
  };

  const bookings = providerBookings?.bookings || [];

  return (
    <div className="space-y-8">
      {/* Service Management Section */}
      <section className="rounded-lg border bg-card p-6" style={{ borderColor: '#E7E3E0' }}>
        <h2 className="text-xl font-semibold text-primary mb-6" style={{ color: '#1A1614' }}>
          Manage Your Services
        </h2>
        <ServiceManagement
          specialties={specialties}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
        />
      </section>

      {/* Provider Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4" style={{ borderColor: '#E7E3E0' }}>
          <p className="text-xs font-medium text-muted-foreground mb-1" style={{ color: '#746B66' }}>
            Active Services
          </p>
          <p className="text-2xl font-bold text-primary" style={{ color: '#1A1614' }}>{specialties.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4" style={{ borderColor: '#E7E3E0' }}>
          <p className="text-xs font-medium text-muted-foreground mb-1" style={{ color: '#746B66' }}>
            Upcoming This Week
          </p>
          <p className="text-2xl font-bold text-primary" style={{ color: '#1A1614' }}>
            {bookings.filter(b => new Date(b.startTime) > new Date()).length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4" style={{ borderColor: '#E7E3E0' }}>
          <p className="text-xs font-medium text-muted-foreground mb-1" style={{ color: '#746B66' }}>
            Avg. Rating
          </p>
          <p className="text-2xl font-bold text-primary" style={{ color: '#1A1614' }}>
            4.8
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4" style={{ borderColor: '#E7E3E0' }}>
          <p className="text-xs font-medium text-muted-foreground mb-1" style={{ color: '#746B66' }}>
            Response Time
          </p>
          <p className="text-2xl font-bold text-primary" style={{ color: '#1A1614' }}>
            2h
          </p>
        </div>
      </section>

      {/* Recent Bookings */}
      <section>
        <h2 className="text-xl font-semibold text-primary mb-6" style={{ color: '#1A1614' }}>
          Incoming Bookings
        </h2>
        {isLoadingBookings ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full border-4 border-primary/20 border-t-primary h-8 w-8"></div>
            <span className="ml-3 text-sm text-muted-foreground">Loading bookings...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/50 mb-4">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-primary mb-2" style={{ color: '#1A1614' }}>
              No incoming bookings yet
            </p>
            <p className="text-sm text-muted-foreground max-w-md text-center">
              Your services are live! Seekers will book you and their requests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking: any) => (
              <BookingCard
                key={booking.orderId}
                booking={booking}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow" style={{ borderColor: '#E7E3E0' }}>
          <h3 className="text-sm font-semibold text-primary mb-2" style={{ color: '#1A1614' }}>Services</h3>
          <p className="text-xs text-muted-foreground">Manage your specialties and pricing</p>
        </div>
        <div className="rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow" style={{ borderColor: '#E7E3E0' }}>
          <h3 className="text-sm font-semibold text-primary mb-2" style={{ color: '#1A1614' }}>Schedule</h3>
          <p className="text-xs text-muted-foreground">View and manage your availability</p>
        </div>
        <div className="rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow" style={{ borderColor: '#E7E3E0' }}>
          <h3 className="text-sm font-semibold text-primary mb-2" style={{ color: '#1A1614' }}>Reviews</h3>
          <p className="text-xs text-muted-foreground">See what seekers are saying about you</p>
        </div>
        <div className="rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow" style={{ borderColor: '#E7E3E0' }}>
          <h3 className="text-sm font-semibold text-primary mb-2" style={{ color: '#1A1614' }}>Analytics</h3>
          <p className="text-xs text-muted-foreground">View performance metrics</p>
        </div>
      </section>
    </div>
  );
};

export default ProfileDashboard;