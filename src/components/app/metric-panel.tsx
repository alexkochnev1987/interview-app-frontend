import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type MetricPanelTone = 'surface' | 'elevated' | 'compact'

const toneClasses: Record<MetricPanelTone, string> = {
  surface: 'rounded-3xl bg-surface-low-glass p-5 ring-1 ring-hairline',
  elevated: 'rounded-xl-2 bg-surface-glass-soft p-4 ring-1 ring-hairline',
  compact: 'rounded-2xl bg-surface-low-soft p-3 ring-1 ring-hairline',
}

interface MetricPanelProps {
  className?: string
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
  className,
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
    <div className={cn(toneClasses[tone], className)}>
      {hasIcon ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="shrink-0">{icon}</span>
          <span
            className={cn(
              'text-[0.72rem] font-semibold uppercase tracking-eyebrow-wider',
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
              'text-[0.68rem] font-semibold uppercase tracking-eyebrow-wide text-muted-foreground',
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
                ? 'mt-4 text-4xl font-semibold tracking-display-tight text-foreground'
                : 'mt-3 text-3xl font-semibold tracking-display-tight text-foreground'),
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
