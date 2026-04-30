import type { ReactNode } from 'react'

import { IconBadge } from '@/components/ui/icon-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

interface EditorSectionCardProps {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
  className?: string
}

export function EditorSectionCard({
  title,
  description,
  icon,
  children,
  className,
}: EditorSectionCardProps) {
  return (
    <Card variant="surface" size="lg" className={className}>
      <CardContent spacing="xl">
        <Inline gap={3} align="start">
          <IconBadge tone="primary" size="sm">
            {icon}
          </IconBadge>
          <Stack gap={1}>
            <SectionHeading size="md">{title}</SectionHeading>
            <BodyText size="sm">{description}</BodyText>
          </Stack>
        </Inline>
        {children}
      </CardContent>
    </Card>
  )
}
