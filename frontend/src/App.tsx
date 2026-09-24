import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Discovery from './pages/Discovery';
import ProfilePage from './pages/Profile';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderDetail from './pages/ProviderDetail';
import Bookings from './pages/Bookings';
import Chat from './pages/Chat';
import type { RootState } from './store';

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
          <Route path="login" element={<UnauthenticatedRoute><Login /></UnauthenticatedRoute>} />
          <Route path="register" element={<UnauthenticatedRoute><Register /></UnauthenticatedRoute>} />
          <Route path="discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
          <Route path="provider/:userId" element={<ProtectedRoute><ProviderDetail /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="provider" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
          <Route path="bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="chat/:orderId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;