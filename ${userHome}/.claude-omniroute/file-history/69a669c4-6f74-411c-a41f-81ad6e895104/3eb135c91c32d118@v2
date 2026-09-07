import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Discovery from './pages/Discovery';
import ProfilePage from './pages/Profile';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="provider" element={<ProviderDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;