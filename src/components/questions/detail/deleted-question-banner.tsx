'use client'

import { LoaderCircle, RotateCcw } from 'lucide-react'

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
  return (
    <PageShell as="section" spacing="compact" padding="top">
      <Card variant="danger-soft" size="sm" role="alert">
        <CardContent layout="split-row" spacing="sm">
          <Stack gap={1}>
            <BodyText size="sm" tone="foreground" weight="medium">
              This question is deleted
            </BodyText>
            <BodyText size="sm" tone="foreground">
              Only super admins can see deleted questions. It is hidden from the
              library for everyone else and excluded from new interviews and
              similarity search. Restore it to make it visible again.
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
            {restoring ? 'Restoring...' : 'Restore question'}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
