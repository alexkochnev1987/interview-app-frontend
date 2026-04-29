import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const heroTitleVariants = cva(
  'font-semibold tracking-display-tight text-foreground',
  {
    variants: {
      size: {
        sm: 'text-3xl',
        md: 'text-3xl md:text-4xl',
        lg: 'text-4xl md:text-5xl',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  },
)

interface HeroTitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof heroTitleVariants> {
  as?: 'h1' | 'h2'
}

export function HeroTitle({
  className,
  size,
  as: Tag = 'h1',
  ...props
}: HeroTitleProps) {
  return (
    <Tag className={cn(heroTitleVariants({ size }), className)} {...props} />
  )
}

interface HeroLeadProps extends HTMLAttributes<HTMLParagraphElement> {}

export function HeroLead({ className, ...props }: HeroLeadProps) {
  return (
    <p
      className={cn(
        'text-base leading-7 text-muted-foreground md:text-lg',
        className,
      )}
      {...props}
    />
  )
}
