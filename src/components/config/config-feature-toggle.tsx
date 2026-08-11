'use client'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/layout/stack'
import { SegmentedGroup } from '@/components/ui/segmented-group'
import { BodyText } from '@/components/ui/text'

type ConfigBooleanToggleProps = {
  ariaLabel: string
  enabled: boolean
  enabledLabel: string
  disabledLabel: string
  onEnable: () => void
  onDisable: () => void
}

export function ConfigBooleanToggle({
  ariaLabel,
  enabled,
  enabledLabel,
  disabledLabel,
  onEnable,
  onDisable,
}: ConfigBooleanToggleProps) {
  return (
    <DemoWriteGuard width="auto">
      <SegmentedGroup ariaLabel={ariaLabel}>
        <Button
          type="button"
          variant={enabled ? 'secondary' : 'ghost'}
          shape="pill"
          size="sm"
          onClick={onEnable}
        >
          {enabledLabel}
        </Button>
        <Button
          type="button"
          variant={!enabled ? 'secondary' : 'ghost'}
          shape="pill"
          size="sm"
          onClick={onDisable}
        >
          {disabledLabel}
        </Button>
      </SegmentedGroup>
    </DemoWriteGuard>
  )
}

type ConfigFeatureToggleProps = {
  label: string
  description?: string
  enabled: boolean
  enabledLabel: string
  disabledLabel: string
  onEnable: () => void
  onDisable: () => void
}

export function ConfigFeatureToggle({
  label,
  description,
  enabled,
  enabledLabel,
  disabledLabel,
  onEnable,
  onDisable,
}: ConfigFeatureToggleProps) {
  return (
    <Stack gap={2}>
      <Stack gap={1}>
        <BodyText weight="medium">{label}</BodyText>
        {description ? (
          <BodyText size="sm" tone="muted">
            {description}
          </BodyText>
        ) : null}
      </Stack>
      <ConfigBooleanToggle
        ariaLabel={label}
        enabled={enabled}
        enabledLabel={enabledLabel}
        disabledLabel={disabledLabel}
        onEnable={onEnable}
        onDisable={onDisable}
      />
    </Stack>
  )
}
