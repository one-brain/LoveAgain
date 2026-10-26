import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
const HowItWorks = lazy(() => import('./pages/HowItWorks'));

// Admin Multi-Page Architecture (Zero-Tabs Dedicated Workspaces)
const AdminIndexRedirect = lazy(() => import('./pages/admin/AdminIndexRedirect'));
const AdminVerificationsPage = lazy(() => import('./pages/admin/AdminVerificationsPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminPayoutsPage = lazy(() => import('./pages/admin/AdminPayoutsPage'));
const AdminMisPage = lazy(() => import('./pages/admin/AdminMisPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'));

const RouteLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium text-muted-foreground">Loading experience...</span>
    </div>
  </div>
);

const isUserAdmin = (user: any) =>
  Boolean(user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local');

const NonAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    const redirectParam = encodeURIComponent(location.pathname + location.search);
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
          {/* Admin Dedicated Full-Bleed Workspaces (Zero-Tabs Multi-Page Architecture) */}
          <Route
            path="admin"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminIndexRedirect />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/verifications"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminVerificationsPage />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/bookings"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminBookingsPage />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/users"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/payouts"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminPayoutsPage />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/mis"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminMisPage />
                </AdminRoute>
              </Suspense>
            }
          />
          <Route
            path="admin/profile"
            element={
              <Suspense fallback={<RouteLoader />}>
                <AdminRoute>
                  <AdminProfilePage />
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
