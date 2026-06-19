'use client'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
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
            <IconBadge tone="gradient" size="md">
              <Icon size="lg">
                <Sparkles />
              </Icon>
            </IconBadge>
            <Stack gap={2}>
              <SectionHeading size="md">{title}</SectionHeading>
              <BodyText tone="muted">{description}</BodyText>
            </Stack>
          </Stack>

          <Inline gap={3} wrap="wrap" justify="end">
            <Button type="button" variant="ghost" onClick={onSkip}>
              {skipLabel}
            </Button>
            <Button type="button" variant="gradient" onClick={onStart}>
              {startLabel}
            </Button>
          </Inline>
        </Stack>
      </CardContent>
    </ModalShell>
  )
}
