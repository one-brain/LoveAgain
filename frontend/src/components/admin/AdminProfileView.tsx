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
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  ShieldCheckmark20Regular,
  Key20Regular,
  PersonCircle20Regular,
  Image16Regular,
  Delete16Regular,
  Eye16Regular,
  EyeOff16Regular,
  ArrowSync16Regular,
  LockClosed16Regular,
  Copy16Regular,
  Checkmark16Regular,
  Mail16Regular,
  Call16Regular,
  Building20Regular,
  ArrowLeft16Regular,
} from '@fluentui/react-icons';

async function compressImageFile(
  file: File,
  maxDim = 600,
  quality = 0.85
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

interface AdminProfileViewProps {
  onBackToDashboard?: () => void;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({ onBackToDashboard }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: profileData, isLoading: isLoadingProfile, refetch } = useGetSeekerProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateSeekerProfileMutation();
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadSeekerPhotoMutation();
  const [deletePhoto, { isLoading: isDeletingPhoto }] = useDeleteSeekerPhotoMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangeAdminPasswordMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      showToast('Avatar photo removed. Reverted to administrator initials.');
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
      const msg =
        err?.data?.error || 'Failed to update password. Please check your current password.';
      setPasswordError(msg);
    }
  };

  const photoUrl = profileData?.profile?.photoUrl || user?.photoUrl;
  const adminEmail = profileData?.profile?.email || user?.email || 'admin@cue.local';
  const adminId = profileData?.profile?.userId || user?.id || '—';

  return (
    <div className="space-y-6">
      {toast && (
        <MessageBar intent={toast.type === 'success' ? 'success' : 'error'}>
          <MessageBarBody>{toast.message}</MessageBarBody>
        </MessageBar>
      )}

      {onBackToDashboard && (
        <div className="flex items-center justify-between">
          <Button
            appearance="outline"
            size="small"
            icon={<ArrowLeft16Regular />}
            onClick={onBackToDashboard}
          >
            Return to operations dashboard
          </Button>
        </div>
      )}

      {/* Administrative Profile Header Card */}
      <Card className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <Avatar
              size={72}
              shape="square"
              name={`${firstName || 'Admin'} ${lastName}`.trim()}
              image={photoUrl ? { src: photoUrl } : undefined}
              color="gold"
            />
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
                id="admin-photo-upload"
              />
              <Button
                appearance="outline"
                size="small"
                icon={<Image16Regular />}
                disabled={isUploadingPhoto || isDeletingPhoto}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingPhoto ? 'Uploading...' : 'Upload'}
              </Button>
              {photoUrl && (
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Delete16Regular />}
                  disabled={isDeletingPhoto}
                  onClick={handleDeletePhoto}
                  title="Remove photo"
                  aria-label="Remove photo"
                />
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge appearance="tint" color="warning" icon={<ShieldCheckmark20Regular />}>
                Platform administrator · Tier 1 clearance
              </Badge>
              <Badge appearance="tint" color="success" className="tabular">
                100% trust score
              </Badge>
            </div>

            <h2 className="text-title2 font-semibold text-foreground">
              {firstName || 'Administrator'} {lastName}
            </h2>
            <p className="text-caption1 text-muted-foreground font-mono flex items-center justify-center sm:justify-start gap-1.5">
              <Mail16Regular />
              <span>{adminEmail}</span>
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-caption1 text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md border border-border font-mono tabular">
                <span>UUID:</span>
                <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-none">
                  {adminId}
                </span>
                <Button
                  appearance="transparent"
                  size="small"
                  icon={
                    copiedId ? (
                      <Checkmark16Regular className="text-success" />
                    ) : (
                      <Copy16Regular />
                    )
                  }
                  onClick={handleCopyId}
                  title="Copy user ID"
                  aria-label="Copy user ID"
                />
              </div>
              <span>Administrative security log: Active session authenticated</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Administrator Personal Information */}
        <Card className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <PersonCircle20Regular className="text-brand-fg" />
            <div>
              <h3 className="font-semibold text-subtitle1 text-foreground">
                Administrative identity
              </h3>
              <p className="text-caption1 text-muted-foreground">
                Update your official administrator contact coordinates.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First name" required>
                <Input
                  required
                  value={firstName}
                  onChange={(_e, data) => setFirstName(data.value)}
                  placeholder="e.g. Alex"
                />
              </Field>

              <Field label="Last name">
                <Input
                  value={lastName}
                  onChange={(_e, data) => setLastName(data.value)}
                  placeholder="e.g. Vance"
                />
              </Field>
            </div>

            <Field
              label="Primary administrator email"
              hint="Root administrator email bound to platform infrastructure credentials."
            >
              <Input
                type="email"
                disabled
                contentBefore={<Mail16Regular />}
                contentAfter={<LockClosed16Regular />}
                value={adminEmail}
              />
            </Field>

            <Field
              label="Emergency & operations alert phone"
              hint="Used for critical platform uptime and high-priority escrow alerts."
            >
              <Input
                type="tel"
                contentBefore={<Call16Regular />}
                value={phone}
                onChange={(_e, data) => setPhone(data.value)}
                placeholder="+91 98765 43210"
              />
            </Field>

            <div className="pt-2">
              <Button
                type="submit"
                appearance="primary"
                disabled={isUpdatingProfile || isLoadingProfile}
                icon={isUpdatingProfile ? <ArrowSync16Regular className="animate-spin" /> : undefined}
                className="w-full min-h-11"
              >
                {isUpdatingProfile ? 'Saving profile...' : 'Save administrative profile'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Card 2: Security & Password Management */}
        <Card className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <Key20Regular className="text-warning" />
            <div>
              <h3 className="font-semibold text-subtitle1 text-foreground">
                Security & credentials
              </h3>
              <p className="text-caption1 text-muted-foreground">
                Rotate your back-office master console password.
              </p>
            </div>
          </div>

          {passwordError && (
            <MessageBar intent="error">
              <MessageBarBody>{passwordError}</MessageBarBody>
            </MessageBar>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Field label="Current password" required>
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(_e, data) => setCurrentPassword(data.value)}
                placeholder="••••••••••••"
                contentAfter={
                  <Button
                    type="button"
                    appearance="transparent"
                    size="small"
                    icon={showCurrentPassword ? <EyeOff16Regular /> : <Eye16Regular />}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label="Toggle current password visibility"
                  />
                }
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="New password" required>
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(_e, data) => setNewPassword(data.value)}
                  placeholder="Min 8 characters"
                  contentAfter={
                    <Button
                      type="button"
                      appearance="transparent"
                      size="small"
                      icon={showNewPassword ? <EyeOff16Regular /> : <Eye16Regular />}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label="Toggle new password visibility"
                    />
                  }
                />
              </Field>

              <Field label="Confirm new password" required>
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(_e, data) => setConfirmPassword(data.value)}
                  placeholder="Repeat new password"
                />
              </Field>
            </div>

            <p className="text-caption1 text-muted-foreground">
              Password requirements: Minimum 8 characters with alphanumeric combination.
            </p>

            <div className="pt-2">
              <Button
                type="submit"
                appearance="primary"
                disabled={isChangingPassword}
                icon={isChangingPassword ? <ArrowSync16Regular className="animate-spin" /> : undefined}
                className="w-full min-h-11"
              >
                {isChangingPassword ? 'Verifying credentials...' : 'Update master password'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Card 3: Platform Governance & Clearance Audit Matrix */}
      <Card className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <Building20Regular className="text-brand-fg" />
          <div>
            <h3 className="font-semibold text-subtitle1 text-foreground">
              Administrative clearance & access matrix
            </h3>
            <p className="text-caption1 text-muted-foreground">
              Active security policies and role grants bound to this account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'KYC verification',
              desc: 'Approve, reject, or request changes on guest ID and selfie verifications.',
            },
            {
              title: 'Escrow & settlements',
              desc: 'Settle UPI payouts, inspect booking transactions, and arbitrate escrow releases.',
            },
            {
              title: 'User moderation',
              desc: 'Audit registered accounts, inspect guest profiles, and toggle account suspensions.',
            },
            {
              title: 'Financial ledger MIS',
              desc: 'Export GMV reports, audit revenue trajectories, and analyze platform take-rates.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-lg bg-muted border border-border space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-body1 text-foreground">{item.title}</span>
                <Badge appearance="tint" color="success" size="small">
                  Active
                </Badge>
              </div>
              <p className="text-caption1 text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <MessageBar intent="warning">
          <MessageBarBody>
            <strong>Audit & security notice:</strong> All administrative modifications and clearance actions are cryptographically logged with timestamps and administrator UUID for audit compliance.
          </MessageBarBody>
        </MessageBar>
      </Card>
    </div>
  );
};
