import { cva, type VariantProps } from 'class-variance-authority';
import type { ElementType, ReactNode } from 'react';

const headingVariants = cva('', {
  variants: {
    variant: {
      heroTitle: 'text-4xl font-semibold tracking-display-tight text-foreground md:text-5xl',
      sectionHeroTitle:
        'text-3xl font-semibold tracking-display-tight text-foreground md:text-4xl',
      questionTitle: 'text-2xl font-semibold leading-9 tracking-display text-foreground',
      toolbarSessionTitle:
        'm-0 min-w-0 text-sm font-semibold leading-tight tracking-tight text-foreground sm:text-[0.9375rem]',
    },
  },
  defaultVariants: {
    variant: 'sectionHeroTitle',
  },
});

interface HeadingProps extends VariantProps<typeof headingVariants> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}

export function Heading({ children, level, variant }: HeadingProps) {
  const resolvedLevel =
    level ?? (variant === 'questionTitle' || variant === 'toolbarSessionTitle' ? 2 : 1);
  const className = headingVariants({ variant });
  const Tag = `h${resolvedLevel}` as ElementType;
  return <Tag className={className}>{children}</Tag>;
}

