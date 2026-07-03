'use client'

import { Save } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { Textarea } from '@/components/ui/textarea'
import { type QuestionInput } from '@/lib/api'
import { type Locale } from '@/i18n/locales'
import {
  joinStringList,
  parseStringList,
  type LocaleQuestionDraft,
} from '@/lib/question-editor/parsers'
import { type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { EditorSectionCard } from './editor-section-card'
import { QuestionEditorField } from './question-editor-field'

interface EditorReferenceSectionProps {
  locale: Locale
  primaryLocale: Locale
  contentDraft: LocaleQuestionDraft
  value: QuestionInput
  metadataText: string
  submitting: boolean
  onContentUpdate: (patch: Partial<LocaleQuestionDraft>) => void
  onUpdate: (patch: Partial<QuestionInput>) => void
  onMetadataTextChange: (next: string) => void
  renderAiSuggestion?: (field: DraftFieldKey) => ReactNode
  metadataError?: string
}

export function EditorReferenceSection({
  locale,
  primaryLocale,
  contentDraft,
  value,
  metadataText,
  submitting,
  onContentUpdate,
  onUpdate,
  onMetadataTextChange,
  renderAiSuggestion,
  metadataError,
}: EditorReferenceSectionProps) {
  const tFields = useTranslations('questions.fields')
  const t = useTranslations('questions.sections.reference')
  const isPrimaryLocale = locale === primaryLocale

  return (
    <EditorSectionCard
      title={t('title')}
      description={t('description')}
      icon={<Save className="size-4" />}
    >
      <Stack gap={5}>
        <Stack gap={2}>
          <QuestionEditorField
            htmlFor={`sampleGoodAnswer-${locale}`}
            label={t('sampleGoodAnswer')}
            hint={t('sampleGoodAnswerHint')}
          >
            <Textarea
              id={`sampleGoodAnswer-${locale}`}
              size="md"
              value={contentDraft.sampleGoodAnswer ?? ''}
              onChange={(event) =>
                onContentUpdate({ sampleGoodAnswer: event.target.value })
              }
              placeholder={t('sampleGoodAnswerPlaceholder')}
              disabled={submitting}
            />
          </QuestionEditorField>
          {isPrimaryLocale ? renderAiSuggestion?.('sampleGoodAnswer') : null}
        </Stack>

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
          {isPrimaryLocale ? renderAiSuggestion?.('tags') : null}
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
    </EditorSectionCard>
  )
}
