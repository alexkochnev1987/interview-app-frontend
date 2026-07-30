import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { Inline } from '@/components/ui/layout/inline'
import { BodyText } from '@/components/ui/text'
import { cn } from '@/lib/utils'

const iconLabelVariants = cva('', {
  variants: {
    tone: {
      default: 'text-foreground',
      primary: 'text-primary',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

interface IconLabelProps {
  icon: ReactNode
  children: ReactNode
  tone?: VariantProps<typeof iconLabelVariants>['tone']
}

export function IconLabel({ icon, children, tone }: IconLabelProps) {
  return (
    <Inline gap={2} align="center" className={cn(iconLabelVariants({ tone }))}>
      {icon}
      <BodyText as="span" size="sm-tight" tone="inherit">
        {children}
      </BodyText>
    </Inline>
  )
}
