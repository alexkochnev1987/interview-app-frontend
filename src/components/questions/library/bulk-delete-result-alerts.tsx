'use client'

import { useEffect, useRef } from 'react'

import { BulletList } from '@/components/ui/bullet-list'
import { Card, CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import { type BulkDeleteResult } from '@/lib/api'
import { notifyError, notifySuccess } from '@/lib/toast'
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
  const lastErrorRef = useRef<string | null>(null)
  const lastSuccessKeyRef = useRef<string | null>(null)
  const lastPartialKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!error) {
      lastErrorRef.current = null
      return
    }
    if (error === lastErrorRef.current) {
      return
    }
    lastErrorRef.current = error
    notifyError(TOAST_MESSAGES.bulkDelete.failedTitle, {
      id: 'bulk-delete-error',
      description: error,
    })
  }, [error])

  useEffect(() => {
    if (!result || result.blocked.length > 0 || result.deleted.length === 0) {
      lastSuccessKeyRef.current = null
      return
    }
    const key = result.deleted.join(',')
    if (key === lastSuccessKeyRef.current) {
      return
    }
    lastSuccessKeyRef.current = key
    notifySuccess(TOAST_MESSAGES.bulkDelete.successTitle(result.deleted.length), {
      id: 'bulk-delete-success',
      description: TOAST_MESSAGES.bulkDelete.successDescription,
    })
  }, [result])

  useEffect(() => {
    if (!result || result.blocked.length === 0) {
      lastPartialKeyRef.current = null
      return
    }
    const key = `${result.deleted.join(',')}|${result.blocked.map((item) => item.id).join(',')}`
    if (key === lastPartialKeyRef.current) {
      return
    }
    lastPartialKeyRef.current = key
    notifySuccess(
      TOAST_MESSAGES.bulkDelete.partialTitle(
        result.deleted.length,
        result.blocked.length,
      ),
      { id: 'bulk-delete-partial' },
    )
  }, [result])

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
