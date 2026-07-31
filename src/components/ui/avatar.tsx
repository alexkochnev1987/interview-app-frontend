'use client'

import type { VariantProps } from 'class-variance-authority'
import { useState, type ReactNode } from 'react'

import { getCandidateInitials } from '@/lib/interview-formatters'
import { cn } from '@/lib/utils'

import { iconBadgeVariants, IconBadge } from './icon-badge'

interface AvatarProps {
  name: string
  pictureUrl?: string | null
  size?: VariantProps<typeof iconBadgeVariants>['size']
  textSize?: VariantProps<typeof iconBadgeVariants>['textSize']
  tone?: VariantProps<typeof iconBadgeVariants>['tone']
  className?: string
  action?: ReactNode
}

function resolveAvatarSrc(pictureUrl?: string | null): string | undefined {
  if (!pictureUrl) return undefined
  if (pictureUrl.startsWith('/')) return `/api${pictureUrl}`
  return pictureUrl
}

export function Avatar({
  name,
  pictureUrl,
  size,
  textSize,
  tone = 'surface',
  className,
  action,
}: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const src = pictureUrl && pictureUrl === failedUrl ? undefined : resolveAvatarSrc(pictureUrl)

  const avatarNode = !src ? (
    <IconBadge tone={tone} size={size} shape="circle" textSize={textSize} className={className}>
      {getCandidateInitials(name)}
    </IconBadge>
  ) : (
    <span
      className={cn(
        iconBadgeVariants({ size, shape: 'circle' }),
        'overflow-hidden ring-1 ring-hairline',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- avatar source can be an external Google CDN URL, not a local/optimizable asset */}
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
        onError={() => setFailedUrl(pictureUrl ?? null)}
      />
    </span>
  )

  if (!action) return avatarNode

  return (
    <span className="relative inline-flex">
      {avatarNode}
      <span className="absolute -bottom-1 -right-1">{action}</span>
    </span>
  )
}
