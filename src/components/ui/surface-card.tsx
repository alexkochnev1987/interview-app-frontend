import type { ComponentProps } from 'react'

import { Card } from '@/components/ui/card'

type SurfaceCardTone =
  | 'glassSoft'
  | 'glassSoftFlat'
  | 'glassFloat'
  | 'mutedSoft'
  | 'recordingHero'

const toneMap: Record<
  SurfaceCardTone,
  NonNullable<ComponentProps<typeof Card>['variant']>
> = {
  glassSoft: 'surface',
  glassSoftFlat: 'surfaceFlat',
  glassFloat: 'floating',
  mutedSoft: 'tinted',
  recordingHero: 'recordingHero',
}

interface SurfaceCardProps
  extends Omit<ComponentProps<typeof Card>, 'className' | 'variant'> {
  tone?: SurfaceCardTone
}

export function SurfaceCard({ tone = 'glassSoft', ...props }: SurfaceCardProps) {
  return <Card variant={toneMap[tone]} {...props} />
}
