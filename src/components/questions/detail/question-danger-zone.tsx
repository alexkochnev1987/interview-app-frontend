'use client'

import { LoaderCircle, Trash2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
  return (
    <section className="container pb-12">
      <Card
        variant="surface"
        className="border-danger-soft-border bg-danger-soft"
      >
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl tracking-[-0.03em] text-danger-soft-foreground">
            Danger zone
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-danger-soft-foreground/80">
            Deleting hides this question from the library and from new
            interviews. Past interviews keep their snapshot. Active interviews
            block deletion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deleteError && (
            <Alert variant="danger">
              <AlertTitle>Cannot delete</AlertTitle>
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
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
    </section>
  )
}
