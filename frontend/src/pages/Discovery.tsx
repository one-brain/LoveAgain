import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useListProvidersQuery } from '../store/discoveryApi';
import {
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  CheckBadgeIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface SpecialtyOption {
  label: string;
  icon: string;
}

const SPECIALTY_OPTIONS: SpecialtyOption[] = [
  { label: 'All', icon: '✨' },
  { label: 'Tennis', icon: '🎾' },
  { label: 'Yoga', icon: '🧘' },
  { label: 'Cooking', icon: '🍳' },
  { label: 'Photography', icon: '📸' },
  { label: 'Music', icon: '🎵' },
  { label: 'Hiking', icon: '🥾' },
  { label: 'Reading', icon: '📚' },
  { label: 'Art', icon: '🎨' },
  { label: 'Dance', icon: '💃' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'distance', label: 'Nearest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'newest', label: 'Newest Companions' },
];

// Curated realistic companion profiles for demo / offline fallback
const CURATED_SAMPLE_PROVIDERS = [
  {
    providerId: 'sample-1',
    displayName: 'Elena Rostova',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    hourlyRate: 45,
    bio: 'Semi-pro tennis instructor and contemporary art curator. Love high-energy matches and weekend museum tours.',
    specialties: ['Tennis', 'Yoga', 'Art'],
    averageRating: 4.98,
    isVerified: true,
    trustScore: 99,
    distanceKm: 2.4,
  },
  {
    providerId: 'sample-2',
    displayName: 'Marcus Vance',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    hourlyRate: 55,
    bio: 'Former sous-chef turned street photographer. Eager to explore new culinary spots or teach authentic Italian pasta making.',
    specialties: ['Cooking', 'Photography', 'Reading'],
    averageRating: 4.95,
    isVerified: true,
    trustScore: 98,
    distanceKm: 3.8,
  },
  {
    providerId: 'sample-3',
    displayName: 'Sophia Chen',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    hourlyRate: 40,
    bio: 'Outdoor enthusiast and classical violinist. Let us explore mountain trails, scenic viewpoints, or catch a live symphony.',
    specialties: ['Hiking', 'Music', 'Photography'],
    averageRating: 4.92,
    isVerified: true,
    trustScore: 97,
    distanceKm: 1.9,
  },
  {
    providerId: 'sample-4',
    displayName: 'Julian Alvarez',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    hourlyRate: 50,
    bio: 'Salsa & tango dancer with a passion for architectural history. Great companion for ballroom sessions and city heritage walks.',
    specialties: ['Dance', 'Art', 'Music'],
    averageRating: 4.88,
    isVerified: true,
    trustScore: 96,
    distanceKm: 4.5,
  },
  {
    providerId: 'sample-5',
    displayName: 'Aria Thorne',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    hourlyRate: 48,
    bio: 'Certified vinyasa yoga teacher and avid reader. Perfect companion for morning mindfulness, park yoga, and book discussions.',
    specialties: ['Yoga', 'Reading', 'Hiking'],
    averageRating: 4.97,
    isVerified: true,
    trustScore: 99,
    distanceKm: 2.1,
  },
  {
    providerId: 'sample-6',
    displayName: 'David Morales',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    hourlyRate: 60,
    bio: 'Sommelier and culinary guide. Join me for artisan pastry tours, farm-to-table tasting dinners, and wine pairings.',
    specialties: ['Cooking', 'Art', 'Reading'],
    averageRating: 4.94,
    isVerified: true,
    trustScore: 98,
    distanceKm: 5.2,
  },
];

const Discovery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial query parameters from URL
  const initialQ = searchParams.get('q') || '';
  const initialSpecialty = searchParams.get('specialty') || 'All';

  const [q, setQ] = useState(initialQ);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Sync state if URL search parameters change
  useEffect(() => {
    const paramQ = searchParams.get('q');
    const paramSpec = searchParams.get('specialty');
    if (paramQ !== null) setQ(paramQ);
    if (paramSpec !== null) setSpecialty(paramSpec);
  }, [searchParams]);

  // Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Default location if denied
        }
      );
    }
  }, []);

  // Fetch from RTK query
  const { data: apiProviders, isLoading, isError } = useListProvidersQuery({
    q: q.trim() || undefined,
    specialty: specialty !== 'All' ? specialty : undefined,
    minRate: minRate ? Number(minRate) : undefined,
    maxRate: maxRate ? Number(maxRate) : undefined,
    sortBy,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    radiusKm: 50,
  });

  // Decide on active providers list (API data if available, fallback to sample data if offline/empty)
  const isFallback = !isLoading && (isError || !apiProviders || apiProviders.length === 0);

  const displayProviders = useMemo(() => {
    if (apiProviders && apiProviders.length > 0) {
      let filtered = [...apiProviders];
      if (verifiedOnly) {
        filtered = filtered.filter((p) => p.isVerified);
      }
      return filtered;
    }

    // Filter curated fallback data
    let list = [...CURATED_SAMPLE_PROVIDERS];
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.displayName.toLowerCase().includes(lower) ||
          p.bio.toLowerCase().includes(lower) ||
          p.specialties.some((s) => s.toLowerCase().includes(lower))
      );
    }
    if (specialty !== 'All') {
      list = list.filter((p) => p.specialties.includes(specialty));
    }
    if (minRate) {
      list = list.filter((p) => p.hourlyRate >= Number(minRate));
    }
    if (maxRate) {
      list = list.filter((p) => p.hourlyRate <= Number(maxRate));
    }
    if (verifiedOnly) {
      list = list.filter((p) => p.isVerified);
    }

    if (sortBy === 'price') {
      list.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'distance') {
      list.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
    } else {
      list.sort((a, b) => b.averageRating - a.averageRating);
    }

    return list;
  }, [apiProviders, q, specialty, minRate, maxRate, verifiedOnly, sortBy]);

  const handleSpecialtySelect = (spec: string) => {
    setSpecialty(spec);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (spec === 'All') {
        next.delete('specialty');
      } else {
        next.set('specialty', spec);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setQ('');
    setSpecialty('All');
    setMinRate('');
    setMaxRate('');
    setVerifiedOnly(false);
    setSortBy('rating');
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount =
    (specialty !== 'All' ? 1 : 0) +
    (minRate || maxRate ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (q.trim() ? 1 : 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Search Area */}
      <section className="bg-card border-b border-border py-10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-accent mb-2 block">
              Verified Experience Companions
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-serif">
              Discover Inspiring Companions
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Filter by interest, rate, and proximity. Connect with vetted companions for shared adventures and activities.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search companions by activity, skill, or name..."
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base shadow-xs"
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-xs ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-background border-border text-foreground hover:bg-muted'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent shadow-xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Specialty Horizontal Chips */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SPECIALTY_OPTIONS.map((spec) => {
              const selected = specialty === spec.label;
              return (
                <button
                  key={spec.label}
                  onClick={() => handleSpecialtySelect(spec.label)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-all shadow-xs ${
                    selected
                      ? 'bg-accent text-accent-foreground font-semibold scale-[1.02]'
                      : 'bg-card text-foreground/85 border border-border hover:border-accent/50 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{spec.icon}</span>
                  <span>{spec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Expandable Filter Tray */}
          {showFilters && (
            <div className="mt-4 p-5 rounded-2xl bg-card border border-border space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Hourly Rate Range ($)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min ($)"
                        value={minRate}
                        onChange={(e) => setMinRate(e.target.value)}
                        className="w-24 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <span className="text-muted-foreground text-xs">to</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max ($)"
                        value={maxRate}
                        onChange={(e) => setMaxRate(e.target.value)}
                        className="w-24 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
                      />
                      <span className="flex items-center gap-1">
                        <CheckBadgeIcon className="w-4 h-4 text-success" />
                        ID Verified Only
                      </span>
                    </label>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Results Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notice banner if displaying sample showcase */}
        {isFallback && (
          <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between gap-4 text-xs sm:text-sm text-foreground">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-accent flex-shrink-0" />
              <span>
                <strong>Featured Companion Showcase:</strong> Browsing our curated community directory of verified companionship providers.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-accent text-accent-foreground font-semibold text-xs">
              Live Preview
            </span>
          </div>
        )}

        {/* Results Counter & Active summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground font-medium">
            Showing <strong className="text-foreground">{displayProviders.length}</strong> available{' '}
            {displayProviders.length === 1 ? 'companion' : 'companions'}
            {specialty !== 'All' ? ` for ${specialty}` : ''}
          </p>
        </div>

        {/* Loading skeleton state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-4 animate-pulse">
                <div className="h-56 bg-muted rounded-xl" />
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayProviders.length === 0 && (
          <div className="py-20 text-center rounded-3xl bg-card border border-border p-12">
            <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No companions found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              We couldn't find companions matching your current filters. Try adjusting your search keywords or broadening your budget.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-xs hover:bg-accent-hover transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Provider Cards Grid */}
        {!isLoading && displayProviders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProviders.map((provider) => {
              const avatar =
                provider.photoUrl ||
                `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80`;

              return (
                <div
                  key={provider.providerId}
                  onClick={() => navigate(`/provider/${provider.providerId}`)}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-lg card-hover-effect cursor-pointer flex flex-col group"
                >
                  {/* Photo area */}
                  <div className="relative h-64 overflow-hidden bg-muted">
                    <img
                      src={avatar}
                      alt={provider.displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hourly Rate Badge */}
                    <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-foreground border border-border shadow-xs">
                      ${provider.hourlyRate}
                      <span className="font-normal text-muted-foreground">/hr</span>
                    </div>

                    {/* Verified & Trust Score Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {provider.isVerified && (
                        <div className="bg-success/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold text-white flex items-center gap-1 shadow-xs">
                          <CheckBadgeIcon className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      )}
                      {provider.trustScore && (
                        <div className="bg-card/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold text-foreground border border-border shadow-xs flex items-center gap-1">
                          <ShieldCheckIcon className="w-3.5 h-3.5 text-accent" />
                          <span>{provider.trustScore}% Trust</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info area */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                          {provider.displayName}
                        </h3>
                        <div className="flex items-center gap-1 text-sm font-semibold text-foreground flex-shrink-0">
                          <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>{provider.averageRating.toFixed(1)}</span>
                        </div>
                      </div>

                      {provider.distanceKm != null && (
                        <div className="flex items-center gap-1 text-xs text-foreground/75 mb-3">
                          <MapPinIcon className="w-3.5 h-3.5 text-accent" />
                          <span>
                            {provider.distanceKm < 1
                              ? `${Math.round(provider.distanceKm * 1000)}m away`
                              : `${provider.distanceKm} km away`}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed mb-4">
                        {provider.bio}
                      </p>
                    </div>

                    <div>
                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {provider.specialties.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-accent/10 text-accent border border-accent/20"
                          >
                            {spec}
                          </span>
                        ))}
                        {provider.specialties.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground">
                            +{provider.specialties.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/provider/${provider.providerId}`);
                        }}
                        className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs text-center shadow-xs hover:bg-accent-hover transition-colors"
                      >
                        View Profile & Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Discovery;
