import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

const takePanelVariants = cva('ring-1 ring-border/45', {
  variants: {
    tone: {
      surface: 'bg-[hsl(var(--surface-low)/0.85)]',
      surfaceStrong: 'bg-[hsl(var(--surface-low)/0.9)]',
      white: 'bg-white/85',
    },
    radius: {
      md: 'rounded-[1.25rem]',
      lg: 'rounded-[1.5rem]',
    },
    padding: {
      md: 'p-4',
      lg: 'p-5',
    },
  },
  defaultVariants: {
    tone: 'surface',
    radius: 'md',
    padding: 'md',
  },
});

type TakePanelProps = ComponentProps<'div'> & VariantProps<typeof takePanelVariants>;

export function TakePanel({ tone, radius, padding, className, ...props }: TakePanelProps) {
  return <div className={cn(takePanelVariants({ tone, radius, padding }), className)} {...props} />;
}
