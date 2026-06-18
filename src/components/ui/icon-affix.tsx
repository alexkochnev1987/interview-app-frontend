import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const wrapperVariants = cva('relative', {
  variants: {
    width: {
      auto: '',
      full: 'w-full',
    },
  },
  defaultVariants: {
    width: 'auto',
  },
})

const affixVariants = cva(
  'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
  {
    variants: {
      side: {
        left: 'left-4',
        right: 'right-4',
      },
    },
    defaultVariants: {
      side: 'left',
    },
  },
)

interface IconAffixProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof wrapperVariants> {
  icon: ReactNode
  iconSide?: 'left' | 'right'
  children: ReactNode
}

export function IconAffix({
  icon,
  iconSide = 'left',
  width,
  className,
  children,
  ...props
}: IconAffixProps) {
  return (
    <div className={cn(wrapperVariants({ width }), className)} {...props}>
      <span className={affixVariants({ side: iconSide })}>{icon}</span>
      {children}
    </div>
  )
}
