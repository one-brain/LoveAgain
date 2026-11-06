import React from 'react';
import {
  Skeleton as FluentSkeleton,
  SkeletonItem,
} from '@fluentui/react-components';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <FluentSkeleton aria-hidden="true" className={className}>
    <SkeletonItem className="!w-full !h-full !block" style={{ width: '100%', height: '100%' }} />
  </FluentSkeleton>
);

export const CompanionCardSkeleton: React.FC = () => (
  <div className="fluent-card overflow-hidden flex flex-col">
    <Skeleton className="w-full aspect-[4/3]" />
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-2/3 rounded" />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
      <Skeleton className="h-3.5 w-1/2 rounded" />
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-5/6 rounded" />
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  </div>
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
