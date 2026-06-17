'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import { QuestionDeleteBlockingInterviews } from '@/components/questions/detail/question-delete-blocking-interviews'
import { type QuestionDeleteBlockingInterview } from '@/lib/api'

interface QuestionDeleteScheduledAlertProps {
  intro: string
  blockingInterviews: QuestionDeleteBlockingInterview[]
}

export function QuestionDeleteScheduledAlert({
  intro,
  blockingInterviews,
}: QuestionDeleteScheduledAlertProps) {
  return (
    <Card variant="warning" size="sm">
      <CardContent spacing="md">
        <Stack gap={2}>
          <BodyText size="sm">{intro}</BodyText>
          <SurfaceTile tone="soft" padding="md" rounded="lg" width="full">
            <QuestionDeleteBlockingInterviews interviews={blockingInterviews} />
          </SurfaceTile>
        </Stack>
      </CardContent>
    </Card>
  )
}
