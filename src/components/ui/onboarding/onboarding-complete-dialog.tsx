'use client'

import { CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { BodyText, SectionHeading } from '@/components/ui/text'

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
            <IconBadge tone="primary" size="md">
              <Icon size="lg">
                <CheckCircle2 />
              </Icon>
            </IconBadge>
            <Stack gap={2}>
              <SectionHeading size="md">{title}</SectionHeading>
              <BodyText tone="muted">{description}</BodyText>
            </Stack>
          </Stack>

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
