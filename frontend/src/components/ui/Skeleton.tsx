import React from 'react';
import {
  Card,
  Skeleton as FluentSkeleton,
  SkeletonItem,
} from '@fluentui/react-components';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <FluentSkeleton aria-hidden="true" className={className}>
    <SkeletonItem className="!w-full !h-full !block" style={{ width: '100%', height: '100%' }} />
  </FluentSkeleton>
);

export const CompanionCardSkeleton: React.FC = () => (
  <Card className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-5/6 rounded" />
    </div>
    <div className="flex flex-wrap gap-1.5 pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
    <div className="pt-3 border-t border-border flex items-center justify-between">
      <Skeleton className="h-5 w-24 rounded" />
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
  </Card>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-border">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton className="h-4 w-full rounded" />
      </td>
    ))}
  </tr>
);
