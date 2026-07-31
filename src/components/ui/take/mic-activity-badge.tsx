'use client'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

import { useMicLevel } from './use-mic-level'

const BAR_HEIGHTS = [11, 18, 11] as const
const BAR_SCALE = [0.75, 1, 0.75] as const
const BAR_MIN_SCALE = 0.5

const badgeVariants = cva(
  'pointer-events-none flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary transition-opacity duration-150',
  {
    variants: {
      placement: {
        default: 'self-end',
        'toolbar-left': 'absolute left-3',
        'hero-bottom-left': 'absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4',
      },
    },
    defaultVariants: {
      placement: 'default',
    },
  },
)

export interface MicActivityBadgeProps extends VariantProps<typeof badgeVariants> {
  stream: MediaStream | null
  muted: boolean
  className?: string
}

export function MicActivityBadge({ stream, muted, placement, className }: MicActivityBadgeProps) {
  const level = useMicLevel(muted ? null : stream)
  const isInactive = muted || !stream

  return (
    <div
      data-slot="mic-activity-badge"
      className={cn(badgeVariants({ placement }), isInactive && 'opacity-50', className)}
    >
      <div className="flex items-center gap-[3px]" aria-hidden>
        {BAR_SCALE.map((scale, i) => {
          const barLevel = Math.min(level * scale, 1)
          const scaleY = BAR_MIN_SCALE + barLevel * (1 - BAR_MIN_SCALE)
          return (
            <span
              // oxlint-disable-next-line react/no-array-index-key
              key={i}
              className="w-[3px] origin-center rounded-full bg-primary-foreground transition-transform duration-100 ease-out will-change-transform"
              style={{
                height: `${BAR_HEIGHTS[i]}px`,
                transform: `scaleY(${scaleY.toFixed(3)})`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
