import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function HoverGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('group', className)} {...props} />
}
