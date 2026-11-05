import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const AdminIndexRedirect: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let tab = 'verifications';
  if (path.includes('/bookings')) tab = 'bookings';
  else if (path.includes('/users')) tab = 'users';
  else if (path.includes('/payouts')) tab = 'payouts';
  else if (path.includes('/mis')) tab = 'mis';
  else if (path.includes('/profile')) tab = 'profile';
  else if (path.includes('/verifications')) tab = 'verifications';

  return <Navigate to={`/admin?tab=${tab}`} replace />;
};

export default AdminIndexRedirect;

