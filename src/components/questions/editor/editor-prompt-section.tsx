'use client'

import { Sparkles } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Stack } from '@/components/ui/layout/stack'
import { Textarea } from '@/components/ui/textarea'
import { type Locale } from '@/i18n/locales'
import {
  joinStringList,
  parseStringList,
  type LocaleQuestionDraft,
} from '@/lib/question-editor/parsers'
import { type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { type EditorPhase } from '@/lib/question-editor/editor-phase'
import { EditorSectionCard } from './editor-section-card'
import { QuestionEditorField } from './question-editor-field'

interface EditorPromptSectionProps {
  editorPhase: EditorPhase
  locale: Locale
  primaryLocale: Locale
  localeLabel: (locale: Locale) => string
  contentDraft: LocaleQuestionDraft
  submitting: boolean
  onContentUpdate: (patch: Partial<LocaleQuestionDraft>) => void
  renderAiSuggestion?: (field: DraftFieldKey) => ReactNode
  questionTextError?: string
  translateLocalesPanel?: ReactNode
  translationTabPanel?: ReactNode
}

export function EditorPromptSection({
  editorPhase,
  locale,
  primaryLocale,
  localeLabel,
  contentDraft,
  submitting,
  onContentUpdate,
  renderAiSuggestion,
  questionTextError,
  translateLocalesPanel,
  translationTabPanel,
}: EditorPromptSectionProps) {
  const t = useTranslations('questions.sections.prompt')
  const isPrimaryLocale = locale === primaryLocale

  return (
    <EditorSectionCard
      title={t('title')}
      description={t('description')}
      icon={<Sparkles className="size-4" />}
    >
      <Stack gap={5}>
        <Stack gap={2}>
          <QuestionEditorField
            htmlFor={`questionText-${locale}`}
            label={t('questionText')}
            error={questionTextError}
          >
            <Textarea
              id={`questionText-${locale}`}
              size="xs"
              value={contentDraft.questionText}
              onChange={(event) =>
                onContentUpdate({ questionText: event.target.value })
              }
              placeholder={
                isPrimaryLocale
                  ? t('questionTextPlaceholder')
                  : t('questionTextLocalePlaceholder', {
                      locale: localeLabel(locale),
                    })
              }
              disabled={submitting}
            />
          </QuestionEditorField>
          {isPrimaryLocale ? renderAiSuggestion?.('questionText') : null}
        </Stack>

        {editorPhase === 2 && !isPrimaryLocale ? translationTabPanel : null}

        {isPrimaryLocale ? translateLocalesPanel : null}

        <Stack gap={2}>
          <QuestionEditorField
            htmlFor={`followUpQuestions-${locale}`}
            label={t('followUpQuestions')}
            hint={t('followUpHint')}
          >
            <Textarea
              id={`followUpQuestions-${locale}`}
              size="xs"
              value={joinStringList(contentDraft.followUpQuestions || [])}
              onChange={(event) =>
                onContentUpdate({
                  followUpQuestions: parseStringList(event.target.value),
                })
              }
              placeholder={t('followUpPlaceholder')}
              disabled={submitting}
            />
          </QuestionEditorField>
          {isPrimaryLocale ? renderAiSuggestion?.('followUpQuestions') : null}
        </Stack>
      </Stack>
    </EditorSectionCard>
  )
}
