import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { useSearchParams, Link } from 'react-router-dom';
import type { RootState } from '../store';
import {
  useGetSeekerProfileQuery,
  useUpdateSeekerProfileMutation,
  useUploadSeekerPhotoMutation,
  useGetMyProfileQuery,
  useUpdateProviderProfileMutation,
  useUploadCompanionPhotoMutation,
} from '../store/api';
import {
  BriefcaseIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  MapPinIcon,
  BanknotesIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const PRESET_SPECIALTIES = [
  'Photography & Video',
  'Fitness & Sports Coaching',
  'Yoga & Mindfulness',
  'Language Tutoring',
  'Coding & Tech Mentorship',
  'DJ & Music Performance',
  'City Guide & Tours',
  'Dinner Date & Foodie',
  'Concert & Festival Buddy',
  'Workout & Tennis Partner',
  'Business Gala & Plus-One',
  'Hiking & Outdoor Walks',
  'Seeking Matrimony Match',
  'Live-In Compatibility',
];

const SLOT_LABELS = [
  { index: 0, title: 'Photo 1 · Primary Cover', subtitle: 'Main card photo in Browse Profiles' },
  { index: 1, title: 'Photo 2 · Activity / Hobby', subtitle: 'Showcases your skill or activity' },
  { index: 2, title: 'Photo 3 · Candid / Social', subtitle: 'Full-length or social setting photo' },
];

/**
 * Compresses and resizes an uploaded image file via HTML5 Canvas so uploads are fast
 * and Base64 fallbacks remain lightweight (<120KB).
 */
async function compressImageFile(file: File, maxDim = 800, quality = 0.82): Promise<{ file: File; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'));
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
            });
            resolve({ file: compressedFile, dataUrl });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'personal' | 'provider' | 'kyc'>(
    tabParam === 'provider' ? 'provider' : tabParam === 'kyc' ? 'kyc' : 'personal'
  );

  useEffect(() => {
    if (tabParam === 'provider' || tabParam === 'kyc' || tabParam === 'personal') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'personal' | 'provider' | 'kyc') => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'personal') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  // Queries
  const shouldSkip = !accessToken;
  const { data: seekerData, isLoading: seekerLoading, refetch: refetchSeeker } = useGetSeekerProfileQuery(undefined, { skip: shouldSkip });
  const { data: providerData, isLoading: providerLoading, refetch: refetchProvider } = useGetMyProfileQuery(undefined, { skip: shouldSkip });

  // Mutations
  const [updateSeeker, { isLoading: isUpdatingSeeker }] = useUpdateSeekerProfileMutation();
  const [uploadSeekerPhoto, { isLoading: isUploadingAvatar }] = useUploadSeekerPhotoMutation();
  const [updateProvider, { isLoading: isUpdatingProvider }] = useUpdateProviderProfileMutation();
  const [uploadCompanionPhoto] = useUploadCompanionPhotoMutation();

  // Personal Form State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [personalSuccess, setPersonalSuccess] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // Provider Form State (Display Name + 3 Profile Images)
  const [displayName, setDisplayName] = useState('');
  const [profileImages, setProfileImages] = useState<string[]>(['', '', '']);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [hourlyRate, setHourlyRate] = useState('1500');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>(['Dinner Date & Foodie', 'City Guide & Tours']);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>(PRESET_SPECIALTIES);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [specialtyFeedback, setSpecialtyFeedback] = useState('');
  const [maxRadiusKm, setMaxRadiusKm] = useState('25');
  const [providerSuccess, setProviderSuccess] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const providerProfile = providerData?.profile;
  const companionStatus = providerProfile?.status || 'Draft';

  // Populate Personal Details
  useEffect(() => {
    if (seekerData?.profile) {
      const p = seekerData.profile;
      setFirstName(p.firstName || user?.firstName || '');
      setLastName(p.lastName || user?.lastName || '');
      setPhone(p.phone || '');
      setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '');
      if (p.photoUrl) setAvatarUrl(p.photoUrl);
    } else if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [seekerData, user]);

  // Populate Provider Details (including DisplayName and 3 ProfileImages)
  useEffect(() => {
    if (providerProfile) {
      const defaultDisplay =
        providerProfile.displayName ||
        `${seekerData?.profile?.firstName || user?.firstName || ''} ${seekerData?.profile?.lastName || user?.lastName || ''}`.trim();
      setDisplayName(defaultDisplay);
      setHourlyRate(providerProfile.hourlyRate ? String(providerProfile.hourlyRate) : '1500');
      setBio(providerProfile.bio || '');
      setMaxRadiusKm(providerProfile.maxRadiusKm ? String(providerProfile.maxRadiusKm) : '25');

      if (providerProfile.profileImages && providerProfile.profileImages.length > 0) {
        const slots = ['', '', ''];
        providerProfile.profileImages.slice(0, 3).forEach((url, idx) => {
          slots[idx] = url || '';
        });
        setProfileImages(slots);
      }

      if (providerProfile.specialties && providerProfile.specialties.length > 0) {
        setSpecialties(providerProfile.specialties);
        setAvailableSpecialties((prev) => {
          const combined = [...prev];
          for (const s of providerProfile.specialties) {
            if (!combined.some((item) => item.toLowerCase() === s.toLowerCase())) {
              combined.push(s);
            }
          }
          return combined;
        });
      }
    } else if (user && !displayName) {
      setDisplayName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    }
  }, [providerProfile, seekerData, user]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPersonalError(null);
    try {
      const { file: compressedFile, dataUrl } = await compressImageFile(file, 600, 0.85);
      setAvatarUrl(dataUrl);
      const formData = new FormData();
      formData.append('file', compressedFile);
      const res: any = await uploadSeekerPhoto(formData).unwrap();
      if (res?.photoUrl || res?.profile?.photoUrl) {
        setAvatarUrl(res?.photoUrl || res?.profile?.photoUrl);
      }
      await refetchSeeker();
      setPersonalSuccess(true);
      setTimeout(() => setPersonalSuccess(false), 3500);
    } catch {
      // Fallback keeps compressed dataUrl in UI
    } finally {
      e.target.value = '';
    }
  };

  const handleCompanionSlotFileUpload = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProviderError(null);
    setUploadingSlot(slotIndex);

    try {
      const { file: compressedFile, dataUrl } = await compressImageFile(file, 800, 0.82);
      let finalUrl = dataUrl;

      try {
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('slot', String(slotIndex + 1));
        const res = await uploadCompanionPhoto(formData).unwrap();
        if (res?.photoUrl) {
          finalUrl = res.photoUrl;
        }
      } catch {
        // Use client-compressed dataUrl if multipart upload fails
        finalUrl = dataUrl;
      }

      setProfileImages((prev) => {
        const next = [...prev];
        next[slotIndex] = finalUrl;
        return next;
      });
    } catch (err: any) {
      setProviderError(err?.message || 'Could not process selected image file.');
    } finally {
      setUploadingSlot(null);
      e.target.value = '';
    }
  };

  const handleSlotUrlChange = (slotIndex: number, value: string) => {
    setProfileImages((prev) => {
      const next = [...prev];
      next[slotIndex] = value;
      return next;
    });
  };

  const handleRemoveSlotImage = (slotIndex: number) => {
    setProfileImages((prev) => {
      const next = [...prev];
      next[slotIndex] = '';
      return next;
    });
  };

  const handleUpdateSeeker = async (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalError(null);
    setPersonalSuccess(false);
    try {
      const cleanFirst = firstName.trim();
      const cleanLast = lastName.trim();
      const cleanPhone = phone.trim() || null;
      const cleanDob = dateOfBirth.trim() || null;

      await updateSeeker({
        firstName: cleanFirst,
        lastName: cleanLast,
        phone: cleanPhone,
        dateOfBirth: cleanDob,
      }).unwrap();

      if (user) {
        dispatch(
          setUser({
            ...user,
            firstName: cleanFirst,
            lastName: cleanLast,
          })
        );
      }

      await refetchSeeker();
      setPersonalSuccess(true);
      setTimeout(() => setPersonalSuccess(false), 4000);
    } catch (err: any) {
      setPersonalError(
        err?.data?.error || 'Failed to update personal details. Please verify your inputs.'
      );
    }
  };

  const handleToggleSpecialty = (spec: string) => {
    setSpecialtyFeedback('');
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleAddCustomSpecialty = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = customSpecialty.trim();
    if (!query) return;

    const matched = availableSpecialties.find(
      (s) => s.trim().toLowerCase() === query.toLowerCase()
    );

    if (matched) {
      if (!specialties.includes(matched)) {
        setSpecialties((prev) => [...prev, matched]);
      }
      setSpecialtyFeedback(`Selected existing: "${matched}"`);
    } else {
      const capitalized = query.replace(/\b\w/g, (c) => c.toUpperCase());
      setAvailableSpecialties((prev) => [...prev, capitalized]);
      setSpecialties((prev) => [...prev, capitalized]);
      setSpecialtyFeedback(`Added new custom specialty: "${capitalized}"`);
    }
    setCustomSpecialty('');
  };

  const handleUpdateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setProviderError(null);
    setProviderSuccess(false);

    if (!displayName.trim()) {
      setProviderError('Please provide a Companion Display Name for Browse Profiles.');
      return;
    }

    if (specialties.length === 0) {
      setProviderError('Please select at least one specialty or activity.');
      return;
    }

    const cleanedImages = profileImages.map((img) => img.trim()).filter((img) => img.length > 0).slice(0, 3);

    try {
      await updateProvider({
        DisplayName: displayName.trim(),
        ProfileImages: cleanedImages,
        HourlyRate: Number(hourlyRate),
        Bio: bio,
        Specialties: specialties,
        MaxRadiusKm: Number(maxRadiusKm),
      }).unwrap();
      await refetchProvider();
      setProviderSuccess(true);
      setTimeout(() => setProviderSuccess(false), 4000);
    } catch (err: any) {
      setProviderError(err?.data?.error || 'Failed to update companion settings.');
    }
  };

  if (seekerLoading || providerLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading unified profile...</p>
        </div>
      </div>
    );
  }

  const netRate = (Number(hourlyRate) * 0.85).toFixed(0);
  const activeHeroAvatar =
    profileImages.find((img) => img && img.trim().length > 0) || avatarUrl;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Summary Card */}
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group flex-shrink-0">
          {activeHeroAvatar ? (
            <img
              src={activeHeroAvatar}
              alt={displayName || firstName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md border-2 border-border/80"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-accent to-accent-hover text-accent-foreground font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-md border-2 border-border/80">
              {firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            title="Upload Profile Photo"
            className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-accent text-accent-foreground text-[10px] font-bold shadow-md hover:bg-accent-hover transition-colors flex items-center gap-1"
          >
            <ArrowUpTrayIcon className="w-3 h-3" />
            <span>{isUploadingAvatar ? '...' : 'Photo'}</span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
              {displayName || `${firstName} ${lastName}`.trim() || 'Member'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success w-fit mx-auto sm:mx-0">
              <CheckBadgeIcon className="w-3.5 h-3.5" />
              <span>Unified Account</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{user?.email}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted text-xs font-medium text-foreground">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              <span>Trust Score: 99%</span>
            </span>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <CalendarDaysIcon className="w-4 h-4 text-accent" />
              <span>My Bookings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3-Tab Segmented Switcher */}
      <div className="flex border-b border-border/80 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabChange('personal')}
          className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'personal'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserCircleIcon className="w-4 h-4" />
          <span>1. Personal Details</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('provider')}
          className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'provider'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BriefcaseIcon className="w-4 h-4" />
          <span>2. Companion & Provider Settings</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('kyc')}
          className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'kyc'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          <span>3. Identity & KYC</span>
        </button>
      </div>

      {/* Tab 1: Personal Information */}
      {activeTab === 'personal' && (
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold font-serif text-foreground">Personal Information</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Your contact details used for notifications and booking confirmations.
            </p>
          </div>

          {personalSuccess && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span>Personal details updated successfully!</span>
            </div>
          )}

          {personalError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {personalError}
            </div>
          )}

          <form onSubmit={handleUpdateSeeker} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Account Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-muted-foreground text-sm cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Phone Number (For Safety Alerts)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingSeeker}
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40"
              >
                {isUpdatingSeeker ? 'Saving Changes...' : 'Save Personal Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Companion & Provider Settings */}
      {activeTab === 'provider' && (
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">Companion & Provider Settings</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configure your public Display Name, 3 Browse Profile photos, hourly rate, and offered activities.
              </p>
            </div>

            {companionStatus === 'Approved' ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold w-fit">
                ✓ Approved Companion
              </span>
            ) : companionStatus === 'PendingReview' ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold w-fit">
                ⏳ Application In Review
              </span>
            ) : (
              <Link
                to="/apply-companion"
                className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors"
              >
                Apply for Companion Verification &rarr;
              </Link>
            )}
          </div>

          {providerSuccess && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span>Companion Display Name, 3 profile images, and settings saved!</span>
              </div>
              {companionStatus === 'Draft' && (
                <Link
                  to="/apply-companion"
                  className="px-3 py-1 rounded-lg bg-accent text-accent-foreground text-[11px] font-bold hover:opacity-90 transition-opacity w-fit"
                >
                  Complete Verification (ID & Payout) &rarr;
                </Link>
              )}
            </div>
          )}

          {providerError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {providerError}
            </div>
          )}

          <form onSubmit={handleUpdateProvider} className="space-y-6">
            {/* Public Companion Display Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Companion Display Name (Shown on Browse Profiles)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Elena Rostova or Aarav K."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                This name is displayed publicly on your Discovery card and Companion profile page.
              </span>
            </div>

            {/* 3 Profile Images Uploader */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Companion Profile Images (Upload up to 3 Photos for Browse Profiles)
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Upload directly from your device or paste an image URL. All 3 photos appear in an interactive carousel during Browse Profiles.
                  </p>
                </div>
                <span className="text-xs font-bold text-accent">
                  {profileImages.filter((u) => u && u.trim().length > 0).length} / 3 Uploaded
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SLOT_LABELS.map((slot) => {
                  const currentImg = profileImages[slot.index] || '';
                  const isUploadingThisSlot = uploadingSlot === slot.index;

                  return (
                    <div
                      key={slot.index}
                      className="rounded-2xl border border-border bg-muted/20 p-3 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-foreground">{slot.title}</span>
                          {currentImg && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlotImage(slot.index)}
                              className="text-destructive hover:opacity-80 p-1"
                              title="Remove photo"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">{slot.subtitle}</p>

                        {/* Image Preview Box */}
                        <div
                          onClick={() => fileInputRefs.current[slot.index]?.click()}
                          className="relative h-44 w-full rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-accent bg-background flex flex-col items-center justify-center cursor-pointer group transition-colors"
                        >
                          {currentImg ? (
                            <>
                              <img
                                src={currentImg}
                                alt={slot.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="px-3 py-1.5 rounded-lg bg-card/90 text-foreground text-xs font-semibold flex items-center gap-1.5 shadow-md">
                                  <ArrowUpTrayIcon className="w-4 h-4 text-accent" />
                                  Replace Photo
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-4 space-y-1.5">
                              <PhotoIcon className="w-8 h-8 text-muted-foreground mx-auto group-hover:text-accent transition-colors" />
                              <div className="text-xs font-semibold text-foreground">
                                {isUploadingThisSlot ? 'Uploading...' : 'Click to Upload Photo'}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                JPG, PNG, WebP
                              </div>
                            </div>
                          )}
                        </div>

                        <input
                          ref={(el) => {
                            fileInputRefs.current[slot.index] = el;
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCompanionSlotFileUpload(slot.index, e)}
                          className="hidden"
                        />
                      </div>

                      {/* Upload Button + Optional URL input */}
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          disabled={isUploadingThisSlot}
                          onClick={() => fileInputRefs.current[slot.index]?.click()}
                          className="w-full py-1.5 px-3 rounded-xl bg-accent/10 hover:bg-accent hover:text-accent-foreground text-accent font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                          <span>
                            {isUploadingThisSlot
                              ? 'Uploading...'
                              : currentImg
                              ? 'Upload Different File'
                              : 'Upload from Device'}
                          </span>
                        </button>
                        <input
                          type="text"
                          value={currentImg.startsWith('data:') ? '' : currentImg}
                          onChange={(e) => handleSlotUrlChange(slot.index, e.target.value)}
                          placeholder="Or paste image URL..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-[11px] focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Hourly Rate (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-foreground">₹</span>
                  <input
                    type="number"
                    min="500"
                    max="50000"
                    step="50"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Recommended: ₹800 – ₹3,000/hr. You receive <strong>₹{netRate}/hr</strong> (85% net take-home via Escrow Vault).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Max Travel Radius (km)
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={maxRadiusKm}
                    onChange={(e) => setMaxRadiusKm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  Maximum distance from your home location you are willing to travel for meets.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Public Bio & Introduction
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your conversational style, hobbies, activities offered, and experience..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2">
                Offered Specialties & Activities ({specialties.length} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map((spec) => {
                  const isSelected = specialties.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleToggleSpecialty(spec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-accent text-accent-foreground border-accent shadow-xs'
                          : 'bg-muted/40 text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{spec}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Specialty with Deduplication */}
              <div className="mt-3 p-3 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  value={customSpecialty}
                  onChange={(e) => setCustomSpecialty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSpecialty();
                    }
                  }}
                  placeholder="Can't find an activity? Add custom (e.g. Squash, Wine Tasting)..."
                  className="flex-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomSpecialty()}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-hover transition-colors whitespace-nowrap"
                >
                  + Add Specialty
                </button>
              </div>
              {specialtyFeedback && (
                <p className="text-[11px] font-medium text-accent mt-1.5">{specialtyFeedback}</p>
              )}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProvider}
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40"
              >
                {isUpdatingProvider ? 'Saving Changes...' : 'Save Companion Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Verification & KYC */}
      {activeTab === 'kyc' && (
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold font-serif text-foreground">Identity Verification & Trust Status</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Cue enforces strict identity checks to ensure a safe, scam-free community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center space-y-1">
              <ShieldCheckIcon className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-xs font-bold text-foreground">Government ID</div>
              <div className="text-[11px] text-muted-foreground">
                {companionStatus === 'Approved' ? 'Verified by Admin' : 'Submitted for review'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center space-y-1">
              <SparklesIcon className="w-8 h-8 text-accent mx-auto" />
              <div className="text-xs font-bold text-foreground">Trust Score</div>
              <div className="text-sm font-bold text-accent">99%</div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center space-y-1">
              <BanknotesIcon className="w-8 h-8 text-amber-500 mx-auto" />
              <div className="text-xs font-bold text-foreground">Escrow Payouts</div>
              <div className="text-[11px] text-muted-foreground">100% Guaranteed</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2 text-xs text-muted-foreground">
            <h4 className="font-bold text-foreground text-sm">Verification Guidelines</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>All companions submit government ID (Aadhaar, Passport, or Driving License) + selfie verification.</li>
              <li>Profiles undergo manual review within 24 hours.</li>
              <li>Once verified, your profile appears publicly on the Discovery feed and is eligible for direct escrow bookings.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
