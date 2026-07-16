'use client'

import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { HeroLead, HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { routes } from '@/i18n/routes'
import { type Interview } from '@/lib/api'
import { getCandidateInitials } from '@/lib/interview-formatters'

interface CandidateFeedbackHeaderProps {
  interview: Interview
}

export function CandidateFeedbackHeader({ interview }: CandidateFeedbackHeaderProps) {
  const t = useTranslations('interviews.candidateFeedback')

  return (
    <Card variant="floating" size="lg">
      <CardContent spacing="2xl">
        <Stack gap={5}>
          <UnstyledLink href={routes.interviews.detail(interview.id)}>
            <EyebrowBadge
              tone="default"
              icon={
                <Icon size="sm">
                  <ArrowLeft />
                </Icon>
              }
            >
              {t('backToInterview')}
            </EyebrowBadge>
          </UnstyledLink>

          <Inline gap={4} align="center">
            <IconBadge tone="primary" size="lg" textSize="lg">
              {getCandidateInitials(interview.candidateName)}
            </IconBadge>
            <Stack gap={1.5}>
              <HeroTitle>{interview.candidateName}</HeroTitle>
              <HeroLead>{interview.position}</HeroLead>
            </Stack>
          </Inline>
        </Stack>
      </CardContent>
    </Card>
  )
}
