import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const skeletonVariants = cva('animate-pulse bg-muted', {
  variants: {
    variant: {
      default: 'rounded-md',
      pill: 'rounded-full',
      circle: 'rounded-full aspect-square',
      rounded: 'rounded-lg',
      'rounded-xl': 'rounded-xl-2',
    },
    height: {
      auto: '',
      xs: 'h-3.5',
      sm: 'h-4',
      md: 'h-5',
      lg: 'h-6',
      xl: 'h-8',
      '2xl': 'h-10',
      '3xl': 'h-12',
    },
    width: {
      auto: '',
      full: 'w-full',
      '4/5': 'w-4/5',
      '3/4': 'w-3/4',
      '2/3': 'w-2/3',
      '1/2': 'w-1/2',
      '1/3': 'w-1/3',
      '1/4': 'w-1/4',
      xs: 'w-16',
      sm: 'w-24',
      md: 'w-36',
      lg: 'w-48',
      xl: 'w-64',
    },
  },
  defaultVariants: {
    variant: 'default',
    height: 'sm',
    width: 'full',
  },
})

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, height, width, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, height, width }), className)}
      {...props}
    />
  )
}

interface CandidateLinkSkeletonProps extends HTMLAttributes<HTMLOutputElement> {
  'aria-label'?: string
}

export function CandidateLinkSkeleton({
  className,
  'aria-label': ariaLabel = 'Loading link...',
  ...props
}: CandidateLinkSkeletonProps) {
  return (
    <output aria-label={ariaLabel} className={cn('flex flex-col gap-1.5', className)} {...props}>
      <div className="flex flex-col">
        <div className="flex h-6 items-center">
          <Skeleton height="md" width="full" variant="rounded" />
        </div>
        <div className="flex h-6 items-center block @[620px]:hidden">
          <Skeleton height="md" width="4/5" variant="rounded" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex h-5 items-center">
          <Skeleton height="sm" variant="rounded" className="w-full @[620px]:w-3/4" />
        </div>
        <div className="flex h-5 items-center block @[620px]:hidden">
          <Skeleton height="sm" width="1/2" variant="rounded" />
        </div>
      </div>
    </output>
  )
}
