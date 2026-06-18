'use client'

import { LoaderCircle, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface DeletedQuestionBannerProps {
  restoring: boolean
  onRestore: () => void
}

export function DeletedQuestionBanner({
  restoring,
  onRestore,
}: DeletedQuestionBannerProps) {
  const tBanner = useTranslations('questions.deletedBanner')
  const tEdit = useTranslations('questions.editPage')

  return (
    <PageShell as="section" spacing="compact" padding="top">
      <Card variant="danger-soft" size="sm" role="alert">
        <CardContent layout="split-row" spacing="sm">
          <Stack gap={1}>
            <BodyText size="sm" tone="foreground" weight="medium">
              {tBanner('title')}
            </BodyText>
            <BodyText size="sm" tone="foreground">
              {tBanner('description')}
            </BodyText>
          </Stack>
          <Button
            type="button"
            variant="destructive"
            shape="pill"
            disabled={restoring}
            onClick={onRestore}
          >
            {restoring ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            {restoring ? tEdit('restoring') : tBanner('restore')}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
