'use client'

import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'

interface QuestionEditorSaveBarProps {
  isDirty: boolean
  dirtyFieldLabels: string[]
  submitting: boolean
  submitLabel: string
}

export function QuestionEditorSaveBar({
  isDirty,
  dirtyFieldLabels,
  submitting,
  submitLabel,
}: QuestionEditorSaveBarProps) {
  const t = useTranslations('questions.saveBar')
  const fieldCount = dirtyFieldLabels.length
  return (
    <Card variant={isDirty ? 'warning' : 'surface'} size="lg">
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
        <Button
          type="submit"
          variant="gradient"
          size="xl"
          disabled={submitting || !isDirty}
        >
          <Save className="size-4" />
          {submitting ? t('saving') : submitLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
