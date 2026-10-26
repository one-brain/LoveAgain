import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminProfileView } from '../../components/admin/AdminProfileView';

export const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in-50 duration-150">
      {/* Page Header */}
      <AdminPageHeader
        title="Admin Identity, Security & Credentials"
        description="Manage administrative contact details, compressed avatar identity, password rotation, and audit active platform authorization telemetry."
        badge={
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Super Administrator Authority</span>
          </div>
        }
      />

      {/* Full-Bleed Profile & Security Studio */}
      <main>
        <AdminProfileView onBackToDashboard={() => navigate('/admin/verifications')} />
      </main>
    </div>
  );
};

export default AdminProfilePage;

