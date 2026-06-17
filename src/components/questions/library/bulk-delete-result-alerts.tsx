'use client'

import { QuestionDeleteBlockingInterviews } from '@/components/questions/detail/question-delete-blocking-interviews'
import { Card, CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import { type BulkDeleteResult } from '@/lib/api'
import { truncateText } from '@/lib/text'
import { useToastMessages } from '@/lib/use-toast-messages'

interface BulkDeleteResultAlertsProps {
  result: BulkDeleteResult | null
}

export function BulkDeleteResultAlerts({ result }: BulkDeleteResultAlertsProps) {
  const toastMessages = useToastMessages()

  if (!result || result.scheduled.length === 0) {
    return null
  }

  return (
    <Card variant="warning" size="sm">
      <CardContent spacing="md">
        <Stack gap={2}>
          <BodyText size="sm">{toastMessages.bulkDelete.scheduledIntro}</BodyText>
          <SurfaceTile tone="soft" padding="md" rounded="lg" width="full">
            <Stack gap={3}>
              {result.scheduled.map((item) => (
                <Stack key={item.id} gap={1}>
                  <BodyText size="sm" weight="medium" tone="foreground">
                    {truncateText(item.questionText, 80)}
                    {' — '}
                    {item.reason}
                  </BodyText>
                  <QuestionDeleteBlockingInterviews
                    interviews={item.blockingInterviews}
                  />
                </Stack>
              ))}
            </Stack>
          </SurfaceTile>
        </Stack>
      </CardContent>
    </Card>
  )
}
