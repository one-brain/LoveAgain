import React from 'react';
import { Badge, Button } from '@fluentui/react-components';
import {
  ShieldCheckmark16Regular,
  ArrowDownload16Regular,
  ArrowSync16Regular,
} from '@fluentui/react-icons';

interface AdminHeaderProps {
  onRefreshAll: () => void;
  onExportCsv: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onRefreshAll,
  onExportCsv,
  isRefreshing = false,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-border">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <Badge appearance="tint" color="brand" icon={<ShieldCheckmark16Regular />}>
            Cue back-office command
          </Badge>
          <Badge appearance="tint" color="success">
            Live telemetry
          </Badge>
        </div>

        <h1 className="text-title2 font-semibold text-foreground">
          Back-office command dashboard
        </h1>
        <p className="text-caption1 text-muted-foreground mt-1 max-w-2xl">
          Centralized supervision for companion trust verification, escrow settlement, and user safety governance.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
        <Button
          appearance="outline"
          size="medium"
          icon={<ArrowSync16Regular className={isRefreshing ? 'animate-spin' : ''} />}
          onClick={onRefreshAll}
          disabled={isRefreshing}
          aria-label="Refresh platform telemetry"
        >
          {isRefreshing ? 'Syncing...' : 'Sync data'}
        </Button>

        <Button
          appearance="primary"
          size="medium"
          icon={<ArrowDownload16Regular />}
          onClick={onExportCsv}
        >
          Export CSV
        </Button>
      </div>
    </header>
  );
};
