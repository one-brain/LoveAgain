import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#FAFAF9' }}>
      {/* Hero Section */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1
            className="text-5xl font-semibold mb-4"
            style={{ color: '#1A1614', lineHeight: '1.2' }}
          >
            Find companions for the experiences you love
          </h1>
          <p
            className="text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: '#746B66', lineHeight: '1.6' }}
          >
            Connect with verified people for activities, skill-sharing, and adventures. From tennis matches to cooking classes to museum visits.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 rounded-lg font-medium text-lg transition-colors"
            style={{ backgroundColor: '#E8773D', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C65D28'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E8773D'}
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl font-semibold text-center mb-16"
            style={{ color: '#1A1614' }}
          >
            How Cue works
          </h2>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div>
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                style={{ backgroundColor: '#FEF3EE' }}
              >
                <svg className="h-6 w-6" style={{ color: '#E8773D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1614' }}>
                Verified profiles
              </h3>
              <p style={{ color: '#746B66', lineHeight: '1.6' }}>
                All providers undergo identity verification and background checks for safety.
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                style={{ backgroundColor: '#FEF3EE' }}
              >
                <svg className="h-6 w-6" style={{ color: '#E8773D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1614' }}>
                Secure payments
              </h3>
              <p style={{ color: '#746B66', lineHeight: '1.6' }}>
                Built-in Stripe integration ensures safe, escrow-based transactions.
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                style={{ backgroundColor: '#FEF3EE' }}
              >
                <svg className="h-6 w-6" style={{ color: '#E8773D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1614' }}>
                Real-time chat
              </h3>
              <p style={{ color: '#746B66', lineHeight: '1.6' }}>
                Connect instantly with built-in messaging and notifications.
              </p>
            </div>

            {/* Feature 4 */}
            <div>
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg mb-4"
                style={{ backgroundColor: '#FEF3EE' }}
              >
                <svg className="h-6 w-6" style={{ color: '#E8773D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#1A1614' }}>
                Trust scoring
              </h3>
              <p style={{ color: '#746B66', lineHeight: '1.6' }}>
                Reputation system with reviews and dispute resolution protects the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E7E3E0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl font-semibold text-center mb-16"
            style={{ color: '#1A1614' }}
          >
            Three steps to your next experience
          </h2>
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Step 1 */}
            <div>
              <div className="mb-4">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-lg"
                  style={{ backgroundColor: '#FEF3EE', color: '#E8773D' }}
                >
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1614' }}>
                Create your account
              </h3>
              <p style={{ color: '#746B66', lineHeight: '1.6' }}>
                Sign up in minutes. Choose whether you want to find companions, offer services, or both.
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div className="mb-4">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-lg"
                  style={{ backgroundColor: '#FEF3EE', color: '#E8773D' }}
                >
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1614' }}>
                Browse and connect
              </h3>
              <p style={{ color: '#746B66', lineHeight: '1.6' }}>
                Search by specialty, location, and availability. View profiles, ratings, and reviews.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div className="mb-4">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full font-semibold text-lg"
                  style={{ backgroundColor: '#FEF3EE', color: '#E8773D' }}
                >
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#1A1614' }}>
                Book and enjoy
              </h3>
              <p style={{ color: '#746B66', lineHeight: '1.6' }}>
                Securely book time, chat in real-time, and share your experience through reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#E8773D' }}>
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2
            className="text-4xl font-semibold mb-4"
            style={{ color: '#FFFFFF', lineHeight: '1.3' }}
          >
            Ready to get started?
          </h2>
          <p
            className="text-lg mb-8 max-w-2xl mx-auto"
            style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6' }}
          >
            Join thousands finding companions for activities, skill-sharing, and new adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#FFFFFF', color: '#E8773D' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAF9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              Create account
            </Link>
            <Link
              to="/discovery"
              className="px-8 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
            >
              Browse providers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
