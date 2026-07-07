import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function AppBody({
  className,
  ...props
}: HTMLAttributes<HTMLBodyElement>) {
  return (
    <body
      className={cn(
        'min-h-screen bg-background text-foreground antialiased',
        className,
      )}
      {...props}
    />
  )
}

export function AppShellRoot({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative flex min-h-screen overflow-x-clip', className)}
      {...props}
    />
  )
}

export function AppMain({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex min-h-screen min-w-0 flex-1 flex-col', className)}
      {...props}
    />
  )
}
