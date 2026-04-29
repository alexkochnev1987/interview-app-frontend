import type { ReactNode } from 'react';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CardContentSpaciousProps {
  children: ReactNode;
}

interface CardContentHeroProps {
  children: ReactNode;
}

interface CardContentFormProps {
  children: ReactNode;
}

interface CardContentCompactProps {
  children: ReactNode;
}

interface ActionRowProps {
  children: ReactNode;
}

interface SectionCardTitleProps {
  children: ReactNode;
}

interface CardHeaderFormProps {
  children: ReactNode;
}

interface HeroTitleProps {
  children: ReactNode;
}

interface HeroDescriptionProps {
  children: ReactNode;
}

interface BodyMutedSmProps {
  children: ReactNode;
}

interface EyebrowLabelProps {
  children: ReactNode;
}

interface LabelSmStrongProps {
  children: ReactNode;
}

interface CaptionMutedXsProps {
  children: ReactNode;
}

interface SectionHeroTitleProps {
  children: ReactNode;
}

interface CaptionWarningXsProps {
  children: ReactNode;
}

export function CardContentSpacious({ children }: CardContentSpaciousProps) {
  return <CardContent className="space-y-6 px-8 py-8">{children}</CardContent>;
}

export function CardContentHero({ children }: CardContentHeroProps) {
  return <CardContent className="flex h-full flex-col gap-6 px-8 py-8">{children}</CardContent>;
}

export function CardContentForm({ children }: CardContentFormProps) {
  return <CardContent className="px-8 pb-8">{children}</CardContent>;
}

export function CardContentCompact({ children }: CardContentCompactProps) {
  return <CardContent className="space-y-3 px-5 py-5">{children}</CardContent>;
}

export function ActionRow({ children }: ActionRowProps) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

export function SectionCardTitle({ children }: SectionCardTitleProps) {
  return <CardTitle className="text-2xl tracking-[-0.03em]">{children}</CardTitle>;
}

export function CardHeaderForm({ children }: CardHeaderFormProps) {
  return <CardHeader className="space-y-3 px-8 pt-8">{children}</CardHeader>;
}

export function HeroTitle({ children }: HeroTitleProps) {
  return <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">{children}</h1>;
}

export function HeroDescription({ children }: HeroDescriptionProps) {
  return <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{children}</p>;
}

export function BodyMutedSm({ children }: BodyMutedSmProps) {
  return <p className="text-sm leading-6 text-muted-foreground">{children}</p>;
}

export function EyebrowLabel({ children }: EyebrowLabelProps) {
  return <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{children}</div>;
}

export function LabelSmStrong({ children }: LabelSmStrongProps) {
  return <div className="text-sm font-semibold text-foreground">{children}</div>;
}

export function CaptionMutedXs({ children }: CaptionMutedXsProps) {
  return <p className="text-xs leading-5 text-muted-foreground">{children}</p>;
}

export function SectionHeroTitle({ children }: SectionHeroTitleProps) {
  return <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">{children}</h1>;
}

export function CaptionWarningXs({ children }: CaptionWarningXsProps) {
  return <p className="text-xs leading-5 text-[var(--color-status-pending-fg)]">{children}</p>;
}
