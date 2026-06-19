'use client'

import { CirclePlus, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Link } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'

export function InterviewCreateIntro() {
  const t = useTranslations('interviews.createIntro')

  return (
    <Card variant="floating" size="lg" data-tour="interview-create">
      <CardContent spacing="xl">
        <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
          {t('eyebrow')}
        </EyebrowBadge>
        <Stack gap={3}>
          <HeroTitle>{t('title')}</HeroTitle>
          <HeroLead width="prose">{t('lead')}</HeroLead>
        </Stack>
        <Inline gap={3} wrap="wrap">
          <Button asChild variant="gradient">
            <Link href={routes.questions.new}>
              <CirclePlus className="size-4" />
              {t('createQuestion')}
            </Link>
          </Button>
          <Button asChild variant="outline-pill" shape="pill">
            <Link href={routes.questions.list}>{t('openBank')}</Link>
          </Button>
        </Inline>
      </CardContent>
    </Card>
  )
}
