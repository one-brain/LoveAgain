import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Badge,
  Button,
  Card,
  Input,
} from '@fluentui/react-components';
import {
  Search20Regular,
  ShieldCheckmark20Regular,
  Star16Filled,
  Sparkle20Regular,
  Clock20Regular,
  Location16Regular,
  CheckmarkStarburst16Filled,
  ArrowRight16Regular,
  CheckmarkCircle20Regular,
  Key20Regular,
  ChevronDown20Regular,
  ArrowSync20Regular,
  Briefcase20Regular,
  Library20Regular,
  MusicNote220Regular,
  FoodCake20Regular,
} from '@fluentui/react-icons';
import type { RootState } from '../store';
import { RateBadge } from '../components/ui/RateBadge';
import { ArchetypeQuizSection } from '../components/home/ArchetypeQuizSection';

interface CuratedOccasion {
  id: string;
  title: string;
  subtitle: string;
  query: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

const OCCASIONS: CuratedOccasion[] = [
  {
    id: 'coffee-dialogue',
    title: 'Specialty Coffee & Literary Dialogue',
    subtitle: 'Quiet roasteries, boutique bookshops, and unhurried intellectual banter with well-read companions.',
    query: 'Coffee',
    badge: 'Thoughtful & calm',
    icon: Library20Regular,
    tags: ['Third-Wave Roasteries', 'Bookshop Cafés', 'Quiet Banter', 'Intellectual Sparks'],
  },
  {
    id: 'fine-dining',
    title: 'Fine Dining & Culinary Walks',
    subtitle: 'Artisanal tasting menus, heritage night food trails, and articulate plus-ones for culinary explorations.',
    query: 'Restaurant',
    badge: 'Sensory & refined',
    icon: FoodCake20Regular,
    tags: ['Tasting Menus', 'Heritage Food Walks', 'Jazz Lounges', 'Boutique Bistros'],
  },
  {
    id: 'art-culture',
    title: 'Art Previews & Cultural Galas',
    subtitle: 'Contemporary gallery openings, architectural walks, classical music concerts, and theater evenings.',
    query: 'Art Gallery',
    badge: 'Aesthetic & inspiring',
    icon: Sparkle20Regular,
    tags: ['Gallery Previews', 'Heritage Architecture', 'Classical Recitals', 'Museum Walks'],
  },
  {
    id: 'music-exploration',
    title: 'Live Music & Urban Discovery',
    subtitle: 'Intimate acoustic sets, hidden speakeasies, street photography trails, and weekend explorations.',
    query: 'Weekend',
    badge: 'Spontaneous & lively',
    icon: MusicNote220Regular,
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
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Authenticated Welcome Ribbon */}
      {isAuthenticated && !isAdmin && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-6 pt-4">
          <Card className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-body2 font-semibold text-foreground">
                  Welcome back, {memberName}!
                </span>
                <span className="px-2 py-0.5 rounded-full text-caption2 font-semibold bg-trust-light text-trust border border-trust-border">
                  Verified Member
                </span>
              </div>
              <p className="text-caption1 text-muted-foreground mt-0.5">
                Explore verified companions for upcoming outings or review your active schedule.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                appearance="secondary"
                size="large"
                icon={<Clock20Regular />}
                onClick={() => navigate('/bookings')}
                className="min-h-11"
              >
                My Outings
              </Button>
              <Button
                appearance="primary"
                size="large"
                icon={<ArrowRight16Regular />}
                iconPosition="after"
                onClick={() => navigate('/discovery')}
                className="min-h-11"
              >
                Find Companions
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2. Hero Section: Fluent-calm */}
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-16 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Copy & Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trust-light border border-trust-border text-trust text-caption1 font-semibold">
                <ShieldCheckmark20Regular className="shrink-0" />
                <span>Discreet verification • Escrow-backed integrity</span>
              </div>

              <h1 className="text-title1 sm:text-large-title font-semibold text-foreground text-balance">
                Curated Companionship for <span className="text-brand-fg">Cultured Outings</span>
              </h1>

              <p className="text-body2 text-muted-foreground max-w-2xl leading-relaxed">
                Connect with verified, articulate companions for coffee conversations, fine dining, art previews, and cultural events across India's premier metropolitan cities. 100% platonic, discreet, and protected by platform escrow.
              </p>

              {/* Unified Search & Discovery Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
              >
                <Input
                  size="large"
                  contentBefore={<Search20Regular className="text-muted-foreground" />}
                  value={searchQuery}
                  onChange={(_, data) => setSearchQuery(data.value)}
                  placeholder="Search by occasion, interest, or neighborhood (e.g. 'Coffee in Indiranagar')..."
                  aria-label="Search companions by occasion, interest, or neighborhood"
                  className="flex-1 min-h-11"
                />
                <Button
                  type="submit"
                  appearance="primary"
                  size="large"
                  icon={<ArrowRight16Regular />}
                  iconPosition="after"
                  className="min-h-11 shrink-0"
                >
                  Explore
                </Button>
              </form>

              {/* Primary / Secondary Action Row */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  appearance="primary"
                  size="large"
                  onClick={() => navigate('/discovery')}
                  className="min-h-11"
                >
                  Browse verified companions
                </Button>
                <Button
                  appearance="secondary"
                  size="large"
                  icon={<Sparkle20Regular className="text-trust" />}
                  onClick={scrollToQuiz}
                  className="min-h-11"
                >
                  Take Archetype Quiz
                </Button>
              </div>

              {/* Curated Service Quick Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {[
                  { label: 'Specialty Coffee', q: 'Coffee' },
                  { label: 'Fine Dining', q: 'Restaurant' },
                  { label: 'Art Previews', q: 'Art Gallery' },
                  { label: 'Theater & Cinema', q: 'Movies' },
                  { label: 'Tennis & Active', q: 'Tennis' },
                  { label: 'Event Plus-One', q: 'Special Events' },
                ].map((srv) => (
                  <Button
                    key={srv.label}
                    appearance="outline"
                    size="small"
                    onClick={() => navigate(`/discovery?q=${encodeURIComponent(srv.q)}`)}
                    className="!rounded-full min-h-9"
                  >
                    {srv.label}
                  </Button>
                ))}
              </div>

              {/* Popular Metros Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-caption1 font-semibold text-muted-foreground mr-1">Metros:</span>
                {METROS.map((metro) => (
                  <button
                    key={metro.name}
                    type="button"
                    onClick={() => navigate(`/discovery?city=${encodeURIComponent(metro.name)}`)}
                    className="min-h-9 px-3 py-1 rounded-full bg-background hover:bg-muted border border-border text-caption1 text-foreground font-normal transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{metro.name}</span>
                    <span className="text-caption2 text-muted-foreground tabular">
                      ({metro.count.split(' ')[0]})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Imagery in an 8px-radius frame */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
                  alt="Curated dining and coffee outing in a public venue"
                  className="w-full h-72 sm:h-88 object-cover"
                />
                <div className="p-4 bg-card border-t border-border flex items-center justify-between gap-4">
                  <div>
                    <div className="text-body1 font-semibold text-foreground">
                      Public venues & mutual PIN verification
                    </div>
                    <div className="text-caption1 text-muted-foreground">
                      Bengaluru · Mumbai · Delhi-NCR · Hyderabad
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-trust-light text-trust border border-trust-border text-caption1 font-semibold shrink-0">
                    100% Escrow
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Strip */}
          <div className="mt-12 pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-title3 sm:text-title2 font-semibold text-foreground font-mono tabular">100%</div>
              <div className="text-caption1 text-muted-foreground mt-0.5">Government ID Verified</div>
            </div>
            <div>
              <div className="text-title3 sm:text-title2 font-semibold text-foreground">Escrow Vault</div>
              <div className="text-caption1 text-muted-foreground mt-0.5">Zero Pre-payment Risk</div>
            </div>
            <div>
              <div className="text-title3 sm:text-title2 font-semibold text-foreground font-mono tabular">4-Digit PIN</div>
              <div className="text-caption1 text-muted-foreground mt-0.5">Mutual Check-In</div>
            </div>
            <div>
              <div className="text-title3 sm:text-title2 font-semibold text-foreground tabular">24/7 SOS</div>
              <div className="text-caption1 text-muted-foreground mt-0.5">Safety Dispatch</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Archetype Quiz */}
      <div id="archetype-quiz">
        <ArchetypeQuizSection />
      </div>

      {/* 4. Curated Outing Occasions */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-caption1 font-semibold text-brand-fg mb-1 block">
            Tailored experiences
          </span>
          <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
            Curated Outing Occasions
          </h2>
          <p className="text-muted-foreground mt-2 text-body1">
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
                className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm card-hover-effect cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent-light border border-border flex items-center justify-center text-brand-fg">
                      <Icon />
                    </div>
                    <Badge appearance="tint" color="informative" size="medium">
                      {occ.badge}
                    </Badge>
                  </div>

                  <h3 className="text-subtitle1 font-semibold text-foreground mb-2 group-hover:text-brand-fg transition-colors">
                    {occ.title}
                  </h3>

                  <p className="text-body1 text-muted-foreground leading-relaxed mb-4">
                    {occ.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {occ.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-muted text-caption1 text-foreground border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-caption1 font-semibold text-brand-fg">
                    <span>Browse companions</span>
                    <ArrowRight16Regular />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Featured Verified Companions Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-caption1 font-semibold text-brand-fg mb-1 block">
                Vetted & active this week
              </span>
              <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
                Featured Verified Companions
              </h2>
              <p className="text-muted-foreground mt-1 text-body1">
                Every companion has completed government ID & biometric verification and accepts invitations exclusively in public venues.
              </p>
            </div>
            <Button
              appearance="secondary"
              size="large"
              icon={<ArrowRight16Regular />}
              iconPosition="after"
              onClick={() => navigate('/discovery')}
              className="min-h-11 self-start sm:self-auto"
            >
              Browse all 100+ companions
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_COMPANIONS.map((comp) => (
              <div
                key={comp.id}
                onClick={() => navigate(`/providers/${comp.id}`)}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm card-hover-effect cursor-pointer flex flex-col group"
              >
                <div className="relative h-60 overflow-hidden bg-muted">
                  <img
                    src={comp.image}
                    alt={comp.name}
                    className="w-full h-full object-cover"
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
                  <div className="absolute top-3 left-3 bg-trust-light px-2.5 py-0.5 rounded-full text-caption2 font-semibold text-trust border border-trust-border flex items-center gap-1 shadow-2xs">
                    <CheckmarkStarburst16Filled />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-subtitle2 text-foreground group-hover:text-brand-fg transition-colors">
                        {comp.name}
                      </h3>
                      <div className="flex items-center gap-1 text-caption1 font-semibold text-trust">
                        <Star16Filled />
                        <span className="font-mono tabular">{comp.rating}</span>
                      </div>
                    </div>
                    <p className="text-caption1 text-brand-fg font-semibold mb-3 line-clamp-1">{comp.headline}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {comp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-muted text-caption2 text-muted-foreground border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-caption1 text-muted-foreground">
                    <span className="flex items-center gap-1 tabular">
                      <Location16Regular className="text-muted-foreground" />
                      {comp.distance}
                    </span>
                    <span className="font-semibold text-brand-fg">
                      {isAuthenticated ? 'Book with Escrow \u2192' : 'View Profile \u2192'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. The 3-Step Trust Architecture */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-caption1 font-semibold text-brand-fg mb-1 block">
            Safe, transparent & escrow-protected
          </span>
          <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
            How Cue Protects Every Outing
          </h2>
          <p className="text-muted-foreground mt-2 text-body1">
            Zero cash exchanges, zero upfront payment risk, and guaranteed mutual security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-accent-light border border-border flex items-center justify-center text-brand-fg font-semibold text-subtitle2 mb-4 font-mono tabular">
                1
              </div>
              <h3 className="text-subtitle2 font-semibold text-foreground mb-2">
                Select & Escrow Hold
              </h3>
              <p className="text-body1 text-muted-foreground leading-relaxed">
                Choose your companion and specify the public meeting spot. Your payment is held securely in an isolated platform escrow vault — the companion never receives money upfront.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border text-caption1 font-semibold text-success flex items-center gap-1.5">
              <ShieldCheckmark20Regular />
              <span>100% refundable before outing</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-accent-light border border-border flex items-center justify-center text-brand-fg font-semibold text-subtitle2 mb-4 font-mono tabular">
                2
              </div>
              <h3 className="text-subtitle2 font-semibold text-foreground mb-2">
                Public Meetup & 4-Digit Handshake
              </h3>
              <p className="text-body1 text-muted-foreground leading-relaxed">
                Meet at the agreed public venue (café, gallery, or restaurant). Exchange your private 4-digit PIN to confirm check-in and verify that both parties have arrived safely.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border text-caption1 font-semibold text-brand-fg flex items-center gap-1.5">
              <Key20Regular />
              <span>Mutual 4-digit security PIN</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-accent-light border border-border flex items-center justify-center text-brand-fg font-semibold text-subtitle2 mb-4 font-mono tabular">
                3
              </div>
              <h3 className="text-subtitle2 font-semibold text-foreground mb-2">
                Outing Concluded & Instant Settlement
              </h3>
              <p className="text-body1 text-muted-foreground leading-relaxed">
                Once the scheduled time finishes, the outing is completed. Escrow funds transfer directly to the companion's wallet with instant UPI payout, and both parties leave verified feedback.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border text-caption1 font-semibold text-success flex items-center gap-1.5">
              <CheckmarkCircle20Regular />
              <span>Instant payout & verified review</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Companion Monetization (Become a Verified Companion) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-card text-foreground border border-border shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trust-light text-trust text-caption1 font-semibold mb-4 border border-trust-border">
                <Briefcase20Regular />
                <span>Earn with dignity & protection</span>
              </div>

              <h2 className="text-title2 sm:text-title1 font-semibold mb-4 text-foreground">
                Share your time, culture, and interests with guaranteed escrow payouts
              </h2>

              <p className="text-muted-foreground text-body2 leading-relaxed mb-6">
                Whether you are an art curator, certified sports coach, language mentor, or cultural enthusiast, Cue allows you to publish your schedule, set your hourly rate, and receive guaranteed payouts with zero risk of unpaid invoices.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={isAuthenticated ? '/apply-companion' : '/register?redirect=/apply-companion'}
                  className="min-h-11 px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-body1 shadow-2xs transition-colors flex items-center"
                >
                  Apply as a Verified Companion
                </Link>
                <Link
                  to="/how-it-works"
                  className="min-h-11 px-5 py-2.5 rounded-md bg-card hover:bg-muted text-foreground font-semibold text-body1 transition-colors border border-border-strong flex items-center"
                >
                  Learn About Payouts
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-muted border border-border flex items-center gap-3">
                <CheckmarkCircle20Regular className="text-success shrink-0" />
                <div>
                  <h4 className="font-semibold text-body1 text-foreground">Guaranteed Escrow Security</h4>
                  <p className="text-caption1 text-muted-foreground">Clients deposit funds in escrow prior to meeting. No chasing payments or defaults.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-muted border border-border flex items-center gap-3">
                <ShieldCheckmark20Regular className="text-success shrink-0" />
                <div>
                  <h4 className="font-semibold text-body1 text-foreground">Strict Identity & Safety Vetting</h4>
                  <p className="text-caption1 text-muted-foreground">Every member completes biometric verification and government ID checks for mutual safety.</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-muted border border-border flex items-center gap-3">
                <ArrowSync20Regular className="text-success shrink-0" />
                <div>
                  <h4 className="font-semibold text-body1 text-foreground">Instant UPI Disbursements</h4>
                  <p className="text-caption1 text-muted-foreground">Withdraw earnings straight to your GPay, PhonePe, or Paytm with zero delay.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-caption1 font-semibold text-brand-fg mb-1 block">
            Clear answers
          </span>
          <h2 className="text-title2 sm:text-title1 font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-1 text-body1">
            Everything you need to know about safety, reservations, escrow, and outing guidelines.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full min-h-14 p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="text-body2 font-semibold text-foreground">
                    {faq.question}
                  </span>
                  <ChevronDown20Regular
                    className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-fg' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 text-body1 text-muted-foreground leading-relaxed border-t border-border">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Final Conversion Invitation */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-card border border-border shadow-sm text-center">
          <h2 className="text-title2 sm:text-title1 font-semibold text-foreground mb-3 text-balance">
            Experience Connection on Your Own Terms
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-body2 mb-8">
            Join hundreds of verified urban members across Bengaluru, Mumbai, Delhi-NCR, and Hyderabad. Discreet, escrow-backed, and 100% platonic.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              appearance="primary"
              size="large"
              icon={<ArrowRight16Regular />}
              iconPosition="after"
              onClick={() => navigate('/discovery')}
              className="w-full sm:w-auto min-h-11"
            >
              Explore Verified Companions
            </Button>
            <Button
              appearance="secondary"
              size="large"
              icon={<Sparkle20Regular className="text-trust" />}
              onClick={scrollToQuiz}
              className="w-full sm:w-auto min-h-11"
            >
              Take Archetype Quiz
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
