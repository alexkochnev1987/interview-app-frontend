import { Camera, ListChecks, RotateCcw, Wifi } from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface CandidatePrepTipsCardProps {
  title: string
  questionCountLabel: string
  retryLabel: string
  cameraTip: string
  connectionTip: string
}

function TipRow({
  icon,
  children,
}: {
  icon: ReactElement<{ className?: string }>
  children: ReactNode
}) {
  return (
    <Inline gap={3} align="center">
      <Icon size="sm" tone="inherit">
        {icon}
      </Icon>
      <BodyText size="sm" tone="foreground">
        {children}
      </BodyText>
    </Inline>
  )
}

/**
 * "Before you start" — real, per-interview facts (question count, retry
 * policy) plus static-but-accurate prep guidance. Only relevant before the
 * candidate has finished, so the caller only renders this for
 * not-started/in-progress interviews.
 */
export function CandidatePrepTipsCard({
  title,
  questionCountLabel,
  retryLabel,
  cameraTip,
  connectionTip,
}: CandidatePrepTipsCardProps) {
  return (
    <Card variant="tinted">
      <CardHeader spacing="xs">
        <CardTitle size="md">{title}</CardTitle>
      </CardHeader>
      <CardContent spacing="md">
        <Stack gap={3}>
          <TipRow icon={<ListChecks />}>{questionCountLabel}</TipRow>
          <TipRow icon={<RotateCcw />}>{retryLabel}</TipRow>
          <TipRow icon={<Camera />}>{cameraTip}</TipRow>
          <TipRow icon={<Wifi />}>{connectionTip}</TipRow>
        </Stack>
      </CardContent>
    </Card>
  )
}
