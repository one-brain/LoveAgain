import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { RateBadge } from '../components/ui/RateBadge';
import { ArchetypeQuizSection } from '../components/home/ArchetypeQuizSection';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  KeyIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  MusicalNoteIcon,
  CakeIcon,
} from '@heroicons/react/24/outline';

interface CuratedOccasion {
  id: string;
  title: string;
  subtitle: string;
  query: string;
  badge: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  tags: string[];
}

const OCCASIONS: CuratedOccasion[] = [
  {
    id: 'coffee-dialogue',
    title: 'Specialty Coffee & Literary Dialogue',
    subtitle: 'Quiet roasteries, boutique bookshops, and unhurried intellectual banter with well-read companions.',
    query: 'Coffee',
    badge: 'Thoughtful & Calm',
    icon: BuildingLibraryIcon,
    tags: ['Third-Wave Roasteries', 'Bookshop Cafés', 'Quiet Banter', 'Intellectual Sparks'],
  },
  {
    id: 'fine-dining',
    title: 'Fine Dining & Culinary Walks',
    subtitle: 'Artisanal tasting menus, heritage night food trails, and articulate plus-ones for culinary explorations.',
    query: 'Restaurant',
    badge: 'Sensory & Refined',
    icon: CakeIcon,
    tags: ['Tasting Menus', 'Heritage Food Walks', 'Jazz Lounges', 'Boutique Bistros'],
  },
  {
    id: 'art-culture',
    title: 'Art Previews & Cultural Galas',
    subtitle: 'Contemporary gallery openings, architectural walks, classical music concerts, and theater evenings.',
    query: 'Art Gallery',
    badge: 'Aesthetic & Inspiring',
    icon: SparklesIcon,
    tags: ['Gallery Previews', 'Heritage Architecture', 'Classical Recitals', 'Museum Walks'],
  },
  {
    id: 'music-exploration',
    title: 'Live Music & Urban Discovery',
    subtitle: 'Intimate acoustic sets, hidden speakeasies, street photography trails, and weekend explorations.',
    query: 'Weekend',
    badge: 'Spontaneous & Lively',
    icon: MusicalNoteIcon,
    tags: ['Acoustic Gigs', 'Vinyl Bars', 'Street Photography', 'Active Weekend Outings'],
  },
];

const METROS = [
  { name: 'Bengaluru', count: '28+ companions' },
  { name: 'Mumbai', count: '24+ companions' },
  { name: 'Delhi-NCR', count: '18+ companions' },
  { name: 'Hyderabad', count: '14+ companions' },
  { name: 'Pune', count: '8+ companions' },
  { name: 'Chennai', count: '6+ companions' },
];

const FEATURED_COMPANIONS = [
  {
    id: '158b9ff7-19de-49ce-a57c-b37738591285',
    name: 'Elena Rostova',
    headline: 'Contemporary Art Curator & Semi-Pro Tennis Coach',
    city: 'Bengaluru',
    area: 'Indiranagar',
    tags: ['Art Gallery Walk', 'Tennis', 'Boutique Coffee'],
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
    headline: 'Commercial Photographer & Heritage Foodie Guide',
    city: 'Bengaluru',
    area: 'Koramangala',
    tags: ['Street Photography', 'Culinary Walk', 'Night Trails'],
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
    tags: ['Violin Recitals', 'Nature Trails', 'Mindful Walks'],
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
    headline: 'Regional Homestyle Culinary Artist & Tea Specialist',
    city: 'Bengaluru',
    area: 'Jayanagar',
    tags: ['Regional Culinary', 'Traditional Tea', 'Floral Art'],
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
    tags: ['Senior Companion', 'Chess Partner', 'Heritage Escort'],
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
    headline: 'Sanskrit & History Scholar, Temple Architecture Guide',
    city: 'Bengaluru',
    area: 'Basavanagudi',
    tags: ['Heritage Walks', 'Architecture', 'Philosophy'],
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
    question: 'Is Cue strictly a platonic companionship service?',
    answer:
      'Yes, absolutely. Cue is dedicated solely to verified, dignified, and platonic social companionship (such as coffee conversations, restaurant outings, gallery walks, and event plus-ones). All meetups must take place strictly in licensed public venues. Any romantic or inappropriate solicitation is strictly prohibited and results in immediate, permanent account termination.',
  },
  {
    question: 'How does the Escrow Payment Guarantee protect members and companions?',
    answer:
      'When you reserve an outing, your payment is held securely in an isolated platform escrow vault. The companion never receives payment upfront. Funds are released only after the meetup concludes and both parties verify check-in using a mutual 4-digit security PIN. If a companion cancels or fails to show up, 100% of your deposit is refunded immediately to your wallet.',
  },
  {
    question: 'How are companions vetted before being accepted?',
    answer:
      'Every companion applicant must submit Government ID proof (Aadhaar, Passport, or Driving License) along with live liveness biometric verification audited by our compliance operations team. In addition, every active outing is protected with an in-app Emergency SOS beacon that can dispatch live coordinates to our 24/7 trust & safety dispatch.',
  },
  {
    question: 'Can outings take place at private residences or hotel rooms?',
    answer:
      'No. Platform safety policy requires all first-time outings to occur strictly in public, commercial venues (such as licensed cafés, restaurants, sports clubs, art galleries, and public concert halls). Private residential or hotel room visits are prohibited for mutual safety.',
  },
  {
    question: 'Can I cancel an outing reservation if my plans change?',
    answer:
      'Yes. You can cancel any reservation directly from your dashboard before the agreed start time. Funds held in escrow are credited back to your wallet balance with zero penalty in accordance with our transparent cancellation policy.',
  },
  {
    question: 'How do companion earnings and payouts work?',
    answer:
      'Companions set their own transparent hourly rates and receive 85% of each booking fee (15% platform escrow commission). Cleared balances can be withdrawn instantly via UPI (GPay, PhonePe, Paytm, or BHIM) directly to your bank account with zero withdrawal delays.',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local');
  const memberName = user?.firstName || 'Member';
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(`/discovery${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  const scrollToQuiz = () => {
    const el = document.getElementById('archetype-quiz');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-28 pb-24">
      {/* 1. Authenticated Welcome Ribbon */}
      {isAuthenticated && !isAdmin && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mb-6 pt-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Welcome back, {memberName}!
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore verified companions for upcoming outings or review your active schedule.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/bookings"
                className="min-h-[44px] px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ClockIcon className="w-3.5 h-3.5 text-[#881337] dark:text-rose-400" aria-hidden="true" />
                <span>My Outings</span>
              </Link>
              <Link
                to="/discovery"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[#881337] hover:bg-[#9F1239] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Find Companions &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Hero Section: Refined Editorial Luxury */}
      <section className="relative overflow-hidden pt-12 pb-14 sm:pt-24 sm:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/25 text-[#C5A059] text-xs font-semibold uppercase tracking-wider mb-6">
            <SparklesIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Discreet Verification • Escrow-Backed Integrity</span>
          </div>

          {/* Canonical Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-serif max-w-4xl mx-auto leading-[1.12] text-balance">
            Curated Companionship for <span className="text-[#881337] dark:text-rose-400">Cultured Outings</span>
          </h1>

          {/* Clean Subtitle */}
          <p className="mt-5 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Connect with verified, articulate companions for coffee conversations, fine dining, art previews, and cultural events across India's premier metropolitan cities. 100% platonic, discreet, and protected by platform escrow.
          </p>

          {/* Unified Search & Discovery Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-10 max-w-2xl mx-auto p-2 bg-card rounded-2xl border border-border shadow-xl flex flex-col sm:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-[#881337]/30 transition-all"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by occasion, interest, or neighborhood (e.g. 'Coffee in Indiranagar', 'Art Gallery')..."
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm sm:text-base py-2.5"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl bg-[#881337] hover:bg-[#9F1239] text-white font-bold text-sm transition-all shadow-sm hover:scale-[1.02] flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {/* Curated Service Quick Pills & Quiz Trigger */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {[
              { label: '☕ Specialty Coffee', q: 'Coffee' },
              { label: '🍽️ Fine Dining', q: 'Restaurant' },
              { label: '🎨 Art Previews', q: 'Art Gallery' },
              { label: '🎬 Theater & Cinema', q: 'Movies' },
              { label: '🎾 Tennis & Active', q: 'Tennis' },
              { label: '🎟️ Event Plus-One', q: 'Special Events' },
            ].map((srv) => (
              <button
                key={srv.label}
                type="button"
                onClick={() => navigate(`/discovery?q=${encodeURIComponent(srv.q)}`)}
                className="min-h-[44px] px-3.5 py-1.5 rounded-full bg-card hover:bg-[#881337]/5 border border-border/80 hover:border-[#881337]/40 text-xs font-medium text-foreground transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span>{srv.label}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={scrollToQuiz}
              className="min-h-[44px] px-4 py-1.5 rounded-full bg-[#881337]/10 hover:bg-[#881337]/20 border border-[#881337]/30 text-xs font-bold text-[#881337] dark:text-rose-400 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
              <span>Take Archetype Quiz ✨</span>
            </button>
          </div>

          {/* Popular Metros Row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Metros:</span>
            {METROS.map((metro) => (
              <button
                key={metro.name}
                type="button"
                onClick={() => navigate(`/discovery?city=${encodeURIComponent(metro.name)}`)}
                className="min-h-[44px] px-3.5 py-1 rounded-full bg-card hover:bg-muted border border-border/70 hover:border-border text-xs text-foreground/90 font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{metro.name}</span>
                <span className="text-[10px] text-muted-foreground">({metro.count.split(' ')[0]})</span>
              </button>
            ))}
          </div>

          {/* Trust Strip */}
          <div className="mt-14 pt-8 border-t border-border/60 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono tabular-nums">100%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Government ID Verified</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground font-serif tracking-tight">Escrow Vault</div>
              <div className="text-xs text-muted-foreground mt-0.5">Zero Pre-payment Risk</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono tabular-nums">4-Digit PIN</div>
              <div className="text-xs text-muted-foreground mt-0.5">Mutual Check-In</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground font-serif tracking-tight">24/7 SOS</div>
              <div className="text-xs text-muted-foreground mt-0.5">Safety Dispatch</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Archetype Quiz (Lead Magnet & Wavelength Matcher) */}
      <div id="archetype-quiz">
        <ArchetypeQuizSection />
      </div>

      {/* 4. Curated Outing Occasions (Clean Editorial Pillars) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1 block">
            Tailored Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif tracking-tight">
            Curated Outing Occasions
          </h2>
          <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
            Whether exploring an art preview or sharing a quiet coffee, choose the setting that matches your mood.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OCCASIONS.map((occ) => {
            const Icon = occ.icon;
            return (
              <div
                key={occ.id}
                onClick={() => navigate(`/discovery?q=${encodeURIComponent(occ.query)}`)}
                className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-card hover:border-[#881337]/50 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center group-hover:bg-[#881337]/10 transition-colors">
                      <Icon className="w-6 h-6 text-[#881337] dark:text-rose-400" aria-hidden="true" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-muted/80 text-[11px] font-semibold text-muted-foreground border border-border/60">
                      {occ.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground font-serif mb-2 group-hover:text-[#881337] dark:group-hover:text-rose-400 transition-colors">
                    {occ.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                    {occ.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {occ.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80 border border-border/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#881337] dark:text-rose-400">
                    <span>Browse Companions</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Verified Companions Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1 block">
                Vetted & Active This Week
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-foreground font-serif tracking-tight">
                Featured Verified Companions
              </h2>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Every companion has completed government ID & biometric verification and accepts invitations exclusively in public venues.
              </p>
            </div>
            <Link
              to="/discovery"
              className="min-h-[44px] px-4 py-2 rounded-xl border border-border hover:border-[#881337] text-xs sm:text-sm font-semibold text-foreground hover:text-[#881337] dark:hover:text-rose-400 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Browse All 100+ Companions</span>
              <ArrowRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURED_COMPANIONS.map((comp) => (
              <div
                key={comp.id}
                onClick={() => navigate(`/providers/${comp.id}`)}
                className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group hover:-translate-y-1"
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
                  <div className="absolute top-3 left-3 bg-[#C5A059]/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white flex items-center gap-1 shadow-xs">
                    <CheckBadgeIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-foreground font-serif group-hover:text-[#881337] dark:group-hover:text-rose-400 transition-colors">
                        {comp.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                        <StarIcon className="w-4 h-4 fill-amber-400" aria-hidden="true" />
                        <span className="font-mono tabular-nums">{comp.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#881337] dark:text-rose-400 font-medium mb-3 line-clamp-1">{comp.headline}</p>

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
                      <MapPinIcon className="w-3.5 h-3.5 text-[#C5A059]" aria-hidden="true" />
                      {comp.distance}
                    </span>
                    <span className="font-bold text-[#881337] dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                      {isAuthenticated ? 'Book with Escrow \u2192' : 'View Profile \u2192'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. The 3-Step Trust Architecture (How Escrow Protects You) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1 block">
            Safe, Transparent & Escrow-Protected
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif tracking-tight">
            How Cue Protects Every Outing
          </h2>
          <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
            Zero cash exchanges, zero upfront payment risk, and guaranteed mutual security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#881337]/10 border border-[#881337]/20 flex items-center justify-center text-[#881337] dark:text-rose-400 font-bold text-lg mb-4 font-mono">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground font-serif mb-2">
                Select & Escrow Hold
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Choose your companion and specify the public meeting spot. Your payment is held securely in an isolated platform escrow vault — the companion never receives money upfront.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4" aria-hidden="true" />
              <span>100% Refundable Before Outing</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#881337]/10 border border-[#881337]/20 flex items-center justify-center text-[#881337] dark:text-rose-400 font-bold text-lg mb-4 font-mono">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground font-serif mb-2">
                Public Meetup & 4-Digit Handshake
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Meet at the agreed public venue (café, gallery, or restaurant). Exchange your private 4-digit PIN to confirm check-in and verify that both parties have arrived safely.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-xs font-semibold text-[#881337] dark:text-rose-400 flex items-center gap-1.5">
              <KeyIcon className="w-4 h-4" aria-hidden="true" />
              <span>Mutual 4-Digit Security PIN</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#881337]/10 border border-[#881337]/20 flex items-center justify-center text-[#881337] dark:text-rose-400 font-bold text-lg mb-4 font-mono">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground font-serif mb-2">
                Outing Concluded & Instant Settlement
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Once the scheduled time finishes, the outing is completed. Escrow funds transfer directly to the companion's wallet with instant UPI payout, and both parties leave verified feedback.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/60 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
              <span>Instant Payout & Verified Review</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Companion Monetization (Become a Verified Companion) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#140B12] text-white border border-[#2A1824] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[#881337]/20 via-[#C5A059]/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C5A059] text-xs font-semibold uppercase tracking-wider mb-4 border border-white/15">
                <BriefcaseIcon className="w-4 h-4" aria-hidden="true" />
                <span>Earn With Dignity & Protection</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif mb-4 text-white leading-tight">
                Share your time, culture, and interests with guaranteed escrow payouts
              </h2>

              <p className="text-white/80 text-xs sm:text-base leading-relaxed mb-6">
                Whether you are an art curator, certified sports coach, language mentor, or cultural enthusiast, Cue allows you to publish your schedule, set your hourly rate, and receive guaranteed payouts with zero risk of unpaid invoices.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={isAuthenticated ? "/apply-companion" : "/register?redirect=/apply-companion"}
                  className="min-h-[44px] px-6 py-3 rounded-xl bg-[#881337] hover:bg-[#9F1239] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center cursor-pointer"
                >
                  Apply as a Verified Companion
                </Link>
                <Link
                  to="/how-it-works"
                  className="min-h-[44px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-all border border-white/20 flex items-center cursor-pointer"
                >
                  Learn About Payouts
                </Link>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center gap-3">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">Guaranteed Escrow Security</h4>
                  <p className="text-[11px] sm:text-xs text-white/70">Clients deposit funds in escrow prior to meeting. No chasing payments or defaults.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">Strict Identity & Safety Vetting</h4>
                  <p className="text-[11px] sm:text-xs text-white/70">Every member completes biometric verification and government ID checks for mutual safety.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center gap-3">
                <ArrowPathIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-white">Instant UPI Disbursements</h4>
                  <p className="text-[11px] sm:text-xs text-white/70">Withdraw earnings straight to your GPay, PhonePe, or Paytm with zero delay.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions (Friction Eliminator) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1 block">
            Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif tracking-tight">
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
                  className="w-full min-h-[56px] p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#881337] dark:text-rose-400' : ''
                    }`}
                    aria-hidden="true"
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

      {/* 9. Final Conversion Invitation */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-card border border-[#C5A059]/30 shadow-xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#881337]/5 via-[#C5A059]/10 to-[#881337]/5 pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-bold text-foreground font-serif mb-3 text-balance">
            Experience Connection on Your Own Terms
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-base mb-8 text-pretty">
            Join hundreds of verified urban members across Bengaluru, Mumbai, Delhi-NCR, and Hyderabad. Discreet, escrow-backed, and 100% platonic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/discovery"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-[#881337] hover:bg-[#9F1239] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] flex items-center justify-center cursor-pointer"
            >
              Explore Verified Companions &rarr;
            </Link>
            <button
              type="button"
              onClick={scrollToQuiz}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-xl bg-card hover:bg-muted text-foreground font-semibold text-sm border border-border transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <SparklesIcon className="w-4 h-4 text-[#C5A059]" aria-hidden="true" />
              <span>Take Archetype Quiz</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
