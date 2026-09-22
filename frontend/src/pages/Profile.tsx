import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  useGetSeekerProfileQuery,
  useUpdateSeekerProfileMutation,
} from '../store/api';

const Profile: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);

  // Fetch seeker profile from /me
  const { data: seekerData, isLoading: seekerLoading, isError: seekerError } = useGetSeekerProfileQuery();
  const [updateSeeker] = useUpdateSeekerProfileMutation();

  // Local state for editable seeker profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Initialize forms from profile data
  useEffect(() => {
    if (seekerData?.profile) {
      const p = seekerData.profile;
      setFirstName(p.firstName || '');
      setLastName(p.lastName || '');
      setPhone(p.phone || '');
      setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '');
    }
  }, [seekerData]);

  // Reset success message after delay
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => setUpdateSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  const handleUpdateSeeker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    try {
      await updateSeeker({
        firstName,
        lastName,
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
      }).unwrap();
      setUpdateSuccess(true);
    } catch (err: any) {
      setUpdateError(err?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const isLoading = seekerLoading;

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-pulse-subtle text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || seekerError) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7v8.5m0 0H8m8 0V11a4 4 0 00-4-4h-.5a3.5 3.5 0 100 7m1 .5v2.5a2.5 2.5 0 105 0V12a2.5 2.5 0 00-2.5-2.5H10a2.5 2.5 0 000 5h5.5z" />
            </svg>
          </div>
          <h3 className="empty-state-title">Unable to load profile</h3>
          <p className="empty-state-text">There was a problem loading your profile. Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }

  const seekerProfile = seekerData?.profile;
  const displayName = seekerProfile
    ? seekerProfile.firstName + ' ' + seekerProfile.lastName
    : `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.email || '?').charAt(0).toUpperCase();

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-title">
          <h1 className="text-3xl font-semibold text-primary">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your seeker and provider profiles</p>
        </div>
      </header>

      <main className="page-content">
        {/* User Info Header */}
        <div className="flex items-center gap-6 mb-10 pb-6 border-b border-border">
          <div className="avatar-lg">{initials}</div>
          <div>
            <h2 className="text-2xl font-semibold text-primary">{displayName || 'User'}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.roles?.[0] || 'Member'} • Joined{' '}
              {new Date(user?.createdAt || new Date()).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid-2">
          {/* Seeker Profile Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Seeker Profile</h2>
            <form onSubmit={handleUpdateSeeker} className="space-y-6">
              <div className="form-section">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label-field">First Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="label-field">Last Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-field">Phone</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="label-field">Date of Birth</label>
                  <input
                    type="date"
                    className="input-field"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              {updateError && <p className="error-message">{updateError}</p>}
              {updateSuccess && <p className="success-message">Profile updated successfully!</p>}

              <button
                type="submit"
                disabled={isUpdating}
                className="btn-primary w-full"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* Provider Profile Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Provider Profile</h2>

            <div className="form-section text-center">
              <div className="empty-state-icon mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6M12 6l-3 3M12 6l3 3" />
                </svg>
              </div>
              <p className="empty-state-title">You do not have a provider profile yet.</p>
              <p className="empty-state-text mb-6">Become a provider and offer your services to the community.</p>
              <Link
                to="/provider"
                className="btn-primary inline-flex justify-center"
              >
                Switch to Provider Dashboard
              </Link>
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="text-xl font-semibold mb-4 text-primary">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/bookings" className="btn-outline">
              My Bookings
            </Link>
            <Link to="/provider" className="btn-outline">
              Provider Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;