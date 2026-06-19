'use client'

import { ClipboardList, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Link } from '@/i18n/navigation'
import { useIsDemo } from '@/lib/auth-context'

export function AssessmentsListHeader() {
  const t = useTranslations('assessments.list')
  const tNav = useTranslations('nav')
  const isDemo = useIsDemo()

  return (
    <Card variant="floating" size="lg" data-tour="assessments-list">
      <CardContent layout="fill-column" spacing="xl">
        <EyebrowBadge icon={<Icon size="sm"><ClipboardList /></Icon>}>
          {t('eyebrow')}
        </EyebrowBadge>
        <Stack gap={3}>
          <HeroTitle>{t('title')}</HeroTitle>
          <HeroLead width="prose">{t('lead')}</HeroLead>
        </Stack>
        {!isDemo ? (
          <Inline>
            <Button asChild variant="gradient" size="hero">
              <Link href="/interviews/new">
                <Icon size="lg"><Plus /></Icon>
                {tNav('newInterview')}
              </Link>
            </Button>
          </Inline>
        ) : null}
      </CardContent>
    </Card>
  )
}
