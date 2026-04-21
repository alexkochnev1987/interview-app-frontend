import type { ReactNode } from 'react'

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
    <Card className={cn('border-white/65 bg-white/86 shadow-soft', className)}>
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
    <Card className={cn('border-white/65 bg-white/86 shadow-soft', className)}>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        {icon ? (
          <div className="rounded-full bg-[hsl(var(--primary-fixed)/0.85)] p-3 text-[hsl(var(--primary))]">
            {icon}
          </div>
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
