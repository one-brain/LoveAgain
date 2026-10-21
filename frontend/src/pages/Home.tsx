import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface CategoryItem {
  name: string;
  count: number;
  icon: string;
  description: string;
  specialtyParam: string;
}

const CATEGORIES: CategoryItem[] = [
  { name: 'Sports & Fitness', count: 48, icon: '🎾', description: 'Tennis, squash, running partners & yoga', specialtyParam: 'Tennis' },
  { name: 'Culinary & Dining', count: 62, icon: '🍳', description: 'Cooking classes, foodie tours & tastings', specialtyParam: 'Cooking' },
  { name: 'Arts & Culture', count: 35, icon: '🎨', description: 'Museum visits, exhibitions & theatre', specialtyParam: 'Art' },
  { name: 'Outdoor Adventures', count: 41, icon: '🥾', description: 'Scenic hikes, cycling & nature trails', specialtyParam: 'Hiking' },
  { name: 'Skill & Creative', count: 29, icon: '📸', description: 'Photography walks, languages & craft', specialtyParam: 'Photography' },
  { name: 'Music & Concerts', count: 33, icon: '🎵', description: 'Jazz clubs, live gigs & acoustics', specialtyParam: 'Music' },
];

const FEATURED_COMPANIONS = [
  {
    id: 'f1',
    name: 'Elena Rostova',
    specialties: ['Tennis', 'Yoga', 'Art'],
    rate: 45,
    rating: 4.98,
    reviews: 64,
    distance: '2.4 km away',
    bio: 'Semi-pro tennis instructor and contemporary art curator. Love sharing high-energy matches and weekend gallery strolls.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    trustScore: 99,
  },
  {
    id: 'f2',
    name: 'Marcus Vance',
    specialties: ['Cooking', 'Photography', 'Reading'],
    rate: 55,
    rating: 4.95,
    reviews: 82,
    distance: '3.8 km away',
    bio: 'Former sous-chef turned street photographer. Eager to explore new culinary spots or teach pasta making from scratch.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    trustScore: 98,
  },
  {
    id: 'f3',
    name: 'Sophia Chen',
    specialties: ['Hiking', 'Music', 'Photography'],
    rate: 40,
    rating: 4.92,
    reviews: 47,
    distance: '1.9 km away',
    bio: 'Outdoor enthusiast and classical violinist. Let us explore mountain trails, scenic viewpoints, or catch a live symphony.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    trustScore: 97,
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discovery?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/discovery');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Ambient decorative glowing backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust badge pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-8">
            <SparklesIcon className="w-4 h-4" />
            <span>The Premier Experience Companion Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-serif max-w-4xl mx-auto leading-[1.12]">
            Find inspiring companions for the{' '}
            <span className="text-gradient">moments that matter</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with verified, vetted individuals for shared sports, culinary adventures, cultural outings, and skill sharing. Safe, escrow-protected, and genuine.
          </p>

          {/* Interactive Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-10 max-w-2xl mx-auto p-2 bg-card rounded-2xl border border-border shadow-lg flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <MagnifyingGlassIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What experience are you seeking? (e.g. Tennis, Cooking, Gallery)"
                className="w-full bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm sm:text-base py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm transition-all shadow-sm hover:scale-[1.02] flex items-center justify-center gap-2 flex-shrink-0"
            >
              <span>Explore Now</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Trust metrics */}
          <div className="mt-12 pt-8 border-t border-border/60 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">100%</div>
              <div className="text-xs text-muted-foreground mt-0.5">ID & Face Verified</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">4.95★</div>
              <div className="text-xs text-muted-foreground mt-0.5">Community Rating</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">12+</div>
              <div className="text-xs text-muted-foreground mt-0.5">Activity Types</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">Escrow</div>
              <div className="text-xs text-muted-foreground mt-0.5">Guaranteed Payouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
              Curated Companion Experiences
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Choose an activity you love, or try something entirely new with a verified companion.
            </p>
          </div>
          <Link
            to="/discovery"
            className="mt-4 sm:mt-0 text-sm font-semibold text-accent hover:text-accent-hover flex items-center gap-1 group"
          >
            <span>View all companions</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/discovery?specialty=${cat.specialtyParam}`)}
              className="p-6 rounded-2xl bg-card border border-border hover:border-accent/40 shadow-xs card-hover-effect cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-accent">
                <span>{cat.count} verified companions</span>
                <span className="group-hover:translate-x-1 transition-transform">Book slot &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Companions Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-3xl border border-border p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent mb-2 block">
                Top Rated This Week
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
                Featured Verified Companions
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Each companion is identity verified, background checked, and vetted by fellow members.
              </p>
            </div>
            <Link
              to="/discovery"
              className="mt-4 sm:mt-0 px-4 py-2 rounded-xl border border-border hover:border-accent text-sm font-medium text-foreground hover:text-accent transition-colors"
            >
              Browse All Profiles
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_COMPANIONS.map((comp) => (
              <div
                key={comp.id}
                onClick={() => navigate('/discovery')}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col group"
              >
                {/* Photo container with verified badge & rate */}
                <div className="relative h-64 overflow-hidden bg-muted">
                  <img
                    src={comp.image}
                    alt={comp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-foreground border border-border shadow-xs">
                    ${comp.rate}/hr
                  </div>
                  <div className="absolute top-3 left-3 bg-success/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold text-success-foreground flex items-center gap-1 shadow-xs">
                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                        {comp.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                        <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{comp.rating}</span>
                        <span className="text-xs text-muted-foreground font-normal">({comp.reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-foreground/75 mb-3">
                      <MapPinIcon className="w-3.5 h-3.5 text-accent" />
                      <span>{comp.distance}</span>
                      <span className="mx-1">•</span>
                      <span>Trust: {comp.trustScore}%</span>
                    </div>

                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed mb-4">
                      {comp.bio}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {comp.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent/10 text-accent border border-accent/20"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/discovery');
                      }}
                      className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs text-center shadow-xs hover:bg-accent-hover transition-colors"
                    >
                      View Profile & Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-accent mb-2 block">
            Simple, Transparent, Safe
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif">
            How Cue Works in 3 Steps
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Everything is designed to make organizing shared experiences safe, intuitive, and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-card border border-border shadow-xs text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-2xl mx-auto mb-6">
              1
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Explore & Match</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Filter companions by activity, location radius, schedule, and verified reviews. Check bios and specialty tags.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border shadow-xs text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-2xl mx-auto mb-6">
              2
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Book with Escrow</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select an available time slot. Payment is held securely in escrow and only released once the activity is safely completed.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border shadow-xs text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold text-2xl mx-auto mb-6">
              3
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Meet & Enjoy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Coordinate meeting spots via encrypted in-app chat. Perform seamless GPS safety check-ins and share your experience review.
            </p>
          </div>
        </div>
      </section>

      {/* Safety & Trust Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary via-primary-light to-primary text-primary-foreground border border-border/80 shadow-xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs font-semibold uppercase tracking-wider mb-4 border border-primary-foreground/15">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
              <span>Safety First Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif mb-4 text-primary-foreground">
              Built on community trust and physical safety
            </h2>
            <p className="text-primary-foreground/85 text-sm sm:text-base leading-relaxed mb-8">
              We verify provider identities with government ID scans, track bookings with GPS verification, monitor trust scores across every engagement, and resolve any disputes with 24/7 human review.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/15">
              <div className="flex items-start gap-3">
                <CheckBadgeIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-primary-foreground/90">Identity verification and background screening</span>
              </div>
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-primary-foreground/90">Flexible cancellations and dispute mediation</span>
              </div>
              <div className="flex items-start gap-3">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-primary-foreground/90">Real-time encrypted chat with location anchors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="p-10 sm:p-16 rounded-3xl bg-card border border-border shadow-md">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-serif mb-4">
            Ready to find your next companion?
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-8">
            Join thousands of active seekers and verified providers who share activities, skills, and genuine human connection.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent text-accent-foreground font-semibold text-base shadow-sm hover:bg-accent-hover transition-all hover:scale-[1.02]"
            >
              Sign Up for Free
            </Link>
            <Link
              to="/discovery"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-border text-foreground hover:bg-muted font-semibold text-base transition-all"
            >
              Explore Companions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
