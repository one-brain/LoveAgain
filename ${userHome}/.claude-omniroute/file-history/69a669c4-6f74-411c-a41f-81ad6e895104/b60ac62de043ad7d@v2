import { Link } from 'react-router-dom';

const Discovery: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Discover Providers
          </h1>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Provider Card Example */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
                <div className="flex h-full items-center justify-center">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-6 0a2 2 0 1000-4 2 2 0 000 4zm6 8a2 2 0 1000-4 2 2 0 000 4zm-6 0a2 2 0 1000-4 2 2 0 000 4z" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Alex Johnson
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Companionship Provider • 5.0 Rating
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
                <div className="mt-6">
                  <Link
                    to="/provider/1"
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Profile
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

export default Discovery;