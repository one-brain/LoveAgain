import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListProvidersQuery } from '../store/discoveryApi';

const SPECIALTIES = [
  'All',
  'Tennis',
  'Yoga',
  'Cooking',
  'Photography',
  'Music',
  'Hiking',
  'Reading',
  'Art',
  'Dance',
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'price', label: 'Price: low to high' },
  { value: 'newest', label: 'Newest' },
];

const Discovery: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const { data: providers, isLoading, isError, error } = useListProvidersQuery({
    q: q || undefined,
    specialty: specialty !== 'All' ? specialty : undefined,
    minRate: minRate ? Number(minRate) : undefined,
    maxRate: maxRate ? Number(maxRate) : undefined,
    sortBy,
    page,
    pageSize,
  });

  const handleSpecialtyChange = (value: string) => {
    setSpecialty(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setQ(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      {/* Search hero */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1
            className="text-5xl font-semibold mb-3"
            style={{ color: '#1A1614', lineHeight: '1.2' }}
          >
            Find your next experience
          </h1>
          <p
            className="text-lg mb-8"
            style={{ color: '#746B66', maxWidth: '600px' }}
          >
            Connect with verified companions for activities, skill-sharing, and new adventures
          </p>

          {/* Search input */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by name, interest, or activity..."
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-lg border-2 focus:outline-none transition-colors"
              style={{
                borderColor: q ? '#E8773D' : '#E7E3E0',
                color: '#1A1614',
              }}
            />
            <svg
              className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6"
              style={{ color: '#746B66' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Specialty pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecialtyChange(spec)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: specialty === spec ? '#E8773D' : '#FFFFFF',
                  color: specialty === spec ? '#FFFFFF' : '#746B66',
                  border: specialty === spec ? 'none' : '1px solid #E7E3E0',
                }}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Secondary filters */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: showPriceFilter || minRate || maxRate ? '#FEF3EE' : 'transparent',
                color: '#746B66',
                border: '1px solid #E7E3E0',
              }}
            >
              {minRate || maxRate ? `$${minRate || '0'}–$${maxRate || '∞'}/hr` : 'Price range'}
            </button>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: '#746B66',
                border: '1px solid #E7E3E0',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {(specialty !== 'All' || minRate || maxRate || q) && (
              <button
                onClick={() => {
                  setQ('');
                  setSpecialty('All');
                  setMinRate('');
                  setMaxRate('');
                  setPage(1);
                }}
                className="text-sm font-medium"
                style={{ color: '#E8773D' }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Price filter expansion */}
          {showPriceFilter && (
            <div className="mt-4 flex gap-3 items-center">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                className="w-28 px-3 py-2 rounded-lg text-sm border focus:outline-none"
                style={{ borderColor: '#E7E3E0', color: '#1A1614' }}
              />
              <span style={{ color: '#746B66' }}>to</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-28 px-3 py-2 rounded-lg text-sm border focus:outline-none"
                style={{ borderColor: '#E7E3E0', color: '#1A1614' }}
              />
              <span className="text-sm" style={{ color: '#746B66' }}>per hour</span>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-lg" style={{ color: '#746B66' }}>Loading...</div>
          </div>
        )}

        {isError && (
          <div
            className="rounded-xl p-8 text-center"
            style={{ backgroundColor: '#FEF3EE', border: '1px solid #E8773D' }}
          >
            <p className="font-medium" style={{ color: '#C65D28' }}>Could not load providers</p>
            <p className="text-sm mt-2" style={{ color: '#746B66' }}>
              {error && typeof error === 'object' && 'status' in error
                ? `Server returned ${(error as { status: number }).status}`
                : 'Check your connection and try again'}
            </p>
          </div>
        )}

        {!isLoading && !isError && providers && providers.length === 0 && (
          <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
            <svg className="mx-auto h-12 w-12 mb-4" style={{ color: '#E7E3E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium mb-2" style={{ color: '#1A1614' }}>No one found</h3>
            <p style={{ color: '#746B66' }}>Try different search terms or filters</p>
          </div>
        )}

        {!isLoading && !isError && providers && providers.length > 0 && (
          <>
            <p className="mb-8 text-sm" style={{ color: '#746B66' }}>
              {providers.length} {providers.length === 1 ? 'provider' : 'providers'}
            </p>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <div
                  key={provider.providerId}
                  onClick={() => navigate(`/provider/${provider.providerId}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/provider/${provider.providerId}`); }}
                  role="button"
                  tabIndex={0}
                  className="rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}
                >
                  {/* Photo */}
                  <div
                    className="h-64 flex items-center justify-center"
                    style={{
                      backgroundColor: provider.photoUrl ? 'transparent' : '#E8773D',
                    }}
                  >
                    {provider.photoUrl ? (
                      <img
                        src={provider.photoUrl}
                        alt={provider.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-6xl font-semibold"
                        style={{ color: '#FFFFFF' }}
                      >
                        {provider.displayName.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold" style={{ color: '#1A1614' }}>
                        {provider.displayName}
                      </h3>
                      {provider.isVerified && (
                        <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#E8773D' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {provider.bio && (
                      <p
                        className="text-sm mb-4 line-clamp-2"
                        style={{ color: '#746B66', lineHeight: '1.5' }}
                      >
                        {provider.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-lg font-semibold" style={{ color: '#1A1614' }}>
                        ${provider.hourlyRate}
                      </span>
                      <span style={{ color: '#E7E3E0' }}>•</span>
                      <div className="flex items-center gap-1">
                        <span style={{ color: '#E8773D' }}>★</span>
                        <span className="text-sm font-medium" style={{ color: '#746B66' }}>
                          {provider.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {provider.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {provider.specialties.slice(0, 3).map((spec) => (
                          <span
                            key={spec}
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: '#FEF3EE', color: '#C65D28' }}
                          >
                            {spec}
                          </span>
                        ))}
                        {provider.specialties.length > 3 && (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: '#FAFAF9', color: '#746B66' }}
                          >
                            +{provider.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: page <= 1 ? 'transparent' : '#FFFFFF',
                  color: '#746B66',
                  border: '1px solid #E7E3E0',
                }}
              >
                Previous
              </button>
              <span className="text-sm" style={{ color: '#746B66' }}>Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!providers || providers.length < pageSize}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: (!providers || providers.length < pageSize) ? 'transparent' : '#FFFFFF',
                  color: '#746B66',
                  border: '1px solid #E7E3E0',
                }}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Discovery;
