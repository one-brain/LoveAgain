import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { RateBadge } from '../components/ui/RateBadge';
import { usePretextHeight } from '../hooks/usePretext';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CheckCircleIcon,
  HomeModernIcon,
  KeyIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { PlatformLens } from '../types/platform';

interface LensCard {
  id: PlatformLens;
  name: string;
  tagline: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgGradient: string;
  popularItems: string[];
}

const PILLAR_CARDS: LensCard[] = [
  {
    id: 'companions',
    name: 'Cue Social & Events',
    tagline: 'Connect with verified guests for coffee dates, restaurant visits, shopping, movies, weekend activities, and special events.',
    badge: '100% Platonic & Escrowed',
    icon: UserGroupIcon,
    accentColor: 'text-emerald-500',
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    popularItems: ['Coffee Dates', 'Restaurant Visits', 'Shopping Outings', 'Movie Dates', 'Weekend Activities', 'Special Events'],
  },
  {
    id: 'wellness',
    name: 'Cue Active & Fitness',
    tagline: 'Partner up for weekend tennis matches, gym spotting, morning lake runs, hiking trails, and mindfulness yoga sessions.',
    badge: 'Fitness & Outdoor Buddies',
    icon: SparklesIcon,
    accentColor: 'text-amber-500',
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    popularItems: ['Tennis Partner', 'Hiking Trails', 'Gym Spotter', 'Morning Run', 'Yoga Buddy'],
  },
  {
    id: 'pro_work',
    name: 'Cue Skills & Creative Walks',
    tagline: 'Invite guest mentors for golden-hour street photography walks, foreign language practice, and hobby masterclasses.',
    badge: '1-on-1 Skill Sharing',
    icon: BriefcaseIcon,
    accentColor: 'text-sky-500',
    bgGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    popularItems: ['Photography Walk', 'Language Practice', 'Culinary Walk', 'Creative Hobbies'],
  },
  {
    id: 'lifestyle',
    name: 'Cue Domestic & Lifestyle',
    tagline: 'Find regional homestyle cooks, festive floral & pooja artists, patient senior escorts, and local bazaar shopping guides.',
    badge: 'Ghar Ka Khana & Care',
    icon: HomeModernIcon,
    accentColor: 'text-rose-500',
    bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
    popularItems: ['Homestyle Cooking', 'Festival & Pooja Prep', 'Senior Companion', 'Mandi Guide', 'Saree Styling'],
  },
];

const METROS = [
  { name: 'Bengaluru', count: '28+ guests' },
  { name: 'Mumbai', count: '24+ guests' },
  { name: 'Delhi-NCR', count: '18+ guests' },
  { name: 'Hyderabad', count: '14+ guests' },
  { name: 'Chennai', count: '8+ guests' },
  { name: 'Pune', count: '6+ guests' },
  { name: 'Kolkata', count: '6+ guests' },
];

const FEATURED_PROFILES = [
  {
    id: '158b9ff7-19de-49ce-a57c-b37738591285',
    name: 'Elena Rostova',
    headline: 'Semi-Pro Tennis Player & Art Gallery Plus-One',
    city: 'Bengaluru',
    area: 'Indiranagar',
    tags: ['Tennis Coaching', 'Art Gallery', 'City Tour'],
    rate: 1500,
    rating: 4.98,
    reviews: 64,
    distance: 'Indiranagar · 2.4 km',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    trustScore: 99,
  },
  {
    id: '6d187ed5-aff0-4fa3-856c-9beb89264b15',
    name: 'Marcus Vance',
    headline: 'Commercial Photographer & Street Foodie Guide',
    city: 'Bengaluru',
    area: 'Koramangala',
    tags: ['Photography Gigs', 'Culinary Walk', 'Italian Cooking'],
    rate: 1800,
    rating: 4.95,
    reviews: 82,
    distance: 'Koramangala · 3.8 km',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    trustScore: 98,
  },
  {
    id: '010e1920-fdf6-4419-85c1-95d284c6730d',
    name: 'Dr. Sophia Chen',
    headline: 'Cardiologist · Classical Violinist & Nature Trail Guide',
    city: 'Bengaluru',
    area: 'Lavelle Road',
    tags: ['Hiking Partner', 'Violin Music', 'City Tour'],
    rate: 1200,
    rating: 4.92,
    reviews: 47,
    distance: 'Lavelle Road · 1.9 km',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    trustScore: 97,
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Ananya Sharma',
    headline: 'Regional Homestyle Cook & Festive Floral Decor Artist',
    city: 'Bengaluru',
    area: 'Jayanagar',
    tags: ['Regional Homestyle Cook', 'Festival & Pooja Decor', 'Gardening'],
    rate: 1200,
    rating: 4.96,
    reviews: 58,
    distance: 'Jayanagar · 3.1 km',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    trustScore: 99,
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Col. Rajeshwar Rao (Retd.)',
    headline: 'Senior Companion, Temple Escort & Society Chess Partner',
    city: 'Bengaluru',
    area: 'Malleswaram',
    tags: ['Senior Companion', 'Temple Escort', 'Carrom & Chess'],
    rate: 1000,
    rating: 4.99,
    reviews: 73,
    distance: 'Malleswaram · 2.8 km',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    trustScore: 100,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Naveen Kumar',
    headline: 'Sanskrit & Kannada Scholar, Heritage Temple Walk Guide',
    city: 'Bengaluru',
    area: 'Basavanagudi',
    tags: ['Heritage Walk', 'Language Practice', 'Cultural Tours'],
    rate: 1100,
    rating: 4.94,
    reviews: 39,
    distance: 'Basavanagudi · 4.2 km',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    trustScore: 98,
  },
];

const FAQS = [
  {
    question: 'Is Cue a dating or romance service?',
    answer: 'No. Cue is strictly a platonic experience platform where Hosts invite verified Guests for shared activities. All outings must take place in public venues (cafes, courts, galleries, markets), and are governed by strict safety rules. Any solicitation or inappropriate conduct results in immediate account termination and forfeiture of escrow funds.',
  },
  {
    question: 'How does the Escrow Payment Guarantee protect Hosts and Guests?',
    answer: 'When a Host reserves an outing, the payment is held securely in an isolated platform escrow ledger. The Guest does not receive the funds until the outing is complete and both parties verify check-in using a private PIN. If the Guest cancels or fails to show up, 100% of the deposit is instantly refunded to the Host wallet.',
  },
  {
    question: 'How do you verify Guests and ensure safety?',
    answer: 'Every Guest applicant must submit Government ID proof (Aadhaar, Passport, or Driving License) along with a live camera selfie verification audited by our compliance operations team. In addition, every active outing is protected with an in-app Emergency SOS beacon that dispatches geolocation coordinates to our 24/7 trust & safety dispatch.',
  },
  {
    question: 'Can I cancel an outing reservation?',
    answer: 'Yes. You can cancel any reservation free of charge before the agreed start time directly from your outings dashboard. Funds held in escrow are instantly credited back to your available wallet balance with zero penalty.',
  },
  {
    question: 'Can outings take place at private residences or hotels?',
    answer: 'No. Platform safety policy requires all first-time outings to occur in public, commercial, or licensed sports/arts venues. Private residential visits are prohibited for mutual safety.',
  },
  {
    question: 'How do Guest earnings and withdrawals work?',
    answer: 'Guests set their own transparent hourly rates and receive 85% of each outing fee (15% platform escrow commission). Cleared balances can be withdrawn instantly via UPI (GPay, PhonePe, Paytm, or BHIM) with zero withdrawal fees.',
  },
];

// Pretext-native category card with dynamic text reflow measurement
const PretextPillarCard: React.FC<{
  card: LensCard;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ card, isSelected, onSelect }) => {
  const Icon = card.icon;
  const { containerRef, height } = usePretextHeight(
    card.tagline,
    '14px Inter, sans-serif',
    20
  );

  return (
    <div
      onClick={onSelect}
      className={`relative p-6 sm:p-7 rounded-3xl border bg-card/90 backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl ${
        isSelected
          ? 'border-accent shadow-md ring-2 ring-accent/30'
          : 'border-border/80 hover:border-accent/50'
      }`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${card.bgGradient} blur-2xl pointer-events-none -z-10`} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <Icon className={`w-6 h-6 ${card.accentColor}`} />
          </div>
          <span className="px-2.5 py-1 rounded-full bg-muted/80 text-[11px] font-semibold text-muted-foreground border border-border/40">
            {card.badge}
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground font-serif mb-2 group-hover:text-accent transition-colors">
          {card.name}
        </h3>

        {/* Pretext-controlled reflow paragraph */}
        <div
          ref={containerRef}
          style={{ height: height ? `${height}px` : 'auto' }}
          className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 overflow-hidden transition-[height] duration-150"
        >
          <p className="text-pretty">{card.tagline}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-border/60">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.popularItems.map((item) => (
            <span
              key={item}
              className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80 border border-border/40"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-accent">
          <span>Explore companions</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local');
  const hostFirstName = user?.firstName || 'Host';
  const [selectedLens, setSelectedLens] = useState<PlatformLens>('companions');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(`/discovery${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Authenticated Welcome Bar */}
      {isAuthenticated && !isAdmin && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mb-8 pt-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Welcome back, {hostFirstName}! 👋
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified Host
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Browse verified guests for upcoming outings or view your hosted outing timeline.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/bookings"
                className="px-3.5 py-2 rounded-xl bg-muted/80 hover:bg-muted text-foreground text-xs font-semibold border border-border/80 transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5"
              >
                <ClockIcon className="w-3.5 h-3.5 text-accent" />
                <span>My Outings</span>
              </Link>
              <Link
                to="/discovery"
                className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold shadow-xs hover:bg-accent-hover transition-all"
              >
                <span>Find Guests &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Hero Section (Persuade Billboard: One Offer, One Primary CTA, Zero CLS) */}
      <section className="relative overflow-hidden pt-10 pb-12 sm:pt-20 sm:pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
            <SparklesIcon className="w-4 h-4" />
            <span>Verified Social Experiences Across India</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-serif max-w-4xl mx-auto leading-[1.12] text-balance">
            Meet Verified Guests for <span className="text-gradient">Coffee, Dining & Activities</span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            As a Host, connect with verified local guests for coffee dates, restaurant visits, shopping outings, movies, weekend activities, and special events. 100% platonic, protected by platform escrow, and verified with government ID.
          </p>

          {/* Primary Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto p-2 bg-card rounded-2xl border border-border shadow-xl flex flex-col sm:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-accent/40"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try 'Coffee date in Indiranagar', 'Restaurant visit', 'Movie outing', 'Shopping'..."
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm sm:text-base py-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm transition-all shadow-sm hover:scale-[1.02] flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Curated Service Quick-Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {[
              { label: '☕ Coffee Dates', q: 'Coffee' },
              { label: '🍽️ Restaurant Visits', q: 'Restaurant' },
              { label: '🛍️ Shopping Companion', q: 'Shopping' },
              { label: '🎬 Movie Outings', q: 'Movies' },
              { label: '🌄 Weekend Activities', q: 'Weekend' },
              { label: '🎟️ Special Events', q: 'Special Events' },
            ].map((srv) => (
              <button
                key={srv.label}
                type="button"
                onClick={() => navigate(`/discovery?q=${encodeURIComponent(srv.q)}`)}
                className="px-3 py-1.5 rounded-full bg-card hover:bg-accent/10 border border-border/80 hover:border-accent text-xs font-medium text-foreground transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span>{srv.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Metro Filter Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Popular Metros:</span>
            {METROS.map((metro) => (
              <button
                key={metro.name}
                type="button"
                onClick={() => navigate(`/discovery?city=${encodeURIComponent(metro.name)}`)}
                className="px-3 py-1 rounded-full bg-card hover:bg-accent/10 border border-border/70 hover:border-accent/40 text-xs text-foreground/90 font-medium transition-all shadow-2xs flex items-center gap-1.5"
              >
                <span>{metro.name}</span>
                <span className="text-[10px] text-muted-foreground">({metro.count.split(' ')[0]})</span>
              </button>
            ))}
          </div>

          {/* Pretext-Native Experience Pillar Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {PILLAR_CARDS.map((card) => (
              <PretextPillarCard
                key={card.id}
                card={card}
                isSelected={selectedLens === card.id}
                onSelect={() => {
                  setSelectedLens(card.id);
                  navigate(`/discovery?q=${encodeURIComponent(card.name)}`);
                }}
              />
            ))}
          </div>

          {/* Trust Strip */}
          <div className="mt-12 pt-8 border-t border-border/60 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono tabular-nums">100%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Government ID & Selfie KYC</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground font-sans tracking-tight">Escrow Hold</div>
              <div className="text-xs text-muted-foreground mt-0.5">Zero Pre-payment Risk</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground font-sans tracking-tight">4-Digit PIN</div>
              <div className="text-xs text-muted-foreground mt-0.5">In-Person Meeting Check-In</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground font-sans tracking-tight">24/7 SOS</div>
              <div className="text-xs text-muted-foreground mt-0.5">Emergency Outing Dispatch</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Verified Guests (Real Flagship Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
                Vetted & Active This Week
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
                Featured Verified Guests
              </h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Every guest has completed biometric verification and accepts invitations exclusively in public venues.
              </p>
            </div>
            <Link
              to="/discovery"
              className="px-4 py-2 rounded-xl border border-border hover:border-accent text-xs sm:text-sm font-semibold text-foreground hover:text-accent transition-colors self-start sm:self-auto"
            >
              Browse All 100+ Guests &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURED_PROFILES.map((comp) => (
              <div
                key={comp.id}
                onClick={() => navigate(`/discovery?q=${encodeURIComponent(comp.name)}`)}
                className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group hover:-translate-y-1"
              >
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img
                    src={comp.image}
                    alt={comp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <RateBadge
                      variant="card-badge"
                      rate={comp.rate}
                      isAuthenticated={isAuthenticated}
                      onAuthPrompt={() => navigate('/login?redirect=/discovery')}
                    />
                  </div>
                  <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white flex items-center gap-1 shadow-xs">
                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                        {comp.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                        <StarIcon className="w-4 h-4 fill-amber-400" />
                        <span>{comp.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-accent font-medium mb-3 line-clamp-1">{comp.headline}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {comp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground border border-border/40"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5 text-accent" />
                      {comp.distance}
                    </span>
                    <span className="font-semibold text-accent group-hover:translate-x-1 transition-transform">
                      {isAuthenticated ? 'Book with Escrow \u2192' : 'Login to Book \u2192'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The 3-Step Trust Architecture (How It Works) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
            Safe, Transparent & Platonic
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground font-serif">
            How LoveAgain Protects Every Outing
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            No unexpected cancellations, no awkward cash exchanges, and no safety compromises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground font-serif mb-2">
                Reserve & Escrow Deposit
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose an available slot, specify the public meeting spot, and confirm. Your booking fee is held in an isolated platform escrow ledger — the guest does not receive payment upfront.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>100% Refundable Before Outing</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground font-serif mb-2">
                Meet at Public Venue & Exchange PIN
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Meet your guest at the agreed cafe, sports club, or gallery. Exchange your private check-in PIN to start the outing timer and verify both parties are present.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-xs font-semibold text-accent flex items-center gap-1.5">
              <KeyIcon className="w-4 h-4" />
              <span>Mutual Security PIN Exchange</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground font-serif mb-2">
                Outing Completed & Escrow Released
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Once the scheduled time finishes, the outing is marked completed. Escrow funds are automatically released to the guest's wallet for instant UPI withdrawal, and both parties leave verified reviews.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Instant Payout & Verified Review</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Guest Monetization Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary via-primary-light to-primary text-primary-foreground border border-border/80 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs font-semibold uppercase tracking-wider mb-4 border border-primary-foreground/15">
                <BriefcaseIcon className="w-4 h-4 text-emerald-400" />
                <span>Monetize Your Time & Knowledge</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif mb-4 text-primary-foreground text-balance">
                Earn on your own terms with guaranteed escrow payouts
              </h2>
              <p className="text-primary-foreground/85 text-xs sm:text-base leading-relaxed mb-6 text-pretty">
                Whether you are a certified tennis coach, heritage walk curator, commercial photographer, or homestyle chef, Cue lets you publish your schedule, set your hourly rate, and get paid with zero payment defaults.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={isAuthenticated ? "/apply-companion" : "/register?redirect=/apply-companion"}
                  className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-xs sm:text-sm shadow-md hover:bg-accent-hover transition-all"
                >
                  Apply as a Verified Guest
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all border border-white/20"
                >
                  Learn About Payouts
                </Link>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">Guaranteed Payment Security</h4>
                  <p className="text-[11px] sm:text-xs text-white/80">Hosts deposit funds in escrow prior to meeting. No chasing invoices or unpaid outings.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">Strict Identity & Safety Vetting</h4>
                  <p className="text-[11px] sm:text-xs text-white/80">Every host and guest must complete biometric verification and government ID checks.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
                <ArrowPathIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">Instant UPI Disbursements</h4>
                  <p className="text-[11px] sm:text-xs text-white/80">Withdraw earnings straight to your GPay, PhonePe, Paytm, or bank account with 0 delay.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Persuasive FAQ (Friction & Objection Killer) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Everything you need to know about safety, reservations, escrow, and outing guidelines.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-card transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 mt-1">
                    <p className="pt-2 text-pretty">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Final Conversion Invitation Billboard */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-card border border-accent/30 shadow-lg text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif mb-3 text-balance">
            Ready to Explore Life with Verified Guests?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-base mb-6 text-pretty">
            Join hundreds of urban hosts across Bengaluru, Mumbai, Delhi, and Hyderabad. No commitments, zero pre-payment risk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/discovery"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-sm shadow-sm transition-all hover:scale-[1.02]"
            >
              Explore Guests Now &rarr;
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-muted/80 hover:bg-muted text-foreground font-semibold text-sm border border-border/80 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
