import type { ReactNode } from 'react'

import {
  METRIC_PANEL_COMPACT,
  METRIC_PANEL_ELEVATED,
  METRIC_PANEL_SURFACE,
} from '@/components/app/style-tokens'
import { Inline, Stack } from '@/components/ui/layout'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

type MetricPanelTone = 'surface' | 'elevated' | 'compact'

const toneClasses: Record<MetricPanelTone, string> = {
  surface: METRIC_PANEL_SURFACE,
  elevated: METRIC_PANEL_ELEVATED,
  compact: METRIC_PANEL_COMPACT,
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
