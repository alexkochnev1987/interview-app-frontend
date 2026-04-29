'use client'

import { LoaderCircle, RotateCcw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface DeletedQuestionBannerProps {
  restoring: boolean
  restoreError: string | null
  onRestore: () => void
}

export function DeletedQuestionBanner({
  restoring,
  restoreError,
  onRestore,
}: DeletedQuestionBannerProps) {
  return (
    <section className="container space-y-3 pt-6">
      <Card variant="danger-soft" size="sm" role="alert">
        <CardContent layout="split-row" spacing="sm">
          <div className="space-y-1 text-sm">
            <div className="font-medium">This question is deleted</div>
            <div className="opacity-80">
              Only super admins can see deleted questions. It is hidden from the
              library for everyone else and excluded from new interviews and
              similarity search. Restore it to make it visible again.
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            shape="pill"
            className="md:shrink-0"
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
      {restoreError && (
        <Alert variant="danger">
          <AlertTitle>Cannot restore</AlertTitle>
          <AlertDescription>{restoreError}</AlertDescription>
        </Alert>
      )}
    </section>
  )
}
