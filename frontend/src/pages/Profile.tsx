import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout } from '../store/slices/authSlice';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import {
  useGetSeekerProfileQuery,
  useUpdateSeekerProfileMutation,
  useUploadSeekerPhotoMutation,
  useGetMyProfileQuery,
  useUpdateProviderProfileMutation,
  useUploadCompanionPhotoMutation,
  useDeleteMyAccountMutation,
  useGetMyKycQuery,
  useSubmitMyKycMutation,
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
} from '../store/api';
import { CompanionLocationCard } from '../components/profile/CompanionLocationCard';
import { DiscoveryVisibilityCard } from '../components/profile/DiscoveryVisibilityCard';
import { SpecialtySearchPicker } from '../components/profile/SpecialtySearchPicker';
import { CameraSelfieCapture } from '../components/profile/CameraSelfieCapture';
import { OtpVerificationDrawer } from '../components/profile/OtpVerificationDrawer';
import {
  BriefcaseIcon,
  CheckBadgeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowUpTrayIcon,
  ArrowRightIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender (Optional)' },
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Non-Binary', label: 'Non-Binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const SLOT_LABELS = [
  { index: 0, title: 'Photo 1 · Primary Cover', subtitle: 'Main card photo in Browse Profiles' },
  { index: 1, title: 'Photo 2 · Activity / Hobby', subtitle: 'Showcases your skill or activity' },
  { index: 2, title: 'Photo 3 · Candid / Social', subtitle: 'Full-length or social setting photo' },
];

/**
 * Compresses an uploaded image via Canvas to keep payloads small and snappy.
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
  const navigate = useNavigate();
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
  const { data: kycData, refetch: refetchKyc } = useGetMyKycQuery(undefined, { skip: shouldSkip });

  // Mutations
  const [updateSeeker, { isLoading: isUpdatingSeeker }] = useUpdateSeekerProfileMutation();
  const [uploadSeekerPhoto, { isLoading: isUploadingAvatar }] = useUploadSeekerPhotoMutation();
  const [updateProvider, { isLoading: isUpdatingProvider }] = useUpdateProviderProfileMutation();
  const [uploadCompanionPhoto] = useUploadCompanionPhotoMutation();
  const [deleteMyAccount, { isLoading: isDeletingAccount }] = useDeleteMyAccountMutation();
  const [submitMyKyc, { isLoading: isSubmittingKyc }] = useSubmitMyKycMutation();
  const [sendEmailOtp] = useSendEmailOtpMutation();
  const [verifyEmailOtp] = useVerifyEmailOtpMutation();
  const [sendPhoneOtp] = useSendPhoneOtpMutation();
  const [verifyPhoneOtp] = useVerifyPhoneOtpMutation();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // 1. Personal Form State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [personalSuccess, setPersonalSuccess] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);

  // 2. Companion Settings State
  const [displayName, setDisplayName] = useState('');
  const [profileImages, setProfileImages] = useState<string[]>(['', '', '']);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [hourlyRate, setHourlyRate] = useState('1500');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [maxRadiusKm, setMaxRadiusKm] = useState('25');
  const [providerSuccess, setProviderSuccess] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  // 3. KYC Form State
  const [kycDocType, setKycDocType] = useState('Aadhaar Card');
  const [kycDocNumber, setKycDocNumber] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycSuccess, setKycSuccess] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  const providerProfile = providerData?.profile;
  const companionStatus = providerProfile?.status || 'Draft';

  // Populate Personal Details
  useEffect(() => {
    if (seekerData?.profile) {
      const p = seekerData.profile;
      setFirstName(p.firstName || user?.firstName || '');
      setLastName(p.lastName || user?.lastName || '');
      setPhone(p.phone || '');
      setGender(p.gender || '');
      setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '');
      if (p.photoUrl) setAvatarUrl(p.photoUrl);
    } else if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [seekerData, user]);

  // Populate Companion Settings
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
      }
    } else if (user && !displayName) {
      setDisplayName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
    }
  }, [providerProfile, seekerData, user]);

  const handleKycFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setKycError('File must be 5MB or smaller.');
      return;
    }
    const valid = ['image/jpeg', 'image/png', 'image/webp'];
    if (!valid.includes(file.type)) {
      setKycError('Only JPEG, PNG, or WebP images are accepted.');
      return;
    }
    setKycError(null);
    setFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycError(null);
    setKycSuccess(null);

    if (!kycDocNumber.trim()) {
      setKycError('Please enter your official document number.');
      return;
    }
    if (!frontFile) {
      setKycError('Please upload the front image of your ID document.');
      return;
    }
    if (!backFile) {
      setKycError('Please upload the back image of your ID document.');
      return;
    }
    if (!selfieFile) {
      setKycError('Please take a live selfie or upload your selfie verification photo.');
      return;
    }

    const formData = new FormData();
    formData.append('documentType', kycDocType);
    formData.append('documentNumber', kycDocNumber.trim());
    formData.append('frontImage', frontFile);
    formData.append('backImage', backFile);
    formData.append('selfieImage', selfieFile);

    try {
      await submitMyKyc(formData).unwrap();
      setKycSuccess('Identity documents submitted successfully! Our safety team will review them within 24 hours.');
      refetchKyc();
      refetchSeeker();
    } catch (err: any) {
      setKycError(err?.data?.error || 'Failed to submit identity verification. Please verify your files and try again.');
    }
  };

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
      const cleanGender = gender.trim() || null;

      await updateSeeker({
        firstName: cleanFirst,
        lastName: cleanLast,
        phone: cleanPhone,
        dateOfBirth: cleanDob,
        gender: cleanGender,
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

  const handleDeleteAccount = async () => {
    try {
      await deleteMyAccount().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err: any) {
      setPersonalError(
        err?.data?.error || 'Unable to delete account. Ensure you have no active upcoming bookings.'
      );
      setConfirmDeleteOpen(false);
    }
  };

  if (seekerLoading || providerLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading account details...</p>
        </div>
      </div>
    );
  }

  const netRate = (Number(hourlyRate) * 0.85).toFixed(0);
  const activeHeroAvatar =
    profileImages.find((img) => img && img.trim().length > 0) || avatarUrl;

  const isKycApproved = user?.isVerified || kycData?.status === 'Approved';
  const isEmailVerified = seekerData?.profile?.isEmailVerified ?? true; // primary registration email verified by default
  const isPhoneVerified = seekerData?.profile?.isPhoneVerified ?? false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header Profile Summary Card */}
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative group shrink-0">
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
            className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-accent text-accent-foreground text-[10px] font-bold shadow-md hover:bg-accent-hover transition-colors flex items-center gap-1 cursor-pointer"
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 w-fit mx-auto sm:mx-0">
              <CheckBadgeIcon className="w-3.5 h-3.5" />
              <span>Unified Account</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground">{user?.email}</p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted text-xs font-medium text-foreground">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              <span>Trust Score: {seekerData?.profile?.trustScore ?? user?.trustScore ?? 50}%</span>
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
              isKycApproved
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
            }`}>
              <span>{isKycApproved ? '✓ Identity Verified' : '⚠️ KYC Verification Required'}</span>
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

      {/* 2. Simplified 3-Tab Segmented Switcher */}
      <div className="flex border-b border-border/80 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabChange('personal')}
          className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'personal'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <IdentificationIcon className="w-4 h-4" />
          <span>1. Personal Details</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('provider')}
          className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'provider'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BriefcaseIcon className="w-4 h-4" />
          <span>2. Companion Settings</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('kyc')}
          className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'kyc'
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4" />
          <span>3. Identity Verification</span>
          {isKycApproved && <span className="text-[10px] text-emerald-500 font-bold">✓</span>}
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PERSONAL DETAILS SECTION                                */}
      {/* ============================================================== */}
      {activeTab === 'personal' && (
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold font-serif text-foreground">Personal Details</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your legal name, gender, date of birth, and safety contact details.
            </p>
          </div>

          {personalSuccess && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
              <span>Personal details updated successfully!</span>
            </div>
          )}

          {personalError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {personalError}
            </div>
          )}

          <form onSubmit={handleUpdateSeeker} className="space-y-5">
            {/* 1. First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">First Name *</label>
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

            {/* 2. Gender & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Date of Birth (Must be 18+ to book)
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            {/* 3. Account Email */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground">Account Email</label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckBadgeIcon className="w-3.5 h-3.5" />
                  <span>Primary Login</span>
                </span>
              </div>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-muted-foreground text-sm cursor-not-allowed"
              />
            </div>

            {/* 4. Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Phone Number (For Safety Alerts & Meetup SMS)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                You can verify this mobile number in the Identity Verification tab via SMS OTP.
              </span>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingSeeker}
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isUpdatingSeeker ? 'Saving Changes...' : 'Save Personal Details'}
              </button>
            </div>
          </form>

          {/* Account Privacy & Deactivation */}
          <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Privacy & Deactivation
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently deactivate your account and revoke active sessions (requires zero upcoming active bookings).
              </p>
            </div>
            {!confirmDeleteOpen ? (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Deactivate Account</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="px-3.5 py-2 rounded-xl bg-destructive text-white hover:bg-destructive/90 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isDeletingAccount ? 'Deactivating...' : 'Confirm Deactivation'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: COMPANION SETTINGS                                      */}
      {/* ============================================================== */}
      {activeTab === 'provider' && (
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">Companion Settings</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configure your public Display Name, 3 Browse Profile photos, hourly rate, GPS service area, public bio, and offered specialties.
              </p>
            </div>

            {companionStatus === 'Approved' ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold w-fit">
                  ✓ Approved Companion
                </span>
                <DiscoveryVisibilityCard
                  compact={true}
                  isActive={providerProfile?.isActive ?? true}
                  isApproved={true}
                  onToggleSuccess={() => refetchProvider()}
                />
              </div>
            ) : companionStatus === 'PendingReview' ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold w-fit">
                ⏳ Application In Review
              </span>
            ) : (
              <Link
                to="/apply-companion"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto shadow-xs"
              >
                <span>Apply for Companion Verification</span>
                <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" />
              </Link>
            )}
          </div>

          {providerSuccess && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
              <span>Companion settings saved successfully!</span>
            </div>
          )}

          {providerError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {providerError}
            </div>
          )}

          {/* Wallet Settings Relocation Notice */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0">
                <BanknotesIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Earnings & Withdrawal Destination (UPI)</p>
                <p className="text-[11px] text-muted-foreground">
                  Your UPI ID and direct bank transfer settings are now managed in Wallet Settings.
                </p>
              </div>
            </div>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              <span>Manage in Wallet</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-accent" />
            </Link>
          </div>

          <form onSubmit={handleUpdateProvider} className="space-y-6">
            {/* 1. Public Display Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Companion Display Name (Shown on Browse Profiles) *
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
                This name is displayed publicly on your Discovery card and companion profile page.
              </span>
            </div>

            {/* 2. 3 Profile Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-foreground">
                    Profile Images (Upload up to 3 Photos) *
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    All 3 photos appear in an interactive carousel during Browse Profiles.
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
                              className="text-destructive hover:opacity-80 p-1 cursor-pointer"
                              title="Remove photo"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">{slot.subtitle}</p>

                        <div className="aspect-4/3 rounded-xl overflow-hidden border border-border bg-black/5 relative group">
                          {currentImg ? (
                            <img
                              src={currentImg}
                              alt={slot.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                              <ArrowUpTrayIcon className="w-6 h-6 mb-1 opacity-50" />
                              <span className="text-[11px]">Empty slot</span>
                            </div>
                          )}

                          {isUploadingThisSlot && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                              <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <input
                          ref={(el) => {
                            fileInputRefs.current[slot.index] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleCompanionSlotFileUpload(slot.index, e)}
                        />
                        <button
                          type="button"
                          disabled={isUploadingThisSlot}
                          onClick={() => fileInputRefs.current[slot.index]?.click()}
                          className="w-full py-2 px-3 rounded-xl bg-background border border-border hover:bg-muted text-foreground text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <ArrowUpTrayIcon className="w-3.5 h-3.5 text-accent" />
                          <span>{currentImg ? 'Change Photo' : 'Upload Photo'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Hourly Rate */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">
                Hourly Experience Fee (₹ / hr) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="500"
                    max="10000"
                    step="100"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">You receive (85% net):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{netRate} / hr
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Base Location & Service Area */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">
                Base Location & Service Area
              </label>
              <CompanionLocationCard
                currentLatitude={providerProfile?.latitude ?? 12.9716}
                currentLongitude={providerProfile?.longitude ?? 77.5946}
                currentMaxRadiusKm={Number(maxRadiusKm)}
                onLocationUpdated={(_lat, _lon, rad) => {
                  setMaxRadiusKm(String(rad));
                  refetchProvider();
                }}
              />
            </div>

            {/* 5. Public Bio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-muted-foreground">Public Bio</label>
                <span className="text-[11px] text-muted-foreground">{bio.length} / 500 characters</span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself, your conversational passions, hobbies, and what kind of outing you enjoy..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* 6. Offered Specialties */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground">
                Offered Specialties & Outing Activities *
              </label>
              <SpecialtySearchPicker
                selectedSpecialties={specialties}
                onChange={(newSpecialties) => setSpecialties(newSpecialties)}
              />
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProvider}
                className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-sm shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isUpdatingProvider ? 'Saving Settings...' : 'Save Companion Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: IDENTITY VERIFICATION                                   */}
      {/* ============================================================== */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          {/* Top Trust & Status Badges */}
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">Identity & Security Verification</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Complete government KYC verification and contact verifications to unlock full booking privileges and boost your Trust Score.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center space-y-1">
                <ShieldCheckIcon className="w-7 h-7 text-emerald-500 mx-auto" />
                <div className="text-xs font-bold text-foreground">Platform Trust Score</div>
                <div className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {seekerData?.profile?.trustScore ?? user?.trustScore ?? 50}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center space-y-1">
                <IdentificationIcon className="w-7 h-7 text-accent mx-auto" />
                <div className="text-xs font-bold text-foreground">Government KYC</div>
                <div className="text-xs font-semibold">
                  {isKycApproved ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Approved (+20 Trust)</span>
                  ) : kycData?.status === 'PendingReview' ? (
                    <span className="text-amber-600 dark:text-amber-400">Under Review</span>
                  ) : kycData?.status === 'Rejected' ? (
                    <span className="text-rose-600 dark:text-rose-400">Needs Resubmission</span>
                  ) : (
                    <span className="text-muted-foreground">Not Submitted</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center space-y-1">
                <BanknotesIcon className="w-7 h-7 text-emerald-500 mx-auto" />
                <div className="text-xs font-bold text-foreground">Booking Privileges</div>
                <div className="text-xs font-semibold">
                  {isKycApproved ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Unlocked (Full Access)</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Locked until KYC</span>
                  )}
                </div>
              </div>
            </div>

            {/* Approved KYC Banner */}
            {isKycApproved && (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      Identity Verified Successfully
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Your identity has been verified. You have full access to explore, message, and book experience companions. A +20 Trust Score boost is active on your profile.
                    </p>
                  </div>
                </div>

                {kycData?.documentType && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                    <div>
                      <span className="opacity-70">Document: </span>
                      <span className="font-semibold">{kycData.documentType}</span>
                    </div>
                    <div>
                      <span className="opacity-70">Document Number: </span>
                      <span className="font-mono font-semibold">{kycData.documentNumberMasked}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pending Review Banner */}
            {kycData?.status === 'PendingReview' && !isKycApproved && (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-8 h-8 text-amber-500 shrink-0 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                      Verification Documents Under Review
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Your {kycData.documentType} (ending in {kycData.documentNumberMasked}) and live selfie were submitted on {new Date(kycData.submittedAt || Date.now()).toLocaleDateString()}. Our safety team is reviewing your details (typically takes under 24 hours).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {kycData.frontImageUrl && (
                    <div className="rounded-xl overflow-hidden border border-amber-500/30 aspect-4/3 bg-black/5 relative">
                      <img src={kycData.frontImageUrl} alt="Front ID" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-0.5">Front ID</span>
                    </div>
                  )}
                  {kycData.backImageUrl && (
                    <div className="rounded-xl overflow-hidden border border-amber-500/30 aspect-4/3 bg-black/5 relative">
                      <img src={kycData.backImageUrl} alt="Back ID" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-0.5">Back ID</span>
                    </div>
                  )}
                  {kycData.selfieImageUrl && (
                    <div className="rounded-xl overflow-hidden border border-amber-500/30 aspect-4/3 bg-black/5 relative">
                      <img src={kycData.selfieImageUrl} alt="Live Selfie" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-0.5">Live Selfie</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rejected Banner */}
            {kycData?.status === 'Rejected' && !isKycApproved && (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <ExclamationCircleIcon className="w-8 h-8 text-rose-500 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                      Verification Needs Correction & Resubmission
                    </h3>
                    <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                      <span className="font-bold">Admin Feedback: </span>
                      {kycData.rejectionReason || 'The submitted documents could not be verified. Please review the requirements and resubmit clear photographs.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* KYC Submission Form (when NotSubmitted or Rejected) */}
            {(kycData?.status === 'NotSubmitted' || kycData?.status === 'Rejected' || !kycData?.status) && !isKycApproved && (
              <form onSubmit={handleKycSubmit} className="space-y-6 pt-2">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Submit Your Government ID & Live Selfie</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Accepted formats: JPEG, PNG, or WebP. Maximum size: 5MB per file.
                  </p>
                </div>

                {kycError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                    <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                    <span>{kycError}</span>
                  </div>
                )}

                {kycSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 shrink-0" />
                    <span>{kycSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Document Type *</label>
                    <select
                      value={kycDocType}
                      onChange={(e) => setKycDocType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-accent cursor-pointer"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (India)</option>
                      <option value="Passport">Passport</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID Card</option>
                      <option value="National Identity Card">National Identity Card / Other Government ID</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Document Number *</label>
                    <input
                      type="text"
                      value={kycDocNumber}
                      onChange={(e) => setKycDocNumber(e.target.value)}
                      placeholder="e.g. 1234 5678 9012 or Z1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                </div>

                {/* Document Images (Front & Back) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front of Document */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-foreground">1. Front Image of ID *</span>
                    <input
                      ref={frontInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleKycFileSelect(e, setFrontFile, setFrontPreview)}
                    />
                    <div
                      onClick={() => frontInputRef.current?.click()}
                      className={`aspect-4/3 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden relative group ${
                        frontPreview
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/60 bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      {frontPreview ? (
                        <>
                          <img src={frontPreview} alt="Front preview" className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            Click to Change
                          </div>
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="w-7 h-7 text-muted-foreground group-hover:text-accent transition-colors mb-2" />
                          <span className="text-xs font-bold text-foreground">Upload Front Side</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG, WebP up to 5MB</span>
                        </>
                      )}
                    </div>
                    {frontFile && <p className="text-[10px] text-muted-foreground truncate">{frontFile.name}</p>}
                  </div>

                  {/* Back of Document */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-foreground">2. Back Image of ID *</span>
                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleKycFileSelect(e, setBackFile, setBackPreview)}
                    />
                    <div
                      onClick={() => backInputRef.current?.click()}
                      className={`aspect-4/3 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden relative group ${
                        backPreview
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/60 bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      {backPreview ? (
                        <>
                          <img src={backPreview} alt="Back preview" className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            Click to Change
                          </div>
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="w-7 h-7 text-muted-foreground group-hover:text-accent transition-colors mb-2" />
                          <span className="text-xs font-bold text-foreground">Upload Back Side</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG, WebP up to 5MB</span>
                        </>
                      )}
                    </div>
                    {backFile && <p className="text-[10px] text-muted-foreground truncate">{backFile.name}</p>}
                  </div>
                </div>

                {/* Live Selfie Capture */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-foreground">3. Live Selfie Verification *</span>
                  <CameraSelfieCapture
                    existingPreviewUrl={selfiePreview}
                    onSelfieCaptured={(file, preview) => {
                      setSelfieFile(file);
                      setSelfiePreview(preview);
                    }}
                    onClear={() => {
                      setSelfieFile(null);
                      setSelfiePreview(null);
                    }}
                  />
                </div>

                {/* Submit CTA */}
                <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingKyc}
                    className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingKyc ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        <span>Uploading & Submitting...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span>Submit Documents for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Email & Mobile OTP Verification Card */}
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-accent" />
                <span>Email & Mobile Verification</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify your contact credentials to receive real-time booking alerts, OTP logins, and secure escrow updates (+10 Trust Score each).
              </p>
            </div>

            <div className="space-y-5 divide-y divide-border/60">
              {/* Email Verification */}
              <div className="pt-2">
                <OtpVerificationDrawer
                  type="email"
                  label="Account Email Address"
                  targetValue={user?.email || ''}
                  isVerified={isEmailVerified}
                  onSendOtp={async () => {
                    const res = await sendEmailOtp().unwrap();
                    return res;
                  }}
                  onVerifyOtp={async (code) => {
                    await verifyEmailOtp({ otp: code }).unwrap();
                    await refetchSeeker();
                  }}
                />
              </div>

              {/* Mobile Phone Verification */}
              <div className="pt-5">
                <OtpVerificationDrawer
                  type="phone"
                  label="Registered Mobile Number"
                  targetValue={phone || seekerData?.profile?.phone || ''}
                  isVerified={isPhoneVerified}
                  disabled={!phone && !seekerData?.profile?.phone}
                  onSendOtp={async () => {
                    const res = await sendPhoneOtp().unwrap();
                    return res;
                  }}
                  onVerifyOtp={async (code) => {
                    await verifyPhoneOtp({ otp: code }).unwrap();
                    await refetchSeeker();
                  }}
                />
                {!phone && !seekerData?.profile?.phone && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    * Please enter and save your phone number in the Personal Details tab to verify mobile SMS.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
