import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  HeartIcon,
} from '@heroicons/react/24/outline';
import type { PlatformLens } from '../types/platform';

interface LensConfig {
  id: PlatformLens;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  searchPlaceholder: string;
  badge: string;
}

const LENSES: LensConfig[] = [
  {
    id: 'pro_work',
    name: 'Cue Pro (Work & Gigs)',
    tagline: 'Hire verified skilled talent or advertise your skills to earn with Escrow guarantee',
    icon: BriefcaseIcon,
    searchPlaceholder: 'Search skills (e.g. Photography, Tennis Coach, Python Tutor, DJ)...',
    badge: 'Verified Freelancers & Pros',
  },
  {
    id: 'companions',
    name: 'Cue Companions',
    tagline: 'Rent friendly companions for city tours, concerts, gym partners & dining',
    icon: UserGroupIcon,
    searchPlaceholder: 'Search activities (e.g. City Tour, Concert Buddy, Hiking, Foodie)...',
    badge: '100% Platonic & Escrow Protected',
  },
  {
    id: 'relationships',
    name: 'Cue Relationships',
    tagline: 'Verified matrimony biodatas, live-in compatibility & modern romance',
    icon: HeartIcon,
    searchPlaceholder: 'Search matches (e.g. Matrimony, Live-In Match, Coffee Date)...',
    badge: 'ID-Verified & Boundary Safe',
  },
];

// Activity categories for Companions Lens
const COMPANION_ACTIVITIES = [
  { name: 'City Guide & Local Tours', count: 42, icon: '🗺️', desc: 'Hidden city gems, street food, heritage walks' },
  { name: 'Sports & Fitness Partners', count: 54, icon: '🎾', desc: 'Tennis, gym accountability, jogging & yoga' },
  { name: 'Fine Dining & Foodie Tastings', count: 68, icon: '🍷', desc: 'Artisan cafes, dinner company & chef tastings' },
  { name: 'Concerts & Live Music', count: 39, icon: '🎸', desc: 'Gigs, music festivals, jazz clubs & theatre' },
  { name: 'Events & Plus-One', count: 31, icon: '🥂', desc: 'Weddings, corporate galas & milestone dinners' },
  { name: 'Outdoor Adventures & Hikes', count: 47, icon: '🥾', desc: 'Scenic mountain trails, nature getaways' },
];

// Skilled Pro Categories for Work Lens
const PRO_SERVICES = [
  { name: 'Fitness & Sports Coaching', count: 85, icon: '🏋️', desc: 'Personal trainers, yoga instructors & coaches' },
  { name: 'Photography & Creative', count: 62, icon: '📸', desc: 'Portrait, event, product & street shoots' },
  { name: 'Tutoring & Language Exchange', count: 44, icon: '📚', desc: 'English, French, Hindi & coding mentors' },
  { name: 'Event Hosting & Entertainment', count: 38, icon: '🎤', desc: 'DJs, anchors, musicians & party hosts' },
  { name: 'Tech & Digital Gigs', count: 51, icon: '💻', desc: 'Web dev, graphic design & content consulting' },
  { name: 'Personal Styling & Shopping', count: 26, icon: '🛍️', desc: 'Fashion consulting & mall shopping experts' },
];

// Relationship Categories
const RELATIONSHIP_PILLARS = [
  { name: 'Verified Matrimony Biodatas', count: 120, icon: '💍', desc: 'Education, profession, family background & lifestyle compatibility' },
  { name: 'Live-In Compatibility Match', count: 74, icon: '🏡', desc: 'Assess long-term cohabitation habits & lifestyle harmony' },
  { name: 'Courtship & Dinner Dates', count: 96, icon: '🌹', desc: 'Romantic dinners, coffee dates & shared chemistry' },
  { name: 'Travel & Vacation Companions', count: 45, icon: '✈️', desc: 'Weekend road trips & overseas exploration partners' },
];

const FEATURED_PROFILES = [
  {
    id: 'p1',
    name: 'Elena Rostova',
    headline: 'Semi-Pro Tennis Coach & Event Plus-One',
    activeLenses: ['pro_work', 'companions'],
    tags: ['Tennis Coaching', 'City Tour', 'Art Gallery'],
    rate: 45,
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
    rate: 55,
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
    headline: 'Cardiologist · Seeking Verified Matrimony & Live-In',
    activeLenses: ['relationships'],
    tags: ['Matrimony Biodata', 'Live-In Open', 'Classical Violin'],
    rate: 40,
    rateType: 'hr',
    rating: 4.92,
    reviews: 47,
    distance: '1.9 km away',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    trustScore: 97,
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeLens, setActiveLens] = useState<PlatformLens>('pro_work');
  const [searchQuery, setSearchQuery] = useState('');

  const currentLensConfig = LENSES.find((l) => l.id === activeLens) || LENSES[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(`/discovery?lens=${activeLens}${query ? `&q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 3-Lens Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Lens Selector Segmented Control */}
          <div className="inline-flex p-1.5 rounded-2xl bg-card border border-border shadow-md mb-8 max-w-full overflow-x-auto">
            {LENSES.map((lens) => {
              const Icon = lens.icon;
              const isActive = activeLens === lens.id;
              return (
                <button
                  key={lens.id}
                  onClick={() => {
                    setActiveLens(lens.id);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{lens.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Heading based on Lens */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-serif max-w-4xl mx-auto leading-tight">
            {activeLens === 'pro_work' && (
              <>
                Hire skilled talent or <span className="text-gradient">monetize your expertise</span>
              </>
            )}
            {activeLens === 'companions' && (
              <>
                Experience life together with <span className="text-gradient">verified companions</span>
              </>
            )}
            {activeLens === 'relationships' && (
              <>
                Meaningful connections, verified <span className="text-gradient">matrimony & dating</span>
              </>
            )}
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {currentLensConfig.tagline}
          </p>

          {/* Interactive Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto p-2 bg-card rounded-2xl border border-border shadow-lg flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={currentLensConfig.searchPlaceholder}
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm sm:text-base py-2"
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

          {/* Trust Guarantee Metrics */}
          <div className="mt-12 pt-8 border-t border-border/60 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">100%</div>
              <div className="text-xs text-muted-foreground mt-0.5">Govt ID KYC Verified</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">Escrow Vault</div>
              <div className="text-xs text-muted-foreground mt-0.5">Guaranteed Razorpay Hold</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">3 Lenses</div>
              <div className="text-xs text-muted-foreground mt-0.5">Work · Social · Love</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">4.95★</div>
              <div className="text-xs text-muted-foreground mt-0.5">Community Trust Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content Showcase for the Selected Lens */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-2">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{currentLensConfig.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
              {activeLens === 'pro_work' && 'Popular Skilled Gigs & Freelance Services'}
              {activeLens === 'companions' && 'Curated Platonic Companion Activities'}
              {activeLens === 'relationships' && 'Matrimonial Biodatas & Relationship Modes'}
            </h2>
          </div>
          <button
            onClick={() => navigate(`/discovery?lens=${activeLens}`)}
            className="mt-4 sm:mt-0 text-sm font-semibold text-accent hover:text-accent-hover flex items-center gap-1 group"
          >
            <span>View all in this category</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeLens === 'pro_work' &&
            PRO_SERVICES.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/discovery?lens=pro_work&q=${encodeURIComponent(cat.name)}`)}
                className="p-6 rounded-2xl bg-card border border-border hover:border-accent/40 shadow-xs card-hover-effect cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-accent">
                  <span>{cat.count} verified providers</span>
                  <span>Hire Talent &rarr;</span>
                </div>
              </div>
            ))}

          {activeLens === 'companions' &&
            COMPANION_ACTIVITIES.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/discovery?lens=companions&q=${encodeURIComponent(cat.name)}`)}
                className="p-6 rounded-2xl bg-card border border-border hover:border-accent/40 shadow-xs card-hover-effect cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-accent">
                  <span>{cat.count} active companions</span>
                  <span>Plan Outing &rarr;</span>
                </div>
              </div>
            ))}

          {activeLens === 'relationships' &&
            RELATIONSHIP_PILLARS.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/discovery?lens=relationships&q=${encodeURIComponent(cat.name)}`)}
                className="p-6 rounded-2xl bg-card border border-border hover:border-accent/40 shadow-xs card-hover-effect cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-accent">
                  <span>{cat.count} verified profiles</span>
                  <span>Explore Matches &rarr;</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Featured Profiles Across Lenses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl border border-border p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent mb-1 block">
                Vetted & ID-Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
                Featured Providers & Matches
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Every user is KYC verified with government ID and protected by 100% Escrow holds.
              </p>
            </div>
            <Link
              to={`/discovery?lens=${activeLens}`}
              className="mt-4 sm:mt-0 px-4 py-2 rounded-xl border border-border hover:border-accent text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Browse All in {currentLensConfig.name}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_PROFILES.map((comp) => (
              <div
                key={comp.id}
                onClick={() => navigate(`/discovery?lens=${comp.activeLenses[0]}`)}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col group"
              >
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img
                    src={comp.image}
                    alt={comp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-foreground border border-border shadow-xs">
                    ₹{comp.rate}/{comp.rateType}
                  </div>
                  <div className="absolute top-3 left-3 bg-success/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold text-success-foreground flex items-center gap-1 shadow-xs">
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
                    <span className="font-medium text-accent">View Profile &rarr;</span>
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
                <span>Monetize Your Skills</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif mb-4 text-primary-foreground">
                Advertise your craft, host activities, or find your life partner
              </h2>
              <p className="text-primary-foreground/85 text-sm sm:text-base leading-relaxed mb-6">
                Whether you are a certified fitness trainer, wedding photographer, bilingual tour guide, or looking for marriage, Cue lets you set your rates, find clients, and get paid guaranteed escrow payouts without payment defaults.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/apply-companion"
                  className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-md hover:bg-accent-hover transition-all"
                >
                  Apply as a Provider / Companion
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
                >
                  How Payments & Escrow Work
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <div className="flex items-center gap-3">
                  <CheckBadgeIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">100% Guaranteed Escrow Vault</h4>
                    <p className="text-xs text-white/80">Clients deposit funds before the session begins. Zero non-payment risk.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Strict Identity & Safety Vetting</h4>
                    <p className="text-xs text-white/80">Every participant is verified with government ID and selfie biometrics.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-white">Flexible Hourly or Fixed Gig Rates</h4>
                    <p className="text-xs text-white/80">You set your own terms, hourly rates, or custom package milestones.</p>
                  </div>
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
