import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { IconBadge } from '@/components/ui/icon-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

export function LoginMarketingPanel() {
  const t = useTranslations('login')

  return (
    <Stack as="section" gap={6}>
      <EyebrowBadge icon={<Sparkles className="size-3.5" />}>
        {t('marketingEyebrow')}
      </EyebrowBadge>

      <Stack gap={4}>
        <HeroTitle size="xl" width="prose">
          {t('title')}
        </HeroTitle>
        <HeroLead width="prose">
          {t('lead')}
        </HeroLead>
      </Stack>

      <Grid columns="metrics-3" gap={4}>
        <Card variant="surface" size="md">
          <CardContent spacing="sm">
            <IconBadge tone="primary" size="sm">
              <ShieldCheck className="size-4" />
            </IconBadge>
            <Stack gap={1}>
              <SectionHeading size="sm" as="h2">
                {t('cards.protectedAccess.title')}
              </SectionHeading>
              <BodyText size="sm">
                {t('cards.protectedAccess.description')}
              </BodyText>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="surface" size="md">
          <CardContent spacing="sm">
            <IconBadge tone="primary" size="sm">
              <LockKeyhole className="size-4" />
            </IconBadge>
            <Stack gap={1}>
              <SectionHeading size="sm" as="h2">
                {t('cards.unifiedShell.title')}
              </SectionHeading>
              <BodyText size="sm">
                {t('cards.unifiedShell.description')}
              </BodyText>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="surface" size="md">
          <CardContent spacing="sm">
            <IconBadge tone="primary" size="sm">
              <ArrowRight className="size-4" />
            </IconBadge>
            <Stack gap={1}>
              <SectionHeading size="sm" as="h2">
                {t('cards.fastTriage.title')}
              </SectionHeading>
              <BodyText size="sm">
                {t('cards.fastTriage.description')}
              </BodyText>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  )
}
