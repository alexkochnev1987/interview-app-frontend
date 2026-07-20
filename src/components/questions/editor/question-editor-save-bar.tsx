'use client'

import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'

interface QuestionEditorSaveBarProps {
  isDirty: boolean
  dirtyFieldLabels: string[]
  submitting: boolean
  submitLabel: string
  canSubmit: boolean
}

export function QuestionEditorSaveBar({
  isDirty,
  dirtyFieldLabels,
  submitting,
  submitLabel,
  canSubmit,
}: QuestionEditorSaveBarProps) {
  const t = useTranslations('questions.saveBar')
  const fieldCount = dirtyFieldLabels.length
  return (
    <Card
      variant={isDirty ? 'warning' : 'surface'}
      size="lg"
      data-tour="question-save-bar"
    >
      <CardContent layout="split-row" spacing="md">
        <Stack gap={2}>
          <Inline gap={2} align="center" wrap="wrap">
            <StatusPill tone={isDirty ? 'pending' : 'completed'}>
              {isDirty ? t('statusUnsaved') : t('statusSaved')}
            </StatusPill>
            {isDirty && (
              <BodyText as="span" size="xs" weight="medium">
                {t('fieldsChanged', { count: fieldCount })}
              </BodyText>
            )}
          </Inline>
          <SectionHeading size="sm" as="h3">
            {isDirty ? t('headlineDirty') : t('headlineClean')}
          </SectionHeading>
          <BodyText size="sm">
            {isDirty
              ? t('descriptionDirty', { fields: dirtyFieldLabels.join(', ') })
              : t('descriptionClean')}
          </BodyText>
        </Stack>
        <DemoWriteGuard disabled={submitting || !canSubmit}>
          <Button
            type="submit"
            variant="gradient"
            size="xl"
            disabled={submitting || !canSubmit}
          >
            <Save className="size-4" />
            {submitting ? t('saving') : submitLabel}
          </Button>
        </DemoWriteGuard>
      </CardContent>
    </Card>
  )
}
