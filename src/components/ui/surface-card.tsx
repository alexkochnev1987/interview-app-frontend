import type { ComponentProps } from 'react'

import { Card } from '@/components/ui/card'
import { Container } from '@/components/ui/layout/container'
import { HoverLift } from '@/components/ui/hover-lift'

type SurfaceCardTone = 'glassSoft' | 'glassSoftFlat' | 'glassFloat' | 'mutedSoft'

const toneMap: Record<
  SurfaceCardTone,
  NonNullable<ComponentProps<typeof Card>['variant']>
> = {
  glassSoft: 'surface',
  glassSoftFlat: 'surfaceFlat',
  glassFloat: 'floating',
  mutedSoft: 'tinted',
}

interface SurfaceCardProps
  extends Omit<ComponentProps<typeof Card>, 'className' | 'variant'> {
  tone?: SurfaceCardTone
}

export function SurfaceCard({ tone = 'glassSoft', ...props }: SurfaceCardProps) {
  return <Card variant={toneMap[tone]} {...props} />
}

interface SurfaceCardMax5xlProps extends Omit<SurfaceCardProps, 'className'> {}

export function SurfaceCardMax5xl({ tone, ...props }: SurfaceCardMax5xlProps) {
  return (
    <Container width="reading" align="center">
      <SurfaceCard tone={tone} {...props} />
    </Container>
  )
}

interface SurfaceCardLiftProps extends Omit<SurfaceCardProps, 'className'> {}

export function SurfaceCardLift({ tone, ...props }: SurfaceCardLiftProps) {
  return (
    <HoverLift>
      <SurfaceCard tone={tone} {...props} />
    </HoverLift>
  )
}
