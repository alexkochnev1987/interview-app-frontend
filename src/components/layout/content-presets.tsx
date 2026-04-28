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

interface ActionRowProps {
  children: ReactNode;
}

interface SectionCardTitleProps {
  children: ReactNode;
}

interface CardHeaderFormProps {
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

export function ActionRow({ children }: ActionRowProps) {
  return <div className="flex flex-wrap gap-3">{children}</div>;
}

export function SectionCardTitle({ children }: SectionCardTitleProps) {
  return <CardTitle className="text-2xl tracking-[-0.03em]">{children}</CardTitle>;
}

export function CardHeaderForm({ children }: CardHeaderFormProps) {
  return <CardHeader className="space-y-3 px-8 pt-8">{children}</CardHeader>;
}
