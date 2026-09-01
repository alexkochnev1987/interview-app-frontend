'use client'

import { Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'

export interface RecordingViewBannerProps {
  eyebrowLabel: string
  description: string
  actionLabel: string
  onAction: () => void
}

export function RecordingViewBanner({
  eyebrowLabel,
  description,
  actionLabel,
  onAction,
}: RecordingViewBannerProps) {
  return (
    <SurfaceTile tone="soft" rounded="xl" padding="md" width="full">
      <Inline gap={4} align="center" justify="between" wrap="wrap" width="full">
        <Stack gap={1}>
          <EyebrowLabel size="xs">{eyebrowLabel}</EyebrowLabel>
          <BodyText size="sm" tone="muted">
            {description}
          </BodyText>
        </Stack>
        <Button type="button" variant="outline-pill" shape="pill" size="sm" onClick={onAction}>
          <Eye />
          {actionLabel}
        </Button>
      </Inline>
    </SurfaceTile>
  )
}
