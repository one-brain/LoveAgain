import React from 'react';
import { Badge } from '@fluentui/react-components';

interface AdminPageHeaderProps {
  category?: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  category = 'Back-office operations',
  title,
  description,
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-border">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-caption1 font-semibold text-muted-foreground">
            {category}
          </span>
          <span className="text-muted-foreground">·</span>
          <Badge appearance="tint" color="success">
            Telemetry live
          </Badge>
          {badge}
        </div>

        <h1 className="text-title2 font-semibold text-foreground">{title}</h1>
        <p className="text-caption1 text-muted-foreground mt-1 max-w-2xl">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-2 self-start md:self-center flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
