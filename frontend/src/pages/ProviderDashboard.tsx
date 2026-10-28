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
import {
  BriefcaseIcon,
  SparklesIcon,
  CalendarDaysIcon,
  InboxArrowDownIcon,
  ArrowRightIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const ACTIVE_STATUSES = ['PendingPayment', 'Confirmed', 'InProgress'];

/**
 * Companion Dashboard: performance at a glance and earnings/payouts.
 * Bookings live in My Experience Bookings (/bookings) and configuration lives in
 * Companion Profile & Settings (/profile?tab=provider); this page only links to them.
 */
const ProviderDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const userId = localStorage.getItem('userId') || '';
  const { specialties } = useSelector((state: any) => state.profile || { specialties: [] });

  const { data: profileData, isLoading: profileLoading } = useGetMyProfileQuery();
  const { data: providerBookingsData, isLoading: isLoadingBookings } = useGetProviderIncomingBookingsQuery(
    userId,
    { skip: !userId }
  );

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading Companion Hub...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Awaiting payment', value: pendingCount, hint: 'Requests clients have not paid yet', icon: InboxArrowDownIcon, tone: 'text-amber-500' },
    { label: 'Upcoming sessions', value: upcomingCount, hint: 'Confirmed or in progress', icon: CalendarDaysIcon, tone: 'text-accent' },
    { label: 'Completed meetups', value: completedCount, hint: 'Lifetime finished sessions', icon: SparklesIcon, tone: 'text-emerald-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
            Companion Management Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">Companion Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your performance and earnings at a glance.
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <span>{label}</span>
              <Icon className={`w-5 h-5 ${tone}`} />
            </div>
            <div className="text-3xl font-bold font-serif text-foreground tabular-nums">
              {isLoadingBookings ? '–' : value}
            </div>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      {/* Signposts: where bookings and settings are managed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bookings signpost */}
        <section className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <h2 className="text-lg font-bold font-serif text-foreground">Booking requests</h2>
            {nextSession ? (
              <p className="text-sm text-muted-foreground">
                Next session{' '}
                <strong className="text-foreground">
                  {new Date(nextSession.startTime).toLocaleString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </strong>
                {nextSession.totalAmount ? <> · {formatINR(nextSession.totalAmount)}</> : null}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming sessions. New requests appear in My Experience Bookings.
              </p>
            )}
          </div>
          <Link
            to="/bookings?view=incoming"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors self-start"
          >
            <span>Manage in My Experience Bookings</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </section>

        {/* Profile signpost */}
        <section className="p-6 rounded-2xl bg-card border border-border shadow-xs flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold font-serif text-foreground">Public profile</h2>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  !isApproved
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : isVisible
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {!isApproved ? 'Not yet approved' : isVisible ? 'Visible in Discovery' : 'Paused'}
              </span>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Hourly rate</dt>
                <dd className="font-semibold text-foreground tabular-nums">{hourlyRate ? formatINR(hourlyRate) : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Specialties</dt>
                <dd className="font-semibold text-foreground tabular-nums">{specialties.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Service area</dt>
                <dd className="font-semibold text-foreground flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {hasLocation ? `${radiusKm || 25} km` : 'Not set'}
                </dd>
              </div>
            </dl>
          </div>
          <Link
            to="/profile?tab=provider"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-semibold text-sm text-foreground transition-colors self-start"
          >
            <BriefcaseIcon className="w-4 h-4 text-accent" />
            <span>Edit in Profile & Settings</span>
          </Link>
        </section>
      </div>

      {/* Earnings & UPI payouts: unique to this page */}
      <ProviderEarningsCard />
    </div>
  );
};

export default ProviderDashboard;
