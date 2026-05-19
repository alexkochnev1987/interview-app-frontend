'use client'

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

interface QuestionDangerZoneProps {
  deleting: boolean
  onRequestDelete: () => void
}

export function QuestionDangerZone({
  deleting,
  onRequestDelete,
}: QuestionDangerZoneProps) {
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
