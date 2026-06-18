'use client'

import { BulletList } from '@/components/ui/bullet-list'
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

  if (!result || result.blocked.length === 0) {
    return null
  }

  return (
    <Card variant="warning" size="sm">
      <CardContent spacing="md">
        <Stack gap={2}>
          <BodyText size="sm">{toastMessages.bulkDelete.blockedIntro}</BodyText>
          <SurfaceTile tone="soft" padding="md" rounded="lg" width="full">
            <BulletList>
              {result.blocked.map((item) => (
                <li key={item.id}>
                  <BodyText as="span" size="sm" weight="medium" tone="foreground">
                    {truncateText(item.questionText, 80)}
                  </BodyText>
                  {' — '}
                  <BodyText as="span" size="sm">
                    {item.reason}
                  </BodyText>
                </li>
              ))}
            </BulletList>
          </SurfaceTile>
        </Stack>
      </CardContent>
    </Card>
  )
}
