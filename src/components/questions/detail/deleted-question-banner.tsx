'use client'

import { LoaderCircle, RotateCcw } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

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
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-lg border border-danger-soft-border bg-danger-soft px-4 py-3 text-sm text-danger-soft-foreground md:flex-row md:items-center md:justify-between"
      >
        <div className="space-y-1">
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
      </div>
      {restoreError && (
        <Alert variant="danger">
          <AlertTitle>Cannot restore</AlertTitle>
          <AlertDescription>{restoreError}</AlertDescription>
        </Alert>
      )}
    </section>
  )
}
