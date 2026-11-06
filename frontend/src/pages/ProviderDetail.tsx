import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Badge,
  Tag,
  Spinner,
} from '@fluentui/react-components';
import {
  Star16Filled,
  Star16Regular,
  CheckmarkStarburst20Filled,
  ShieldCheckmark24Regular,
  ShieldCheckmark20Regular,
  ShieldCheckmark16Regular,
  Clock20Regular,
  Location16Regular,
  ArrowLeft16Regular,
  Calendar16Regular,
  Video20Regular,
  CheckmarkCircle24Regular,
  CheckmarkCircle20Regular,
  Image16Regular,
  LockClosed16Regular,
} from '@fluentui/react-icons';
import { useGetProviderQuery } from '../store/discoveryApi';
import { useCreateBookingMutation } from '../store/bookingApi';
import { useGetProviderReviewsQuery, type ReviewDto } from '../store/reviewApi';
import { BookingCheckoutModal } from '../components/payment/BookingCheckoutModal';
import { BookingRequestModal, type BookingRequirementData } from '../components/booking/BookingRequestModal';
import { RateBadge } from '../components/ui/RateBadge';
import { formatINR, formatRate } from '../utils/currency';
import { resolveNearestHub } from '../utils/location';
import { toProviderGuid } from '../utils/providerData';
import type { RootState } from '../store';

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
  const { data: apiProvider, isLoading } = useGetProviderQuery(
    resolvedUserId,
    { skip: !resolvedUserId }
  );

  const { data: reviewsData } = useGetProviderReviewsQuery(
    { providerId: resolvedUserId },
    { skip: !resolvedUserId }
  );

  const [createBooking] = useCreateBookingMutation();

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
          <Spinner size="large" />
          <p className="text-body1 text-muted-foreground">Loading guest profile...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-destructive-light flex items-center justify-center text-destructive mb-4">
          <ShieldCheckmark24Regular />
        </div>
        <h2 className="text-title2 text-foreground font-semibold mb-2">Guest not found</h2>
        <p className="text-body1 text-muted-foreground max-w-md mb-6">
          The guest profile you are looking for does not exist or may have been unlisted.
        </p>
        <Button
          appearance="primary"
          size="large"
          icon={<ArrowLeft16Regular />}
          onClick={() => navigate('/discovery')}
          className="min-h-11"
        >
          Browse active guests
        </Button>
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
        alert(err?.data?.error || 'Failed to create booking. Please check guest availability.');
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
        <Button
          appearance="subtle"
          icon={<ArrowLeft16Regular />}
          onClick={() => navigate('/discovery')}
          className="min-h-11"
        >
          Back to all guests
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Companion Profile Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {/* Portrait Header */}
            <div className="relative h-80 sm:h-96 bg-muted overflow-hidden">
              <img
                src={currentHeroPhoto}
                alt={provider.displayName}
                className="w-full h-full object-cover"
              />

              {galleryImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-card/90 px-3 py-1 rounded-full text-caption1 font-semibold text-foreground flex items-center gap-1.5 border border-border tabular">
                  <Image16Regular className="text-brand-fg" />
                  <span>
                    Photo {activePhotoIdx + 1} of {galleryImages.length}
                  </span>
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 bg-card/90 border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 shadow-md">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-title2 font-semibold text-foreground">
                      {provider.displayName}
                    </h1>
                    {provider.isVerified && (
                      <CheckmarkStarburst20Filled className="text-trust" title="Verified Identity" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-caption1 text-muted-foreground">
                    <div className="flex items-center gap-1 text-trust font-semibold tabular">
                      <Star16Filled />
                      <span>{provider.averageRating.toFixed(2)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 tabular">
                      <ShieldCheckmark16Regular className="text-success" />
                      <span>{provider.trustScore}% trust score</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 tabular">
                      <Location16Regular className="text-brand-fg" />
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
              <div className="px-6 py-4 bg-muted border-b border-border flex items-center gap-3 overflow-x-auto">
                <span className="text-caption1 font-semibold text-muted-foreground whitespace-nowrap tabular">
                  Profile gallery ({galleryImages.length}):
                </span>
                <div className="flex items-center gap-2.5">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      aria-label={`Select photo ${idx + 1} of ${provider.displayName}`}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 cursor-pointer ${
                        activePhotoIdx === idx
                          ? 'border-accent'
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
              <div>
                <h2 className="text-subtitle1 font-semibold text-foreground mb-3">About me</h2>
                <p className="text-body1 text-muted-foreground whitespace-pre-line">
                  {provider.bio}
                </p>
              </div>

              {provider.specialties && provider.specialties.length > 0 && (
                <div>
                  <h2 className="text-subtitle1 font-semibold text-foreground mb-3">Specialties & activities</h2>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((spec: string) => (
                      <Tag key={spec} size="medium" appearance="brand">
                        {spec}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {provider.services && provider.services.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-subtitle1 font-semibold text-foreground">Offered services & gigs</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {provider.services.map((svc: string) => (
                      <div key={svc} className="p-4 rounded-lg bg-card border border-border flex items-center gap-3">
                        <CheckmarkCircle20Regular className="text-brand-fg shrink-0" />
                        <span className="text-body1 font-semibold text-foreground">{svc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust & Verification Badges */}
              <div className="p-5 rounded-lg bg-muted border border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="space-y-1 flex flex-col items-center">
                  <ShieldCheckmark24Regular className="text-success" />
                  <div className="text-caption1 font-semibold text-foreground">Government ID</div>
                  <div className="text-caption1 text-muted-foreground">Fully verified</div>
                </div>
                <div className="space-y-1 flex flex-col items-center">
                  <Clock20Regular className="text-brand-fg" />
                  <div className="text-caption1 font-semibold text-foreground">Response time</div>
                  <div className="text-caption1 text-muted-foreground tabular">&lt; 15 minutes</div>
                </div>
                <div className="space-y-1 flex flex-col items-center">
                  <ShieldCheckmark24Regular className="text-trust" />
                  <div className="text-caption1 font-semibold text-foreground">Escrow payout</div>
                  <div className="text-caption1 text-muted-foreground tabular">100% protected</div>
                </div>
              </div>

              {provider.introVideoUrl && (
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <Video20Regular className="text-brand-fg" />
                    <div>
                      <div className="text-body1 font-semibold text-foreground">Video introduction</div>
                      <div className="text-caption1 text-muted-foreground">Watch a 60-second video message</div>
                    </div>
                  </div>
                  <a
                    href={provider.introVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-md bg-muted hover:bg-subtle text-caption1 font-semibold text-brand-fg transition-colors"
                  >
                    Watch video
                  </a>
                </div>
              )}

              {/* Verified Client Reviews Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-subtitle1 font-semibold text-foreground">
                      Verified client reviews
                    </h2>
                    <p className="text-caption1 text-muted-foreground">
                      Authentic ratings from completed safe escrow bookings
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-trust-light border border-trust-border px-3 py-1.5 rounded-lg">
                    <Star16Filled className="text-trust" />
                    <span className="font-mono font-semibold text-body1 text-trust tabular">
                      {(reviewsData?.averageRating ?? provider.averageRating).toFixed(1)}
                    </span>
                    <span className="text-caption1 text-muted-foreground tabular">
                      ({reviewsData?.totalReviews ?? 0} {reviewsData?.totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>

                {!reviewsData || reviewsData.items.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-muted border border-border text-center space-y-2">
                    <ShieldCheckmark24Regular className="text-muted-foreground mx-auto" />
                    <p className="text-subtitle2 font-semibold text-foreground">No public reviews yet</p>
                    <p className="text-caption1 text-muted-foreground max-w-sm mx-auto">
                      Be among the first to experience a verified outing with {provider.displayName} and leave a rating after completion.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewsData.items.map((rev: ReviewDto) => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-3">
                            {rev.reviewerPhotoUrl ? (
                              <img
                                src={rev.reviewerPhotoUrl}
                                alt={rev.reviewerName}
                                className="w-10 h-10 rounded-lg object-cover border border-border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-accent-light border border-border flex items-center justify-center font-semibold text-brand-fg text-body1">
                                {rev.reviewerName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-body1 text-foreground">
                                  {rev.reviewerName}
                                </span>
                                <Badge appearance="tint" color="success">
                                  Verified client
                                </Badge>
                              </div>
                              <span className="font-mono tabular text-caption1 text-muted-foreground">
                                {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md border border-border">
                            {[1, 2, 3, 4, 5].map((s) =>
                              s <= rev.rating ? (
                                <Star16Filled key={s} className="text-trust" />
                              ) : (
                                <Star16Regular key={s} className="text-muted-foreground" />
                              )
                            )}
                          </div>
                        </div>

                        <p className="text-body1 text-foreground">
                          {rev.comment}
                        </p>

                        {(rev.timelinessScore || rev.communicationScore) && (
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {rev.timelinessScore && (
                              <span className="text-caption1 font-mono tabular px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                Punctuality: <strong className="text-foreground">{rev.timelinessScore}/5</strong>
                              </span>
                            )}
                            {rev.communicationScore && (
                              <span className="text-caption1 font-mono tabular px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
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
          <div className="sticky top-24 bg-card rounded-2xl border border-border p-6 shadow-md space-y-6">
            <div>
              <span className="text-caption1 font-semibold text-trust block mb-1">
                Protected experience
              </span>
              <h2 className="text-title3 font-semibold text-foreground">
                Host an outing
              </h2>
              <p className="text-caption1 text-muted-foreground mt-1">
                100% of your payment is held safely in escrow and released only after your outing concludes safely.
              </p>
            </div>

            {/* Rate & Escrow Guarantee Summary */}
            <div className="p-4 rounded-lg bg-muted border border-border space-y-2.5 text-caption1">
              <div className="flex justify-between items-center text-foreground">
                <span className="text-muted-foreground">Guest rate:</span>
                {isAuthenticated ? (
                  <span className="text-body2 font-semibold font-mono tabular text-brand-fg">{formatRate(provider.hourlyRate)}</span>
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
                <span className="text-muted-foreground tabular">Estimated deposit ({durationHours || 2} hrs):</span>
                {isAuthenticated ? (
                  <span className="font-mono tabular font-semibold text-foreground">{formatINR(provider.hourlyRate * (durationHours || 2))}</span>
                ) : (
                  <span className="font-mono tabular font-semibold text-muted-foreground flex items-center gap-1">
                    <LockClosed16Regular className="text-brand-fg" />
                    <span>₹••••</span>
                  </span>
                )}
              </div>
              <div className="pt-2 border-t border-border flex items-center gap-1.5 text-success font-semibold text-caption1">
                <ShieldCheckmark16Regular className="shrink-0" />
                <span>100% refund guarantee if cancelled</span>
              </div>
            </div>

            {/* Time Slot Picker (Optional Quick Pick) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-caption1 font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Calendar16Regular className="text-brand-fg" />
                  <span>Available windows (optional)</span>
                </label>
                {selectedSlot && (
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    className="text-caption1 text-brand-fg hover:underline font-semibold cursor-pointer"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-4 rounded-lg bg-muted text-center text-caption1 text-muted-foreground">
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
                        className={`w-full p-3 rounded-lg border text-left transition-colors text-caption1 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-accent bg-accent-light text-foreground'
                            : 'border-border bg-card hover:bg-muted text-foreground'
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
                          <div className="text-muted-foreground text-caption1 font-mono tabular mt-0.5">
                            {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} –{' '}
                            {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        </div>

                        {isSelected && (
                          <Badge appearance="filled" color="brand">
                            Selected
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Safety & Boundary Highlights */}
            <div className="p-3.5 rounded-lg bg-accent-light border border-border text-caption1 text-foreground space-y-1">
              <div className="font-semibold text-brand-fg flex items-center gap-1.5">
                <ShieldCheckmark16Regular />
                <span>Cue safety standard</span>
              </div>
              <p className="text-muted-foreground">
                Meetups occur exclusively at public venues (cafes, restaurants, sports clubs, art plazas). Platonic conduct boundaries strictly guaranteed.
              </p>
            </div>

            {/* Primary Action Button: Book with Escrow */}
            <div className="space-y-2">
              <Button
                appearance="primary"
                size="large"
                icon={<ShieldCheckmark20Regular />}
                onClick={() => {
                  if (!isAuthenticated) {
                    setAuthPromptModal(true);
                    return;
                  }
                  setIsRequestModalOpen(true);
                }}
                className="w-full min-h-11"
              >
                {isAuthenticated ? 'Book outing with escrow →' : 'Sign in to book outing →'}
              </Button>
              <p className="text-caption1 text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                <ShieldCheckmark16Regular className="text-trust shrink-0" />
                <span>Protected payment: Released only after mutual session PIN check-in.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={bookingSuccessModal} onOpenChange={(_, data) => !data.open && setBookingSuccessModal(false)}>
        <DialogSurface className="max-w-md w-full rounded-2xl bg-card border border-border p-6 text-center">
          <DialogBody>
            <DialogTitle>
              <div className="w-14 h-14 rounded-full bg-success-light text-success flex items-center justify-center mx-auto mb-2">
                <CheckmarkCircle24Regular />
              </div>
              <span className="text-subtitle1 font-semibold text-foreground block text-center">
                Booking reserved!
              </span>
            </DialogTitle>
            <DialogContent className="pt-2 text-center">
              <p className="text-body1 text-muted-foreground">
                Your experience request with <strong>{provider.displayName}</strong> has been secured in escrow. You can now coordinate specifics in the encrypted chat.
              </p>
            </DialogContent>
            <DialogActions className="pt-4 flex flex-col gap-2">
              <Button
                appearance="primary"
                size="large"
                onClick={() => navigate('/bookings')}
                className="w-full min-h-11"
              >
                View my bookings
              </Button>
              <Button
                appearance="secondary"
                size="large"
                onClick={() => setBookingSuccessModal(false)}
                className="w-full min-h-11"
              >
                Keep exploring
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Auth Prompt Modal */}
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
                Create account (quick & free)
              </Button>
              <Button
                appearance="secondary"
                size="large"
                onClick={() => navigate('/login')}
                className="w-full min-h-11"
              >
                Existing user log in
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
