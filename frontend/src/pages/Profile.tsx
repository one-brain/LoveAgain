import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useGetMyProfileQuery } from '../store/bookingApi';
import { useAddServiceSpecialtyMutation, useRemoveServiceSpecialtyMutation } from '../store/bookingApi';
import { ServiceManagement } from '../components/ServiceManagement';
import { setSpecialties } from '../store/slices/profileSlice';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const { specialties } = useSelector((state: any) => state.profile || { specialties: [] });

  // Fetch provider profile
  const { data: profileData, isLoading: profileLoading } = useGetMyProfileQuery();

  // Service management mutations
  const [addService] = useAddServiceSpecialtyMutation();
  const [removeService] = useRemoveServiceSpecialtyMutation();

  // Initialize specialties from profile data
  useEffect(() => {
    if (profileData?.profile?.specialties) {
      dispatch(setSpecialties(profileData.profile.specialties));
    }
  }, [profileData, dispatch]);

  const handleAddService = async (specialty: string) => {
    try {
      const result = await addService({ specialty }).unwrap();
      dispatch(setSpecialties(result.specialties));
    } catch {
      // Error already handled by RTK Query
    }
  };

  const handleRemoveService = async (specialty: string) => {
    try {
      const result = await removeService({ specialty }).unwrap();
      dispatch(setSpecialties(result.specialties));
    } catch {
      // Error already handled by RTK Query
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div style={{ color: '#746B66' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div style={{ color: '#746B66' }}>Loading...</div>
      </div>
    );
  }

  const profile = profileData?.profile;
  const isProvider = profile !== undefined;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-6xl mx-auto py-6 px-6">
          <h1 className="text-3xl font-semibold" style={{ color: '#1A1614' }}>
            Profile
          </h1>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
            <div className="p-8">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-8 pb-8" style={{ borderBottom: '1px solid #E7E3E0' }}>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-xl"
                  style={{ backgroundColor: '#C65D28', color: '#FFFFFF' }}
                >
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold" style={{ color: '#1A1614' }}>
                    {user.firstName} {user.lastName}
                  </h2>
                  <p style={{ color: '#746B66' }}>
                    {user.roles?.[0] || 'Member'} • Joined {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Provider Profile Section */}
              {isProvider && profile && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A1614' }}>Your Services</h2>
                  <ServiceManagement
                    specialties={specialties}
                    onAddService={handleAddService}
                    onRemoveService={handleRemoveService}
                  />
                </section>
              )}

              {/* Profile Details Grid */}
              {profile && (
                <section>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A1614' }}>Profile Details</h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1" style={{ color: '#746B66' }}>Hourly Rate</p>
                      <p className="text-lg font-semibold" style={{ color: '#1A1614' }}>${profile.hourlyRate}/hr</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1" style={{ color: '#746B66' }}>Availability Radius</p>
                      <p className="text-lg font-semibold" style={{ color: '#1A1614' }}>{profile.maxRadiusKm} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1" style={{ color: '#746B66' }}>Average Rating</p>
                      <p className="text-lg font-semibold" style={{ color: '#1A1614' }}>{profile.averageRating} ★</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1" style={{ color: '#746B66' }}>Profile Status</p>
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: profile.isActive ? '#F0F9F1' : '#FEF3EE', color: profile.isActive ? '#378742' : '#C65D28' }}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="pt-4 mt-6" style={{ borderTop: '1px solid #E7E3E0' }}>
                      <p className="text-xs text-muted-foreground mb-2" style={{ color: '#746B66' }}>Bio</p>
                      <p className="text-sm" style={{ color: '#1A1614' }}>{profile.bio}</p>
                    </div>
                  )}
                </section>
              )}

              {/* Not a provider */}
              {!isProvider && (
                <section className="py-8 text-center">
                  <p className="text-sm mb-4" style={{ color: '#746B66' }}>You do not have a provider profile yet.</p>
                  <Link to="/provider" className="inline-block rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#C65D28', color: '#FFFFFF' }}>
                    Switch to Provider Dashboard
                  </Link>
                </section>
              )}

              {/* Quick Links */}
              <section className="pt-8 mt-8" style={{ borderTop: '1px solid #E7E3E0' }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A1614' }}>Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Link to="/bookings" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50" style={{ borderColor: '#E7E3E0' }}>
                    My Bookings
                  </Link>
                  {isProvider && (
                    <Link to="/provider" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50" style={{ borderColor: '#E7E3E0' }}>
                      Provider Dashboard
                    </Link>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;