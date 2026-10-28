import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-slate-200 dark:bg-slate-700/60 rounded ${className}`}
    aria-hidden="true"
  />
);

export const CompanionCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
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
    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
      <Skeleton className="h-5 w-24 rounded" />
      <Skeleton className="h-9 w-28 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-slate-100 dark:border-slate-800">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton className="h-4 w-full rounded" />
      </td>
    ))}
  </tr>
);

