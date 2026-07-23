'use client'

import { cn } from '@/lib/utils'

import { useMicLevel } from './use-mic-level'

interface MicLevelMeterProps {
  stream: MediaStream | null
  className?: string
}

export function MicLevelMeter({
  stream,
  className,
}: MicLevelMeterProps) {
  const level = useMicLevel(stream)

  return (
    <div
      data-slot="mic-level-meter"
      className={cn(
        'relative w-1.5 self-stretch min-h-[4.25rem] overflow-hidden rounded-full bg-muted-foreground/20',
        className,
      )}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-full origin-bottom rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-transform duration-75 ease-out will-change-transform"
        style={{ transform: `scaleY(${(0.05 + Math.min(level, 1) * 0.60).toFixed(3)})` }}
      />
    </div>
  )
}
