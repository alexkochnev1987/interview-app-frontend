import type { ReactNode } from 'react'

import { IconBadge } from '@/components/app/icon-badge'
import { Card, CardContent } from '@/components/ui/card'
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
    <Card variant="surface" className={className}>
      <CardContent className="py-16 text-center text-sm text-muted-foreground">{label}</CardContent>
    </Card>
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
    <Card variant="surface" className={cn(className)}>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        {icon ? (
          <IconBadge tone="primary" className="rounded-full">
            {icon}
          </IconBadge>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}
