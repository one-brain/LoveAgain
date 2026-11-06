import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@fluentui/react-components';
import {
  Dismiss20Regular,
  CheckmarkStarburst16Filled,
  Star16Filled,
  ShieldCheckmark16Regular,
  ShieldCheckmark20Regular,
  Location16Regular,
  ArrowUpRight16Regular,
  Image24Regular,
  Person20Regular,
} from '@fluentui/react-icons';
import type { RootState } from '../../store';
import { RateBadge } from '../ui/RateBadge';
import { formatRate } from '../../utils/currency';
import { resolveNearestHub } from '../../utils/location';
import { resolveProviderInfo, type ResolvedProviderInfo } from '../../utils/providerData';
import { useGetProviderQuery } from '../../store/discoveryApi';

interface ProviderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string | null;
  liveProviders?: any[];
}

export const ProviderProfileModal: React.FC<ProviderProfileModalProps> = ({
  isOpen,
  onClose,
  providerId,
  liveProviders,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const isRealBackendProvider = Boolean(providerId && !providerId.startsWith('sample-'));
  const { data: apiProvider } = useGetProviderQuery(providerId || '', {
    skip: !isRealBackendProvider || !isOpen,
  });

  const provider: ResolvedProviderInfo = resolveProviderInfo(
    providerId || undefined,
    liveProviders
  );

  const displayName = apiProvider?.displayName || provider.displayName;
  const rawImages = apiProvider?.profileImages && apiProvider.profileImages.length > 0
    ? apiProvider.profileImages
    : provider.profileImages && provider.profileImages.length > 0
    ? provider.profileImages
    : provider.photoUrl
    ? [provider.photoUrl]
    : [];
  const galleryImages = rawImages.slice(0, 3);
  const currentPhoto = galleryImages[activePhotoIndex] || galleryImages[0] || provider.photoUrl;

  const hourlyRate = apiProvider?.hourlyRate ?? provider.hourlyRate ?? 1500;
  const rating = apiProvider?.averageRating ?? provider.averageRating ?? 4.95;
  const trustScore = apiProvider?.trustScore ?? provider.trustScore ?? 98;
  const isVerified = apiProvider?.isVerified ?? provider.isVerified ?? true;
  const bio = apiProvider?.bio || provider.bio || 'Verified platform guest offering engaging platonic outings, dining companionships, and shared experiences.';
  const specialties = apiProvider?.specialties || provider.specialties || (provider.specialty ? [provider.specialty] : ['Companionship']);
  const maxRadiusKm = apiProvider?.maxRadiusKm ?? provider.maxRadiusKm ?? 25;

  const lat = apiProvider?.latitude ?? provider.latitude;
  const lon = apiProvider?.longitude ?? provider.longitude;
  const baseHub =
    lat != null && lon != null
      ? resolveNearestHub(lat, lon)
      : provider.area
      ? { hubName: `${provider.area}, ${provider.city || 'India'}` }
      : null;

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [providerId, isOpen]);

  if (!isOpen || !providerId) return null;

  const handleNavigateToFullProfile = () => {
    onClose();
    navigate(`/provider/${providerId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface
        className="max-w-xl w-full bg-card border border-border rounded-2xl p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <DialogBody>
          <DialogTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close guest preview"
                icon={<Dismiss20Regular />}
                onClick={onClose}
              />
            }
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-accent-light text-brand-fg flex items-center justify-center shrink-0">
                <Person20Regular />
              </span>
              <div>
                <span id="provider-modal-title" className="text-subtitle1 font-semibold text-foreground block">
                  {displayName}
                </span>
                <span className="text-caption1 font-normal text-muted-foreground block">
                  Guest profile details
                </span>
              </div>
            </div>
          </DialogTitle>

          <DialogContent className="space-y-5 pt-4">
            {/* Gallery Hero Section */}
            <div className="relative rounded-2xl overflow-hidden bg-muted h-64 sm:h-72 border border-border">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Image24Regular />
                  <span className="text-caption1">No photos published</span>
                </div>
              )}

              {/* Overlaid Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                {isVerified && (
                  <Badge
                    appearance="filled"
                    icon={<CheckmarkStarburst16Filled />}
                    className="bg-trust-light text-trust border border-trust-border"
                  >
                    ID verified
                  </Badge>
                )}
                <Badge
                  appearance="filled"
                  color="success"
                  icon={<ShieldCheckmark16Regular />}
                  className="tabular"
                >
                  {trustScore}% trust score
                </Badge>
              </div>

              <div className="absolute top-3 right-3 z-10">
                <RateBadge
                  variant="card-badge"
                  rate={hourlyRate}
                  isAuthenticated={isAuthenticated}
                  onAuthPrompt={() => {
                    onClose();
                    navigate('/login?redirect=/discovery');
                  }}
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-full border border-border">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      aria-label={`View photo ${idx + 1}`}
                      className={`relative w-8 h-8 rounded-md overflow-hidden transition-all cursor-pointer ${
                        activePhotoIndex === idx
                          ? 'ring-2 ring-accent'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Identity & Rating Row */}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-title3 font-semibold text-foreground">
                    {displayName}
                  </h3>
                  {isVerified && (
                    <CheckmarkStarburst16Filled className="text-trust shrink-0" title="Verified Guest" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-caption1 text-muted-foreground mt-1">
                  <span className="flex items-center gap-1 text-trust font-semibold tabular">
                    <Star16Filled />
                    <span>{rating.toFixed(2)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Location16Regular className="text-brand-fg" />
                    <span className="tabular">
                      {baseHub ? `${baseHub.hubName} • ` : ''}Travels within {maxRadiusKm} km
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-caption1 text-muted-foreground block">Hourly rate</span>
                {isAuthenticated ? (
                  <span className="text-subtitle1 font-semibold font-mono tabular text-foreground">
                    {formatRate(hourlyRate)}
                  </span>
                ) : (
                  <RateBadge
                    variant="row-item"
                    rate={hourlyRate}
                    isAuthenticated={false}
                    onAuthPrompt={() => {
                      onClose();
                      navigate('/login?redirect=/discovery');
                    }}
                  />
                )}
              </div>
            </div>

            {/* Bio Story */}
            <div className="p-4 rounded-lg bg-muted border border-border">
              <h4 className="text-caption1 font-semibold text-muted-foreground mb-1.5">
                About {displayName.split(' ')[0]}
              </h4>
              <p className="text-body1 text-foreground whitespace-pre-line">
                {bio}
              </p>
            </div>

            {/* Specialties / Activities */}
            {specialties.length > 0 && (
              <div>
                <h4 className="text-caption1 font-semibold text-muted-foreground mb-2">
                  Outing specialties & passions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((spec, i) => (
                    <Tag key={i} size="small" appearance="brand">
                      {spec}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Escrow Guarantee Notice */}
            <div className="p-3.5 rounded-lg bg-success-light border border-border flex items-center gap-3">
              <ShieldCheckmark20Regular className="text-success shrink-0" />
              <div className="text-caption1">
                <span className="font-semibold text-success block">
                  Escrow protected & identity-verified
                </span>
                <span className="text-muted-foreground">
                  Sessions take place in public venues with 100% platonic conduct guidelines and money-back guarantee.
                </span>
              </div>
            </div>
          </DialogContent>

          <DialogActions className="pt-4">
            <Button
              appearance="secondary"
              size="large"
              className="min-h-11"
              onClick={onClose}
            >
              Close preview
            </Button>
            <Button
              appearance="primary"
              size="large"
              className="min-h-11"
              icon={<ArrowUpRight16Regular />}
              iconPosition="after"
              onClick={handleNavigateToFullProfile}
            >
              Open full profile page
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
