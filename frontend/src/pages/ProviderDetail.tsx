import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProviderQuery } from '../store/discoveryApi';
import { useCreateBookingMutation } from '../store/bookingApi';
import { useGetProviderReviewsQuery, type ReviewDto } from '../store/reviewApi';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
import { BookingRequestModal, type BookingRequirementData } from '../components/booking/BookingRequestModal';
import { RateBadge } from '../components/ui/RateBadge';
import { formatINR, formatRate } from '../utils/currency';
import { resolveNearestHub } from '../utils/location';
import { toProviderGuid } from '../utils/providerData';
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
  LockClosedIcon,
} from '@heroicons/react/24/outline';



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

  const resolvedUserId = userId ? toProviderGuid(userId) : '';
  // Fetch API data
  const { data: apiProvider, isLoading } = useGetProviderQuery(
    resolvedUserId,
    { skip: !resolvedUserId }
  );

  const { data: reviewsData } = useGetProviderReviewsQuery(
    { providerId: resolvedUserId },
    { skip: !resolvedUserId }
  );

  const [createBooking] = useCreateBookingMutation();

  // Resolve provider data directly from API
  const provider = useMemo<any>(() => {
    if (apiProvider) {
      return apiProvider;
    }
    return null;
  }, [apiProvider]);

  const baseHub = useMemo(() => {
    if (!provider) return null;
    const lat = provider.latitude;
    const lon = provider.longitude;
    if (lat != null && lon != null) {
      return resolveNearestHub(lat, lon);
    }
    return null;
  }, [provider?.latitude, provider?.longitude]);

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

  if (!provider) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 mb-4">
          <ShieldCheckIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-foreground font-semibold mb-2">Companion Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          The companion profile you are looking for does not exist or may have been unlisted.
        </p>
        <button
          onClick={() => navigate('/discovery')}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Browse Active Companions</span>
        </button>
      </div>
    );
  }

  const galleryImages: string[] =
    provider.profileImages && provider.profileImages.length > 0
      ? provider.profileImages.slice(0, 3)
      : (provider.photoUrl ? [provider.photoUrl] : []);
  const currentHeroPhoto = galleryImages[activePhotoIdx] || galleryImages[0] || '';

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
    if (userId) {
      try {
        const startD = new Date(`${bookingData.startDate}T${bookingData.startTime}:00`);
        const endD = new Date(startD.getTime() + bookingData.durationHours * 3600000);
        const result = await createBooking({
          providerId: toProviderGuid(userId),
          startTime: startD.toISOString(),
          endTime: endD.toISOString(),
          hourlyRate: provider.hourlyRate,
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
          createdOrderId = result.orderId;
        }
      } catch (err: any) {
        console.error('Booking API error:', err);
        alert(err?.data?.error || 'Failed to create booking. Please check companion availability.');
        return;
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
                    <h1 className="text-4xl sm:text-5xl font-normal tracking-tight font-display text-white">
                      {provider.displayName}
                    </h1>
                    {provider.isVerified && (
                      <CheckBadgeIcon className="w-7 h-7 text-emerald-400" title="Verified Identity" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/90">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold font-mono">{provider.averageRating.toFixed(2)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                      <span>{provider.trustScore}% Trust Score</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4 text-accent" />
                      <span>{baseHub ? `${baseHub.hubName} • ` : ''}Within {provider.maxRadiusKm} km</span>
                    </div>
                  </div>
                </div>

                <RateBadge
                  variant="detail-header"
                  rate={provider.hourlyRate}
                  isAuthenticated={isAuthenticated}
                  onAuthPrompt={() => setAuthPromptModal(true)}
                />
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
              {provider.specialties && provider.specialties.length > 0 && (
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
              )}

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

              {/* Verified Client Reviews Section */}
              <div className="space-y-4 pt-4 border-t border-border/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                      Verified Client Reviews
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Authentic ratings from completed Safe Escrow bookings
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-2xl">
                    <SolidStarIcon className="w-4 h-4 text-[#C5A059]" />
                    <span className="font-mono font-bold text-sm text-[#C5A059] tabular-nums">
                      {(reviewsData?.averageRating ?? provider.averageRating).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      ({reviewsData?.totalReviews ?? 0} {reviewsData?.totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>

                {!reviewsData || reviewsData.items.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-muted/20 border border-border/70 text-center space-y-2">
                    <ShieldCheckIcon className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                    <p className="font-serif text-base font-semibold text-foreground">No public reviews yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Be among the first to experience a verified outing with {provider.displayName} and leave a rating after completion.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewsData.items.map((rev: ReviewDto) => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-3xl bg-card border border-border/70 shadow-xs space-y-3 hover:border-accent/30 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-3">
                            {rev.reviewerPhotoUrl ? (
                              <img
                                src={rev.reviewerPhotoUrl}
                                alt={rev.reviewerName}
                                className="w-10 h-10 rounded-2xl object-cover border border-border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center font-serif font-bold text-accent text-sm">
                                {rev.reviewerName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-foreground">
                                  {rev.reviewerName}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  Verified Client
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating Badge */}
                          <div className="flex items-center gap-1 bg-muted/40 px-2.5 py-1 rounded-xl border border-border/60">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <SolidStarIcon
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'text-[#C5A059]' : 'text-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Review Commentary */}
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {rev.comment}
                        </p>

                        {/* Sub-Score Badges (if present) */}
                        {(rev.timelinessScore || rev.communicationScore) && (
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {rev.timelinessScore && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border/50">
                                Punctuality: <strong className="text-foreground">{rev.timelinessScore}/5</strong>
                              </span>
                            )}
                            {rev.communicationScore && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border/50">
                                Communication: <strong className="text-foreground">{rev.communicationScore}/5</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky "Book with Escrow" Reservation Hub */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-card rounded-3xl border border-border p-6 shadow-md space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                Protected Experience
              </span>
              <h2 className="text-2xl font-bold font-serif text-foreground">
                Book a Meetup
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                100% of your payment is held safely by the platform and released only after your meetup concludes safely.
              </p>
            </div>

            {/* Rate & Escrow Guarantee Summary */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-foreground">
                <span className="text-muted-foreground">Companion Rate:</span>
                {isAuthenticated ? (
                  <span className="text-base font-bold font-serif text-accent">{formatRate(provider.hourlyRate)}</span>
                ) : (
                  <RateBadge
                    variant="row-item"
                    rate={provider.hourlyRate}
                    isAuthenticated={false}
                    onAuthPrompt={() => setAuthPromptModal(true)}
                  />
                )}
              </div>
              <div className="flex justify-between items-center text-foreground">
                <span className="text-muted-foreground">Estimated Deposit ({durationHours || 2} hrs):</span>
                {isAuthenticated ? (
                  <span className="font-mono font-semibold text-foreground">{formatINR(provider.hourlyRate * (durationHours || 2))}</span>
                ) : (
                  <span className="font-mono font-semibold text-muted-foreground flex items-center gap-1">
                    <LockClosedIcon className="w-3.5 h-3.5 text-accent" />
                    <span>₹••••</span>
                  </span>
                )}
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
                        onClick={() => {
                          if (!isAuthenticated) {
                            setAuthPromptModal(true);
                            return;
                          }
                          setSelectedSlot(isSelected ? null : slot.slotId);
                        }}
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
                <span>{isAuthenticated ? 'Book a Meetup \u2192' : 'Sign In to Book a Meetup \u2192'}</span>
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                🔒 Protected Payment: Released only after your meetup concludes safely.
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
              Sign In to Unlock Pricing & Reserve
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To guarantee companion privacy and escrow protection, an authenticated account is required to inspect hourly rates and book meetups.
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
