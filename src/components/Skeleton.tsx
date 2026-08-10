/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse motion-reduce:animate-none rounded-md bg-black/8 dark:bg-white/10 ${className}`}
    />
  );
}

/** Placeholder matching a single stat card (icon + label + big value), same shape as the real card. */
export function StatCardSkeleton() {
  return (
    <div className="border border-border-custom p-5 rounded-[20px] flex flex-col justify-between min-h-[120px] bg-bg-surface shadow-sm">
      <div className="flex justify-between items-start">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-[8px]" />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}
