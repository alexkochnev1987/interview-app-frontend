'use client'

import { CheckCircle2, FileText, ListChecks, Send, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ComponentType } from 'react'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText, SectionHeading, Text } from '@/components/ui/text'

type OnboardingCompleteDialogProps = {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

const recapItems: ReadonlyArray<{
  key: string
  icon: ComponentType<{ className?: string }>
}> = [
  { key: 'recapQuestions', icon: FileText },
  { key: 'recapInterviews', icon: ListChecks },
  { key: 'recapCandidates', icon: Send },
  { key: 'recapAssessments', icon: Sparkles },
]

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
        <Stack gap={6}>
          <Stack gap={4}>
            <IconBadge tone="gradient" size="lg">
              <Icon size="xl">
                <CheckCircle2 />
              </Icon>
            </IconBadge>
            <Stack gap={2}>
              <SectionHeading size="md">{title}</SectionHeading>
              <BodyText tone="muted">{description}</BodyText>
            </Stack>
          </Stack>

          <SurfaceTile tone="soft" padding="lg" rounded="2xl">
            <Stack gap={4}>
              <Text as="span" variant="eyebrowLabel">
                {t('recapTitle')}
              </Text>
              <Stack gap={3}>
                {recapItems.map(({ key, icon: RecapIcon }) => (
                  <Inline key={key} gap={3} align="center">
                    <IconBadge tone="surface" size="sm" shape="circle">
                      <Icon size="md">
                        <RecapIcon />
                      </Icon>
                    </IconBadge>
                    <BodyText tone="foreground" size="sm" weight="medium">
                      {t(key)}
                    </BodyText>
                  </Inline>
                ))}
              </Stack>
            </Stack>
          </SurfaceTile>

          <Inline justify="end">
            <Button type="button" variant="gradient" onClick={onAction}>
              {actionLabel}
            </Button>
          </Inline>
        </Stack>
      </CardContent>
    </ModalShell>
  )
}
