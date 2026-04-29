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
