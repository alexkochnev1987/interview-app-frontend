'use client'

import { LoaderCircle, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PageShell } from '@/components/ui/layout/page-shell'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'

interface QuestionDangerZoneProps {
  deleting: boolean
  onRequestDelete: () => void
}

export function QuestionDangerZone({
  deleting,
  onRequestDelete,
}: QuestionDangerZoneProps) {
  const t = useTranslations('questions.dangerZone')

  return (
    <PageShell as="section" spacing="compact" padding="bottom">
      <Card variant="danger-soft">
        <CardHeader spacing="xs">
          <CardTitle size="md">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent spacing="md">
          <DemoWriteGuard disabled={deleting}>
            <Button
              type="button"
              variant="destructive"
              shape="pill"
              onClick={onRequestDelete}
            >
              {deleting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleting ? t('deleting') : t('delete')}
            </Button>
          </DemoWriteGuard>
        </CardContent>
      </Card>
    </PageShell>
  )
}
