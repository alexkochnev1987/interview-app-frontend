import type { ReactNode } from 'react'

import { Inline } from '@/components/ui/layout/inline'
import { BodyText } from '@/components/ui/text'

interface IconLabelProps {
  icon: ReactNode
  children: ReactNode
}

export function IconLabel({ icon, children }: IconLabelProps) {
  return (
    <Inline gap={2} align="center">
      {icon}
      <BodyText as="span" size="sm-tight" tone="foreground">
        {children}
      </BodyText>
    </Inline>
  )
}
