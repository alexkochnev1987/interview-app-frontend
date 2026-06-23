'use client'

import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

export function TeamMembersHeading() {
  const t = useTranslations('team')

  return (
    <Stack gap={2} width="full" data-tour="team-heading">
      <SectionHeading size="xl">{t('heading')}</SectionHeading>
      <BodyText as="p" size="responsive-sm" width="prose">
        {t('lead')}
      </BodyText>
    </Stack>
  )
}
