import type { ReactNode } from 'react'

import { IconBadge } from '@/components/ui/icon-badge'
import { Card, CardContent } from '@/components/ui/card'

type StateCardTone = 'default' | 'ghost'

interface LoadingStateCardProps {
  className?: string
  label: ReactNode
  tone?: StateCardTone
}

interface EmptyStateCardProps {
  action?: ReactNode
  className?: string
  description: ReactNode
  icon?: ReactNode
  title: ReactNode
  tone?: StateCardTone
}

export function LoadingStateCard({ className, label, tone = 'default' }: LoadingStateCardProps) {
  return (
    <Card variant={tone === 'ghost' ? 'ghost' : 'surface'} size="state" className={className}>
      <CardContent layout="stack-center">
        <span className="text-sm text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  )
}

export function EmptyStateCard({
  action,
  className,
  description,
  icon,
  title,
  tone = 'default',
}: EmptyStateCardProps) {
  return (
    <Card variant={tone === 'ghost' ? 'ghost' : 'surface'} size="state" className={className}>
      <CardContent layout="stack-center" spacing="md">
        {icon ? (
          <IconBadge tone="primary" shape="circle">
            {icon}
          </IconBadge>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-display text-foreground">{title}</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}
