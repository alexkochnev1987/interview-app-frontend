import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const textVariants = cva('', {
  variants: {
    variant: {
      heroDescription: 'max-w-2xl text-base leading-7 text-muted-foreground md:text-lg',
      bodyMutedSm: 'text-sm leading-6 text-muted-foreground',
      bodySm: 'text-sm leading-6 text-foreground',
      eyebrowLabel: 'text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground',
      metricLabel: 'text-[0.72rem] font-semibold uppercase tracking-[0.2em]',
      metricLabelCompact: 'text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
      metricValueLg: 'text-3xl font-semibold tracking-[-0.04em] text-foreground',
      metricValueXl: 'text-4xl font-semibold tracking-[-0.04em] text-foreground',
      labelSmStrong: 'text-sm font-semibold text-foreground',
      labelSm: 'text-sm font-medium text-foreground',
      captionMutedXs: 'text-xs leading-5 text-muted-foreground',
      captionWarningXs: 'text-xs leading-5 text-[var(--color-status-pending-fg)]',
      transcriptDraft: 'ml-1 italic text-muted-foreground',
      iconPrimary: 'text-[hsl(var(--primary))]',
    },
  },
  defaultVariants: {
    variant: 'bodyMutedSm',
  },
});

type TextTag = 'p' | 'span';

interface TextProps extends VariantProps<typeof textVariants> {
  as?: TextTag;
  children: ReactNode;
  className?: string;
}

export function Text({ as = 'p', children, variant, className }: TextProps) {
  if (as === 'span') {
    return <span className={cn(textVariants({ variant }), className)}>{children}</span>;
  }

  return <p className={cn(textVariants({ variant }), className)}>{children}</p>;
}

