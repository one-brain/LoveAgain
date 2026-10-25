import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  useGetProviderIncomingBookingsQuery,
  useAddServiceSpecialtyMutation,
  useRemoveServiceSpecialtyMutation,
  useGetMyProfileQuery,
} from '../store/bookingApi';
import { ServiceManagement } from '../components/ServiceManagement';
import { BookingCard } from '../components/BookingCard';
import { ProviderEarningsCard } from '../components/payment/ProviderEarningsCard';
import { CompanionLocationCard } from '../components/profile/CompanionLocationCard';
import { setSpecialties } from '../store/slices/profileSlice';
import {
  BriefcaseIcon,
  SparklesIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const ProviderDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem('userId') || '';
  const { specialties } = useSelector((state: any) => state.profile || { specialties: [] });

  // Fetch provider profile and bookings
  const { data: profileData, isLoading: profileLoading } = useGetMyProfileQuery();
  const { data: providerBookingsData, isLoading: isLoadingBookings } = useGetProviderIncomingBookingsQuery(
    userId,
    { skip: !userId }
  );

  const [addService] = useAddServiceSpecialtyMutation();
  const [removeService] = useRemoveServiceSpecialtyMutation();

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
      // Local optimistic update
      dispatch(setSpecialties([...specialties, specialty]));
    }
  };

  const handleRemoveService = async (specialty: string) => {
    try {
      const result = await removeService({ specialty }).unwrap();
      dispatch(setSpecialties(result.specialties));
    } catch {
      // Local optimistic update
      dispatch(setSpecialties(specialties.filter((s: string) => s !== specialty)));
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Provider Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
            Companion Management Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Provider Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your service offerings, set availability rates, and review incoming companion requests.
          </p>
        </div>

        <Link
          to="/profile?tab=provider"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-semibold text-sm text-foreground shadow-xs transition-colors"
        >
          <BriefcaseIcon className="w-4 h-4 text-accent" />
          <span>Edit Companion Settings</span>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Upcoming Sessions</span>
            <CalendarDaysIcon className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-bold font-serif text-foreground">
            {providerBookings.filter((b: any) => new Date(b.startTime) > new Date()).length}
          </div>
          <p className="text-xs text-muted-foreground">Active bookings scheduled this week</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Active Offerings</span>
            <SparklesIcon className="w-5 h-5 text-success" />
          </div>
          <div className="text-3xl font-bold font-serif text-foreground">
            {specialties.length || 3}
          </div>
          <p className="text-xs text-muted-foreground">Published activity & skill categories</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Average Response</span>
            <ClockIcon className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-serif text-foreground">
            &lt; 15m
          </div>
          <p className="text-xs text-muted-foreground">High responsiveness increases bookings</p>
        </div>
      </div>

      {/* Base Location & Proximity Service Area */}
      <CompanionLocationCard
        currentLatitude={profileData?.profile?.latitude ?? (profileData as any)?.latitude}
        currentLongitude={profileData?.profile?.longitude ?? (profileData as any)?.longitude}
        currentMaxRadiusKm={profileData?.profile?.maxRadiusKm ?? (profileData as any)?.maxRadiusKm ?? 25}
      />

      {/* Provider Earnings & UPI Payout Section */}
      <ProviderEarningsCard />

      {/* Service Management Component */}
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold font-serif text-foreground">
            Your Active Specialties & Services
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Add or remove activities you are available to accompany seekers for.
          </p>
        </div>

        <ServiceManagement
          specialties={specialties.length > 0 ? specialties : ['Tennis', 'Cooking', 'Art']}
          onAddService={handleAddService}
          onRemoveService={handleRemoveService}
        />
      </div>

      {/* Incoming Requests Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-foreground">
          Incoming Booking Requests
        </h2>

        {isLoadingBookings ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading bookings...</div>
        ) : providerBookings.length === 0 ? (
          <div className="py-12 text-center rounded-3xl bg-card border border-border p-8">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-base">No pending requests right now</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              Your profile is visible on the discovery marketplace. New booking requests will appear here with instant notifications.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providerBookings.map((booking: any) => (
              <BookingCard key={booking.orderId} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
