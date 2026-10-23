import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useListProvidersQuery } from '../store/discoveryApi';
import { SelectDropdown, type DropdownOption } from '../components/ui/Dropdown';
import { BookingRequestModal, type BookingRequirementData } from '../components/booking/BookingRequestModal';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
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
} from '@heroicons/react/24/outline';
import type { PlatformLens } from '../types/platform';

interface SpecialtyOption {
  label: string;
  icon: string;
  lens: PlatformLens | 'all';
}

const LENS_DROPDOWN_OPTIONS: DropdownOption<PlatformLens | 'all'>[] = [
  { value: 'all', label: 'All Companions', icon: '✨', description: 'Show all verified companions & activities' },
  { value: 'companions', label: '🤝 Social & Events', icon: '🤝', description: 'Platonic outings, city tours, dining & concerts' },
  { value: 'wellness', label: '🏃 Active & Wellness', icon: '🏃', description: 'Tennis partners, hiking, yoga & gym buddies' },
  { value: 'pro_work', label: '🎨 Skills & Mentorship', icon: '🎨', description: 'Photography walks, language practice & creative craft' },
];

const COMPANION_CHIPS: SpecialtyOption[] = [
  { label: 'All Activities', icon: '✨', lens: 'companions' },
  { label: 'City Tour', icon: '🗺️', lens: 'companions' },
  { label: 'Fine Dining', icon: '🍷', lens: 'companions' },
  { label: 'Concert Buddy', icon: '🎸', lens: 'companions' },
  { label: 'Plus-One', icon: '🥂', lens: 'companions' },
  { label: 'Museum Walk', icon: '🎨', lens: 'companions' },
  { label: 'Cafe & Chat', icon: '☕', lens: 'companions' },
];

const WELLNESS_CHIPS: SpecialtyOption[] = [
  { label: 'All Wellness', icon: '🏃', lens: 'wellness' },
  { label: 'Tennis', icon: '🎾', lens: 'wellness' },
  { label: 'Hiking', icon: '🥾', lens: 'wellness' },
  { label: 'Yoga Partner', icon: '🧘', lens: 'wellness' },
  { label: 'Gym Spotter', icon: '🏋️', lens: 'wellness' },
  { label: 'Running Buddy', icon: '👟', lens: 'wellness' },
];

const PRO_CHIPS: SpecialtyOption[] = [
  { label: 'All Mentorship', icon: '🎨', lens: 'pro_work' },
  { label: 'Photography', icon: '📸', lens: 'pro_work' },
  { label: 'Language Practice', icon: '📚', lens: 'pro_work' },
  { label: 'Cooking & Baking', icon: '🍳', lens: 'pro_work' },
  { label: 'Music & DJing', icon: '🎵', lens: 'pro_work' },
  { label: 'Coding Mentorship', icon: '💻', lens: 'pro_work' },
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

// Rich Universal Profiles showcasing Display Name and 3 Profile Images
const CURATED_SAMPLE_PROVIDERS = [
  {
    providerId: 'sample-1',
    displayName: 'Elena Rostova',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    ],
    hourlyRate: 45,
    bio: 'Semi-pro tennis coach, contemporary art curator, and bilingual city companion.',
    specialties: ['Tennis', 'Yoga Partner', 'Museum Walk', 'Gym Spotter'],
    averageRating: 4.98,
    isVerified: true,
    trustScore: 99,
    distanceKm: 2.4,
    lenses: ['wellness', 'companions'] as PlatformLens[],
    services: ['Tennis Coaching (1-on-1)', 'Art Gallery Curator Walk'],
  },
  {
    providerId: 'sample-2',
    displayName: 'Marcus Vance',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    ],
    hourlyRate: 55,
    bio: 'Commercial photographer and street foodie guide. Available for photoshoots and culinary outings.',
    specialties: ['Photography', 'Cooking & Baking', 'City Tour'],
    averageRating: 4.95,
    isVerified: true,
    trustScore: 98,
    distanceKm: 3.8,
    lenses: ['pro_work', 'companions'] as PlatformLens[],
    services: ['Portrait Photoshoot Package', 'Street Food Crawl Host'],
  },
  {
    providerId: 'sample-3',
    displayName: 'Dr. Sophia Chen',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=600&q=80',
    ],
    hourlyRate: 40,
    bio: 'Cardiologist & classical violinist. Let us explore mountain trails, scenic viewpoints, or catch a live symphony.',
    specialties: ['Hiking', 'Yoga Partner', 'Violin', 'City Tour'],
    averageRating: 4.92,
    isVerified: true,
    trustScore: 97,
    distanceKm: 1.9,
    lenses: ['wellness', 'companions'] as PlatformLens[],
    services: ['Violin Performance / Lesson'],
  },
  {
    providerId: 'sample-4',
    displayName: 'Julian Alvarez',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
    ],
    hourlyRate: 50,
    bio: 'Certified salsa dance instructor & architectural history guide. Available for events & plus-one.',
    specialties: ['Dance', 'Plus-One', 'Event Host', 'Architecture'],
    averageRating: 4.88,
    isVerified: true,
    trustScore: 96,
    distanceKm: 4.5,
    lenses: ['pro_work', 'companions'] as PlatformLens[],
    services: ['Salsa Coaching', 'Wedding Plus-One'],
  },
  {
    providerId: 'sample-5',
    displayName: 'Aria Thorne',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
    ],
    hourlyRate: 48,
    bio: 'Software Architect & avid book enthusiast. Available for coffee chats, tech career mentoring, and museum visits.',
    specialties: ['Coding Mentorship', 'Language Practice', 'Museum Walk', 'Cafe & Chat'],
    averageRating: 4.97,
    isVerified: true,
    trustScore: 99,
    distanceKm: 2.1,
    lenses: ['pro_work', 'companions'] as PlatformLens[],
    services: ['System Design Mentorship'],
  },
  {
    providerId: 'sample-6',
    displayName: 'David Morales',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=600&q=80',
    ],
    hourlyRate: 60,
    bio: 'Sommelier and fitness trainer. Host for dining excursions and high-intensity workout coaching.',
    specialties: ['Fine Dining', 'Gym Spotter', 'Tennis'],
    averageRating: 4.94,
    isVerified: true,
    trustScore: 98,
    distanceKm: 5.2,
    lenses: ['wellness', 'companions'] as PlatformLens[],
    services: ['Wine Tasting Session', 'Strength Training (1-on-1)'],
  },
];

const Discovery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialLens = (searchParams.get('lens') as PlatformLens | 'all') || 'all';
  const initialQ = searchParams.get('q') || '';
  const initialSpecialty = searchParams.get('specialty') || 'All';

  const [activeLens, setActiveLens] = useState<PlatformLens | 'all'>(initialLens);
  const [q, setQ] = useState(initialQ);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [radiusKm, setRadiusKm] = useState('50');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Track active photo index per provider card for interactive 3-photo browsing
  const [activePhotoIndexByProvider, setActivePhotoIndexByProvider] = useState<Record<string, number>>({});

  // Booking Modal State
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<any | null>(null);
  const [activeCheckoutOrderId, setActiveCheckoutOrderId] = useState<string | null>(null);
  const [checkoutTotalAmount, setCheckoutTotalAmount] = useState<number>(0);

  useEffect(() => {
    const paramLens = searchParams.get('lens') as PlatformLens | 'all';
    const paramQ = searchParams.get('q');
    const paramSpec = searchParams.get('specialty');
    if (paramLens) setActiveLens(paramLens);
    if (paramQ !== null) setQ(paramQ);
    if (paramSpec !== null) setSpecialty(paramSpec);
  }, [searchParams]);

  // Query live backend providers
  const { data: backendData } = useListProvidersQuery({
    q: q.trim() || undefined,
    specialty: specialty !== 'All' ? specialty : undefined,
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
      return {
        providerId: item.providerId as string,
        displayName: (item.displayName || 'Verified Companion') as string,
        photoUrl: imgs[0],
        profileImages: imgs,
        hourlyRate: Number(item.hourlyRate || 1500),
        bio: (item.bio || '') as string,
        specialties: (item.specialties || []) as string[],
        averageRating: Number(item.averageRating || 5.0),
        isVerified: Boolean(item.isVerified),
        trustScore: Number(item.trustScore || 99),
        distanceKm: Number(item.distanceKm ?? 2.0),
        lenses: ['companions', 'wellness', 'pro_work'] as PlatformLens[],
        services: [] as string[],
      };
    });

    const existingIds = new Set(liveItems.map((i: any) => i.providerId));
    let list = [...liveItems, ...CURATED_SAMPLE_PROVIDERS.filter((s) => !existingIds.has(s.providerId))];

    // Filter by Active Lens
    if (activeLens !== 'all') {
      list = list.filter((p) => p.lenses.includes(activeLens));
    }

    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.displayName.toLowerCase().includes(lower) ||
          p.bio.toLowerCase().includes(lower) ||
          p.specialties.some((s: string) => s.toLowerCase().includes(lower))
      );
    }

    if (specialty !== 'All') {
      list = list.filter(
        (p) =>
          p.specialties.some((s: string) => s.toLowerCase().includes(specialty.toLowerCase()))
      );
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
  }, [backendData, activeLens, q, specialty, minRate, maxRate, verifiedOnly, sortBy]);

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

  const handleLensChange = (lens: PlatformLens | 'all') => {
    setActiveLens(lens);
    setSpecialty('All');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (lens === 'all') {
        next.delete('lens');
      } else {
        next.set('lens', lens);
      }
      next.delete('specialty');
      return next;
    });
  };

  const handleSpecialtySelect = (spec: string) => {
    const cleanSpec = spec.replace(/^[^\w\s]+/, '').trim();
    setSpecialty(cleanSpec);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cleanSpec === 'All' || cleanSpec.startsWith('All')) {
        next.delete('specialty');
      } else {
        next.set('specialty', cleanSpec);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setActiveLens('all');
    setQ('');
    setSpecialty('All');
    setMinRate('');
    setMaxRate('');
    setVerifiedOnly(false);
    setSortBy('rating');
    setSearchParams(new URLSearchParams());
  };

  // Determine active chip options based on selected lens
  const activeChips = useMemo(() => {
    if (activeLens === 'pro_work') return PRO_CHIPS;
    if (activeLens === 'companions') return COMPANION_CHIPS;
    if (activeLens === 'wellness') return WELLNESS_CHIPS;
    return [...PRO_CHIPS.slice(0, 4), ...COMPANION_CHIPS.slice(1, 4), ...WELLNESS_CHIPS.slice(1, 3)];
  }, [activeLens]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header & Lens Selector */}
      <section className="bg-card border-b border-border sticky top-16 z-20 backdrop-blur-md bg-card/95 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* 3-Lens Dropdown Selector */}
            <div className="w-full md:w-64">
              <SelectDropdown
                options={LENS_DROPDOWN_OPTIONS}
                value={activeLens}
                onChange={(val) => handleLensChange(val)}
                className="w-full text-xs font-semibold"
                triggerClassName="w-full bg-muted/70 hover:bg-muted border border-border/80 px-3 py-2 rounded-xl text-xs"
              />
            </div>

            {/* Search Input Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-80">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={
                    activeLens === 'pro_work'
                      ? 'Search display name or skills (e.g. Photography, Tennis)...'
                      : activeLens === 'wellness'
                      ? 'Search tennis, hiking, yoga, fitness buddies...'
                      : 'Search display name, activities, companions...'
                  }
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/60 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  showFilters
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-card border-border hover:border-accent text-muted-foreground'
                }`}
                title="Filters"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Contextual Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 text-xs scrollbar-none border-t border-border/50 mt-3">
            {activeChips.map((chip) => {
              const clean = chip.label.replace(/^[^\w\s]+/, '').trim();
              const isSelected =
                specialty.toLowerCase() === clean.toLowerCase() ||
                (specialty === 'All' && (clean === 'All Gigs' || clean === 'All Activities' || clean === 'All Matches'));

              return (
                <button
                  key={chip.label}
                  onClick={() => handleSpecialtySelect(chip.label)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 font-medium ${
                    isSelected
                      ? 'bg-accent/15 border border-accent text-accent font-semibold'
                      : 'bg-muted/40 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter Drawer / Accordion */}
      {showFilters && (
        <section className="bg-card border-b border-border py-4 animate-in fade-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Sort Results</label>
                <SelectDropdown options={SORT_OPTIONS} value={sortBy} onChange={(val) => setSortBy(val)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Search Distance</label>
                <SelectDropdown options={RADIUS_OPTIONS} value={radiusKm} onChange={(val) => setRadiusKm(val)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Hourly Rate Range (₹)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs placeholder:text-muted-foreground focus:outline-none"
                  />
                  <span className="text-muted-foreground text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer pb-2 text-xs font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-accent focus:ring-accent"
                  />
                  <span>ID Verified Only</span>
                </label>
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-accent hover:underline flex items-center gap-1"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                  <span>Reset All</span>
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
            {activeLens !== 'all' && (
              <>
                {' '}
                in <span className="font-medium text-accent">{LENS_DROPDOWN_OPTIONS.find((t) => t.value === activeLens)?.label}</span>
              </>
            )}
          </p>
        </div>

        {displayProviders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border max-w-xl mx-auto p-8">
            <SparklesIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No matching profiles found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Try adjusting your lens, search terms, or resetting active filters.
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
                  className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col group focus:outline-none focus:ring-2 focus:ring-accent/50"
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
                    <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-foreground border border-border shadow-xs">
                      ₹{provider.hourlyRate}/hr
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
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                          aria-label={`Previous photo of ${provider.displayName}`}
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleStepPhoto(provider.providerId, images.length, 1, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                          aria-label={`Next photo of ${provider.displayName}`}
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Bottom Bar: Lens Badges (Left) & 3-Photo Thumbnail Switcher (Right) */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {provider.lenses.includes('pro_work') && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-900/80 backdrop-blur-md text-[10px] font-semibold text-sky-200 border border-sky-400/30">
                            💼 Skilled Pro
                          </span>
                        )}
                        {provider.lenses.includes('wellness') && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-900/80 backdrop-blur-md text-[10px] font-semibold text-teal-200 border border-teal-400/30">
                            🏃 Active & Wellness
                          </span>
                        )}
                        {provider.lenses.includes('companions') && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-900/80 backdrop-blur-md text-[10px] font-semibold text-emerald-200 border border-emerald-400/30">
                            🤝 Companion
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
                        {provider.specialties.map((spec: string) => (
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
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        {provider.distanceKm} km away
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProviderForBooking(provider);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent hover:text-accent-foreground text-accent font-semibold transition-all shadow-2xs"
                      >
                        Book with Escrow &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Interactive Booking Request Modal */}
        {selectedProviderForBooking && (
          <BookingRequestModal
            isOpen={Boolean(selectedProviderForBooking)}
            onClose={() => setSelectedProviderForBooking(null)}
            provider={selectedProviderForBooking}
            onProceedToPayment={(bookingData: BookingRequirementData) => {
              const generatedOrderId = `order_${Date.now()}`;
              setCheckoutTotalAmount(bookingData.totalAmount);
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
            providerName="Companion"
            isOpen={Boolean(activeCheckoutOrderId)}
            onClose={() => setActiveCheckoutOrderId(null)}
            onSuccess={() => {
              setActiveCheckoutOrderId(null);
              navigate('/bookings');
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Discovery;
