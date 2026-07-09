'use client'

import { Sparkles, Timer } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { OnboardingWelcomeJourney } from '@/components/ui/onboarding/onboarding-welcome-journey'
import { BodyText, SectionHeading } from '@/components/ui/text'

type OnboardingWelcomeDialogProps = {
  title: string
  description: string
  startLabel: string
  skipLabel: string
  onStart: () => void
  onSkip: () => void
}

export function OnboardingWelcomeDialog({
  title,
  description,
  startLabel,
  skipLabel,
  onStart,
  onSkip,
}: OnboardingWelcomeDialogProps) {
  const t = useTranslations('onboarding.welcome')

  return (
    <ModalShell
      size="md"
      layer="tour"
      accessibilityTitle={title}
      accessibilityDescription={description}
    >
      <CardContent spacing="2xl">
        <Stack gap={8} align="center" width="full">
          <Stack gap={4} align="center" width="full">
            <IconBadge tone="gradient" size="xl" align="center">
              <Icon size="xl">
                <Sparkles />
              </Icon>
            </IconBadge>

            <Inline gap={2} wrap="wrap" justify="center" align="center">
              <EyebrowBadge tone="primary" size="sm" casing="normal">
                {t('eyebrow')}
              </EyebrowBadge>
              <EyebrowBadge tone="muted" size="sm" casing="normal">
                <Icon size="xs">
                  <Timer />
                </Icon>
                {t('duration')}
              </EyebrowBadge>
            </Inline>

            <SectionHeading size="lg" className="text-center">
              {title}
            </SectionHeading>
          </Stack>

          <OnboardingWelcomeJourney />

          <BodyText tone="muted" size="sm" className="max-w-md text-center">
            {description}
          </BodyText>

          <Inline
            gap={3}
            wrap="wrap"
            justify="center"
            align="center"
            width="full"
          >
            <Button type="button" variant="outline" size="lg" onClick={onSkip}>
              {skipLabel}
            </Button>
            <Button type="button" variant="gradient" size="xl" onClick={onStart}>
              <Icon size="md">
                <Sparkles />
              </Icon>
              {startLabel}
            </Button>
          </Inline>
        </Stack>
      </CardContent>
    </ModalShell>
  )
}
