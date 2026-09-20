import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div style={{ color: '#746B66' }}>Loading...</div>
      </div>
    );
  }

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
                  style={{ backgroundColor: '#E8773D', color: '#FFFFFF' }}
                >
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
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

              {/* Account Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A1614' }}>Account information</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium mb-1" style={{ color: '#746B66' }}>Email</dt>
                    <dd style={{ color: '#1A1614' }}>{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium mb-1" style={{ color: '#746B66' }}>Role</dt>
                    <dd className="capitalize" style={{ color: '#1A1614' }}>{user.roles?.[0] || 'Member'}</dd>
                  </div>
                </dl>
              </div>

              {/* Settings Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A1614' }}>Settings</h3>
                <div className="space-y-2">
                  <Link
                    to="#"
                    className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
                    style={{ backgroundColor: '#FAFAF9', color: '#1A1614' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F3F1'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FAFAF9'}
                  >
                    <span className="font-medium">Notifications</span>
                    <svg className="h-5 w-5" style={{ color: '#746B66' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="#"
                    className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
                    style={{ backgroundColor: '#FAFAF9', color: '#1A1614' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F3F1'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FAFAF9'}
                  >
                    <span className="font-medium">Privacy & security</span>
                    <svg className="h-5 w-5" style={{ color: '#746B66' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to="#"
                    className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
                    style={{ backgroundColor: '#FAFAF9', color: '#1A1614' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F3F1'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FAFAF9'}
                  >
                    <span className="font-medium">Billing</span>
                    <svg className="h-5 w-5" style={{ color: '#746B66' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
