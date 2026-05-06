import { LoaderCircle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

interface ScoringPendingCardProps {
  title?: string
  description?: string
}

export function ScoringPendingCard({
  title = 'Scoring still catching up',
  description = "The AI evaluation is still running. We'll show the overall score and decision as soon as it finishes — refresh this page in a moment.",
}: ScoringPendingCardProps) {
  return (
    <Card variant="tinted" size="lg">
      <CardContent layout="stack-center" spacing="md">
        <Inline gap={3} align="center" justify="center">
          <Icon size="lg">
            <LoaderCircle />
          </Icon>
          <Stack gap={1} align="start">
            <SectionHeading size="md">{title}</SectionHeading>
            <BodyText size="sm" tone="muted" width="prose">
              {description}
            </BodyText>
          </Stack>
        </Inline>
      </CardContent>
    </Card>
  )
}
