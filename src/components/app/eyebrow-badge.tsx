import type { HTMLAttributes, ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

type EyebrowTone = 'default' | 'muted' | 'primary'
type EyebrowSize = 'default' | 'sm'

const toneMap: Record<EyebrowTone, 'eyebrowDefault' | 'eyebrowMuted' | 'eyebrowPrimary'> = {
  default: 'eyebrowDefault',
  muted: 'eyebrowMuted',
  primary: 'eyebrowPrimary',
}

const sizeMap: Record<EyebrowSize, 'eyebrow' | 'eyebrowSm'> = {
  default: 'eyebrow',
  sm: 'eyebrowSm',
}

interface EyebrowBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  icon?: ReactNode
  size?: EyebrowSize
  tone?: EyebrowTone
}

export function EyebrowBadge({
  children,
  icon,
  size = 'default',
  tone = 'default',
  ...props
}: EyebrowBadgeProps) {
  return (
    <Badge
      variant={toneMap[tone]}
      size={sizeMap[size]}
      {...props}
    >
      {icon}
      {children}
    </Badge>
  )
}
