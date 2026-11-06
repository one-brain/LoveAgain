import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  useGetProviderIncomingBookingsQuery,
  useGetMyProfileQuery,
} from '../store/bookingApi';
import { ProviderEarningsCard } from '../components/payment/ProviderEarningsCard';
import { setSpecialties } from '../store/slices/profileSlice';
import { formatINR } from '../utils/currency';
import { Badge, Card, Spinner } from '@fluentui/react-components';
import {
  Briefcase20Regular,
  Sparkle20Regular,
  Calendar20Regular,
  MailInbox20Regular,
  ArrowRight16Regular,
  Location16Regular,
} from '@fluentui/react-icons';

const ACTIVE_STATUSES = ['PendingPayment', 'Confirmed', 'InProgress'];

const ProviderDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem('userId') || '';
  const { specialties } = useSelector((state: any) => state.profile || { specialties: [] });

  const { data: profileData, isLoading: profileLoading } = useGetMyProfileQuery();
  const { data: providerBookingsData, isLoading: isLoadingBookings } =
    useGetProviderIncomingBookingsQuery(userId, { skip: !userId });

  useEffect(() => {
    if (profileData?.profile?.specialties) {
      dispatch(setSpecialties(profileData.profile.specialties));
    }
  }, [profileData, dispatch]);

  const profile: any = profileData?.profile ?? profileData ?? {};
  const isApproved = profile?.status === 'Approved';
  const isVisible = profile?.isActive ?? true;
  const hourlyRate = Number(profile?.hourlyRate) || 0;
  const radiusKm = Number(profile?.maxRadiusKm) || 0;
  const hasLocation = profile?.latitude != null && profile?.longitude != null;

  const { pendingCount, upcomingCount, completedCount, nextSession } = useMemo(() => {
    const list: any[] = providerBookingsData?.bookings || [];
    const now = Date.now();
    const active = list.filter((b) => ACTIVE_STATUSES.includes(b.status));
    const upcoming = active
      .filter((b) => new Date(b.startTime).getTime() >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return {
      pendingCount: list.filter((b) => b.status === 'PendingPayment').length,
      upcomingCount: upcoming.length,
      completedCount: list.filter((b) => b.status === 'Completed').length,
      nextSession: upcoming[0],
    };
  }, [providerBookingsData]);

  if (profileLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner label="Loading guest hub..." />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Awaiting payment',
      value: pendingCount,
      hint: 'Requests hosts have not paid yet',
      icon: MailInbox20Regular,
      tone: 'text-warning',
    },
    {
      label: 'Upcoming sessions',
      value: upcomingCount,
      hint: 'Confirmed or in progress',
      icon: Calendar20Regular,
      tone: 'text-brand-fg',
    },
    {
      label: 'Completed outings',
      value: completedCount,
      hint: 'Lifetime finished outings',
      icon: Sparkle20Regular,
      tone: 'text-success',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-caption1 font-semibold text-brand-fg mb-1 block">
            Guest management hub
          </span>
          <h1 className="text-title2 font-semibold text-foreground">Guest dashboard</h1>
          <p className="text-body1 text-muted-foreground mt-1">
            Your guest performance and earnings at a glance.
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(({ label, value, hint, icon: Icon, tone }) => (
          <Card
            key={label}
            className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1.5"
          >
            <div className="flex items-center justify-between text-muted-foreground text-caption1 font-semibold">
              <span>{label}</span>
              <Icon className={tone} />
            </div>
            <div className="text-title2 font-semibold font-mono text-foreground tabular">
              {isLoadingBookings ? '–' : value}
            </div>
            <p className="text-caption1 text-muted-foreground">{hint}</p>
          </Card>
        ))}
      </div>

      {/* Signposts: where bookings and settings are managed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <h2 className="text-subtitle1 font-semibold text-foreground">Booking requests</h2>
            {nextSession ? (
              <p className="text-body1 text-muted-foreground">
                Next session{' '}
                <strong className="text-foreground tabular">
                  {new Date(nextSession.startTime).toLocaleString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </strong>
                {nextSession.totalAmount ? (
                  <>
                    {' '}
                    · <span className="font-mono tabular">{formatINR(nextSession.totalAmount)}</span>
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-body1 text-muted-foreground">
                No upcoming sessions. New requests appear in My Experience Bookings.
              </p>
            )}
          </div>
          <Link
            to="/bookings?view=incoming"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-body1 transition-colors self-start min-h-11"
          >
            <span>Manage in My Experience Bookings</span>
            <ArrowRight16Regular />
          </Link>
        </Card>

        <Card className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-subtitle1 font-semibold text-foreground">Public profile</h2>
              <Badge
                appearance="tint"
                color={!isApproved ? 'warning' : isVisible ? 'success' : 'informative'}
              >
                {!isApproved ? 'Not yet approved' : isVisible ? 'Visible in discovery' : 'Paused'}
              </Badge>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-body1">
              <div>
                <dt className="text-caption1 text-muted-foreground">Hourly rate</dt>
                <dd className="font-semibold font-mono text-foreground tabular">
                  {hourlyRate ? formatINR(hourlyRate) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-caption1 text-muted-foreground">Specialties</dt>
                <dd className="font-semibold font-mono text-foreground tabular">
                  {specialties.length}
                </dd>
              </div>
              <div>
                <dt className="text-caption1 text-muted-foreground">Service area</dt>
                <dd className="font-semibold text-foreground flex items-center gap-1">
                  <Location16Regular className="text-muted-foreground" />
                  <span className="font-mono tabular">
                    {hasLocation ? `${radiusKm || 25} km` : 'Not set'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          <Link
            to="/profile?tab=provider"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-background hover:bg-muted font-semibold text-body1 text-foreground transition-colors self-start min-h-11"
          >
            <Briefcase20Regular className="text-brand-fg" />
            <span>Edit in Profile & Settings</span>
          </Link>
        </Card>
      </div>

      {/* Earnings & UPI payouts */}
      <ProviderEarningsCard />
    </div>
  );
};

export default ProviderDashboard;
