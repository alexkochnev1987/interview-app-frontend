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
            {deleting ? t('deleting') : t('delete')}
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  )
}
