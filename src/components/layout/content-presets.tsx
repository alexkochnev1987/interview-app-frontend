import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PresetProps = { children: ReactNode };

const textVariants = cva('', {
  variants: {
    variant: {
      heroTitle: 'text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl',
      heroDescription: 'max-w-2xl text-base leading-7 text-muted-foreground md:text-lg',
      bodyMutedSm: 'text-sm leading-6 text-muted-foreground',
      eyebrowLabel: 'text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground',
      labelSmStrong: 'text-sm font-semibold text-foreground',
      captionMutedXs: 'text-xs leading-5 text-muted-foreground',
      sectionHeroTitle: 'text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl',
      captionWarningXs: 'text-xs leading-5 text-[var(--color-status-pending-fg)]',
    },
  },
  defaultVariants: {
    variant: 'bodyMutedSm',
  },
});

type TextProps<T extends ElementType = 'p'> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as'> &
  VariantProps<typeof textVariants>;

export function Text<T extends ElementType = 'p'>({
  as,
  variant,
  className,
  ...props
}: TextProps<T>) {
  const Comp = (as ?? 'p') as ElementType;
  return <Comp className={cn(textVariants({ variant }), className)} {...props} />;
}

export function CardContentSpacious({ children }: PresetProps) {
  return <CardContent className="space-y-6 px-8 py-8">{children}</CardContent>;
}

export function CardContentHero({ children }: PresetProps) {
  return <CardContent className="flex h-full flex-col gap-6 px-8 py-8">{children}</CardContent>;
}

export function CardContentForm({ children }: PresetProps) {
  return <CardContent className="px-8 pb-8">{children}</CardContent>;
}

export function CardContentCompact({ children }: PresetProps) {
  return <CardContent className="space-y-3 px-5 py-5">{children}</CardContent>;
}

export function ActionRow({ children }: PresetProps) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

export function SectionCardTitle({ children }: PresetProps) {
  return <CardTitle className="text-2xl tracking-[-0.03em]">{children}</CardTitle>;
}

export function CardHeaderForm({ children }: PresetProps) {
  return <CardHeader className="space-y-3 px-8 pt-8">{children}</CardHeader>;
}

export function HeroTitle({ children }: PresetProps) {
  return (
    <Text as="h1" variant="heroTitle">
      {children}
    </Text>
  );
}

export function HeroDescription({ children }: PresetProps) {
  return <Text variant="heroDescription">{children}</Text>;
}

export function BodyMutedSm({ children }: PresetProps) {
  return <Text variant="bodyMutedSm">{children}</Text>;
}

export function EyebrowLabel({ children }: PresetProps) {
  return (
    <Text as="div" variant="eyebrowLabel">
      {children}
    </Text>
  );
}

export function LabelSmStrong({ children }: PresetProps) {
  return (
    <Text as="div" variant="labelSmStrong">
      {children}
    </Text>
  );
}

export function CaptionMutedXs({ children }: PresetProps) {
  return <Text variant="captionMutedXs">{children}</Text>;
}

export function SectionHeroTitle({ children }: PresetProps) {
  return (
    <Text as="h1" variant="sectionHeroTitle">
      {children}
    </Text>
  );
}

export function CaptionWarningXs({ children }: PresetProps) {
  return <Text variant="captionWarningXs">{children}</Text>;
}
