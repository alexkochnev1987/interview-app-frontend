import type { ComponentProps } from 'react';

import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/layout';
import { HoverLift } from '@/components/ui/hover-lift';

type SurfaceCardTone = 'glassSoft' | 'glassFloat' | 'mutedSoft';

const toneMap: Record<SurfaceCardTone, NonNullable<ComponentProps<typeof Card>['tone']>> = {
  glassSoft: 'surfaceGlassSoft',
  glassFloat: 'surfaceGlassFloat',
  mutedSoft: 'surfaceMutedSoft',
};

interface SurfaceCardProps
  extends Omit<ComponentProps<typeof Card>, 'className' | 'tone'> {
  tone?: SurfaceCardTone;
}

export function SurfaceCard({ tone = 'glassSoft', ...props }: SurfaceCardProps) {
  return <Card tone={toneMap[tone]} {...props} />;
}

interface SurfaceCardMax5xlProps extends Omit<SurfaceCardProps, 'className'> {}

export function SurfaceCardMax5xl({ tone, ...props }: SurfaceCardMax5xlProps) {
  return (
    <Container width="5xl" centered>
      <SurfaceCard tone={tone} {...props} />
    </Container>
  );
}

interface SurfaceCardLiftProps extends Omit<SurfaceCardProps, 'className'> {}

export function SurfaceCardLift({ tone, ...props }: SurfaceCardLiftProps) {
  return (
    <HoverLift>
      <SurfaceCard tone={tone} {...props} />
    </HoverLift>
  );
}
