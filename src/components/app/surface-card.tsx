import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const surfaceCardVariants = cva('', {
  variants: {
    tone: {
      glassSoft: 'border-white/65 bg-white/88 shadow-soft',
      glassFloat: 'border-white/65 bg-white/88 shadow-float',
      mutedSoft: 'border-white/60 bg-[hsl(var(--surface-low)/0.9)] shadow-soft',
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
