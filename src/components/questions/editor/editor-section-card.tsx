import type { ReactNode } from 'react'

import { IconBadge } from '@/components/ui/icon-badge'
import { Card, CardContent } from '@/components/ui/card'

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
        <div className="flex items-start gap-3">
          <IconBadge tone="primary" size="sm">
            {icon}
          </IconBadge>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-display text-foreground">
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
