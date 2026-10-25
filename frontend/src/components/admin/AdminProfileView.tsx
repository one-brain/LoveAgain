import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setUser } from '../../store/slices/authSlice';
import {
  useGetSeekerProfileQuery,
  useUpdateSeekerProfileMutation,
  useUploadSeekerPhotoMutation,
  useDeleteSeekerPhotoMutation,
} from '../../store/api';
import { useChangeAdminPasswordMutation } from '../../store/adminApi';
import {
  ShieldCheckIcon,
  KeyIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  LockClosedIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

/**
 * Compresses uploaded admin avatar so network payload is minimal (<120KB)
 */
async function compressImageFile(file: File, maxDim = 600, quality = 0.85): Promise<{ file: File; dataUrl: string }> {
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

export const AdminProfileView: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Queries & Mutations
  const { data: profileData, isLoading: isLoadingProfile, refetch } = useGetSeekerProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateSeekerProfileMutation();
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadSeekerPhotoMutation();
  const [deletePhoto, { isLoading: isDeletingPhoto }] = useDeleteSeekerPhotoMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangeAdminPasswordMutation();

  // Personal Information State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notifications State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profileData?.profile) {
      const p = profileData.profile;
      setFirstName(p.firstName || user?.firstName || '');
      setLastName(p.lastName || user?.lastName || '');
      setPhone(p.phone || '');
    } else if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [profileData, user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopyId = () => {
    const idToCopy = profileData?.profile?.userId || user?.id || '';
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      showToast('First name is required.', 'error');
      return;
    }

    try {
      const res = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
      }).unwrap();

      const updated = res.profile;
      dispatch(
        setUser({
          id: updated.userId || user?.id || '',
          email: updated.email || user?.email || '',
          firstName: updated.firstName,
          lastName: updated.lastName,
          photoUrl: updated.photoUrl || user?.photoUrl || null,
          isVerified: true,
          trustScore: 100,
          roles: ['Admin'],
        })
      );

      refetch();
      showToast('Administrator profile details updated successfully.');
    } catch {
      showToast('Failed to update profile details. Please try again.', 'error');
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPEG, PNG, WebP).', 'error');
      return;
    }

    try {
      const { file: compressed } = await compressImageFile(file);
      const formData = new FormData();
      formData.append('file', compressed);

      const res = await uploadPhoto(formData).unwrap();
      const updated = res.profile;

      dispatch(
        setUser({
          id: updated.userId || user?.id || '',
          email: updated.email || user?.email || '',
          firstName: updated.firstName || firstName,
          lastName: updated.lastName || lastName,
          photoUrl: updated.photoUrl,
          isVerified: true,
          trustScore: 100,
          roles: ['Admin'],
        })
      );

      refetch();
      showToast('Administrator avatar photo updated.');
    } catch {
      showToast('Failed to upload profile photo.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const res = await deletePhoto().unwrap();
      const updated = res.profile;

      dispatch(
        setUser({
          id: updated.userId || user?.id || '',
          email: updated.email || user?.email || '',
          firstName: updated.firstName || firstName,
          lastName: updated.lastName || lastName,
          photoUrl: null,
          isVerified: true,
          trustScore: 100,
          roles: ['Admin'],
        })
      );

      refetch();
      showToast('Avatar photo removed. Reverted to executive initials.');
    } catch {
      showToast('Failed to remove photo.', 'error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Administrator password updated successfully.');
    } catch (err: any) {
      const msg = err?.data?.error || 'Failed to update password. Please check your current password.';
      setPasswordError(msg);
    }
  };

  const photoUrl = profileData?.profile?.photoUrl || user?.photoUrl;
  const adminEmail = profileData?.profile?.email || user?.email || 'admin@cue.local';
  const adminId = profileData?.profile?.userId || user?.id || '—';
  const userInitials = `${firstName.trim().charAt(0) || 'C'}${lastName.trim().charAt(0) || 'A'}`.toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-200">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-card border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-card border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Administrative Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card via-card to-amber-500/5 border border-border/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Upload/Delete Controls */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-card shadow-md flex items-center justify-center relative">
              {photoUrl ? (
                <img src={photoUrl} alt="Admin Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-amber-600/20 to-amber-700/20 text-amber-500 font-extrabold text-3xl font-serif flex items-center justify-center">
                  {userInitials}
                </div>
              )}

              {/* Uploading Overlay */}
              {(isUploadingPhoto || isDeletingPhoto) && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                  <ArrowPathIcon className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
                id="admin-photo-upload"
              />
              <label
                htmlFor="admin-photo-upload"
                className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-muted text-[11px] font-semibold text-foreground cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                title="Upload Photo"
              >
                <PhotoIcon className="w-3.5 h-3.5 text-accent" />
                <span>Upload</span>
              </label>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={isDeletingPhoto}
                  className="p-1 rounded-lg bg-card border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 text-[11px] transition-all"
                  title="Remove Photo"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                <span>Platform Administrator • Tier 1 Clearance</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                100% Trust Score
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif">
              {firstName || 'Administrator'} {lastName}
            </h2>
            <p className="text-xs text-muted-foreground font-mono flex items-center justify-center sm:justify-start gap-2">
              <EnvelopeIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{adminEmail}</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl border border-border/60 font-mono">
                <span>UUID:</span>
                <span className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">{adminId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="hover:text-accent ml-1 transition-colors"
                  title="Copy User ID"
                >
                  {copiedId ? (
                    <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="text-[11px] text-muted-foreground">
                Administrative security log: Active session authenticated
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Administrator Personal Information */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
              <UserCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground font-serif">Administrative Identity</h3>
              <p className="text-xs text-muted-foreground">Update your official administrator contact coordinates.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center justify-between">
                <span>Primary Administrator Email</span>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <LockClosedIcon className="w-3 h-3" />
                  System Managed
                </span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  disabled
                  value={adminEmail}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-muted/40 text-muted-foreground text-sm font-mono cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Root administrator email bound to platform infrastructure credentials.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Emergency & Operations Alert Phone
              </label>
              <div className="relative">
                <PhoneIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Used for critical platform uptime and high-priority escrow alerts.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile || isLoadingProfile}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-bold text-sm shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdatingProfile ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save Administrative Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Security & Password Management */}
        <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <KeyIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground font-serif">Security & Credentials</h3>
              <p className="text-xs text-muted-foreground">Rotate your back-office master console password.</p>
            </div>
          </div>

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Confirm New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Password requirements: Minimum 8 characters with alphanumeric combination.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isChangingPassword ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Update Master Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Card 3: Platform Governance & Clearance Audit Matrix */}
      <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border/60">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
            <BuildingLibraryIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground font-serif">Administrative Clearance & Access Matrix</h3>
            <p className="text-xs text-muted-foreground">Active security policies and role grants bound to this account.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">KYC Verification</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Approve, reject, or request changes on companion ID and selfie verifications.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">Escrow & Settlements</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Settle UPI payouts, inspect booking transactions, and arbitrate escrow releases.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">User Moderation</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Audit registered users, inspect companion profiles, and toggle account suspensions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">Financial Ledger MIS</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Export GMV reports, audit revenue trajectories, and analyze platform take-rates.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2.5">
          <ShieldCheckIcon className="w-5 h-5 flex-shrink-0 text-amber-500" />
          <span>
            <strong>Audit & Security Notice:</strong> All administrative modifications and clearance actions are
            cryptographically logged with timestamps and administrator UUID for audit compliance.
          </span>
        </div>
      </div>
    </div>
  );
};
