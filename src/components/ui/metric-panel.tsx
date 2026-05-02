import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const metricPanelVariants = cva('', {
  variants: {
    tone: {
      surface: 'rounded-3xl bg-surface-low-glass p-5 ring-1 ring-hairline',
      elevated: 'rounded-xl-2 bg-surface-glass-soft p-4 ring-1 ring-hairline',
      compact: 'rounded-2xl bg-surface-low-soft p-3 ring-1 ring-hairline',
    },
  },
  defaultVariants: {
    tone: 'surface',
  },
})

const valueVariants = cva('', {
  variants: {
    size: {
      default: 'text-3xl font-semibold tracking-display-tight',
      lg: 'text-4xl font-semibold tracking-display-tight',
      hero: 'text-4xl font-semibold tracking-display-tightest',
      md: 'text-xl font-semibold tracking-display',
      sm: 'text-sm leading-6',
      raw: '',
    },
    tone: {
      foreground: 'text-foreground',
      primary: 'text-[hsl(var(--primary))]',
      none: '',
    },
    spacing: {
      'icon-offset': 'mt-4',
      'label-offset': 'mt-3',
      'compact-offset': 'mt-2',
      none: '',
    },
  },
  defaultVariants: {
    size: 'default',
    tone: 'foreground',
    spacing: 'label-offset',
  },
})

const labelVariants = cva('', {
  variants: {
    variant: {
      eyebrow:
        'text-[0.68rem] font-semibold uppercase tracking-eyebrow-wide text-muted-foreground',
      'eyebrow-icon':
        'text-[0.72rem] font-semibold uppercase tracking-eyebrow-wider',
      raw: '',
    },
  },
  defaultVariants: {
    variant: 'eyebrow',
  },
})

interface MetricPanelProps
  extends VariantProps<typeof metricPanelVariants> {
  description?: ReactNode
  icon?: ReactNode
  label: ReactNode
  labelVariant?: 'default' | 'raw'
  value?: ReactNode
  valueSize?: 'default' | 'lg' | 'hero' | 'md' | 'sm' | 'raw'
  valueTone?: 'foreground' | 'primary' | 'none'
}

export function MetricPanel({
  description,
  icon,
  label,
  labelVariant = 'default',
  tone,
  value,
  valueSize,
  valueTone,
}: MetricPanelProps) {
  const hasIcon = icon !== undefined
  const hasValue = value !== null && value !== undefined && value !== false
  const resolvedLabelVariant =
    labelVariant === 'raw' ? 'raw' : hasIcon ? 'eyebrow-icon' : 'eyebrow'
  const resolvedValueSize = valueSize ?? (hasIcon ? 'lg' : 'default')
  const resolvedValueSpacing =
    resolvedValueSize === 'md'
      ? 'compact-offset'
      : hasIcon
        ? 'icon-offset'
        : 'label-offset'

  return (
    <div className={metricPanelVariants({ tone })}>
      {hasIcon ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="shrink-0 [&_svg]:size-4">{icon}</span>
          <span className={labelVariants({ variant: resolvedLabelVariant })}>
            {label}
          </span>
        </div>
      ) : (
        <div className={labelVariants({ variant: resolvedLabelVariant })}>
          {label}
        </div>
      )}

      {hasValue ? (
        <div
          className={valueVariants({
            size: resolvedValueSize,
            tone: valueTone,
            spacing: resolvedValueSpacing,
          })}
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
