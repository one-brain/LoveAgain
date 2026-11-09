import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner } from '@fluentui/react-components';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import type { RootState } from './store';

// Route-level code-splitting (React.lazy) to minimize initial bundle size and optimize FCP
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Discovery = lazy(() => import('./pages/Discovery'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));
const ProviderDetail = lazy(() => import('./pages/ProviderDetail'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Chat = lazy(() => import('./pages/Chat'));
const WalletPage = lazy(() => import('./pages/Wallet'));
const ApplyCompanion = lazy(() => import('./pages/ApplyCompanion'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));

// Legal, Trust & Safety Suite
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const CommunityGuidelines = lazy(() => import('./pages/legal/CommunityGuidelines'));
const CancellationPolicy = lazy(() => import('./pages/legal/CancellationPolicy'));
const SupportContact = lazy(() => import('./pages/legal/SupportContact'));

// Admin Multi-Page Architecture (Unified Modern Dashboard)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminIndexRedirect = lazy(() => import('./pages/admin/AdminIndexRedirect'));

const RouteLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner size="medium" label="Loading experience..." labelPosition="below" />
  </div>
);

const isUserAdmin = (user: any) =>
  Boolean(user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local');

const NonAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    // When an unauthenticated visitor shifts to become a companion, direct them to "Create your account" by default
    if (location.pathname.startsWith('/apply-companion')) {
      return <Navigate to={`/register?redirect=${redirectParam}`} replace />;
    }
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  if (isUserAdmin(user)) {
    // Intelligent Admin Redirection matching destination intent
    if (location.pathname.startsWith('/bookings')) {
      return <Navigate to="/admin/bookings" replace />;
    }
    if (location.pathname.startsWith('/wallet')) {
      return <Navigate to="/admin/payouts" replace />;
    }
    if (location.pathname.startsWith('/profile')) {
      return <Navigate to="/admin/profile" replace />;
    }
    return <Navigate to="/admin/verifications" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  if (!isUserAdmin(user)) {
    return <Navigate to="/discovery" replace />;
  }

  return <>{children}</>;
};

const UnauthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (isAuthenticated) {
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect');
    if (redirectUrl && !redirectUrl.startsWith('/admin') && !isUserAdmin(user)) {
      return <Navigate to={redirectUrl} replace />;
    }
    return isUserAdmin(user) ? <Navigate to="/admin/verifications" replace /> : <Navigate to="/discovery" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route
            index
            element={<Home />}
          />
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
          <Route
            path="forgot-password"
            element={
              <Suspense fallback={<RouteLoader />}>
                <UnauthenticatedRoute>
                  <ForgotPassword />
                </UnauthenticatedRoute>
              </Suspense>
            }
          />
          <Route
            path="reset-password"
            element={
              <Suspense fallback={<RouteLoader />}>
                <UnauthenticatedRoute>
                  <ResetPassword />
                </UnauthenticatedRoute>
              </Suspense>
            }
          />
          <Route
            path="verify-email"
            element={
              <Suspense fallback={<RouteLoader />}>
                <VerifyEmail />
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

          {/* Legal, Safety, & Compliance Suite */}
          <Route
            path="privacy"
            element={
              <Suspense fallback={<RouteLoader />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />
          <Route path="privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route
            path="terms"
            element={
              <Suspense fallback={<RouteLoader />}>
                <TermsOfService />
              </Suspense>
            }
          />
          <Route path="terms-of-service" element={<Navigate to="/terms" replace />} />
          <Route
            path="community-guidelines"
            element={
              <Suspense fallback={<RouteLoader />}>
                <CommunityGuidelines />
              </Suspense>
            }
          />
          <Route path="safety" element={<Navigate to="/community-guidelines" replace />} />
          <Route
            path="cancellation-policy"
            element={
              <Suspense fallback={<RouteLoader />}>
                <CancellationPolicy />
              </Suspense>
            }
          />
          <Route path="refund-policy" element={<Navigate to="/cancellation-policy" replace />} />
          <Route
            path="support"
            element={
              <Suspense fallback={<RouteLoader />}>
                <SupportContact />
              </Suspense>
            }
          />
          <Route path="contact" element={<Navigate to="/support" replace />} />
          <Route path="help" element={<Navigate to="/support" replace />} />
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
                <NonAdminRoute>
                  <ProfilePage />
                </NonAdminRoute>
              </Suspense>
            }
          />
          <Route path="provider-profile/:userId?" element={<Navigate to="/profile?tab=provider" replace />} />
          <Route path="companion" element={<Navigate to="/provider" replace />} />
          <Route
            path="provider"
            element={
              <Suspense fallback={<RouteLoader />}>
                <NonAdminRoute>
                  <ProviderDashboard />
                </NonAdminRoute>
              </Suspense>
            }
          />
          <Route
            path="apply-companion"
            element={
              <Suspense fallback={<RouteLoader />}>
                <NonAdminRoute>
                  <ApplyCompanion />
                </NonAdminRoute>
              </Suspense>
            }
          />
          {/* Admin Command Dashboard Architecture */}
          <Route
            path="admin"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/verifications"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminIndexRedirect />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/bookings"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminIndexRedirect />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/users"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminIndexRedirect />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/payouts"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminIndexRedirect />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/mis"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminIndexRedirect />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/profile"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminIndexRedirect />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="bookings"
            element={
              <Suspense fallback={<RouteLoader />}>
                <NonAdminRoute>
                  <Bookings />
                </NonAdminRoute>
              </Suspense>
            }
          />
          <Route
            path="wallet"
            element={
              <Suspense fallback={<RouteLoader />}>
                <NonAdminRoute>
                  <WalletPage />
                </NonAdminRoute>
              </Suspense>
            }
          />
          <Route
            path="chat/:orderId"
            element={
              <Suspense fallback={<RouteLoader />}>
                <NonAdminRoute>
                  <Chat />
                </NonAdminRoute>
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
