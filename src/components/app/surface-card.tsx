import type { ComponentProps } from 'react';

import { Card } from '@/components/ui/card';

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
    <div className="mx-auto max-w-5xl">
      <SurfaceCard tone={tone} {...props} />
    </div>
  );
}

interface SurfaceCardLiftProps extends Omit<SurfaceCardProps, 'className'> {}

export function SurfaceCardLift({ tone, ...props }: SurfaceCardLiftProps) {
  return (
    <div className="transition-transform duration-200 hover:-translate-y-0.5">
      <SurfaceCard tone={tone} {...props} />
    </div>
  );
}
