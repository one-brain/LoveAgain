import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '@fluentui/react-components';
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
      <Card className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-subtitle1 font-semibold text-foreground mb-4">
          Manage your services
        </h2>
        <ServiceManagement
          specialties={specialties}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
        />
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-caption1 text-muted-foreground mb-1">Active services</p>
          <p className="text-title2 font-semibold text-foreground tabular">{specialties.length}</p>
        </Card>
        <Card className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-caption1 text-muted-foreground mb-1">Upcoming this week</p>
          <p className="text-title2 font-semibold text-foreground tabular">
            {bookings.filter((b: any) => new Date(b.startTime) > new Date()).length}
          </p>
        </Card>
        <Card className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-caption1 text-muted-foreground mb-1">Average rating</p>
          <p className="text-title2 font-semibold text-foreground tabular">4.95</p>
        </Card>
        <Card className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-caption1 text-muted-foreground mb-1">Response time</p>
          <p className="text-title2 font-semibold text-foreground tabular">&lt; 15m</p>
        </Card>
      </section>

      <section>
        <h2 className="text-subtitle1 font-semibold text-foreground mb-4">Recent orders</h2>
        {bookings.length === 0 ? (
          <Card className="text-center py-8 bg-card rounded-2xl border border-border shadow-sm">
            <p className="text-body1 text-muted-foreground">No bookings yet.</p>
          </Card>
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
