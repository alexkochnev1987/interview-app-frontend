import type { ReactNode } from 'react'

import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface ProfileFieldProps {
  label: string
  value: ReactNode
}

export function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <Stack gap={1}>
      <EyebrowLabel>{label}</EyebrowLabel>
      {typeof value === 'string' ? (
        <BodyText weight="medium" tone="foreground">
          {value}
        </BodyText>
      ) : (
        value
      )}
    </Stack>
  )
}
