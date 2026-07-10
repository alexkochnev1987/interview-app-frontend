'use client'

import { CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { OnboardingCompleteJourney } from '@/components/ui/onboarding/onboarding-complete-journey'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { useTranslations } from 'next-intl'

type OnboardingCompleteDialogProps = {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

export function OnboardingCompleteDialog({
  title,
  description,
  actionLabel,
  onAction,
}: OnboardingCompleteDialogProps) {
  const t = useTranslations('onboarding.complete')

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
                <CheckCircle2 />
              </Icon>
            </IconBadge>

            <EyebrowBadge tone="primary" size="sm" casing="normal">
              {t('eyebrow')}
            </EyebrowBadge>

            <SectionHeading size="lg" className="text-center">
              {title}
            </SectionHeading>
          </Stack>

          <OnboardingCompleteJourney />

          <BodyText tone="muted" size="sm" className="max-w-md text-center">
            {description}
          </BodyText>

          <Inline justify="center" align="center" width="full">
            <Button type="button" variant="gradient" size="lg" onClick={onAction}>
              {actionLabel}
            </Button>
          </Inline>
        </Stack>
      </CardContent>
    </ModalShell>
  )
}
