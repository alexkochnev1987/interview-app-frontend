import type { HTMLAttributes, ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

type EyebrowTone = 'default' | 'muted' | 'primary'
type EyebrowSize = 'default' | 'sm'

const toneMap: Record<EyebrowTone, 'capsLabelDefault' | 'capsLabelMuted' | 'capsLabelPrimary'> = {
  default: 'capsLabelDefault',
  muted: 'capsLabelMuted',
  primary: 'capsLabelPrimary',
}

const sizeMap: Record<EyebrowSize, 'capsLabel' | 'capsLabelSm'> = {
  default: 'capsLabel',
  sm: 'capsLabelSm',
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
