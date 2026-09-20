import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetProviderQuery } from '../store/discoveryApi';

const ProviderDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: provider, isLoading, isError } = useGetProviderQuery(
    userId || '',
    { skip: !userId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="text-lg" style={{ color: '#746B66' }}>Loading...</div>
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="rounded-xl p-8 text-center max-w-md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
          <svg className="mx-auto h-12 w-12 mb-4" style={{ color: '#E7E3E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#1A1614' }}>Provider not found</h3>
          <p className="mb-4" style={{ color: '#746B66' }}>This profile doesn't exist or is no longer available</p>
          <Link
            to="/discovery"
            className="inline-block px-5 py-2.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#E8773D', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C65D28'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E8773D'}
          >
            Back to discovery
          </Link>
        </div>
      </div>
    );
  }

  const availableSlots = provider.upcomingSlots.filter((s) => !s.isBooked);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-6xl mx-auto py-6 px-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium inline-flex items-center transition-colors"
            style={{ color: '#746B66' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1A1614'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#746B66'}
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
            {/* Photo */}
            <div
              className="h-80 flex items-center justify-center"
              style={{ backgroundColor: provider.photoUrl ? 'transparent' : '#E8773D' }}
            >
              {provider.photoUrl ? (
                <img
                  src={provider.photoUrl}
                  alt={provider.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  className="text-8xl font-semibold"
                  style={{ color: '#FFFFFF' }}
                >
                  {provider.displayName.charAt(0)}
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="px-8 py-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-semibold" style={{ color: '#1A1614' }}>
                      {provider.displayName}
                    </h1>
                    {provider.isVerified && (
                      <svg className="w-6 h-6" style={{ color: '#E8773D' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span style={{ color: '#E8773D' }}>★</span>
                      <span className="font-medium" style={{ color: '#746B66' }}>
                        {provider.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span style={{ color: '#E7E3E0' }}>•</span>
                    <span className="text-sm" style={{ color: '#746B66' }}>
                      Trust score: {provider.trustScore}
                    </span>
                  </div>
                </div>
                <div className="text-3xl font-semibold" style={{ color: '#1A1614' }}>
                  ${provider.hourlyRate}
                  <span className="text-lg font-normal" style={{ color: '#746B66' }}>/hr</span>
                </div>
              </div>

              {/* Bio */}
              {provider.bio && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-3" style={{ color: '#1A1614' }}>About</h2>
                  <p style={{ color: '#746B66', lineHeight: '1.6' }}>{provider.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {provider.specialties.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-3" style={{ color: '#1A1614' }}>Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ backgroundColor: '#FEF3EE', color: '#C65D28' }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#FAFAF9' }}>
                  <dt className="text-sm font-medium mb-1" style={{ color: '#746B66' }}>Service radius</dt>
                  <dd className="text-lg font-semibold" style={{ color: '#1A1614' }}>{provider.maxRadiusKm} km</dd>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: '#FAFAF9' }}>
                  <dt className="text-sm font-medium mb-1" style={{ color: '#746B66' }}>Intro video</dt>
                  <dd>
                    {provider.introVideoUrl ? (
                      <a
                        href={provider.introVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#E8773D' }}
                      >
                        Watch introduction
                      </a>
                    ) : (
                      <span className="text-sm" style={{ color: '#746B66' }}>Not available</span>
                    )}
                  </dd>
                </div>
              </div>

              {/* Available Slots */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1614' }}>Available times</h2>
                {availableSlots.length === 0 ? (
                  <p style={{ color: '#746B66' }}>No upcoming availability</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.slotId}
                        onClick={() => setSelectedSlot(selectedSlot === slot.slotId ? null : slot.slotId)}
                        className="p-3 rounded-lg text-sm text-center transition-colors"
                        style={{
                          border: selectedSlot === slot.slotId ? '2px solid #E8773D' : '1px solid #E7E3E0',
                          backgroundColor: selectedSlot === slot.slotId ? '#FEF3EE' : '#FFFFFF',
                          color: selectedSlot === slot.slotId ? '#C65D28' : '#1A1614',
                        }}
                      >
                        <div className="font-medium">
                          {new Date(slot.startTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#746B66' }}>
                          {new Date(slot.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })} - {new Date(slot.endTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Book Button */}
              <button
                disabled={!selectedSlot}
                className="w-full sm:w-auto px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: selectedSlot ? '#E8773D' : '#E7E3E0',
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => selectedSlot && (e.currentTarget.style.backgroundColor = '#C65D28')}
                onMouseLeave={(e) => selectedSlot && (e.currentTarget.style.backgroundColor = '#E8773D')}
              >
                {selectedSlot ? 'Book this time' : 'Select a time to book'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDetail;
