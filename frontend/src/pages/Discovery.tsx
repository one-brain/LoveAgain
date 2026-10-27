import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useListProvidersQuery } from '../store/discoveryApi';
import { useCreateBookingMutation } from '../store/bookingApi';
import { SelectDropdown, type DropdownOption } from '../components/ui/Dropdown';
import { BookingRequestModal, type BookingRequirementData } from '../components/booking/BookingRequestModal';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
import { RateBadge } from '../components/ui/RateBadge';
import { SAMPLE_PROVIDERS_LIST } from '../utils/providerData';
import {
  calculateHaversineDistance,
  resolveNearestHub,
  getCurrentCoordinates,
} from '../utils/location';
import {
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  CheckBadgeIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const CITY_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All India', icon: '🇮🇳', description: 'Show companions nationwide' },
  { value: 'blr', label: 'Bengaluru', icon: '📍', description: 'Indiranagar, Koramangala, Whitefield' },
  { value: 'mum', label: 'Mumbai', icon: '📍', description: 'Bandra, BKC, Colaba, Andheri' },
  { value: 'del', label: 'Delhi-NCR', icon: '📍', description: 'Connaught Place, Gurgaon, Noida' },
  { value: 'hyd', label: 'Hyderabad', icon: '📍', description: 'Hitec City, Jubilee Hills, Gachibowli' },
  { value: 'pun', label: 'Pune', icon: '📍', description: 'Koregaon Park, Kalyani Nagar, Baner' },
  { value: 'chn', label: 'Chennai', icon: '📍', description: 'Nungambakkam, Adyar' },
  { value: 'kol', label: 'Kolkata', icon: '📍', description: 'Park Street, Salt Lake' },
];

const GENDER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All Genders', icon: '👥', description: 'Show all companions' },
  { value: 'female', label: 'Women', icon: '👩', description: 'Female companions' },
  { value: 'male', label: 'Men', icon: '👨', description: 'Male companions' },
  { value: 'non-binary', label: 'Non-Binary', icon: '⚧', description: 'Non-binary companions' },
];

const SORT_OPTIONS: DropdownOption[] = [
  { value: 'rating', label: 'Top Rated', icon: '⭐', description: 'Highest review average' },
  { value: 'distance', label: 'Nearest First', icon: '📍', description: 'Closest to your coordinates' },
  { value: 'price', label: 'Price: Low to High', icon: '🏷️', description: 'Budget friendly rates' },
  { value: 'newest', label: 'Newest Members', icon: '✨', description: 'Recently active members' },
];

const RADIUS_OPTIONS: DropdownOption[] = [
  { value: '10', label: 'Within 10 km', description: 'Immediate local area' },
  { value: '25', label: 'Within 25 km', description: 'Metro city radius' },
  { value: '50', label: 'Within 50 km', description: 'Greater metropolitan area' },
  { value: '100', label: 'Within 100 km', description: 'Extended regional area' },
];

const CURATED_SAMPLE_PROVIDERS = SAMPLE_PROVIDERS_LIST;

const Discovery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [createBooking] = useCreateBookingMutation();

  const initialQ = searchParams.get('q') || '';
  const initialGender = (searchParams.get('gender') as any) || 'all';

  const [q, setQ] = useState(initialQ);
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male' | 'non-binary'>(
    ['all', 'female', 'male', 'non-binary'].includes(initialGender) ? initialGender : 'all'
  );
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [radiusKm, setRadiusKm] = useState('50');
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic Location State
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; label: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Track active photo index per provider card for interactive 3-photo browsing
  const [activePhotoIndexByProvider, setActivePhotoIndexByProvider] = useState<Record<string, number>>({});

  // Single Canonical Booking Flow Modal States
  const [authPromptModal, setAuthPromptModal] = useState(false);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<any | null>(null);
  const [activeCheckoutOrderId, setActiveCheckoutOrderId] = useState<string | null>(null);
  const [checkoutTotalAmount, setCheckoutTotalAmount] = useState<number>(0);
  const [checkoutProviderName, setCheckoutProviderName] = useState<string>('Companion');

  useEffect(() => {
    const paramLens = searchParams.get('lens');
    const paramQ = searchParams.get('q');
    const paramSpec = searchParams.get('specialty');
    const paramGender = searchParams.get('gender');

    if (paramGender && ['all', 'female', 'male', 'non-binary'].includes(paramGender.toLowerCase())) {
      setGenderFilter(paramGender.toLowerCase() as any);
    }
    if (paramQ !== null) {
      setQ(paramQ);
    } else if (paramLens && paramLens !== 'all') {
      const lensMap: Record<string, string> = {
        lifestyle: 'Lifestyle',
        wellness: 'Wellness',
        companions: 'Social',
        pro_work: 'Mentorship',
      };
      setQ(lensMap[paramLens] || paramLens);
    } else if (paramSpec !== null && paramSpec !== 'All') {
      setQ(paramSpec);
    }
  }, [searchParams]);

  // Query live backend providers
  const { data: backendData } = useListProvidersQuery({
    q: q.trim() || undefined,
    minRate: minRate ? Number(minRate) : undefined,
    maxRate: maxRate ? Number(maxRate) : undefined,
    sortBy,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    radiusKm: Number(radiusKm) || 50,
  });

  const displayProviders = useMemo(() => {
    const rawItems = Array.isArray(backendData)
      ? backendData
      : Array.isArray((backendData as any)?.items)
      ? (backendData as any).items
      : [];
    const liveItems = rawItems.map((item: any) => {
      const imgs: string[] =
        item.profileImages && item.profileImages.length > 0
          ? item.profileImages
          : item.photoUrl
          ? [item.photoUrl]
          : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'];

      const hub =
        item.latitude != null && item.longitude != null
          ? resolveNearestHub(item.latitude, item.longitude)
          : null;

      return {
        providerId: String(item.providerId),
        displayName: String(item.displayName || 'Verified Companion'),
        photoUrl: imgs[0],
        profileImages: imgs,
        gender: String(item.gender || 'Female'),
        hourlyRate: Number(item.hourlyRate || 1500),
        bio: String(item.bio || ''),
        specialties: Array.isArray(item.specialties) ? item.specialties : [],
        averageRating: Number(item.averageRating || 5.0),
        isVerified: Boolean(item.isVerified),
        trustScore: Number(item.trustScore || 99),
        distanceKm: item.distanceKm != null ? Number(item.distanceKm) : null,
        latitude: item.latitude != null ? Number(item.latitude) : null,
        longitude: item.longitude != null ? Number(item.longitude) : null,
        city: hub?.city || 'Bengaluru',
        area: hub?.area || 'Indiranagar',
        services: Array.isArray(item.services) ? item.services : [],
        lenses: Array.isArray(item.lenses) ? item.lenses : ['companions'],
      };
    });

    const existingIds = new Set(liveItems.map((i: any) => i.providerId));
    let list: any[] = [...liveItems, ...CURATED_SAMPLE_PROVIDERS.filter((s) => !existingIds.has(s.providerId))];

    // Exclude any provider explicitly rejected by platform administration
    try {
      const rawRejected = localStorage.getItem('cue_rejected_provider_ids');
      if (rawRejected) {
        const rejectedIds = new Set(JSON.parse(rawRejected));
        list = list.filter((p: any) => !rejectedIds.has(p.providerId) && !rejectedIds.has(p.userId));
      }
    } catch {}

    // Calculate dynamic distance & filter by radius if location is active
    if (userLocation) {
      const maxR = Number(radiusKm) || 50;
      list = list
        .map((p) => {
          let dist = p.distanceKm;
          if (p.latitude != null && p.longitude != null) {
            dist = calculateHaversineDistance(
              userLocation.latitude,
              userLocation.longitude,
              p.latitude,
              p.longitude
            );
          }
          return {
            ...p,
            distanceKm: dist,
          };
        })
        .filter((p) => p.distanceKm == null || p.distanceKm <= maxR);
    }

    // Filter by Gender
    if (genderFilter !== 'all') {
      list = list.filter((p) => {
        const g = (p.gender || '').toLowerCase();
        if (genderFilter === 'female') return g === 'female' || g === 'woman';
        if (genderFilter === 'male') return g === 'male' || g === 'man';
        if (genderFilter === 'non-binary') return g === 'non-binary' || g === 'other';
        return true;
      });
    }

    // Unified Search across name, specialties, bio, city, area, and services
    if (q.trim()) {
      const lower = q.trim().toLowerCase();
      list = list.filter((p) => {
        const nameMatch = (p.displayName || '').toLowerCase().includes(lower);
        const bioMatch = (p.bio || '').toLowerCase().includes(lower);
        const cityMatch = (p.city || '').toLowerCase().includes(lower);
        const areaMatch = (p.area || '').toLowerCase().includes(lower);
        const specMatch = Array.isArray(p.specialties) && p.specialties.some((s: string) => (s || '').toLowerCase().includes(lower));
        const svcMatch = Array.isArray(p.services) && p.services.some((s: string) => (s || '').toLowerCase().includes(lower));
        return nameMatch || bioMatch || cityMatch || areaMatch || specMatch || svcMatch;
      });
    }

    if (minRate) {
      list = list.filter((p) => p.hourlyRate >= Number(minRate));
    }
    if (maxRate) {
      list = list.filter((p) => p.hourlyRate <= Number(maxRate));
    }

    if (sortBy === 'price') {
      list.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortBy === 'distance') {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else {
      list.sort((a, b) => b.averageRating - a.averageRating);
    }

    return list;
  }, [backendData, userLocation, radiusKm, genderFilter, q, minRate, maxRate, sortBy]);

  const handleSelectPhoto = (providerId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndexByProvider((prev) => ({
      ...prev,
      [providerId]: idx,
    }));
  };

  const handleStepPhoto = (providerId: string, total: number, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndexByProvider((prev) => {
      const current = prev[providerId] ?? 0;
      const next = (current + delta + total) % total;
      return {
        ...prev,
        [providerId]: next,
      };
    });
  };

  const handleNearMeGps = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const coords = await getCurrentCoordinates();
      const nearest = resolveNearestHub(coords.latitude, coords.longitude);
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        label: `Near ${nearest.area}`,
      });
      setSelectedCity('gps');
      setSortBy('distance');
    } catch (err: any) {
      setLocationError(err?.message || 'Location permission denied');
    } finally {
      setIsLocating(false);
    }
  };

  const handleCityChange = (cityKey: string) => {
    setSelectedCity(cityKey);
    setLocationError(null);
    if (cityKey === 'all') {
      setUserLocation(null);
      return;
    }
    const cityMap: Record<string, { lat: number; lon: number; name: string }> = {
      blr: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' },
      mum: { lat: 19.0596, lon: 72.8295, name: 'Mumbai' },
      del: { lat: 28.6315, lon: 77.2167, name: 'Delhi-NCR' },
      hyd: { lat: 17.4435, lon: 78.3772, name: 'Hyderabad' },
      pun: { lat: 18.5362, lon: 73.8940, name: 'Pune' },
      chn: { lat: 13.0569, lon: 80.2425, name: 'Chennai' },
      kol: { lat: 22.5510, lon: 88.3524, name: 'Kolkata' },
    };
    const c = cityMap[cityKey];
    if (c) {
      setUserLocation({
        latitude: c.lat,
        longitude: c.lon,
        label: c.name,
      });
      setSortBy('distance');
    }
  };

  const handleClearFilters = () => {
    setQ('');
    setGenderFilter('all');
    setMinRate('');
    setMaxRate('');
    setSortBy('rating');
    setSelectedCity('all');
    setUserLocation(null);
    setLocationError(null);
    setRadiusKm('50');
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== 'all') count++;
    if (selectedCity !== 'all' || userLocation !== null) count++;
    if (minRate || maxRate) count++;
    if (sortBy !== 'rating') count++;
    return count;
  }, [genderFilter, selectedCity, userLocation, minRate, maxRate, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header & Search Bar */}
      <section className="bg-card border-b border-border sticky top-16 z-20 backdrop-blur-md bg-card/95 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          {/* Main Controls Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Primary Unified Search Bar */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  const val = e.target.value;
                  setQ(val);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (val.trim()) next.set('q', val.trim());
                    else next.delete('q');
                    return next;
                  });
                }}
                placeholder="Search by activity, category, or companion name (e.g. Cooking, Yoga, Saree, Tennis, Elena)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-muted/50 border border-border/80 text-xs sm:text-sm placeholder:text-muted-foreground/70 focus:outline-hidden focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all shadow-2xs"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ('');
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete('q');
                      return next;
                    });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Strip: City, GPS, Gender, and Filters Drawer Toggle */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {/* City Dropdown */}
              <div className="w-36 sm:w-40 shrink-0">
                <SelectDropdown
                  options={CITY_OPTIONS}
                  value={selectedCity === 'gps' ? 'all' : selectedCity}
                  onChange={(val) => handleCityChange(val)}
                  className="w-full text-xs font-medium"
                  triggerClassName="w-full bg-muted/60 hover:bg-muted border border-border/80 px-2.5 py-2 rounded-xl text-xs"
                />
              </div>

              {/* GPS Near Me Button */}
              <button
                type="button"
                onClick={handleNearMeGps}
                disabled={isLocating}
                title="Use Current Device Location (GPS)"
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedCity === 'gps'
                    ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                    : 'bg-card border-border/80 hover:border-accent text-foreground'
                }`}
              >
                {isLocating ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-accent" />
                ) : (
                  <MapPinIcon className="w-3.5 h-3.5 text-accent" />
                )}
                <span>Near Me</span>
              </button>

              {/* Gender Dropdown */}
              <div className="w-32 sm:w-36 shrink-0">
                <SelectDropdown
                  options={GENDER_OPTIONS}
                  value={genderFilter}
                  onChange={(val) => {
                    setGenderFilter(val as any);
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      if (val === 'all') next.delete('gender');
                      else next.set('gender', val);
                      return next;
                    });
                  }}
                  className="w-full text-xs font-medium"
                  triggerClassName="w-full bg-muted/60 hover:bg-muted border border-border/80 px-2.5 py-2 rounded-xl text-xs"
                />
              </div>

              {/* Advanced Filters Button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                    : 'bg-card border-border/80 hover:border-accent text-foreground'
                }`}
                title="More Filters"
              >
                <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-accent-foreground text-accent text-[10px] font-bold flex items-center justify-center font-mono ml-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Popular Search Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <span className="text-[11px] text-muted-foreground font-medium shrink-0">Popular:</span>
            {[
              { label: '🍛 Homestyle Cooking', query: 'Cooking' },
              { label: '🎾 Tennis', query: 'Tennis' },
              { label: '🪔 Festival & Pooja', query: 'Pooja' },
              { label: '📸 Photography', query: 'Photography' },
              { label: '👵 Senior Companion', query: 'Senior Companion' },
              { label: '🧘 Yoga', query: 'Yoga' },
            ].map((tag) => (
              <button
                key={tag.query}
                type="button"
                onClick={() => {
                  setQ(tag.query);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('q', tag.query);
                    return next;
                  });
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                  q.toLowerCase() === tag.query.toLowerCase()
                    ? 'bg-accent text-accent-foreground border-accent shadow-2xs'
                    : 'bg-muted/40 hover:bg-muted text-foreground/80 border-border/70 hover:border-accent/40'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Active Location Indicator Pill */}
          {userLocation && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-xs">
              <div className="flex items-center gap-1.5 text-accent font-medium">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span>
                  Filtering companions within <strong>{radiusKm} km</strong> of <strong>{userLocation.label}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserLocation(null);
                  setSelectedCity('all');
                }}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground underline ml-2 cursor-pointer"
              >
                Clear Location
              </button>
            </div>
          )}

          {locationError && (
            <div className="text-xs text-rose-500 font-medium">
              ⚠️ {locationError}
            </div>
          )}
        </div>
      </section>

      {/* Filter Drawer */}
      {showFilters && (
        <section className="bg-card border-b border-border py-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Sort Results</label>
                <SelectDropdown
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onChange={(val) => {
                    if (val === 'price' && !isAuthenticated) {
                      setAuthPromptModal(true);
                      return;
                    }
                    setSortBy(val);
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Search Distance</label>
                <SelectDropdown options={RADIUS_OPTIONS} value={radiusKm} onChange={(val) => setRadiusKm(val)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>Hourly Rate Range (₹ INR)</span>
                  {!isAuthenticated && (
                    <span className="text-[10px] text-accent flex items-center gap-1 font-semibold">
                      <LockClosedIcon className="w-3 h-3" /> Login Required
                    </span>
                  )}
                </label>
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minRate}
                      onChange={(e) => setMinRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
                    />
                    <span className="text-muted-foreground text-xs">-</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={maxRate}
                      onChange={(e) => setMaxRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthPromptModal(true)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/80 hover:border-accent/60 text-xs text-muted-foreground flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <LockClosedIcon className="w-3.5 h-3.5 text-accent" />
                      Sign in to filter by rate
                    </span>
                    <span className="text-[10px] text-accent font-semibold underline">Unlock</span>
                  </button>
                )}
              </div>

              <div className="flex justify-end pb-1">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-accent hover:bg-accent/10 border border-accent/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Results Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{displayProviders.length}</span> verified profiles
            {q && (
              <>
                {' '}
                for <span className="font-medium text-accent">"{q}"</span>
              </>
            )}
            {genderFilter !== 'all' && (
              <>
                {' '}
                • <span className="font-medium text-foreground">{GENDER_OPTIONS.find((g) => g.value === genderFilter)?.label || genderFilter}</span>
              </>
            )}
          </p>
        </div>

        {displayProviders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border max-w-xl mx-auto p-8">
            <SparklesIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No matching profiles found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your search terms, gender filter, or resetting active filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProviders.map((provider) => {
              const images =
                provider.profileImages && provider.profileImages.length > 0
                  ? provider.profileImages.slice(0, 3)
                  : [provider.photoUrl ?? ''];
              const activeIdx = activePhotoIndexByProvider[provider.providerId] ?? 0;
              const currentPhoto = images[activeIdx] || images[0] || '';

              return (
                <div
                  key={provider.providerId}
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile for ${provider.displayName}`}
                  onClick={() => navigate(`/provider/${provider.providerId}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/provider/${provider.providerId}`);
                    }
                  }}
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col group focus:outline-hidden focus:ring-2 focus:ring-accent/50"
                >
                  {/* Interactive 3-Photo Carousel & Top Badges */}
                  <div className="relative h-64 overflow-hidden bg-muted">
                    <img
                      src={currentPhoto}
                      alt={`${provider.displayName} photo ${activeIdx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

                    {/* Top Right Rate Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <RateBadge
                        variant="card-badge"
                        rate={provider.hourlyRate}
                        isAuthenticated={isAuthenticated}
                        onAuthPrompt={() => setAuthPromptModal(true)}
                      />
                    </div>

                    {/* Top Left Verified + Photo Count Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {provider.isVerified && (
                        <div className="bg-success/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold text-success-foreground flex items-center gap-1 shadow-xs">
                          <CheckBadgeIcon className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      )}
                      {images.length > 1 && (
                        <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold text-white flex items-center gap-1">
                          <PhotoIcon className="w-3 h-3" />
                          <span>
                            {activeIdx + 1}/{images.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Left / Right Photo Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleStepPhoto(provider.providerId, images.length, -1, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-hidden"
                          aria-label={`Previous photo of ${provider.displayName}`}
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleStepPhoto(provider.providerId, images.length, 1, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-hidden"
                          aria-label={`Next photo of ${provider.displayName}`}
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Bottom Bar: Category Badges (Left) & 3-Photo Thumbnail Switcher (Right) */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {provider.lenses?.includes('pro_work') && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-900/80 backdrop-blur-md text-[10px] font-semibold text-sky-200 border border-sky-400/30">
                            💼 Skilled Pro
                          </span>
                        )}
                        {provider.lenses?.includes('wellness') && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-900/80 backdrop-blur-md text-[10px] font-semibold text-teal-200 border border-teal-400/30">
                            🏃 Active & Wellness
                          </span>
                        )}
                        {provider.lenses?.includes('companions') && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-900/80 backdrop-blur-md text-[10px] font-semibold text-emerald-200 border border-emerald-400/30">
                            🤝 Companion
                          </span>
                        )}
                        {provider.lenses?.includes('lifestyle') && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-900/80 backdrop-blur-md text-[10px] font-semibold text-rose-200 border border-rose-400/30">
                            🏡 Lifestyle
                          </span>
                        )}
                      </div>

                      {/* 3-Photo Mini Thumbnails */}
                      {images.length > 1 && (
                        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/15">
                          {images.map((imgUrl: string, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => handleSelectPhoto(provider.providerId, idx, e)}
                              className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all ${
                                activeIdx === idx
                                  ? 'border-accent scale-105 shadow-xs'
                                  : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                              title={`View photo ${idx + 1}`}
                            >
                              <img
                                src={imgUrl}
                                alt={`${provider.displayName} thumb ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                          {provider.displayName}
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                          <StarIcon className="w-4 h-4 fill-amber-400" />
                          <span>{provider.averageRating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {provider.bio}
                      </p>

                      {/* Offered Gigs / Services (If Present) */}
                      {provider.services && provider.services.length > 0 && (
                        <div className="mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                            Offered Services & Gigs:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {provider.services.map((svc: string) => (
                              <span
                                key={svc}
                                className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[11px] font-medium"
                              >
                                ✓ {svc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specialty / Activity Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(provider.specialties || []).map((spec: string) => (
                          <span
                            key={spec}
                            className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground"
                          >
                            #{spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 truncate max-w-[58%]">
                        <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-accent" />
                        <span className="truncate">
                          {provider.distanceKm != null ? (
                            <strong className="text-foreground font-semibold tabular-nums">
                              {provider.distanceKm} km away
                            </strong>
                          ) : null}
                          {provider.area ? ` • ${provider.area}` : provider.city ? ` • ${provider.city}` : ''}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            setAuthPromptModal(true);
                            return;
                          }
                          setSelectedProviderForBooking(provider);
                        }}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all shadow-2xs cursor-pointer ${
                          isAuthenticated
                            ? 'bg-accent/10 hover:bg-accent hover:text-accent-foreground text-accent'
                            : 'bg-muted/80 hover:bg-accent hover:text-accent-foreground text-foreground border border-border/80'
                        }`}
                      >
                        {isAuthenticated ? 'Book with Escrow \u2192' : 'Login to Book \u2192'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Single Canonical Booking Flow: Escrow Request Modal */}
        {selectedProviderForBooking && (
          <BookingRequestModal
            isOpen={Boolean(selectedProviderForBooking)}
            onClose={() => setSelectedProviderForBooking(null)}
            provider={selectedProviderForBooking}
            onProceedToPayment={async (bookingData: BookingRequirementData) => {
              let generatedOrderId = `order_${Date.now()}`;
              if (selectedProviderForBooking.providerId && !selectedProviderForBooking.providerId.startsWith('sample-')) {
                try {
                  const startD = new Date(`${bookingData.startDate}T${bookingData.startTime}:00Z`);
                  const endD = new Date(startD.getTime() + bookingData.durationHours * 3600000);
                  const result = await createBooking({
                    providerId: selectedProviderForBooking.providerId,
                    startTime: startD.toISOString(),
                    endTime: endD.toISOString(),
                    hourlyRate: selectedProviderForBooking.hourlyRate,
                    durationHours: bookingData.durationHours,
                    meetingAddress: bookingData.meetingVenue,
                  }).unwrap();
                  if (result?.orderId) {
                    generatedOrderId = result.orderId;
                  }
                } catch (err: any) {
                  console.error('Booking API error:', err);
                  alert(err?.data?.error || 'Failed to create booking. Please check companion availability.');
                  return;
                }
              }
              setCheckoutTotalAmount(bookingData.totalAmount);
              setCheckoutProviderName(selectedProviderForBooking.displayName);
              setActiveCheckoutOrderId(generatedOrderId);
              setSelectedProviderForBooking(null);
            }}
          />
        )}

        {/* Razorpay Escrow Checkout Modal */}
        {activeCheckoutOrderId && (
          <BookingCheckoutModal
            orderId={activeCheckoutOrderId}
            totalAmount={checkoutTotalAmount}
            providerName={checkoutProviderName}
            isOpen={Boolean(activeCheckoutOrderId)}
            onClose={() => setActiveCheckoutOrderId(null)}
            onSuccess={() => {
              setActiveCheckoutOrderId(null);
              navigate('/bookings');
            }}
          />
        )}

        {/* Auth Prompt Modal for Guest Visitors */}
        {authPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-8 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto">
                <SparklesIcon className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-foreground">
                Sign In to Unlock Pricing & Reserve
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To guarantee companion privacy and escrow protection, an authenticated account is required to inspect hourly rates and book meetups.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/register"
                  className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-xs hover:bg-accent-hover transition-colors block"
                >
                  Create Account (Quick & Free)
                </Link>
                <Link
                  to="/login"
                  className="w-full py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-xs transition-colors block"
                >
                  Existing User Log In
                </Link>
                <button
                  type="button"
                  onClick={() => setAuthPromptModal(false)}
                  className="text-xs text-muted-foreground hover:underline pt-2 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Discovery;
