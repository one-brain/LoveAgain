import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XMarkIcon,
  CheckBadgeIcon,
  StarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  SparklesIcon,
  ArrowUpRightIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
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
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // If real backend provider (not starting with sample-), fetch fresh details
  const isRealBackendProvider = Boolean(providerId && !providerId.startsWith('sample-'));
  const { data: apiProvider } = useGetProviderQuery(providerId || '', {
    skip: !isRealBackendProvider || !isOpen,
  });

  // Resolve base information
  const provider: ResolvedProviderInfo = resolveProviderInfo(
    providerId || undefined,
    liveProviders
  );

  // Merge with API data if present
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
  const bio = apiProvider?.bio || provider.bio || 'Verified platform companion offering engaging platonic outings, city tours, and shared experiences.';
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

  // Reset photo index when modal opens for a new provider
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [providerId, isOpen]);

  // Global Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !providerId) return null;

  const handleNavigateToFullProfile = () => {
    onClose();
    navigate(`/provider/${providerId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-modal-title"
    >
      <div
        className="w-full max-w-xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card/90">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <SparklesIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 id="provider-modal-title" className="text-base font-bold text-foreground">
                {displayName}
              </h2>
              <span className="text-xs text-muted-foreground block">
                Companion Profile Details
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close companion preview"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Gallery Hero Section */}
          <div className="relative rounded-2xl overflow-hidden bg-muted h-64 sm:h-72 border border-border/70 group">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={displayName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <PhotoIcon className="w-12 h-12 stroke-1" />
                <span className="text-xs">No photos published</span>
              </div>
            )}

            {/* Overlaid Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
              {isVerified && (
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1 shadow-xs border border-white/10">
                  <CheckBadgeIcon className="w-3.5 h-3.5 text-accent" />
                  <span>ID Verified</span>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1 shadow-xs border border-white/10">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{trustScore}% Trust Score</span>
              </span>
            </div>

            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-md">
                {formatRate(hourlyRate)}
              </span>
            </div>

            {/* 3-Photo Interactive Thumbnails Strip */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`relative w-8 h-8 rounded-lg overflow-hidden transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      activePhotoIndex === idx
                        ? 'ring-2 ring-accent scale-110'
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
                <h3 className="text-2xl font-bold font-serif text-foreground">
                  {displayName}
                </h3>
                {isVerified && (
                  <CheckBadgeIcon className="w-6 h-6 text-accent shrink-0" title="Verified Companion" />
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <StarIcon className="w-4 h-4 fill-amber-500" />
                  <span>{rating.toFixed(2)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-accent" />
                  <span>
                    {baseHub ? `${baseHub.hubName} • ` : ''}Travels within {maxRadiusKm} km
                  </span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Hourly Rate</span>
              <span className="text-xl font-bold font-mono text-foreground">
                {formatRate(hourlyRate)}
              </span>
            </div>
          </div>

          {/* Bio Story */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              About {displayName.split(' ')[0]}
            </h4>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </div>

          {/* Specialties / Activities */}
          {specialties.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Outing Specialties & Passions
              </h4>
              <div className="flex flex-wrap gap-2">
                {specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-accent/10 border border-accent/20 text-accent font-semibold text-xs"
                  >
                    ✨ {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Platform Escrow Guarantee Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 block">
                Escrow Protected & Identity-Verified
              </span>
              <span className="text-muted-foreground">
                Sessions take place in public venues with 100% platonic conduct guidelines and money-back guarantee.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/80 bg-card/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Close Preview
          </button>

          <button
            type="button"
            onClick={handleNavigateToFullProfile}
            className="px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs transition-all shadow-xs hover:bg-accent-hover flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Full Profile Page</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

