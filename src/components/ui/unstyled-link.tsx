import Link, { type LinkProps } from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface UnstyledLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
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
