import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Input,
  Button,
  ToggleButton,
  Badge,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  MessageBar,
  MessageBarBody,
  Spinner,
} from '@fluentui/react-components';
import {
  Search20Regular,
  Star16Filled,
  Location16Regular,
  Filter16Regular,
  Dismiss16Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  LockClosed16Regular,
  ShieldCheckmark24Regular,
  ShieldCheckmark16Regular,
  People24Regular,
  CheckmarkStarburst16Filled,
} from '@fluentui/react-icons';
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

const CITY_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All India', description: 'Show guests nationwide' },
  { value: 'blr', label: 'Bengaluru', description: 'Indiranagar, Koramangala, Whitefield' },
  { value: 'mum', label: 'Mumbai', description: 'Bandra, BKC, Colaba, Andheri' },
  { value: 'del', label: 'Delhi-NCR', description: 'Connaught Place, Gurgaon, Noida' },
  { value: 'hyd', label: 'Hyderabad', description: 'Hitec City, Jubilee Hills, Gachibowli' },
  { value: 'pun', label: 'Pune', description: 'Koregaon Park, Kalyani Nagar, Baner' },
  { value: 'chn', label: 'Chennai', description: 'Nungambakkam, Adyar' },
  { value: 'kol', label: 'Kolkata', description: 'Park Street, Salt Lake' },
];

const GENDER_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'All genders', description: 'Show all guests' },
  { value: 'female', label: 'Women', description: 'Female guests' },
  { value: 'male', label: 'Men', description: 'Male guests' },
  { value: 'non-binary', label: 'Non-binary', description: 'Non-binary guests' },
];

const SORT_OPTIONS: DropdownOption[] = [
  { value: 'rating', label: 'Top rated', description: 'Highest review average' },
  { value: 'distance', label: 'Nearest first', description: 'Closest to your coordinates' },
  { value: 'price', label: 'Price: Low to high', description: 'Budget friendly rates' },
  { value: 'newest', label: 'Newest members', description: 'Recently active members' },
];

const RADIUS_OPTIONS: DropdownOption[] = [
  { value: '10', label: 'Within 10 km', description: 'Immediate local area' },
  { value: '25', label: 'Within 25 km', description: 'Metro city radius' },
  { value: '50', label: 'Within 50 km', description: 'Greater metropolitan area' },
  { value: '100', label: 'Within 100 km', description: 'Extended regional area' },
];

const SERVICE_TAGS = [
  { label: 'All services', query: '' },
  { label: 'Coffee dates', query: 'Coffee' },
  { label: 'Restaurant visits', query: 'Restaurant' },
  { label: 'Shopping', query: 'Shopping' },
  { label: 'Movies', query: 'Movies' },
  { label: 'Weekend activities', query: 'Weekend' },
  { label: 'Special events', query: 'Special Events' },
  { label: 'Tennis & fitness', query: 'Tennis' },
  { label: 'Homestyle cooking', query: 'Cooking' },
  { label: 'Photography', query: 'Photography' },
  { label: 'Senior care', query: 'Senior Companion' },
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

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; label: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [activePhotoIndexByProvider, setActivePhotoIndexByProvider] = useState<Record<string, number>>({});

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

    if (user?.id) {
      const currentUserId = String(user.id).toLowerCase();
      list = list.filter((p: any) => {
        const provId = String(p.providerId || '').toLowerCase();
        const usrId = String(p.userId || '').toLowerCase();
        return provId !== currentUserId && usrId !== currentUserId;
      });
    }

    try {
      const rawRejected = localStorage.getItem('cue_rejected_provider_ids');
      if (rawRejected) {
        const rejectedIds = new Set(JSON.parse(rawRejected));
        list = list.filter((p: any) => !rejectedIds.has(p.providerId) && !rejectedIds.has(p.userId));
      }
    } catch {}

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

    if (genderFilter !== 'all') {
      list = list.filter((p) => {
        const g = (p.gender || '').toLowerCase();
        if (genderFilter === 'female') return g === 'female' || g === 'woman';
        if (genderFilter === 'male') return g === 'male' || g === 'man';
        if (genderFilter === 'non-binary') return g === 'non-binary' || g === 'other';
        return true;
      });
    }

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
  }, [backendData, user?.id, userLocation, radiusKm, genderFilter, q, minRate, maxRate, sortBy]);

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

  const isAdmin = Boolean(
    isAuthenticated && (user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local')
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Administrator Context Continuity Ribbon */}
      {isAdmin && (
        <aside aria-label="Administrator Preview Ribbon" className="bg-accent text-accent-foreground text-caption1 py-2 px-4 shadow-xs border-b border-border sticky top-14 z-30 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-accent-foreground shrink-0" />
              <span>Administrator preview</span>
              <span className="hidden sm:inline opacity-80 font-normal">• Browsing live public directory as host</span>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-card text-foreground font-semibold text-caption1 transition-colors border border-border shrink-0"
            >
              <ShieldCheckmark16Regular className="text-brand-fg" />
              <span>Admin</span>
            </Link>
          </div>
        </aside>
      )}

      {/* Top Header & Fluent Filter Bar */}
      <section className={`bg-card border-b border-border sticky ${isAdmin ? 'top-23' : 'top-14'} z-20 acrylic transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
          {/* Main Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* Primary Unified Search Bar */}
            <div className="flex-1 min-w-0">
              <Input
                size="medium"
                value={q}
                onChange={(_, data) => {
                  const val = data.value;
                  setQ(val);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (val.trim()) next.set('q', val.trim());
                    else next.delete('q');
                    return next;
                  });
                }}
                placeholder="Search by activity, companion name, or neighborhood (e.g. Coffee dates, Indiranagar)..."
                contentBefore={<Search20Regular className="text-muted-foreground" />}
                contentAfter={
                  q ? (
                    <Button
                      appearance="subtle"
                      size="small"
                      aria-label="Clear search"
                      icon={<Dismiss16Regular />}
                      onClick={() => {
                        setQ('');
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev);
                          next.delete('q');
                          return next;
                        });
                      }}
                    />
                  ) : undefined
                }
                className="w-full h-9"
              />
            </div>

            {/* Quick Filter Strip: City, GPS, Gender, and Filters Drawer Toggle */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              {/* City Dropdown */}
              <div className="w-36 sm:w-40 shrink-0">
                <SelectDropdown
                  options={CITY_OPTIONS}
                  value={selectedCity === 'gps' ? 'all' : selectedCity}
                  onChange={(val) => handleCityChange(val)}
                  size="md"
                  className="w-full"
                  triggerClassName="h-9"
                />
              </div>

              {/* GPS Near Me Button */}
              <ToggleButton
                size="medium"
                checked={selectedCity === 'gps'}
                appearance={selectedCity === 'gps' ? 'primary' : 'outline'}
                onClick={handleNearMeGps}
                disabled={isLocating}
                icon={isLocating ? <Spinner size="tiny" /> : <Location16Regular />}
                title="Use Current Device Location (GPS)"
                className="h-9 shrink-0"
              >
                Near me
              </ToggleButton>

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
                  size="md"
                  className="w-full"
                  triggerClassName="h-9"
                />
              </div>

              {/* Advanced Filters Button */}
              <ToggleButton
                size="medium"
                checked={showFilters || activeFilterCount > 0}
                appearance={showFilters || activeFilterCount > 0 ? 'primary' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                icon={<Filter16Regular />}
                title="More Filters"
                className="h-9 shrink-0"
              >
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge appearance="filled" color="brand" size="small" className="ml-1 tabular">
                    {activeFilterCount}
                  </Badge>
                )}
              </ToggleButton>
            </div>
          </div>

          {/* Quick Curated Services Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-caption1">
            <span className="text-caption1 text-muted-foreground font-semibold shrink-0 mr-1">
              Services:
            </span>
            {SERVICE_TAGS.map((tag) => {
              const isSelected = (!tag.query && !q.trim()) || Boolean(tag.query && q.toLowerCase().includes(tag.query.toLowerCase()));
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
                  className={`px-3 py-1 rounded-full text-caption1 font-semibold transition-colors shrink-0 cursor-pointer border ${
                    isSelected
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-muted/70 hover:bg-subtle text-foreground border-border'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>

          {/* Active Location Indicator Pill */}
          {userLocation && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-accent-light border border-border text-caption1">
              <div className="flex items-center gap-1.5 text-brand-fg font-semibold tabular">
                <Location16Regular />
                <span>
                  Filtering guests within <strong>{radiusKm} km</strong> of <strong>{userLocation.label}</strong>
                </span>
              </div>
              <Button
                appearance="subtle"
                size="small"
                onClick={() => {
                  setUserLocation(null);
                  setSelectedCity('all');
                }}
              >
                Clear location
              </Button>
            </div>
          )}

          {locationError && (
            <MessageBar intent="error">
              <MessageBarBody>{locationError}</MessageBarBody>
            </MessageBar>
          )}
        </div>
      </section>

      {/* Filter Drawer */}
      {showFilters && (
        <section className="bg-card border-b border-border py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-caption1 font-semibold text-muted-foreground mb-1.5">Sort results</label>
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
                <label className="block text-caption1 font-semibold text-muted-foreground mb-1.5">Search distance</label>
                <SelectDropdown options={RADIUS_OPTIONS} value={radiusKm} onChange={(val) => setRadiusKm(val)} />
              </div>

              <div>
                <label className="block text-caption1 font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
                  <span>Hourly rate range (₹ INR)</span>
                  {!isAuthenticated && (
                    <span className="text-caption2 text-brand-fg flex items-center gap-1 font-semibold">
                      <LockClosed16Regular /> Login required
                    </span>
                  )}
                </label>
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min ₹"
                      value={minRate}
                      onChange={(_, data) => setMinRate(data.value)}
                      className="w-full font-mono tabular"
                    />
                    <span className="text-muted-foreground text-caption1">–</span>
                    <Input
                      type="number"
                      placeholder="Max ₹"
                      value={maxRate}
                      onChange={(_, data) => setMaxRate(data.value)}
                      className="w-full font-mono tabular"
                    />
                  </div>
                ) : (
                  <Button
                    appearance="outline"
                    icon={<LockClosed16Regular className="text-brand-fg" />}
                    onClick={() => setAuthPromptModal(true)}
                    className="w-full min-h-11 justify-between"
                  >
                    <span>Unlock rates</span>
                  </Button>
                )}
              </div>

              <div className="flex justify-end pb-1">
                <Button
                  appearance="outline"
                  icon={<Dismiss16Regular />}
                  onClick={handleClearFilters}
                  className="min-h-11"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Results Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-body1 text-muted-foreground tabular">
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
                for <span className="font-semibold text-brand-fg">&ldquo;{q}&rdquo;</span>
              </>
            )}
            {genderFilter !== 'all' && (
              <>
                {' '}
                • <span className="font-semibold text-foreground">{GENDER_OPTIONS.find((g) => g.value === genderFilter)?.label || genderFilter}</span>
              </>
            )}
            {isAuthenticated && totalPages > 1 && (
              <>
                {' '}
                • <span className="font-semibold text-muted-foreground">Page {currentPage} of {totalPages}</span>
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
          <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-xl mx-auto p-8 shadow-sm">
            <People24Regular className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-subtitle1 font-semibold text-foreground mb-2">No matching profiles found</h3>
            <p className="text-body1 text-muted-foreground mb-6">
              Try adjusting your search terms, gender filter, or resetting active filters.
            </p>
            <Button
              appearance="primary"
              size="large"
              onClick={handleClearFilters}
              className="min-h-11"
            >
              Reset filters
            </Button>
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
                <article
                  key={provider.providerId}
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile for ${provider.displayName}`}
                  onClick={() => navigate(`/provider/${provider.providerId}`)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/provider/${provider.providerId}`);
                    }
                  }}
                  className="group fluent-card card-hover-effect overflow-hidden cursor-pointer flex flex-col justify-between"
                >
                  {/* 4:3 Companion Portrait Preview with Hover Carousel */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted border-b border-border">
                    <img
                      src={currentPhoto}
                      alt={`${provider.displayName} photo ${activeIdx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />

                    {/* Top Left Verified Trust Pill */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-trust-light text-trust border border-trust-border text-caption1 font-semibold shadow-xs">
                        <CheckmarkStarburst16Filled className="shrink-0" />
                        <span>Verified</span>
                      </span>
                    </div>

                    {/* Subtle Prev / Next Controls on Hover */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleStepPhoto(provider.providerId, images.length, -1, e)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/90 hover:bg-card text-foreground border border-border shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
                          aria-label={`Previous photo of ${provider.displayName}`}
                        >
                          <ChevronLeft20Regular />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleStepPhoto(provider.providerId, images.length, 1, e)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card/90 hover:bg-card text-foreground border border-border shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
                          aria-label={`Next photo of ${provider.displayName}`}
                        >
                          <ChevronRight20Regular />
                        </button>

                        {/* Centered Photo Indicator Dots */}
                        <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
                          {images.map((_: any, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => handleSelectPhoto(provider.providerId, idx, e)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                activeIdx === idx ? 'w-5 bg-card shadow-xs' : 'w-1.5 bg-card/65 hover:bg-card'
                              }`}
                              aria-label={`Go to photo ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      {/* Title & Rating Row */}
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-subtitle2 font-semibold text-foreground group-hover:text-brand-fg transition-colors truncate">
                          {provider.displayName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground text-caption1 font-semibold tabular shrink-0">
                          <Star16Filled className="text-trust" />
                          <span>{Number(provider.averageRating || 4.9).toFixed(1)}</span>
                        </span>
                      </div>

                      {/* Single Clean Location Subtitle */}
                      <div className="flex items-center gap-1 text-caption1 text-muted-foreground truncate">
                        <Location16Regular className="shrink-0" />
                        <span className="truncate">
                          {provider.area ? `${provider.area}, ` : ''}{provider.city || 'Metro'}
                        </span>
                        {provider.distanceKm != null && (
                          <span className="tabular font-semibold text-foreground shrink-0">
                            • {provider.distanceKm} km
                          </span>
                        )}
                      </div>

                      {/* Bio */}
                      <p className="text-body1 text-muted-foreground line-clamp-2 pt-0.5">
                        {provider.bio}
                      </p>

                      {/* Curated Outing Experiences / Specialties */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(provider.specialties || []).slice(0, 3).map((spec: string) => (
                          <span
                            key={spec}
                            className="px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border text-caption1 truncate max-w-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 mt-1 border-t border-border flex items-center justify-between gap-2">
                      <RateBadge
                        variant="row-item"
                        rate={provider.hourlyRate}
                        isAuthenticated={isAuthenticated}
                        onAuthPrompt={() => setAuthPromptModal(true)}
                      />

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          appearance="outline"
                          size="medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/provider/${provider.providerId}`);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          appearance="primary"
                          size="medium"
                          icon={<ShieldCheckmark16Regular />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isAuthenticated) {
                              setAuthPromptModal(true);
                              return;
                            }
                            setSelectedProviderForBooking(provider);
                          }}
                        >
                          Reserve
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Public Discovery 24-Profile Limit Banner (Unauthenticated) */}
        {!isAuthenticated && (isPublicLimited || displayProviders.length > 0) && (
          <div className="mt-12 p-8 rounded-2xl bg-card border border-border shadow-md text-center max-w-3xl mx-auto space-y-4">
            <Badge appearance="tint" color="brand" className="tabular">
              Public preview limit (24 profiles)
            </Badge>
            <h3 className="text-title3 font-semibold text-foreground">
              Looking for more verified guests?
            </h3>
            <p className="text-muted-foreground text-body1 max-w-xl mx-auto">
              You are currently viewing a curated preview of 24 guests. Sign in or create a free account to unlock our entire community of verified guests, full photo galleries, and instant booking with escrow protection.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                appearance="primary"
                size="large"
                onClick={() => navigate('/register?redirect=/discovery')}
                className="min-h-11"
              >
                Join Cue
              </Button>
              <Button
                appearance="secondary"
                size="large"
                onClick={() => navigate('/login?redirect=/discovery')}
                className="min-h-11"
              >
                Sign in
              </Button>
            </div>
          </div>
        )}

        {/* Numbered Pagination Bar (Authenticated) */}
        {isAuthenticated && totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
            <p className="text-caption1 text-muted-foreground order-2 sm:order-1 tabular">
              Showing page <strong className="text-foreground">{currentPage}</strong> of{' '}
              <strong className="text-foreground">{totalPages}</strong> ({totalCount} verified guests)
            </p>
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <Button
                appearance="outline"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ← Previous
              </Button>

              {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-caption1 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <ToggleButton
                    key={p}
                    size="small"
                    checked={currentPage === p}
                    appearance={currentPage === p ? 'primary' : 'outline'}
                    onClick={() => handlePageChange(Number(p))}
                    className="tabular"
                  >
                    {p}
                  </ToggleButton>
                )
              )}

              <Button
                appearance="outline"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next →
              </Button>
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
        <Dialog open={authPromptModal} onOpenChange={(_, data) => !data.open && setAuthPromptModal(false)}>
          <DialogSurface className="max-w-md w-full rounded-2xl bg-card border border-border p-6 text-center">
            <DialogBody>
              <DialogTitle>
                <div className="w-14 h-14 rounded-full bg-accent-light text-brand-fg flex items-center justify-center mx-auto mb-2">
                  <ShieldCheckmark24Regular />
                </div>
                <span className="text-subtitle1 font-semibold text-foreground block text-center">
                  Sign in to unlock pricing & reserve
                </span>
              </DialogTitle>
              <DialogContent className="pt-2 text-center">
                <p className="text-body1 text-muted-foreground">
                  To guarantee guest privacy and escrow protection, an authenticated account is required to inspect hourly rates and book meetups.
                </p>
              </DialogContent>
              <DialogActions className="pt-4 flex flex-col gap-2">
                <Button
                  appearance="primary"
                  size="large"
                  onClick={() => navigate('/register')}
                  className="w-full min-h-11"
                >
                  Join Cue
                </Button>
                <Button
                  appearance="secondary"
                  size="large"
                  onClick={() => navigate('/login')}
                  className="w-full min-h-11"
                >
                  Sign in
                </Button>
                <Button
                  appearance="subtle"
                  onClick={() => setAuthPromptModal(false)}
                  className="w-full min-h-11"
                >
                  Cancel
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </main>
    </div>
  );
};

export default Discovery;
