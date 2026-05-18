'use client'

import { useMemo } from 'react'

import { BulletList } from '@/components/ui/bullet-list'
import { Card, CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import { useNotifyErrorOnce, useNotifyOnceWhen } from '@/hooks/use-notify-once'
import { type BulkDeleteResult } from '@/lib/api'
import { notifyInfo, notifySuccess } from '@/lib/toast'
import { TOAST_MESSAGES } from '@/lib/toast-messages'
import { truncateText } from '@/lib/text'

interface BulkDeleteResultAlertsProps {
  result: BulkDeleteResult | null
  error: string | null
}

export function BulkDeleteResultAlerts({
  result,
  error,
}: BulkDeleteResultAlertsProps) {
  const successKey = useMemo(() => {
    if (!result || result.blocked.length > 0 || result.deleted.length === 0) {
      return null
    }
    return result.deleted.join(',')
  }, [result])

  const partialKey = useMemo(() => {
    if (!result || result.blocked.length === 0) {
      return null
    }
    return `${result.deleted.join(',')}|${result.blocked.map((item) => item.id).join(',')}`
  }, [result])

  useNotifyErrorOnce({
    value: error,
    toastId: 'bulk-delete-error',
    message: TOAST_MESSAGES.bulkDelete.failedTitle,
    description: error,
  })

  useNotifyOnceWhen({
    value: successKey,
    toastId: 'bulk-delete-success',
    notify: () => {
      if (!result) return
      notifySuccess(TOAST_MESSAGES.bulkDelete.successTitle(result.deleted.length), {
        id: 'bulk-delete-success',
        description: TOAST_MESSAGES.bulkDelete.successDescription,
      })
    },
  })

  useNotifyOnceWhen({
    value: partialKey,
    toastId: 'bulk-delete-partial',
    notify: () => {
      if (!result) return
      notifyInfo(
        TOAST_MESSAGES.bulkDelete.partialTitle(
          result.deleted.length,
          result.blocked.length,
        ),
        { id: 'bulk-delete-partial' },
      )
    },
  })

  if (error) {
    return null
  }

  if (!result) return null

  if (result.blocked.length > 0) {
    return (
      <Card variant="warning" size="sm">
        <CardContent spacing="md">
          <Stack gap={2}>
            <BodyText size="sm">{TOAST_MESSAGES.bulkDelete.blockedIntro}</BodyText>
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

  return null
}
