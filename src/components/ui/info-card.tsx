import type { ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface InfoCardProps {
  icon: ReactNode
  title: ReactNode
  children: ReactNode
}

export function InfoCard({ icon, title, children }: InfoCardProps) {
  return (
    <Card variant="tinted" size="md">
      <CardContent spacing="sm">
        {icon}
        <Stack gap={1}>
          <BodyText size="sm" weight="semibold" tone="foreground">
            {title}
          </BodyText>
          <BodyText size="sm">{children}</BodyText>
        </Stack>
      </CardContent>
    </Card>
  )
}
