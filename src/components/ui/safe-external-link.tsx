import type { ComponentProps, ReactNode } from 'react'

import { parseSafeHttpUrl } from '@/lib/safe-external-url'

type SafeExternalLinkProps = Omit<ComponentProps<'a'>, 'href' | 'children' | 'rel' | 'target'> & {
  href: string
  children: ReactNode
}

export function SafeExternalLink({ href, children, ...props }: SafeExternalLinkProps) {
  const url = parseSafeHttpUrl(href)
  if (!url) return null

  return (
    <a href={url.href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}
