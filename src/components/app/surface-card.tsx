import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import {
  SURFACE_LOW_STRONG_BG,
  SURFACE_SHADOW_FLOAT,
  SURFACE_SHADOW_SOFT,
  SURFACE_WHITE_MUTED_BORDER,
  SURFACE_WHITE_SOFT_BG,
  SURFACE_WHITE_SOFT_BORDER,
} from '@/components/app/style-tokens';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SURFACE_GLASS_SOFT = `${SURFACE_WHITE_SOFT_BORDER} ${SURFACE_WHITE_SOFT_BG} ${SURFACE_SHADOW_SOFT}`;
const SURFACE_GLASS_FLOAT = `${SURFACE_WHITE_SOFT_BORDER} ${SURFACE_WHITE_SOFT_BG} ${SURFACE_SHADOW_FLOAT}`;
const SURFACE_MUTED_SOFT = `${SURFACE_WHITE_MUTED_BORDER} ${SURFACE_LOW_STRONG_BG} ${SURFACE_SHADOW_SOFT}`;

const surfaceCardVariants = cva('', {
  variants: {
    tone: {
      glassSoft: SURFACE_GLASS_SOFT,
      glassFloat: SURFACE_GLASS_FLOAT,
      mutedSoft: SURFACE_MUTED_SOFT,
    },
  },
  defaultVariants: {
    tone: 'glassSoft',
  },
});

interface SurfaceCardProps
  extends ComponentProps<typeof Card>,
    VariantProps<typeof surfaceCardVariants> {}

export function SurfaceCard({ tone, className, ...props }: SurfaceCardProps) {
  return <Card className={cn(surfaceCardVariants({ tone }), className)} {...props} />;
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
