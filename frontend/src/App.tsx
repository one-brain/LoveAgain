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

const isUserAdmin = (user: any) =>
  Boolean(user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local');

const NonAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isUserAdmin(user)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isUserAdmin(user)) return <Navigate to="/discovery" replace />;
  return <>{children}</>;
};

const PublicOrNonAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (isAuthenticated && isUserAdmin(user)) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

const UnauthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  if (isAuthenticated) {
    return isUserAdmin(user) ? <Navigate to="/admin" replace /> : <Navigate to="/discovery" replace />;
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
            element={
              <PublicOrNonAdminRoute>
                <Home />
              </PublicOrNonAdminRoute>
            }
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
                <PublicOrNonAdminRoute>
                  <Discovery />
                </PublicOrNonAdminRoute>
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
                <PublicOrNonAdminRoute>
                  <ProviderDetail />
                </PublicOrNonAdminRoute>
              </Suspense>
            }
          />
          <Route
            path="providers/:userId"
            element={
              <Suspense fallback={<RouteLoader />}>
                <PublicOrNonAdminRoute>
                  <ProviderDetail />
                </PublicOrNonAdminRoute>
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
