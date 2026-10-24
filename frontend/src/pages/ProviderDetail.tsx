import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProviderQuery } from '../store/discoveryApi';
import { useCreateBookingMutation } from '../store/bookingApi';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
import { BookingRequestModal, type BookingRequirementData } from '../components/booking/BookingRequestModal';
import { formatINR, formatRate } from '../utils/currency';
import type { RootState } from '../store';
import {
  StarIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  SparklesIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

// Fallback provider data lookup with Display Name and 3 Profile Images
const FALLBACK_PROVIDERS_MAP: Record<string, any> = {
  'sample-1': {
    providerId: 'sample-1',
    displayName: 'Elena Rostova',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1500,
    bio: 'Hi, I am Elena! I am a semi-professional tennis player and contemporary art curator based in the city. Whether you want to hit the courts for a friendly, competitive rally, improve your backhand, or spend a relaxing Saturday exploring modern art galleries with lively discussion, I would love to accompany you. I value authenticity, positive energy, and great sportsmanship.',
    specialties: ['Tennis', 'Yoga', 'Art', 'Fitness'],
    maxRadiusKm: 25,
    introVideoUrl: 'https://youtube.com',
    averageRating: 4.98,
    isVerified: true,
    trustScore: 99,
  },
  'sample-2': {
    providerId: 'sample-2',
    displayName: 'Marcus Vance',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1800,
    bio: 'Former restaurant sous-chef and active urban photographer. I specialize in culinary walks, private handmade pasta sessions, and exploring bustling farmers markets. I believe great food and shared conversation create the warmest human connections.',
    specialties: ['Cooking', 'Photography', 'Reading'],
    maxRadiusKm: 30,
    introVideoUrl: null,
    averageRating: 4.95,
    isVerified: true,
    trustScore: 98,
  },
  'sample-3': {
    providerId: 'sample-3',
    displayName: 'Dr. Sophia Chen',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1200,
    bio: 'Cardiologist & classical violinist. Let us explore mountain trails, scenic viewpoints, or catch a live symphony. Available for trail hikes and music sessions.',
    specialties: ['Hiking', 'Music', 'Photography', 'Wellness'],
    maxRadiusKm: 40,
    introVideoUrl: null,
    averageRating: 4.92,
    isVerified: true,
    trustScore: 97,
    services: ['Violin Performance / Lesson'],
  },
  'sample-4': {
    providerId: 'sample-4',
    displayName: 'Julian Alvarez',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1600,
    bio: 'Certified salsa dancer and architectural history guide. Available for private dance sessions, wedding plus-one, and city heritage tours.',
    specialties: ['Dance', 'Plus-One', 'Event Host', 'Architecture'],
    maxRadiusKm: 35,
    introVideoUrl: null,
    averageRating: 4.88,
    isVerified: true,
    trustScore: 96,
    services: ['Salsa Coaching (1-on-1)', 'Wedding Plus-One & Social Host'],
  },
  'sample-5': {
    providerId: 'sample-5',
    displayName: 'Aria Thorne',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 1500,
    bio: 'Principal Software Architect & yoga practitioner. Available for system design deep-dives, career mentorship, or mindful yoga morning flows.',
    specialties: ['Yoga Partner', 'Coding Mentorship', 'Reading', 'Career Coaching'],
    maxRadiusKm: 25,
    introVideoUrl: null,
    averageRating: 4.97,
    isVerified: true,
    trustScore: 99,
    services: ['System Design Mentorship', 'Yoga Morning Flow'],
  },
  'sample-6': {
    providerId: 'sample-6',
    displayName: 'David Morales',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    profileImages: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=800&q=80',
    ],
    hourlyRate: 2000,
    bio: 'Sommelier and certified fitness trainer. Available to host wine tasting dinners, curated culinary tours, or 1-on-1 strength training sessions.',
    specialties: ['Fine Dining', 'Fitness Trainer', 'Nightlife', 'Cooking'],
    maxRadiusKm: 30,
    introVideoUrl: null,
    averageRating: 4.94,
    isVerified: true,
    trustScore: 98,
    services: ['Curated Wine Tasting Session', 'Strength Training (1-on-1)'],
  },
};

// Generate realistic slots for today and next few days
function generateDemoSlots() {
  const slots = [];
  const now = new Date();
  for (let i = 1; i <= 4; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    // Morning slot
    const startM = new Date(d);
    startM.setHours(10, 0, 0, 0);
    const endM = new Date(d);
    endM.setHours(12, 0, 0, 0);
    slots.push({
      slotId: `slot-${i}-m`,
      startTime: startM.toISOString(),
      endTime: endM.toISOString(),
      isBooked: false,
    });

    // Afternoon slot
    const startA = new Date(d);
    startA.setHours(14, 30, 0, 0);
    const endA = new Date(d);
    endA.setHours(16, 30, 0, 0);
    slots.push({
      slotId: `slot-${i}-a`,
      startTime: startA.toISOString(),
      endTime: endA.toISOString(),
      isBooked: false,
    });
  }
  return slots;
}

const ProviderDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);
  const [authPromptModal, setAuthPromptModal] = useState(false);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
  const [checkoutTotalAmount, setCheckoutTotalAmount] = useState<number>(0);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Fetch API data
  const { data: apiProvider, isLoading } = useGetProviderQuery(
    userId || '',
    { skip: !userId || userId.startsWith('sample-') }
  );

  const [createBooking] = useCreateBookingMutation();

  // Resolve provider data
  const provider = useMemo(() => {
    if (apiProvider) {
      const slots = apiProvider.upcomingSlots?.length
        ? apiProvider.upcomingSlots
        : generateDemoSlots();
      return {
        ...apiProvider,
        upcomingSlots: slots,
      };
    }
    if (userId && FALLBACK_PROVIDERS_MAP[userId]) {
      return {
        ...FALLBACK_PROVIDERS_MAP[userId],
        upcomingSlots: generateDemoSlots(),
      };
    }
    // Generic fallback for showcase
    return {
      providerId: userId || 'companion',
      displayName: 'Verified Companion',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      profileImages: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
      ],
      hourlyRate: 1500,
      bio: 'Enthusiastic and experienced companion offering activities, city tours, and skill exchange with verified background checks and safety check-ins.',
      specialties: ['Tennis', 'Cooking', 'Art', 'Hiking'],
      maxRadiusKm: 25,
      introVideoUrl: null,
      averageRating: 4.95,
      isVerified: true,
      trustScore: 98,
      upcomingSlots: generateDemoSlots(),
    };
  }, [apiProvider, userId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading companion profile...</p>
        </div>
      </div>
    );
  }

  const galleryImages: string[] =
    provider.profileImages && provider.profileImages.length > 0
      ? provider.profileImages.slice(0, 3)
      : [provider.photoUrl];
  const currentHeroPhoto = galleryImages[activePhotoIdx] || galleryImages[0];

  const availableSlots = (provider.upcomingSlots || []).filter((s: any) => !s.isBooked);
  const selectedSlotData = availableSlots.find((s: any) => s.slotId === selectedSlot);

  const durationHours = selectedSlotData
    ? (new Date(selectedSlotData.endTime).getTime() - new Date(selectedSlotData.startTime).getTime()) / (1000 * 60 * 60)
    : 0;

  const prefilledDate = selectedSlotData
    ? new Date(selectedSlotData.startTime).toISOString().split('T')[0]
    : undefined;
  const prefilledTime = selectedSlotData
    ? new Date(selectedSlotData.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : undefined;
  const prefilledDuration = durationHours > 0 ? durationHours : 2;

  const handleProceedToPayment = async (bookingData: BookingRequirementData) => {
    let createdOrderId = `order_${Date.now()}`;
    if (userId && !userId.startsWith('sample-')) {
      try {
        const startD = new Date(`${bookingData.startDate}T${bookingData.startTime}:00Z`);
        const endD = new Date(startD.getTime() + bookingData.durationHours * 3600000);
        const result = await createBooking({
          providerId: userId,
          startTime: startD.toISOString(),
          endTime: endD.toISOString(),
          hourlyRate: provider.hourlyRate,
          durationHours: bookingData.durationHours,
          meetingAddress: bookingData.meetingVenue,
        }).unwrap();
        if (result?.orderId) {
          createdOrderId = result.orderId;
        }
      } catch (err: any) {
        console.error('Booking API error:', err);
      }
    }

    setCheckoutOrderId(createdOrderId);
    setCheckoutTotalAmount(bookingData.totalAmount);
    setIsRequestModalOpen(false);
    setIsCheckoutModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb / Back button */}
      <div>
        <button
          onClick={() => navigate('/discovery')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to all companions</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Companion Profile Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Card */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-xs">
            {/* Portrait Header */}
            <div className="relative h-80 sm:h-96 bg-muted overflow-hidden">
              <img
                src={currentHeroPhoto}
                alt={provider.displayName}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {galleryImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/15">
                  <PhotoIcon className="w-4 h-4 text-accent" />
                  <span>
                    Photo {activePhotoIdx + 1} of {galleryImages.length}
                  </span>
                </div>
              )}

              <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-white">
                      {provider.displayName}
                    </h1>
                    {provider.isVerified && (
                      <CheckBadgeIcon className="w-7 h-7 text-emerald-400" title="Verified Identity" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{provider.averageRating.toFixed(2)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                      <span>{provider.trustScore}% Trust Score</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>Within {provider.maxRadiusKm} km</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/80 shadow-md text-foreground">
                  <div className="text-2xl font-bold font-serif text-foreground">
                    {formatINR(provider.hourlyRate)}
                    <span className="text-xs font-normal text-muted-foreground">/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Photo Interactive Gallery Strip */}
            {galleryImages.length > 1 && (
              <div className="px-6 pt-5 pb-2 bg-muted/20 border-b border-border flex items-center gap-3 overflow-x-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Profile Gallery ({galleryImages.length}):
                </span>
                <div className="flex items-center gap-2.5">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      aria-label={`Select photo ${idx + 1} of ${provider.displayName}`}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        activePhotoIdx === idx
                          ? 'border-accent ring-2 ring-accent/30 scale-105'
                          : 'border-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${provider.displayName} gallery ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Content Body */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* About */}
              <div>
                <h2 className="text-lg font-bold text-foreground font-serif mb-3">About Me</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {provider.bio}
                </p>
              </div>

              {/* Specialties / Skills */}
              <div>
                <h2 className="text-lg font-bold text-foreground font-serif mb-3">Specialties & Activities</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties.map((spec: string) => (
                    <span
                      key={spec}
                      className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-accent/10 text-accent border border-accent/20"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Offered Services & Gigs (If available) */}
              {provider.services && provider.services.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-bold text-foreground font-serif">💼 Offered Services & Gigs</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {provider.services.map((svc: string) => (
                      <div key={svc} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-foreground">{svc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust & Verification Badges */}
              <div className="p-5 rounded-2xl bg-background border border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <ShieldCheckIcon className="w-6 h-6 text-success mx-auto" />
                  <div className="text-xs font-bold text-foreground">Government ID</div>
                  <div className="text-[11px] text-muted-foreground">Fully Verified</div>
                </div>
                <div className="space-y-1">
                  <ClockIcon className="w-6 h-6 text-accent mx-auto" />
                  <div className="text-xs font-bold text-foreground">Response Time</div>
                  <div className="text-[11px] text-muted-foreground">&lt; 15 Minutes</div>
                </div>
                <div className="space-y-1">
                  <SparklesIcon className="w-6 h-6 text-amber-500 mx-auto" />
                  <div className="text-xs font-bold text-foreground">Escrow Payout</div>
                  <div className="text-[11px] text-muted-foreground">100% Protected</div>
                </div>
              </div>

              {/* Introduction Video if exists */}
              {provider.introVideoUrl && (
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <VideoCameraIcon className="w-6 h-6 text-accent" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">Video Introduction</div>
                      <div className="text-xs text-muted-foreground">Watch a 60-second video message</div>
                    </div>
                  </div>
                  <a
                    href={provider.introVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-muted hover:bg-accent/15 text-xs font-semibold text-accent transition-colors"
                  >
                    Watch Video
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky "Book with Escrow" Reservation Hub */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-card rounded-3xl border border-border p-6 shadow-md space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                Escrow-Protected Experience
              </span>
              <h2 className="text-2xl font-bold font-serif text-foreground">
                Book with Escrow
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                100% of your funds are secured in the Escrow Vault and only released after your companion meetup concludes safely.
              </p>
            </div>

            {/* Rate & Escrow Guarantee Summary */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-foreground">
                <span className="text-muted-foreground">Companion Rate:</span>
                <span className="text-base font-bold font-serif text-accent">{formatRate(provider.hourlyRate)}</span>
              </div>
              <div className="flex justify-between items-center text-foreground">
                <span className="text-muted-foreground">Estimated Deposit ({durationHours || 2} hrs):</span>
                <span className="font-mono font-semibold text-foreground">{formatINR(provider.hourlyRate * (durationHours || 2))}</span>
              </div>
              <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Refund Guarantee if Cancelled</span>
              </div>
            </div>

            {/* Time Slot Picker (Optional Quick Pick) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CalendarDaysIcon className="w-4 h-4 text-accent" />
                  <span>Available Windows (Optional)</span>
                </label>
                {selectedSlot && (
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="text-[11px] text-accent hover:underline font-medium cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-muted/60 text-center text-xs text-muted-foreground">
                  No predefined windows. You can customize date & hours in the booking request.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableSlots.map((slot: any) => {
                    const isSelected = selectedSlot === slot.slotId;
                    const startDate = new Date(slot.startTime);
                    const endDate = new Date(slot.endTime);

                    return (
                      <button
                        key={slot.slotId}
                        type="button"
                        onClick={() => setSelectedSlot(isSelected ? null : slot.slotId)}
                        className={`w-full p-3 rounded-xl border text-left transition-all text-xs flex items-center justify-between shadow-2xs cursor-pointer ${
                          isSelected
                            ? 'border-accent bg-accent/15 text-foreground ring-1 ring-accent'
                            : 'border-border bg-card hover:border-accent/40 text-foreground'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-foreground">
                            {startDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-foreground/70 text-[11px] mt-0.5">
                            {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} -{' '}
                            {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Safety & Boundary Highlights */}
            <div className="p-3.5 rounded-2xl bg-accent/5 border border-accent/15 text-[11px] text-foreground/80 space-y-1.5">
              <div className="font-bold text-accent flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Cue Safety Standard</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Meetups occur exclusively at public venues (cafes, sports clubs, art plazas). Platonic conduct boundaries strictly guaranteed.
              </p>
            </div>

            {/* Primary Action Button: Book with Escrow */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    setAuthPromptModal(true);
                    return;
                  }
                  setIsRequestModalOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <ShieldCheckIcon className="w-5 h-5" />
                <span>Book with Escrow &rarr;</span>
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                🔒 Protected by Cue Escrow Vault until activity completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold font-serif text-foreground">
              Booking Reserved!
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your experience request with <strong>{provider.displayName}</strong> has been secured in escrow. You can now coordinate specifics in the encrypted chat.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate('/bookings')}
                className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-xs hover:bg-accent-hover transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => setBookingSuccessModal(false)}
                className="w-full py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-xs transition-colors"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal (For guest visitors) */}
      {authPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto">
              <SparklesIcon className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-bold font-serif text-foreground">
              Sign In to Reserve
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To guarantee community safety and escrow payment protection, an authenticated account is required to book a companion.
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
                onClick={() => setAuthPromptModal(false)}
                className="text-xs text-muted-foreground hover:underline pt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Canonical Booking Flow: Escrow Request Modal */}
      {isRequestModalOpen && (
        <BookingRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          provider={provider}
          initialDate={prefilledDate}
          initialTime={prefilledTime}
          initialDuration={prefilledDuration}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {/* Escrow Checkout Modal */}
      {isCheckoutModalOpen && checkoutOrderId && (
        <BookingCheckoutModal
          orderId={checkoutOrderId}
          totalAmount={checkoutTotalAmount || (provider.hourlyRate * 2)}
          providerName={provider.displayName}
          isOpen={true}
          onClose={() => setIsCheckoutModalOpen(false)}
          onSuccess={() => {
            setIsCheckoutModalOpen(false);
            setBookingSuccessModal(true);
          }}
        />
      )}
    </div>
  );
};

export default ProviderDetail;
