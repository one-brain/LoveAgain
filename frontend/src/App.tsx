import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import type { RootState } from './store';

// Route-level code-splitting (React.lazy) to minimize initial bundle size and optimize FCP
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Discovery = lazy(() => import('./pages/Discovery'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));
const ProviderDetail = lazy(() => import('./pages/ProviderDetail'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Chat = lazy(() => import('./pages/Chat'));
const WalletPage = lazy(() => import('./pages/Wallet'));
const ApplyCompanion = lazy(() => import('./pages/ApplyCompanion'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));

const RouteLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium text-muted-foreground">Loading experience...</span>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const UnauthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <Navigate to="/discovery" replace /> : <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route
            path="login"
            element={
              <Suspense fallback={<RouteLoader />}>
                <UnauthenticatedRoute>
                  <Login />
                </UnauthenticatedRoute>
              </Suspense>
            }
          />
          <Route
            path="register"
            element={
              <Suspense fallback={<RouteLoader />}>
                <UnauthenticatedRoute>
                  <Register />
                </UnauthenticatedRoute>
              </Suspense>
            }
          />

          {/* Discovery, How It Works, & Provider Detail */}
          <Route
            path="discovery"
            element={
              <Suspense fallback={<RouteLoader />}>
                <Discovery />
              </Suspense>
            }
          />
          <Route
            path="how-it-works"
            element={
              <Suspense fallback={<RouteLoader />}>
                <HowItWorks />
              </Suspense>
            }
          />
          <Route
            path="provider/:userId"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProviderDetail />
              </Suspense>
            }
          />
          <Route
            path="providers/:userId"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProviderDetail />
              </Suspense>
            }
          />

          {/* Protected routes */}
          <Route
            path="profile"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route path="provider-profile/:userId?" element={<Navigate to="/profile?tab=provider" replace />} />
          <Route
            path="provider"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute>
                  <ProviderDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="apply-companion"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute>
                  <ApplyCompanion />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="admin"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="bookings"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="wallet"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="chat/:orderId"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              </Suspense>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
