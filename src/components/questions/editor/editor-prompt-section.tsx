'use client'

import { Sparkles } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

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

interface EditorPromptSectionProps {
  value: QuestionInput
  submitting: boolean
  onUpdate: (patch: Partial<QuestionInput>) => void
  renderAiSuggestion: (field: DraftFieldKey) => ReactNode
  questionTextError?: string
}

export function EditorPromptSection({
  value,
  submitting,
  onUpdate,
  renderAiSuggestion,
  questionTextError,
}: EditorPromptSectionProps) {
  const t = useTranslations('questions.sections.prompt')

  return (
    <EditorSectionCard
      title={t('title')}
      description={t('description')}
      icon={<Sparkles className="size-4" />}
    >
      <Stack gap={2}>
        <QuestionEditorField
          htmlFor="questionText"
          label={t('questionText')}
          error={questionTextError}
        >
          <Textarea
            id="questionText"
            size="xs"
            value={value.questionText}
            onChange={(event) => onUpdate({ questionText: event.target.value })}
            placeholder={t('questionTextPlaceholder')}
            disabled={submitting}
          />
        </QuestionEditorField>
        {renderAiSuggestion('questionText')}
      </Stack>

      <Stack gap={2}>
        <QuestionEditorField
          htmlFor="followUpQuestions"
          label={t('followUpQuestions')}
          hint={t('followUpHint')}
        >
          <Textarea
            id="followUpQuestions"
            size="xs"
            value={joinStringList(value.followUpQuestions || [])}
            onChange={(event) =>
              onUpdate({ followUpQuestions: parseStringList(event.target.value) })
            }
            placeholder={t('followUpPlaceholder')}
            disabled={submitting}
          />
        </QuestionEditorField>
        {renderAiSuggestion('followUpQuestions')}
      </Stack>
    </EditorSectionCard>
  )
}
