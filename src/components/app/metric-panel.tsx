import type { ReactNode } from 'react'

import { Inline, Stack } from '@/components/ui/layout'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

type MetricPanelTone = 'surface' | 'elevated' | 'compact'

const toneClasses: Record<MetricPanelTone, string> = {
  surface: 'rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.9)] p-5 ring-1 ring-border/45',
  elevated: 'rounded-[1.25rem] bg-white/80 p-4 ring-1 ring-border/45',
  compact: 'rounded-[1rem] bg-[hsl(var(--surface-low)/0.85)] p-3 ring-1 ring-border/45',
}

interface MetricPanelProps {
  description?: ReactNode
  icon?: ReactNode
  label: ReactNode
  tone?: MetricPanelTone
  unstyledLabel?: boolean
  unstyledValue?: boolean
  value: ReactNode
  valueClassName?: string
  valueVariant?: 'bodySm' | 'metricValueLg' | 'metricValueXl'
}

export function MetricPanel({
  description,
  icon,
  label,
  tone = 'surface',
  unstyledLabel = false,
  unstyledValue = false,
  value,
  valueClassName,
  valueVariant,
}: MetricPanelProps) {
  const hasIcon = icon !== undefined
  const hasValue = value !== null && value !== undefined && value !== false

  return (
    <div className={toneClasses[tone]}>
      <Stack gap={hasIcon ? 4 : 3}>
        {hasIcon ? (
          <Inline align="center" gap={3}>
            <Text as="span" variant="iconPrimary">
              {icon}
            </Text>
            <Text as="span" variant="metricLabel">
              {label}
            </Text>
          </Inline>
        ) : (
          <>
            {unstyledLabel ? (
              <span>{label}</span>
            ) : (
              <Text as="span" variant="metricLabelCompact">
                {label}
              </Text>
            )}
          </>
        )}

        {hasValue ? (
          unstyledValue ? (
            <div className={valueClassName}>{value}</div>
          ) : (
            <Text
              as="span"
              variant={valueVariant ?? (hasIcon ? 'metricValueXl' : 'metricValueLg')}
              className={cn(valueClassName)}
            >
              {value}
            </Text>
          )
        ) : null}

        {description ? (
          <Text variant="bodyMutedSm">{description}</Text>
        ) : null}
      </Stack>
    </div>
  )
}
