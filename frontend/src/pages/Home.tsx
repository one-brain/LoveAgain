import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { RateBadge } from '../components/ui/RateBadge';
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
    tagline: 'Connect with verified companions for city tours, concerts, dining, and social gatherings.',
    badge: '100% Platonic & Escrowed',
    icon: UserGroupIcon,
    accentColor: 'text-emerald-500',
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    popularItems: ['City Tours', 'Fine Dining', 'Concerts', 'Event Plus-One'],
  },
  {
    id: 'wellness',
    name: 'Cue Active & Wellness',
    tagline: 'Partner up for tennis, gym workouts, morning runs, hiking trails, and yoga sessions.',
    badge: 'Fitness & Outdoor Buddies',
    icon: SparklesIcon,
    accentColor: 'text-amber-500',
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    popularItems: ['Tennis Partner', 'Hiking Trails', 'Gym Spotter', 'Yoga Buddy'],
  },
  {
    id: 'pro_work',
    name: 'Cue Skills & Mentorship',
    tagline: 'Hire companion mentors for 1-on-1 photography walks, language practice, and creative hobbies.',
    badge: 'Skill Sharing & Craft',
    icon: BriefcaseIcon,
    accentColor: 'text-sky-500',
    bgGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    popularItems: ['Photography Walk', 'Language Practice', 'Cooking Sessions', 'Coding Mentorship'],
  },
  {
    id: 'lifestyle',
    name: 'Cue Domestic & Lifestyle',
    tagline: 'Connect with regional homestyle cooks, festival decor companions, senior escorts, and bazaar guides.',
    badge: 'Ghar Ka Khana & Sanskaar',
    icon: HomeModernIcon,
    accentColor: 'text-rose-500',
    bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
    popularItems: ['Homestyle Cooking', 'Festival & Pooja Prep', 'Senior Companion', 'Mandi Guide', 'Saree Styling'],
  },
];

const FEATURED_PROFILES = [
  {
    id: 'p1',
    name: 'Elena Rostova',
    headline: 'Semi-Pro Tennis Coach & Event Plus-One',
    activeLenses: ['pro_work', 'companions'],
    tags: ['Tennis Coaching', 'City Tour', 'Art Gallery'],
    rate: 1500,
    rateType: 'hr',
    rating: 4.98,
    reviews: 64,
    distance: '2.4 km away',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    trustScore: 99,
  },
  {
    id: 'p2',
    name: 'Marcus Vance',
    headline: 'Commercial Photographer & Foodie Guide',
    activeLenses: ['pro_work', 'companions'],
    tags: ['Photography Gigs', 'Culinary Walk', 'Italian Cooking'],
    rate: 1800,
    rateType: 'hr',
    rating: 4.95,
    reviews: 82,
    distance: '3.8 km away',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    trustScore: 98,
  },
  {
    id: 'p3',
    name: 'Dr. Sophia Chen',
    headline: 'Cardiologist · Classical Violinist & Trail Guide',
    activeLenses: ['wellness', 'companions'],
    tags: ['Hiking Partner', 'Violin Music', 'City Tour'],
    rate: 1200,
    rateType: 'hr',
    rating: 4.92,
    reviews: 47,
    distance: '1.9 km away',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    trustScore: 97,
  },
  {
    id: 'p7',
    name: 'Ananya Sharma',
    headline: 'Regional Homestyle Cook & Festive Floral Artist',
    activeLenses: ['lifestyle', 'companions'],
    tags: ['Regional Homestyle Cook', 'Festival & Pooja Decor', 'Balcony Tulsi & Gardening'],
    rate: 1200,
    rateType: 'hr',
    rating: 4.96,
    reviews: 58,
    distance: '3.1 km away',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    trustScore: 99,
  },
  {
    id: 'p8',
    name: 'Col. Rajeshwar Rao (Retd.)',
    headline: 'Senior Companion, Temple Escort & Carrom Partner',
    activeLenses: ['lifestyle', 'wellness'],
    tags: ['Senior Companion & Temple Escort', 'Carrom & Society Sports', 'Evening Chai & Gupshup'],
    rate: 1000,
    rateType: 'hr',
    rating: 4.99,
    reviews: 73,
    distance: '2.8 km away',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    trustScore: 100,
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local');
  const seekerFirstName = user?.firstName || 'Seeker';
  const [selectedLens, setSelectedLens] = useState<PlatformLens>('companions');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(`/discovery?lens=${selectedLens}${query ? `&q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Authenticated Seeker Welcome & Quick Hub Shortcuts */}
      {isAuthenticated && !isAdmin && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mb-8 pt-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Welcome back, {seekerFirstName}! 👋
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/20">
                  Verified Seeker
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore companions for upcoming outings or review your active reservation timeline.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/bookings"
                className="px-3.5 py-2 rounded-xl bg-muted/80 hover:bg-muted text-foreground text-xs font-semibold border border-border/80 transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5"
              >
                <ClockIcon className="w-3.5 h-3.5 text-accent" />
                <span>My Bookings</span>
              </Link>
              <Link
                to="/discovery"
                className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-bold shadow-xs hover:bg-accent-hover transition-all"
              >
                <span>Find Companions &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-14 sm:pt-20 sm:pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-6">
            <SparklesIcon className="w-4 h-4" />
            <span>One Verified Platform · Three Ways to Connect</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-serif max-w-4xl mx-auto leading-[1.12]">
            Connect, Collaborate & <span className="text-gradient">Experience Life</span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hire skilled talent with zero payment default, find friendly companion partners for shared activities, or discover verified marriage matches — all protected by 100% Escrow.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto p-2 bg-card rounded-2xl border border-border shadow-xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What or who are you looking for today? (e.g. Photography, Tennis, Tour, Matrimony)..."
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm sm:text-base py-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm transition-all shadow-sm hover:scale-[1.02] flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>Explore</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          {/* 4 Interactive Visual Pillar Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {PILLAR_CARDS.map((card) => {
              const Icon = card.icon;
              const isSelected = selectedLens === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedLens(card.id);
                    navigate(`/discovery?lens=${card.id}`);
                  }}
                  className={`relative p-6 sm:p-7 rounded-3xl border bg-card/80 backdrop-blur-md transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl ${
                    isSelected
                      ? 'border-accent shadow-md ring-2 ring-accent/30'
                      : 'border-border/80 hover:border-accent/50'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${card.bgGradient} blur-2xl pointer-events-none -z-10`} />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Icon className={`w-6 h-6 ${card.accentColor}`} />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-muted/80 text-[11px] font-semibold text-muted-foreground">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground font-serif mb-2 group-hover:text-accent transition-colors">
                      {card.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                      {card.tagline}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/60">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {card.popularItems.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-accent">
                      <span>Browse category</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Strip */}
          <div className="mt-12 pt-8 border-t border-border/60 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">100%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Govt ID KYC Verified</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">Escrow Vault</div>
              <div className="text-xs text-muted-foreground mt-0.5">Zero Payment Defaults</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">Instant Booking</div>
              <div className="text-xs text-muted-foreground mt-0.5">Direct Real-Time Chat</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">4.95★</div>
              <div className="text-xs text-muted-foreground mt-0.5">Community Trust Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Curated Profiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
                Top Rated This Week
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
                Featured Verified Profiles
              </h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Every member is KYC verified with government ID and protected by 100% Escrow holds.
              </p>
            </div>
            <Link
              to="/discovery"
              className="mt-4 sm:mt-0 px-4 py-2 rounded-xl border border-border hover:border-accent text-xs sm:text-sm font-semibold text-foreground hover:text-accent transition-colors"
            >
              Browse All Profiles &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {FEATURED_PROFILES.map((comp) => (
              <div
                key={comp.id}
                onClick={() => navigate(`/discovery?lens=${comp.activeLenses[0]}`)}
                className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group"
              >
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img
                    src={comp.image}
                    alt={comp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <p className="text-xs text-accent font-medium mb-3">{comp.headline}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {comp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5" />
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

      {/* "Advertise Your Skills & Earn" Callout Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary via-primary-light to-primary text-primary-foreground border border-border/80 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs font-semibold uppercase tracking-wider mb-4 border border-primary-foreground/15">
                <BriefcaseIcon className="w-4 h-4 text-emerald-400" />
                <span>Advertise & Earn</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif mb-4 text-primary-foreground">
                Monetize your expertise with guaranteed escrow earnings
              </h2>
              <p className="text-primary-foreground/85 text-xs sm:text-base leading-relaxed mb-6">
                Whether you are a certified fitness trainer, wedding photographer, bilingual tour guide, or looking for marriage, Cue lets you set your rates, find clients, and get paid with zero payment defaults.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={isAuthenticated ? "/apply-companion" : "/register?redirect=/apply-companion"}
                  className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-xs sm:text-sm shadow-md hover:bg-accent-hover transition-all"
                >
                  Apply as a Provider / Companion
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
                >
                  How Escrow Works
                </Link>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">100% Escrow Vault Security</h4>
                  <p className="text-[11px] sm:text-xs text-white/80">Clients deposit funds before the session begins. Guaranteed payout upon completion.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">Strict Identity & Safety Vetting</h4>
                  <p className="text-[11px] sm:text-xs text-white/80">Every participant is verified with government ID and biometric selfie checks.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">Instant UPI Withdrawals</h4>
                  <p className="text-[11px] sm:text-xs text-white/80">Withdraw your earnings directly to your GPay, PhonePe, or bank account anytime.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
