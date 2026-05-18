'use client'

import { useEffect, useRef } from 'react'
import { LoaderCircle, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageShell } from '@/components/ui/layout/page-shell'
import { notifyError } from '@/lib/toast'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

interface QuestionDangerZoneProps {
  deleting: boolean
  deleteError: string | null
  onRequestDelete: () => void
}

export function QuestionDangerZone({
  deleting,
  deleteError,
  onRequestDelete,
}: QuestionDangerZoneProps) {
  const lastDeleteErrorRef = useRef<string | null>(null)

  useEffect(() => {
    if (!deleteError) {
      lastDeleteErrorRef.current = null
      return
    }
    if (deleteError === lastDeleteErrorRef.current) {
      return
    }
    lastDeleteErrorRef.current = deleteError
    notifyError(TOAST_MESSAGES.deleteQuestion.cannotDeleteTitle, {
      id: 'delete-question-error',
      description: deleteError,
    })
  }, [deleteError])

  return (
    <PageShell as="section" spacing="compact" padding="bottom">
      <Card variant="danger-soft">
        <CardHeader spacing="xs">
          <CardTitle size="md">Danger zone</CardTitle>
          <CardDescription>
            Deleting hides this question from the library and from new
            interviews. Past interviews keep their snapshot. Active interviews
            block deletion.
          </CardDescription>
        </CardHeader>
        <CardContent spacing="md">
          <Button
            type="button"
            variant="destructive"
            shape="pill"
            disabled={deleting}
            onClick={onRequestDelete}
          >
            {deleting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {deleting ? 'Deleting...' : 'Delete question'}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
