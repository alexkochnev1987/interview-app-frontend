import type { ReactNode } from 'react'

import { IconBadge } from '@/components/app/icon-badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EditorSectionCardProps {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function EditorSectionCard({
  title,
  description,
  icon,
  children,
  className,
  contentClassName,
}: EditorSectionCardProps) {
  return (
    <Card variant="surface" className={className}>
      <CardContent className={cn('space-y-6 px-8 py-8', contentClassName)}>
        <div className="flex items-start gap-3">
          <IconBadge tone="primary" size="sm">
            {icon}
          </IconBadge>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
              {title}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
