const ProviderDashboard: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-6xl mx-auto py-6 px-6">
          <h1 className="text-3xl font-semibold" style={{ color: '#1A1614' }}>
            Provider dashboard
          </h1>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
            <div className="p-8 space-y-8">
              {/* Stats Grid */}
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#FEF3EE' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#C65D28' }}>
                    Upcoming bookings
                  </h3>
                  <p className="text-3xl font-semibold" style={{ color: '#1A1614' }}>5</p>
                  <p className="text-sm mt-1" style={{ color: '#746B66' }}>This week</p>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: '#F0F9F1' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#378742' }}>
                    Total earnings
                  </h3>
                  <p className="text-3xl font-semibold" style={{ color: '#1A1614' }}>$1,240</p>
                  <p className="text-sm mt-1" style={{ color: '#746B66' }}>This month</p>
                </div>

                <div className="p-6 rounded-lg" style={{ backgroundColor: '#FAFAF9' }}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: '#746B66' }}>
                    Average rating
                  </h3>
                  <p className="text-3xl font-semibold" style={{ color: '#1A1614' }}>4.8</p>
                  <p className="text-sm mt-1" style={{ color: '#746B66' }}>12 reviews</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1A1614' }}>
                  Recent activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: '#FAFAF9' }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#FEF3EE' }}
                    >
                      <svg className="h-5 w-5" style={{ color: '#E8773D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: '#1A1614' }}>New booking request</p>
                      <p className="text-sm" style={{ color: '#746B66' }}>2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: '#FAFAF9' }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#F0F9F1' }}
                    >
                      <svg className="h-5 w-5" style={{ color: '#47A855' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: '#1A1614' }}>Payment received</p>
                      <p className="text-sm" style={{ color: '#746B66' }}>5 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: '#FAFAF9' }}>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#FEF3EE' }}
                    >
                      <svg className="h-5 w-5" style={{ color: '#E8773D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: '#1A1614' }}>New review received</p>
                      <p className="text-sm" style={{ color: '#746B66' }}>Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProviderDashboard;
