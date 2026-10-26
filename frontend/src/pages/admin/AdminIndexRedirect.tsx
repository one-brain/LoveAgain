import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

export const AdminIndexRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const routeMap: Record<string, string> = {
    profile: '/admin/profile',
    bookings: '/admin/bookings',
    users: '/admin/users',
    payouts: '/admin/payouts',
    mis: '/admin/mis',
    verifications: '/admin/verifications',
  };

  const target = tab && routeMap[tab] ? routeMap[tab] : '/admin/verifications';
  return <Navigate to={target} replace />;
};

export default AdminIndexRedirect;

