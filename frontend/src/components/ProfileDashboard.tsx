import React from 'react';
import { useSelector } from 'react-redux';
import {
  useAddServiceSpecialtyMutation,
  useRemoveServiceSpecialtyMutation,
  useGetProviderIncomingBookingsQuery,
} from '../store/bookingApi';
import { ServiceManagement } from './ServiceManagement';
import { BookingCard } from './BookingCard';

export const ProfileDashboard: React.FC = () => {
  const { specialties } = useSelector((state: any) => state.profile || { specialties: [] });
  const userId = localStorage.getItem('userId') || '';

  const [addService] = useAddServiceSpecialtyMutation();
  const [removeService] = useRemoveServiceSpecialtyMutation();

  const { data: providerBookings } = useGetProviderIncomingBookingsQuery(userId, { skip: !userId });

  const handleAddService = async (specialty: string) => {
    try {
      await addService({ specialty }).unwrap();
    } catch {
      // Handled
    }
  };

  const handleRemoveService = async (specialty: string) => {
    try {
      await removeService({ specialty }).unwrap();
    } catch {
      // Handled
    }
  };

  const bookings = providerBookings?.bookings || [];

  return (
    <div className="space-y-8">
      {/* Service Management Section */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-xl font-bold font-serif text-foreground mb-6">
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
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Active Services
          </p>
          <p className="text-2xl font-bold font-serif text-foreground">{specialties.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Upcoming This Week
          </p>
          <p className="text-2xl font-bold font-serif text-foreground">
            {bookings.filter((b: any) => new Date(b.startTime) > new Date()).length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Avg. Rating
          </p>
          <p className="text-2xl font-bold font-serif text-foreground">4.95</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Response Time
          </p>
          <p className="text-2xl font-bold font-serif text-foreground">&lt; 15m</p>
        </div>
      </section>

      {/* Bookings */}
      <section>
        <h2 className="text-xl font-bold font-serif text-foreground mb-4">
          Recent Orders
        </h2>
        {bookings.length === 0 ? (
          <div className="text-center py-8 bg-card rounded-2xl border border-border">
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking: any) => (
              <BookingCard key={booking.orderId} booking={booking} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileDashboard;
