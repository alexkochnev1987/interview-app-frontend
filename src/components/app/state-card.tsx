import type { ReactNode } from 'react'

import {
  SURFACE_PRIMARY_ELEVATED_BG,
  SURFACE_PRIMARY_SOFT_TEXT,
} from '@/components/app/style-tokens'
import { Heading } from '@/components/ui/heading'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

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
            <div className={cn('rounded-full p-3', SURFACE_PRIMARY_ELEVATED_BG, SURFACE_PRIMARY_SOFT_TEXT)}>
              {icon}
            </div>
          ) : null}
          <div className="space-y-2">
            <Heading variant="questionTitle">{title}</Heading>
            <div className="max-w-md">
              <Text variant="bodyMutedSm">{description}</Text>
            </div>
          </div>
          {action}
        </CardContent>
      </Card>
    </div>
  )
}
