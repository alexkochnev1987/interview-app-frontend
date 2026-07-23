import type { ReactNode } from 'react'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface ProfileFieldProps {
  label: string
  value: ReactNode
  action?: ReactNode
}

export function ProfileField({ label, value, action }: ProfileFieldProps) {
  return (
    <Stack gap={1}>
      <EyebrowLabel>{label}</EyebrowLabel>
      <Inline justify="between" align="center" width="full" wrap="wrap">
        {typeof value === 'string' ? (
          <BodyText weight="medium" tone="foreground">
            {value}
          </BodyText>
        ) : (
          value
        )}
        {action ?? null}
      </Inline>
    </Stack>
  )
}
