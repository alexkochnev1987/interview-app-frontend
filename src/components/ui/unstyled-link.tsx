import type { ComponentProps, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const unstyledLinkVariants = cva('no-underline', {
  variants: {
    display: {
      default: '',
      // Renders the anchor as display:contents so its children remain direct
      // layout children of the parent. Use for a clickable card whose action
      // button must stay a sibling rather than nest inside the anchor.
      contents: 'contents',
    },
  },
  defaultVariants: {
    display: 'default',
  },
})

interface UnstyledLinkProps
  extends ComponentProps<typeof Link>,
    VariantProps<typeof unstyledLinkVariants> {
  children?: ReactNode
}

export function UnstyledLink({
  className,
  children,
  display,
  ...props
}: UnstyledLinkProps) {
  return (
    <Link
      className={cn(unstyledLinkVariants({ display }), className)}
      {...props}
    >
      {children}
    </Link>
  )
}
