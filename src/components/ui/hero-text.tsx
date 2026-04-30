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
        xl: 'text-4xl tracking-display-tightest md:text-6xl',
      },
      width: {
        full: '',
        prose: 'max-w-3xl',
        narrow: 'max-w-2xl',
      },
    },
    defaultVariants: {
      size: 'lg',
      width: 'full',
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
  width,
  as: Tag = 'h1',
  ...props
}: HeroTitleProps) {
  return (
    <Tag className={cn(heroTitleVariants({ size, width }), className)} {...props} />
  )
}

const heroLeadVariants = cva(
  'text-base leading-7 text-muted-foreground md:text-lg',
  {
    variants: {
      width: {
        full: '',
        prose: 'max-w-2xl',
        narrow: 'max-w-xl',
      },
    },
    defaultVariants: {
      width: 'full',
    },
  },
)

interface HeroLeadProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof heroLeadVariants> {}

export function HeroLead({ className, width, ...props }: HeroLeadProps) {
  return (
    <p className={cn(heroLeadVariants({ width }), className)} {...props} />
  )
}
