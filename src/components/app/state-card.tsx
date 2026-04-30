import type { ReactNode } from 'react'

import { Heading } from '@/components/ui/heading'
import { Card, CardContent } from '@/components/ui/card'
import { IconBox } from '@/components/ui/icon-box'
import { Container, Stack } from '@/components/ui/layout'
import { Text } from '@/components/ui/text'

interface LoadingStateCardProps {
  className?: string
  label: ReactNode
}

interface EmptyStateCardProps {
  action?: ReactNode
  className?: string
  description: ReactNode
  icon?: ReactNode
  title: ReactNode
}

export function LoadingStateCard({ className, label }: LoadingStateCardProps) {
  return (
    <div className={className}>
      <Card tone="surfaceGlassSoft">
        <CardContent layout="stateLoading">{label}</CardContent>
      </Card>
    </div>
  )
}

export function EmptyStateCard({
  action,
  className,
  description,
  icon,
  title,
}: EmptyStateCardProps) {
  return (
    <div className={className}>
      <Card tone="surfaceGlassSoft">
        <CardContent layout="stateEmpty">
          {icon ? (
            <IconBox tone="primarySoft" size="sm" shape="pill">
              {icon}
            </IconBox>
          ) : null}
          <Stack gap={2}>
            <Heading variant="questionTitle">{title}</Heading>
            <Container width="4xl">
              <Text variant="bodyMutedSm">{description}</Text>
            </Container>
          </Stack>
          {action}
        </CardContent>
      </Card>
    </div>
  )
}
