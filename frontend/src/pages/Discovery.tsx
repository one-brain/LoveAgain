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
import { CompanionCardSkeleton } from '../components/ui/Skeleton';
import { toProviderGuid } from '../utils/providerData';
import {
  calculateHaversineDistance,
  resolveNearestHub,
  getCurrentCoordinates,
} from '../utils/location';
import {
  MagnifyingGlassIcon,
  StarIcon,
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const CITY_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All India', icon: '🇮🇳', description: 'Show guests nationwide' },
  { value: 'blr', label: 'Bengaluru', icon: '📍', description: 'Indiranagar, Koramangala, Whitefield' },
  { value: 'mum', label: 'Mumbai', icon: '📍', description: 'Bandra, BKC, Colaba, Andheri' },
  { value: 'del', label: 'Delhi-NCR', icon: '📍', description: 'Connaught Place, Gurgaon, Noida' },
  { value: 'hyd', label: 'Hyderabad', icon: '📍', description: 'Hitec City, Jubilee Hills, Gachibowli' },
  { value: 'pun', label: 'Pune', icon: '📍', description: 'Koregaon Park, Kalyani Nagar, Baner' },
  { value: 'chn', label: 'Chennai', icon: '📍', description: 'Nungambakkam, Adyar' },
  { value: 'kol', label: 'Kolkata', icon: '📍', description: 'Park Street, Salt Lake' },
];

const GENDER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All Genders', icon: '👥', description: 'Show all guests' },
  { value: 'female', label: 'Women', icon: '👩', description: 'Female guests' },
  { value: 'male', label: 'Men', icon: '👨', description: 'Male guests' },
  { value: 'non-binary', label: 'Non-Binary', icon: '⚧', description: 'Non-binary guests' },
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

const Discovery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
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
  const [checkoutProviderName, setCheckoutProviderName] = useState<string>('Guest');

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

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Query live backend providers
  const { data: backendData, isLoading: isDiscoveryLoading } = useListProvidersQuery({
    q: q.trim() || undefined,
    minRate: minRate ? Number(minRate) : undefined,
    maxRate: maxRate ? Number(maxRate) : undefined,
    sortBy,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    radiusKm: Number(radiusKm) || 50,
    page: currentPage,
    pageSize: 24,
  });

  const totalCount = (backendData as any)?.totalCount ?? (Array.isArray(backendData) ? backendData.length : 24);
  const totalPages = (backendData as any)?.totalPages ?? Math.max(1, Math.ceil(totalCount / 24));
  const isPublicLimited = Boolean((backendData as any)?.isPublicLimited);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage > 1) {
        next.set('page', String(newPage));
      } else {
        next.delete('page');
      }
      return next;
    });
    const gridEl = document.getElementById('discovery-grid');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

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
        displayName: String(item.displayName || 'Verified Guest'),
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
        city: item.city || hub?.city || 'Bengaluru',
        area: item.area || hub?.area || 'Indiranagar',
        services: Array.isArray(item.services) ? item.services : [],
        lenses: Array.isArray(item.lenses) ? item.lenses : ['companions'],
      };
    });

    let list: any[] = [...liveItems];

    // Exclude logged-in user's own companion profile card
    if (user?.id) {
      const currentUserId = String(user.id).toLowerCase();
      list = list.filter((p: any) => {
        const provId = String(p.providerId || '').toLowerCase();
        const usrId = String(p.userId || '').toLowerCase();
        return provId !== currentUserId && usrId !== currentUserId;
      });
    }

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
                placeholder="Search by activity (e.g. Coffee Dates, Restaurant Visits, Shopping, Movies, Elena)..."
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

          {/* Quick Curated Services Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider font-mono shrink-0 mr-1">
              Services:
            </span>
            {[
              { label: 'All Services', query: '' },
              { label: '☕ Coffee Dates', query: 'Coffee' },
              { label: '🍽️ Restaurant Visits', query: 'Restaurant' },
              { label: '🛍️ Shopping', query: 'Shopping' },
              { label: '🎬 Movies', query: 'Movies' },
              { label: '🌄 Weekend Activities', query: 'Weekend' },
              { label: '🎟️ Special Events', query: 'Special Events' },
              { label: '🎾 Tennis & Fitness', query: 'Tennis' },
              { label: '🍛 Homestyle Cooking', query: 'Cooking' },
              { label: '📸 Photography', query: 'Photography' },
              { label: '👵 Senior Care', query: 'Senior Companion' },
            ].map((tag) => {
              const isSelected = (!tag.query && !q.trim()) || (tag.query && q.toLowerCase().includes(tag.query.toLowerCase()));
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    setQ(tag.query);
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      if (tag.query) next.set('q', tag.query);
                      else next.delete('q');
                      return next;
                    });
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shrink-0 cursor-pointer min-h-[36px] flex items-center gap-1 ${
                    isSelected
                      ? 'bg-accent text-accent-foreground border-accent shadow-2xs font-semibold'
                      : 'bg-muted/40 hover:bg-muted text-foreground/85 border-border/80 hover:border-accent/40'
                  }`}
                >
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Location Indicator Pill */}
          {userLocation && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-xs">
              <div className="flex items-center gap-1.5 text-accent font-medium">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span>
                  Filtering guests within <strong>{radiusKm} km</strong> of <strong>{userLocation.label}</strong>
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
            Showing <span className="font-semibold text-foreground">{displayProviders.length}</span>
            {totalCount > displayProviders.length && (
              <>
                {' '}of <span className="font-semibold text-foreground">{totalCount}</span>
              </>
            )}{' '}
            verified profiles
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
            {isAuthenticated && totalPages > 1 && (
              <>
                {' '}
                • <span className="font-medium text-muted-foreground">Page {currentPage} of {totalPages}</span>
              </>
            )}
          </p>
        </div>

        {isDiscoveryLoading ? (
          <div id="discovery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CompanionCardSkeleton key={i} />
            ))}
          </div>
        ) : displayProviders.length === 0 ? (
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
          <div id="discovery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-xl hover:border-accent/30 transition-all duration-200 cursor-pointer flex flex-col group focus:outline-hidden focus:ring-2 focus:ring-accent/50"
                >
                  {/* Luxury Portrait Frame with Touch-Friendly Carousel */}
                  <div className="relative h-72 overflow-hidden bg-muted">
                    <img
                      src={currentPhoto}
                      alt={`${provider.displayName} photo ${activeIdx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25 pointer-events-none" />

                    {/* Top Right Rate Badge */}
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <RateBadge
                        variant="card-badge"
                        rate={provider.hourlyRate}
                        isAuthenticated={isAuthenticated}
                        onAuthPrompt={() => setAuthPromptModal(true)}
                      />
                    </div>

                    {/* Top Left Verified Trust & Rating Badge */}
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
                      <div className="bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-[#C5A059] border border-[#C5A059]/30 flex items-center gap-1 shadow-sm font-mono">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{Number(provider.averageRating || 4.9).toFixed(1)}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-white text-[11px] font-sans font-medium">Verified Guest</span>
                      </div>
                    </div>

                    {/* Touch & Click Friendly Prev / Next Controls */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleStepPhoto(provider.providerId, images.length, -1, e)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all focus:outline-hidden backdrop-blur-xs"
                          aria-label={`Previous photo of ${provider.displayName}`}
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleStepPhoto(provider.providerId, images.length, 1, e)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all focus:outline-hidden backdrop-blur-xs"
                          aria-label={`Next photo of ${provider.displayName}`}
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>

                        {/* Centered Photo Indicator Dots */}
                        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                          {images.map((_: any, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => handleSelectPhoto(provider.providerId, idx, e)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                activeIdx === idx ? 'w-5 bg-white shadow-xs' : 'w-1.5 bg-white/50 hover:bg-white/80'
                              }`}
                              aria-label={`Go to photo ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Profile Details & 1-Click Action */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-display text-2xl font-normal text-foreground group-hover:text-accent transition-colors truncate">
                          {provider.displayName}
                        </h3>
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap tabular-nums">
                          {provider.distanceKm != null ? `${provider.distanceKm} km` : (provider.city || 'Central Hub')}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {provider.bio}
                      </p>

                      {/* Curated Outing Experiences / Specialties */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(provider.specialties || []).slice(0, 3).map((spec: string) => (
                          <span
                            key={spec}
                            className="px-2.5 py-1 rounded-xl bg-muted/60 text-[11px] font-medium text-foreground/80 border border-border/60"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground truncate">
                        <span>{provider.area ? `${provider.area}, ` : ''}{provider.city || 'Metro'}</span>
                      </div>

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
                        className="px-4 py-2.5 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm bg-accent hover:bg-accent-hover text-accent-foreground shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Book Outing &rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Public Discovery 24-Profile Limit Banner (Unauthenticated) */}
        {!isAuthenticated && (isPublicLimited || displayProviders.length > 0) && (
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-card via-card/90 to-accent/5 border border-border/80 shadow-xl text-center max-w-3xl mx-auto backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4 border border-accent/20">
              <SparklesIcon className="w-4 h-4" />
              Public Preview Limit (24 Profiles)
            </div>
            <h3 className="text-2xl font-bold font-serif text-foreground tracking-tight">
              Looking for more verified guests?
            </h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-xl mx-auto leading-relaxed">
              You are currently viewing a curated preview of 24 guests. Sign in or create a free account to unlock our entire community of verified guests, full photo galleries, and instant booking with escrow protection.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register?redirect=/discovery"
                className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-md shadow-accent/20"
              >
                Create Free Account & Explore All
              </Link>
              <Link
                to="/login?redirect=/discovery"
                className="px-6 py-2.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground font-semibold text-sm border border-border transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Numbered Pagination Bar (Authenticated) */}
        {isAuthenticated && totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              Showing page <strong className="text-foreground">{currentPage}</strong> of{' '}
              <strong className="text-foreground">{totalPages}</strong> ({totalCount} verified guests)
            </p>
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                &larr; Previous
              </button>

              {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-muted-foreground">
                    &hellip;
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(Number(p))}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-accent text-accent-foreground shadow-sm'
                        : 'border border-border bg-card text-foreground hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Single Canonical Booking Flow: Escrow Request Modal */}
        {selectedProviderForBooking && (
          <BookingRequestModal
            isOpen={Boolean(selectedProviderForBooking)}
            onClose={() => setSelectedProviderForBooking(null)}
            provider={selectedProviderForBooking}
            initialActivity={q || undefined}
            onProceedToPayment={async (bookingData: BookingRequirementData) => {
              let generatedOrderId = `order_${Date.now()}`;
              if (selectedProviderForBooking.providerId) {
                try {
                  const startD = new Date(`${bookingData.startDate}T${bookingData.startTime}:00`);
                  const endD = new Date(startD.getTime() + bookingData.durationHours * 3600000);
                  const result = await createBooking({
                    providerId: toProviderGuid(selectedProviderForBooking.providerId),
                    startTime: startD.toISOString(),
                    endTime: endD.toISOString(),
                    hourlyRate: selectedProviderForBooking.hourlyRate,
                    durationHours: bookingData.durationHours,
                    meetingAddress: bookingData.meetingVenue,
                    requirements: {
                      activity: bookingData.activity,
                      dressCode: bookingData.dressCode,
                      transportMode: bookingData.transportMode,
                      dietPreference: bookingData.dietPreference,
                      equipmentGear: bookingData.equipmentGear,
                      languagePreference: bookingData.languagePreference,
                      specialNotes: bookingData.specialNotes,
                    },
                  }).unwrap();
                  if (result?.orderId) {
                    generatedOrderId = result.orderId;
                  }
                } catch (err: any) {
                  console.error('Booking API error:', err);
                  alert(err?.data?.error || 'Failed to create booking. Please check guest availability.');
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
                To guarantee guest privacy and escrow protection, an authenticated account is required to inspect hourly rates and book meetups.
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
