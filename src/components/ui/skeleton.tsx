import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-surface-low-soft/70', className)}
      {...props}
    />
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-4 p-4">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      {/* Search / Filter bar skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-28" />
      </div>
      {/* Table rows skeleton */}
      <div className="space-y-2 rounded-2xl border border-hairline-strong p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}

function DetailPageSkeleton() {
  return (
    <div className="w-full space-y-6 p-6">
      {/* Header / Breadcrumb */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
      </div>
      {/* Main content cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full" />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, TableSkeleton, DetailPageSkeleton, CardGridSkeleton }
