import type { ReactNode } from 'react'

import {
  RING_BORDER_SOFT,
  SURFACE_LOW_BG,
  SURFACE_LOW_STRONG_BG,
} from '@/components/app/style-tokens'
import { cn } from '@/lib/utils'

type MetricPanelTone = 'surface' | 'elevated' | 'compact'

const toneClasses: Record<MetricPanelTone, string> = {
  surface: `rounded-[1.5rem] ${SURFACE_LOW_STRONG_BG} p-5 ${RING_BORDER_SOFT}`,
  elevated: `rounded-[1.25rem] bg-white/80 p-4 ${RING_BORDER_SOFT}`,
  compact: `rounded-[1rem] ${SURFACE_LOW_BG} p-3 ${RING_BORDER_SOFT}`,
}

interface MetricPanelProps {
  description?: ReactNode
  icon?: ReactNode
  label: ReactNode
  labelClassName?: string
  tone?: MetricPanelTone
  unstyledLabel?: boolean
  unstyledValue?: boolean
  value: ReactNode
  valueClassName?: string
}

export function MetricPanel({
  description,
  icon,
  label,
  labelClassName,
  tone = 'surface',
  unstyledLabel = false,
  unstyledValue = false,
  value,
  valueClassName,
}: MetricPanelProps) {
  const hasIcon = icon !== undefined
  const hasValue = value !== null && value !== undefined && value !== false

  return (
    <div className={toneClasses[tone]}>
      {hasIcon ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="shrink-0">{icon}</span>
          <span
            className={cn(
              'text-[0.72rem] font-semibold uppercase tracking-[0.2em]',
              labelClassName
            )}
          >
            {label}
          </span>
        </div>
      ) : (
        <div
          className={cn(
            !unstyledLabel &&
              'text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
            labelClassName,
            unstyledLabel && 'text-inherit'
          )}
        >
          {label}
        </div>
      )}

      {hasValue ? (
        <div
          className={cn(
            !unstyledValue &&
              (hasIcon
                ? 'mt-4 text-4xl font-semibold tracking-[-0.04em] text-foreground'
                : 'mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground'),
            unstyledValue && (hasIcon ? 'mt-4' : 'mt-3'),
            valueClassName
          )}
        >
          {value}
        </div>
      ) : null}

      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
