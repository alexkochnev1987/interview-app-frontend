'use client'

import { Save } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { Textarea } from '@/components/ui/textarea'
import { type QuestionInput } from '@/lib/api'
import {
  joinStringList,
  parseStringList,
} from '@/lib/question-editor/parsers'
import { type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { EditorSectionCard } from './editor-section-card'
import { QuestionEditorField } from './question-editor-field'

interface EditorReferenceSectionProps {
  value: QuestionInput
  metadataText: string
  submitting: boolean
  onUpdate: (patch: Partial<QuestionInput>) => void
  onMetadataTextChange: (next: string) => void
  renderAiSuggestion: (field: DraftFieldKey) => ReactNode
  metadataError?: string
}

export function EditorReferenceSection({
  value,
  metadataText,
  submitting,
  onUpdate,
  onMetadataTextChange,
  renderAiSuggestion,
  metadataError,
}: EditorReferenceSectionProps) {
  const tFields = useTranslations('questions.fields')
  const t = useTranslations('questions.sections.reference')

  return (
    <EditorSectionCard
      title={t('title')}
      description={t('description')}
      icon={<Save className="size-4" />}
    >
      <Grid columns="editor-2" gap={6}>
        <Stack gap={2}>
          <QuestionEditorField
            htmlFor="sampleGoodAnswer"
            label={t('sampleGoodAnswer')}
            hint={t('sampleGoodAnswerHint')}
          >
            <Textarea
              id="sampleGoodAnswer"
              size="xl"
              value={value.sampleGoodAnswer ?? ''}
              onChange={(event) => onUpdate({ sampleGoodAnswer: event.target.value })}
              placeholder={t('sampleGoodAnswerPlaceholder')}
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('sampleGoodAnswer')}
        </Stack>

        <Stack gap={6}>
          <Stack gap={2}>
            <QuestionEditorField
              htmlFor="tags"
              label={tFields('tags')}
              hint={t('tagsHint')}
            >
              <Textarea
                id="tags"
                size="sm"
                value={joinStringList(value.tags || [])}
                onChange={(event) => onUpdate({ tags: parseStringList(event.target.value) })}
                placeholder={t('tagsPlaceholder')}
                disabled={submitting}
              />
            </QuestionEditorField>
            {renderAiSuggestion('tags')}
          </Stack>

          <QuestionEditorField
            htmlFor="metadata"
            label={t('metadata')}
            hint={t('metadataHint')}
            error={metadataError}
          >
            <Textarea
              id="metadata"
              size="lg"
              tone="code"
              value={metadataText}
              onChange={(event) => onMetadataTextChange(event.target.value)}
              placeholder={t('metadataPlaceholder')}
              disabled={submitting}
            />
          </QuestionEditorField>
        </Stack>
      </Grid>
    </EditorSectionCard>
  )
}
