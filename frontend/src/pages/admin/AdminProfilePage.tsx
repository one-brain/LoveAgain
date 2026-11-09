import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@fluentui/react-components';
import { ShieldCheckmark16Regular } from '@fluentui/react-icons';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminProfileView } from '../../components/admin/AdminProfileView';

export const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <AdminPageHeader
        title="Admin identity, security & credentials"
        description="Manage administrative contact details, compressed avatar identity, password rotation, and audit active platform authorization telemetry."
        badge={
          <Badge appearance="tint" color="warning" icon={<ShieldCheckmark16Regular />}>
            Super administrator authority
          </Badge>
        }
      />

      <main>
        <AdminProfileView onBackToDashboard={() => navigate('/admin/verifications')} />
      </main>
    </div>
  );
};

export default AdminProfilePage;
