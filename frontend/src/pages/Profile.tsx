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
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Option,
  Spinner,
  Tab,
  TabList,
  Textarea,
} from '@fluentui/react-components';
import {
  Briefcase20Regular,
  CheckmarkStarburst16Regular,
  Calendar20Regular,
  CheckmarkCircle20Regular,
  ShieldCheckmark20Regular,
  Money20Regular,
  ArrowUpload16Regular,
  ArrowRight16Regular,
  Delete16Regular,
  ErrorCircle20Regular,
  Clock20Regular,
  ArrowSync16Regular,
  Mail20Regular,
  ContactCard20Regular,
} from '@fluentui/react-icons';

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender (optional)' },
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Non-Binary', label: 'Non-Binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const SLOT_LABELS = [
  { index: 0, title: 'Photo 1 · Primary cover', subtitle: 'Main card photo in browse profiles' },
  { index: 1, title: 'Photo 2 · Activity / hobby', subtitle: 'Showcases your skill or activity' },
  { index: 2, title: 'Photo 3 · Candid / social', subtitle: 'Full-length or social setting photo' },
];

const KYC_DOC_OPTIONS = [
  { value: 'Aadhaar Card', label: 'Aadhaar Card (India)' },
  { value: 'Passport', label: 'Passport' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'Voter ID', label: 'Voter ID Card' },
  { value: 'National Identity Card', label: 'National Identity Card / Other Government ID' },
];

async function compressImageFile(
  file: File,
  maxDim = 800,
  quality = 0.82
): Promise<{ file: File; dataUrl: string }> {
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

  const shouldSkip = !accessToken;
  const { data: seekerData, isLoading: seekerLoading, refetch: refetchSeeker } =
    useGetSeekerProfileQuery(undefined, { skip: shouldSkip });
  const { data: providerData, isLoading: providerLoading, refetch: refetchProvider } =
    useGetMyProfileQuery(undefined, { skip: shouldSkip });
  const { data: kycData, refetch: refetchKyc } = useGetMyKycQuery(undefined, { skip: shouldSkip });

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
      if (user.gender) setGender(user.gender);
    }
  }, [seekerData, user]);

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

  const handleKycFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setKycError('File must be 10MB or smaller.');
      return;
    }
    const valid = ['image/jpeg', 'image/png', 'image/webp'];
    if (!valid.includes(file.type)) {
      setKycError('Only JPEG, PNG, or WebP images are accepted.');
      return;
    }
    setKycError(null);
    try {
      const { file: compressedFile, dataUrl } = await compressImageFile(file, 1200, 0.85);
      setFile(compressedFile);
      setPreview(dataUrl);
    } catch {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
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
      setKycSuccess(
        'Identity documents submitted successfully. Our safety team will review them within 24 hours.'
      );
      refetchKyc();
      refetchSeeker();
    } catch (err: any) {
      const msg =
        err?.data?.error ||
        err?.data?.message ||
        err?.error ||
        err?.message ||
        'Failed to submit identity verification. Please verify your files and try again.';
      setKycError(msg);
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

  const handleCompanionSlotFileUpload = async (
    slotIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      const res = await updateSeeker({
        firstName: cleanFirst,
        lastName: cleanLast,
        phone: cleanPhone,
        dateOfBirth: cleanDob,
        gender: cleanGender,
      }).unwrap();

      if (res?.profile?.gender !== undefined) {
        setGender(res.profile.gender || '');
      }

      if (user) {
        dispatch(
          setUser({
            ...user,
            firstName: cleanFirst,
            lastName: cleanLast,
            gender: cleanGender,
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
      setProviderError('Please provide a guest display name for browse profiles.');
      return;
    }

    if (specialties.length === 0) {
      setProviderError('Please select at least one specialty or activity.');
      return;
    }

    const cleanedImages = profileImages
      .map((img) => img.trim())
      .filter((img) => img.length > 0)
      .slice(0, 3);

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
      setProviderError(err?.data?.error || 'Failed to update guest settings.');
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
        <Spinner label="Loading account details..." />
      </div>
    );
  }

  const netRate = (Number(hourlyRate) * 0.85).toFixed(0);
  const activeHeroAvatar =
    profileImages.find((img) => img && img.trim().length > 0) || avatarUrl;

  const isKycApproved = user?.isVerified || kycData?.status === 'Approved';
  const isEmailVerified = seekerData?.profile?.isEmailVerified ?? true;
  const isPhoneVerified = seekerData?.profile?.isPhoneVerified ?? false;
  const selectedGenderLabel =
    GENDER_OPTIONS.find((opt) => opt.value === gender)?.label || 'Select gender (optional)';
  const selectedKycDocLabel =
    KYC_DOC_OPTIONS.find((opt) => opt.value === kycDocType)?.label || kycDocType;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header Profile Summary Card */}
      <Card className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0 flex flex-col items-center gap-2">
            <Avatar
              size={72}
              shape="square"
              name={displayName || `${firstName} ${lastName}`.trim() || user?.email || 'Member'}
              image={activeHeroAvatar ? { src: activeHeroAvatar } : undefined}
            />
            <Button
              size="small"
              appearance="outline"
              icon={<ArrowUpload16Regular />}
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
            >
              {isUploadingAvatar ? 'Uploading...' : 'Change photo'}
            </Button>
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
              <h1 className="text-title2 font-semibold text-foreground">
                {displayName || `${firstName} ${lastName}`.trim() || 'Member'}
              </h1>
              <Badge appearance="tint" color="success" icon={<CheckmarkStarburst16Regular />}>
                Unified account
              </Badge>
            </div>

            <p className="text-body1 text-muted-foreground">{user?.email}</p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge appearance="outline" color="informative" icon={<ShieldCheckmark20Regular />}>
                <span className="tabular">
                  Trust score: {seekerData?.profile?.trustScore ?? user?.trustScore ?? 50}%
                </span>
              </Badge>
              <Badge
                appearance="tint"
                color={isKycApproved ? 'success' : 'warning'}
              >
                {isKycApproved ? 'Identity verified' : 'KYC verification required'}
              </Badge>
              <Link
                to="/bookings"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border text-caption1 font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Calendar20Regular className="text-brand-fg" />
                <span>My bookings</span>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Fluent Settings Layout: Left vertical TabList on md+, Top horizontal TabList on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
        <Card className="bg-card rounded-2xl border border-border p-2 shadow-sm">
          {/* Mobile Horizontal TabList */}
          <div className="md:hidden overflow-x-auto">
            <TabList
              selectedValue={activeTab}
              onTabSelect={(_e, data) =>
                handleTabChange(data.value as 'personal' | 'provider' | 'kyc')
              }
            >
              <Tab value="personal" icon={<ContactCard20Regular />}>
                Personal details
              </Tab>
              <Tab value="provider" icon={<Briefcase20Regular />}>
                Guest settings
              </Tab>
              <Tab value="kyc" icon={<ShieldCheckmark20Regular />}>
                Identity verification
              </Tab>
            </TabList>
          </div>

          {/* Desktop Vertical TabList */}
          <div className="hidden md:block">
            <TabList
              vertical
              selectedValue={activeTab}
              onTabSelect={(_e, data) =>
                handleTabChange(data.value as 'personal' | 'provider' | 'kyc')
              }
            >
              <Tab value="personal" icon={<ContactCard20Regular />}>
                Personal details
              </Tab>
              <Tab value="provider" icon={<Briefcase20Regular />}>
                Guest settings
              </Tab>
              <Tab value="kyc" icon={<ShieldCheckmark20Regular />}>
                Identity verification
              </Tab>
            </TabList>
          </div>
        </Card>

        {/* Active Tab Content */}
        <div className="space-y-6 min-w-0">
          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === 'personal' && (
            <Card className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-subtitle1 font-semibold text-foreground">Personal details</h2>
                <p className="text-caption1 text-muted-foreground mt-1">
                  Manage your legal name, gender, date of birth, and safety contact details.
                </p>
              </div>

              {personalSuccess && (
                <MessageBar intent="success">
                  <MessageBarBody>Personal details updated successfully.</MessageBarBody>
                </MessageBar>
              )}

              {personalError && (
                <MessageBar intent="error">
                  <MessageBarBody>{personalError}</MessageBarBody>
                </MessageBar>
              )}

              <form onSubmit={handleUpdateSeeker} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First name" required>
                    <Input
                      value={firstName}
                      onChange={(_e, data) => setFirstName(data.value)}
                      required
                    />
                  </Field>

                  <Field label="Last name">
                    <Input
                      value={lastName}
                      onChange={(_e, data) => setLastName(data.value)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Gender">
                    <Dropdown
                      value={selectedGenderLabel}
                      selectedOptions={[gender]}
                      onOptionSelect={(_e, data) => setGender(data.optionValue ?? '')}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <Option key={opt.value} value={opt.value} text={opt.label}>
                          {opt.label}
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>

                  <Field label="Date of birth" hint="Must be 18+ to book">
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(_e, data) => setDateOfBirth(data.value)}
                    />
                  </Field>
                </div>

                <Field label="Account email" hint="Primary login email">
                  <Input type="email" value={user?.email || ''} disabled />
                </Field>

                <Field
                  label="Phone number"
                  hint="You can verify this mobile number in the Identity verification tab via SMS OTP."
                >
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(_e, data) => setPhone(data.value)}
                    placeholder="+91 98765 43210"
                  />
                </Field>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    type="submit"
                    appearance="primary"
                    disabled={isUpdatingSeeker}
                    className="min-h-11"
                  >
                    {isUpdatingSeeker ? 'Saving changes...' : 'Save personal details'}
                  </Button>
                </div>
              </form>

              {/* Account Privacy & Deactivation */}
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-body1 font-semibold text-foreground">
                    Account privacy & deactivation
                  </h3>
                  <p className="text-caption1 text-muted-foreground mt-0.5">
                    Permanently deactivate your account and revoke active sessions (requires zero upcoming active bookings).
                  </p>
                </div>
                {!confirmDeleteOpen ? (
                  <Button
                    type="button"
                    appearance="outline"
                    icon={<Delete16Regular />}
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="text-destructive min-h-11"
                  >
                    Deactivate account
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      appearance="primary"
                      disabled={isDeletingAccount}
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground min-h-11"
                    >
                      {isDeletingAccount ? 'Deactivating...' : 'Confirm deactivation'}
                    </Button>
                    <Button
                      type="button"
                      appearance="outline"
                      onClick={() => setConfirmDeleteOpen(false)}
                      className="min-h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* TAB 2: GUEST SETTINGS */}
          {activeTab === 'provider' && (
            <Card className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-subtitle1 font-semibold text-foreground">Guest settings</h2>
                  <p className="text-caption1 text-muted-foreground mt-1">
                    Configure your public display name, 3 browse profile photos, hourly rate, service area, public bio, and offered specialties.
                  </p>
                </div>

                {companionStatus === 'Approved' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Badge appearance="tint" color="success">
                      Approved guest
                    </Badge>
                    <DiscoveryVisibilityCard
                      compact={true}
                      isActive={providerProfile?.isActive ?? true}
                      isApproved={true}
                      onToggleSuccess={() => refetchProvider()}
                    />
                  </div>
                ) : companionStatus === 'PendingReview' ? (
                  <Badge appearance="tint" color="warning">
                    Application in review
                  </Badge>
                ) : (
                  <Link
                    to="/apply-companion"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-accent text-accent-foreground text-body1 font-semibold hover:bg-accent-hover transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto min-h-11"
                  >
                    <span>Apply for guest verification</span>
                    <ArrowRight16Regular />
                  </Link>
                )}
              </div>

              {providerSuccess && (
                <MessageBar intent="success">
                  <MessageBarBody>Guest settings saved successfully.</MessageBarBody>
                </MessageBar>
              )}

              {providerError && (
                <MessageBar intent="error">
                  <MessageBarBody>{providerError}</MessageBarBody>
                </MessageBar>
              )}

              <div className="p-4 rounded-lg bg-muted border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-accent-light text-brand-fg shrink-0">
                    <Money20Regular />
                  </div>
                  <div>
                    <p className="text-body1 font-semibold text-foreground">
                      Earnings & withdrawal destination (UPI)
                    </p>
                    <p className="text-caption1 text-muted-foreground">
                      Your UPI ID and direct bank transfer settings are managed in wallet settings.
                    </p>
                  </div>
                </div>
                <Link
                  to="/wallet"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-foreground text-caption1 font-semibold whitespace-nowrap self-start sm:self-auto transition-colors"
                >
                  <span>Manage in wallet</span>
                  <ArrowRight16Regular className="text-brand-fg" />
                </Link>
              </div>

              <form onSubmit={handleUpdateProvider} className="space-y-6">
                <Field
                  label="Guest display name (shown on browse profiles)"
                  required
                  hint="This name is displayed publicly on your discovery card and guest profile page."
                >
                  <Input
                    value={displayName}
                    onChange={(_e, data) => setDisplayName(data.value)}
                    placeholder="e.g. Elena Rostova or Aarav K."
                    required
                  />
                </Field>

                {/* 3 Profile Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-body1 font-semibold text-foreground">
                        Profile images (upload up to 3 photos)
                      </span>
                      <p className="text-caption1 text-muted-foreground">
                        All 3 photos appear in an interactive carousel during browse profiles.
                      </p>
                    </div>
                    <Badge appearance="tint" color="brand" className="tabular">
                      {profileImages.filter((u) => u && u.trim().length > 0).length} / 3 uploaded
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {SLOT_LABELS.map((slot) => {
                      const currentImg = profileImages[slot.index] || '';
                      const isUploadingThisSlot = uploadingSlot === slot.index;

                      return (
                        <Card
                          key={slot.index}
                          className="rounded-2xl border border-border bg-muted/30 p-3 flex flex-col justify-between space-y-3 shadow-none"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-body1 font-semibold text-foreground">
                                {slot.title}
                              </span>
                              {currentImg && (
                                <Button
                                  type="button"
                                  appearance="subtle"
                                  size="small"
                                  icon={<Delete16Regular />}
                                  onClick={() => handleRemoveSlotImage(slot.index)}
                                  title="Remove photo"
                                  aria-label={`Remove ${slot.title}`}
                                />
                              )}
                            </div>
                            <p className="text-caption1 text-muted-foreground mb-2">
                              {slot.subtitle}
                            </p>

                            <div className="aspect-4/3 rounded-lg overflow-hidden border border-border bg-muted relative">
                              {currentImg ? (
                                <img
                                  src={currentImg}
                                  alt={slot.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                  <ArrowUpload16Regular className="mb-1" />
                                  <span className="text-caption1">Empty slot</span>
                                </div>
                              )}

                              {isUploadingThisSlot && (
                                <div className="absolute inset-0 bg-primary/60 flex items-center justify-center text-primary-foreground">
                                  <Spinner size="tiny" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-1">
                            <input
                              ref={(el) => {
                                fileInputRefs.current[slot.index] = el;
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleCompanionSlotFileUpload(slot.index, e)}
                            />
                            <Button
                              type="button"
                              appearance="outline"
                              icon={<ArrowUpload16Regular />}
                              disabled={isUploadingThisSlot}
                              onClick={() => fileInputRefs.current[slot.index]?.click()}
                              className="w-full"
                            >
                              {currentImg ? 'Change photo' : 'Upload photo'}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <Field label="Hourly experience fee (₹ / hr)" required>
                    <Input
                      type="number"
                      min="500"
                      max="10000"
                      step="100"
                      contentBefore={<span className="tabular font-semibold">₹</span>}
                      value={hourlyRate}
                      onChange={(_e, data) => setHourlyRate(data.value)}
                      className="tabular"
                      required
                    />
                  </Field>
                  <div className="p-3 rounded-lg bg-accent-light border border-border flex items-center justify-between text-caption1">
                    <span className="text-muted-foreground">You receive (85% net):</span>
                    <span className="font-mono font-semibold text-success text-body1 tabular">
                      ₹{netRate} / hr
                    </span>
                  </div>
                </div>

                {/* Base Location & Service Area */}
                <div className="space-y-2">
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

                {/* Public Bio */}
                <Field label="Public bio" hint={`${bio.length} / 500 characters`}>
                  <Textarea
                    rows={4}
                    maxLength={500}
                    value={bio}
                    onChange={(_e, data) => setBio(data.value)}
                    placeholder="Introduce yourself, your conversational passions, hobbies, and what kind of outing you enjoy..."
                  />
                </Field>

                {/* Offered Specialties */}
                <div className="space-y-2">
                  <SpecialtySearchPicker
                    selectedSpecialties={specialties}
                    onChange={(newSpecialties) => setSpecialties(newSpecialties)}
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    type="submit"
                    appearance="primary"
                    disabled={isUpdatingProvider}
                    className="min-h-11"
                  >
                    {isUpdatingProvider ? 'Saving settings...' : 'Save guest settings'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 3: IDENTITY VERIFICATION */}
          {activeTab === 'kyc' && (
            <div className="space-y-6">
              <Card className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-subtitle1 font-semibold text-foreground">
                    Identity & security verification
                  </h2>
                  <p className="text-caption1 text-muted-foreground mt-1">
                    Complete government KYC verification and contact verifications to unlock full booking privileges and boost your trust score.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="p-4 rounded-2xl bg-muted border border-border text-center space-y-1 shadow-none">
                    <ShieldCheckmark20Regular className="text-success mx-auto" />
                    <div className="text-caption1 font-semibold text-foreground">
                      Platform trust score
                    </div>
                    <div className="text-subtitle1 font-semibold font-mono text-success tabular">
                      {seekerData?.profile?.trustScore ?? user?.trustScore ?? 50}%
                    </div>
                  </Card>

                  <Card className="p-4 rounded-2xl bg-muted border border-border text-center space-y-1 shadow-none">
                    <ContactCard20Regular className="text-brand-fg mx-auto" />
                    <div className="text-caption1 font-semibold text-foreground">
                      Government KYC
                    </div>
                    <div className="text-caption1 font-semibold">
                      {isKycApproved ? (
                        <span className="text-success">Approved (+20 trust)</span>
                      ) : kycData?.status === 'PendingReview' ? (
                        <span className="text-warning">Under review</span>
                      ) : kycData?.status === 'Rejected' ? (
                        <span className="text-destructive">Needs resubmission</span>
                      ) : (
                        <span className="text-muted-foreground">Not submitted</span>
                      )}
                    </div>
                  </Card>

                  <Card className="p-4 rounded-2xl bg-muted border border-border text-center space-y-1 shadow-none">
                    <Money20Regular className="text-success mx-auto" />
                    <div className="text-caption1 font-semibold text-foreground">
                      Booking privileges
                    </div>
                    <div className="text-caption1 font-semibold">
                      {isKycApproved ? (
                        <span className="text-success">Unlocked (full access)</span>
                      ) : (
                        <span className="text-warning">Locked until KYC</span>
                      )}
                    </div>
                  </Card>
                </div>

                {isKycApproved && (
                  <div className="p-5 rounded-2xl bg-success-light border border-border space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckmarkCircle20Regular className="text-success shrink-0" />
                      <div>
                        <h3 className="text-body1 font-semibold text-foreground">
                          Identity verified successfully
                        </h3>
                        <p className="text-caption1 text-muted-foreground">
                          Your identity has been verified. You have full access to explore, message, and host verified guests. A +20 trust score boost is active on your profile.
                        </p>
                      </div>
                    </div>

                    {kycData?.documentType && (
                      <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-caption1 text-foreground">
                        <div>
                          <span className="text-muted-foreground">Document: </span>
                          <span className="font-semibold">{kycData.documentType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Document number: </span>
                          <span className="font-mono font-semibold tabular">
                            {kycData.documentNumberMasked}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {kycData?.status === 'PendingReview' && !isKycApproved && (
                  <div className="p-5 rounded-2xl bg-warning-light border border-border space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock20Regular className="text-warning shrink-0" />
                      <div>
                        <h3 className="text-body1 font-semibold text-foreground">
                          Verification documents under review
                        </h3>
                        <p className="text-caption1 text-muted-foreground">
                          Your {kycData.documentType} (ending in{' '}
                          <span className="tabular">{kycData.documentNumberMasked}</span>) and live selfie were submitted on{' '}
                          {new Date(kycData.submittedAt || Date.now()).toLocaleDateString()}. Our safety team is reviewing your details (typically under 24 hours).
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {kycData.frontImageUrl && (
                        <div className="rounded-lg overflow-hidden border border-border aspect-4/3 bg-muted relative">
                          <img
                            src={kycData.frontImageUrl}
                            alt="Front ID"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-primary/70 text-caption2 text-primary-foreground text-center py-0.5">
                            Front ID
                          </span>
                        </div>
                      )}
                      {kycData.backImageUrl && (
                        <div className="rounded-lg overflow-hidden border border-border aspect-4/3 bg-muted relative">
                          <img
                            src={kycData.backImageUrl}
                            alt="Back ID"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-primary/70 text-caption2 text-primary-foreground text-center py-0.5">
                            Back ID
                          </span>
                        </div>
                      )}
                      {kycData.selfieImageUrl && (
                        <div className="rounded-lg overflow-hidden border border-border aspect-4/3 bg-muted relative">
                          <img
                            src={kycData.selfieImageUrl}
                            alt="Live Selfie"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-primary/70 text-caption2 text-primary-foreground text-center py-0.5">
                            Live selfie
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {kycData?.status === 'Rejected' && !isKycApproved && (
                  <div className="p-5 rounded-2xl bg-destructive-light border border-border space-y-2">
                    <div className="flex items-center gap-3">
                      <ErrorCircle20Regular className="text-destructive shrink-0" />
                      <div>
                        <h3 className="text-body1 font-semibold text-foreground">
                          Verification needs correction & resubmission
                        </h3>
                        <p className="text-caption1 text-muted-foreground mt-1">
                          <span className="font-semibold text-foreground">Admin feedback: </span>
                          {kycData.rejectionReason ||
                            'The submitted documents could not be verified. Please review the requirements and resubmit clear photographs.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(kycData?.status === 'NotSubmitted' ||
                  kycData?.status === 'Rejected' ||
                  !kycData?.status) &&
                  !isKycApproved && (
                    <form onSubmit={handleKycSubmit} className="space-y-6 pt-2">
                      <div className="border-b border-border pb-3">
                        <h3 className="text-subtitle2 font-semibold text-foreground">
                          Submit your government ID & live selfie
                        </h3>
                        <p className="text-caption1 text-muted-foreground mt-0.5">
                          Accepted formats: JPEG, PNG, or WebP. Maximum size: 5MB per file.
                        </p>
                      </div>

                      {kycError && (
                        <MessageBar intent="error">
                          <MessageBarBody>{kycError}</MessageBarBody>
                        </MessageBar>
                      )}

                      {kycSuccess && (
                        <MessageBar intent="success">
                          <MessageBarBody>{kycSuccess}</MessageBarBody>
                        </MessageBar>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Document type" required>
                          <Dropdown
                            value={selectedKycDocLabel}
                            selectedOptions={[kycDocType]}
                            onOptionSelect={(_e, data) => {
                              if (data.optionValue) setKycDocType(data.optionValue);
                            }}
                          >
                            {KYC_DOC_OPTIONS.map((opt) => (
                              <Option key={opt.value} value={opt.value} text={opt.label}>
                                {opt.label}
                              </Option>
                            ))}
                          </Dropdown>
                        </Field>

                        <Field label="Document number" required>
                          <Input
                            value={kycDocNumber}
                            onChange={(_e, data) => setKycDocNumber(data.value)}
                            placeholder="e.g. 1234 5678 9012 or Z1234567"
                            className="tabular"
                            required
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-caption1 font-semibold text-foreground">
                            1. Front image of ID *
                          </span>
                          <input
                            ref={frontInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => handleKycFileSelect(e, setFrontFile, setFrontPreview)}
                          />
                          <div
                            onClick={() => frontInputRef.current?.click()}
                            className={`aspect-4/3 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors overflow-hidden relative group ${
                              frontPreview
                                ? 'border-brand-stroke bg-accent-light'
                                : 'border-border hover:border-brand-stroke bg-muted/40'
                            }`}
                          >
                            {frontPreview ? (
                              <>
                                <img
                                  src={frontPreview}
                                  alt="Front preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-primary-foreground text-caption1 font-semibold">
                                  Click to change
                                </div>
                              </>
                            ) : (
                              <>
                                <ArrowUpload16Regular className="text-muted-foreground mb-2" />
                                <span className="text-caption1 font-semibold text-foreground">
                                  Upload front side
                                </span>
                                <span className="text-caption2 text-muted-foreground mt-0.5">
                                  JPEG, PNG, WebP up to 5MB
                                </span>
                              </>
                            )}
                          </div>
                          {frontFile && (
                            <p className="text-caption2 text-muted-foreground truncate">
                              {frontFile.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-caption1 font-semibold text-foreground">
                            2. Back image of ID *
                          </span>
                          <input
                            ref={backInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => handleKycFileSelect(e, setBackFile, setBackPreview)}
                          />
                          <div
                            onClick={() => backInputRef.current?.click()}
                            className={`aspect-4/3 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors overflow-hidden relative group ${
                              backPreview
                                ? 'border-brand-stroke bg-accent-light'
                                : 'border-border hover:border-brand-stroke bg-muted/40'
                            }`}
                          >
                            {backPreview ? (
                              <>
                                <img
                                  src={backPreview}
                                  alt="Back preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-primary-foreground text-caption1 font-semibold">
                                  Click to change
                                </div>
                              </>
                            ) : (
                              <>
                                <ArrowUpload16Regular className="text-muted-foreground mb-2" />
                                <span className="text-caption1 font-semibold text-foreground">
                                  Upload back side
                                </span>
                                <span className="text-caption2 text-muted-foreground mt-0.5">
                                  JPEG, PNG, WebP up to 5MB
                                </span>
                              </>
                            )}
                          </div>
                          {backFile && (
                            <p className="text-caption2 text-muted-foreground truncate">
                              {backFile.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <span className="text-caption1 font-semibold text-foreground">
                          3. Live selfie verification *
                        </span>
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

                      <div className="pt-4 border-t border-border flex justify-end items-center gap-3">
                        <Button
                          type="submit"
                          appearance="primary"
                          disabled={isSubmittingKyc}
                          icon={
                            isSubmittingKyc ? (
                              <ArrowSync16Regular className="animate-spin" />
                            ) : (
                              <ShieldCheckmark20Regular />
                            )
                          }
                          className="min-h-11"
                        >
                          {isSubmittingKyc
                            ? 'Uploading & submitting...'
                            : 'Submit documents for verification'}
                        </Button>
                      </div>
                    </form>
                  )}
              </Card>

              {/* Email & Mobile OTP Verification Card */}
              <Card className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-subtitle1 font-semibold text-foreground flex items-center gap-2">
                    <Mail20Regular className="text-brand-fg" />
                    <span>Email & mobile verification</span>
                  </h3>
                  <p className="text-caption1 text-muted-foreground mt-0.5">
                    Verify your contact credentials to receive real-time booking alerts, OTP logins, and secure escrow updates (+10 trust score each).
                  </p>
                </div>

                <div className="space-y-5 divide-y divide-border">
                  <div className="pt-2">
                    <OtpVerificationDrawer
                      type="email"
                      label="Account email address"
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

                  <div className="pt-5">
                    <OtpVerificationDrawer
                      type="phone"
                      label="Registered mobile number"
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
                      <p className="text-caption1 text-warning mt-1">
                        Please enter and save your phone number in the Personal details tab to verify mobile SMS.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
