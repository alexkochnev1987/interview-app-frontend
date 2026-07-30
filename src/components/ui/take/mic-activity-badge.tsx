'use client'

import { cn } from '@/lib/utils'

import { useMicLevel } from './use-mic-level'

const BAR_HEIGHTS = [11, 18, 11] as const
const BAR_SCALE = [0.75, 1, 0.75] as const
const BAR_MIN_SCALE = 0.5

interface MicActivityBadgeProps {
  stream: MediaStream | null
  muted: boolean
  className?: string
}

export function MicActivityBadge({ stream, muted, className }: MicActivityBadgeProps) {
  const level = useMicLevel(muted ? null : stream)
  const isInactive = muted || !stream

  return (
    <div
      data-slot="mic-activity-badge"
      className={cn(
        'pointer-events-none flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary self-end transition-opacity duration-150',
        isInactive && 'opacity-50',
        className,
      )}
    >
      <div className="flex items-center gap-[3px]" aria-hidden>
        {BAR_SCALE.map((scale, i) => {
          const barLevel = Math.min(level * scale * 6, 1)
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
