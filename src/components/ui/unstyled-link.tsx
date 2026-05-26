import type { ComponentProps, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface UnstyledLinkProps extends ComponentProps<typeof Link> {
  children?: ReactNode
}

export function UnstyledLink({
  className,
  children,
  ...props
}: UnstyledLinkProps) {
  return (
    <Link className={cn('no-underline', className)} {...props}>
      {children}
    </Link>
  )
}
