import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative z-10 py-20 bg-gradient-to-t from-white to-transparent">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-6">
            Discover Meaningful Connections
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A trusted platform connecting seekers with verified providers for social companionship.
          </p>
          <div className="flex justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">
            Why Choose Cue?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 flex items-center justify-center mb-4 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-6 0a2 2 0 1000-4 2 2 0 000 4zm6 8a2 2 0 1000-4 2 2 0 000 4zm-6 0a2 2 0 1000-4 2 2 0 000 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3">Verified Providers</h3>
              <p className="text-gray-600">
                All providers undergo identity verification and background checks for your safety.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 flex items-center justify-center mb-4 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 10c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0-6c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Built-in Stripe integration ensures safe, escrow-based transactions for peace of mind.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 flex items-center justify-center mb-4 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h3m4 0h3m-7 0h3M3 10a6 6 0 0112 0c0-2.761-3.582-5-8-5s-8 2.239-8 5zm0 10a8 8 0 101016 0H3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3">Real-time Chat</h3>
              <p className="text-gray-600">
                Connect instantly with built-in messaging, including read receipts and typing indicators.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 flex items-center justify-center mb-4 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 10c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0-6c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3">Trust & Safety</h3>
              <p className="text-gray-600">
                Comprehensive trust scoring, dispute resolution, and content moderation protect our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col items-center py-8 px-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 flex items-center justify-center mb-4 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3 mt-2">Create Account</h3>
              <p className="text-gray-600 text-center">
                Sign up as either a seeker looking for companionship or a provider offering services.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center py-8 px-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 flex items-center justify-center mb-4 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3 mt-2">Browse & Connect</h3>
              <p className="text-gray-600 text-center">
                Search providers by specialty, location, rate, and availability. View detailed profiles and reviews.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center py-8 px-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-14 w-14 flex items-center justify-center mb-4 bg-blue-100 rounded-full">
                <span className="text-blue-600 text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-600 mb-3 mt-2">Book & Enjoy</h3>
              <p className="text-gray-600 text-center">
                Securely book sessions, chat in real-time, and leave reviews to help build community trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have found meaningful connections through our trusted platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors transform hover:scale-105"
            >
              Join Now - It's Free
            </Link>
            <Link
              to="/discovery"
              className="flex-1 bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors transform hover:scale-105 border border-white/20"
            >
              Browse Providers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;