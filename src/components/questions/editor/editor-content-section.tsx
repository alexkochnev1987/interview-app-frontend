'use client'

import { type ReactNode } from 'react'

import { Stack } from '@/components/ui/layout/stack'
import { QuestionLocaleTabs } from '@/components/ui/question-locale-tabs'
import { type QuestionInput } from '@/lib/api'
import { type Locale } from '@/i18n/locales'
import {
  type LocaleQuestionDraft,
} from '@/lib/question-editor/parsers'
import { CONTENT_FIELD_KEYS, type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { type EditorPhase } from '@/lib/question-editor/editor-phase'
import { EditorMetadataSection } from './editor-metadata-section'
import { EditorPromptSection } from './editor-prompt-section'
import { EditorReferenceSection } from './editor-reference-section'
import { EditorRubricSection } from './editor-rubric-section'

interface EditorContentSectionProps {
  editorPhase: EditorPhase
  value: QuestionInput
  metadataText: string
  submitting: boolean
  primaryLocale: Locale
  primaryLocaleDisabled: boolean
  localeLabel: (locale: Locale) => string
  onPrimaryLocaleChange: (locale: Locale) => void
  onMetadataUpdate: (patch: Partial<QuestionInput>) => void
  onMetadataTextChange: (next: string) => void
  metadataError?: string
  renderAiSuggestion: (field: DraftFieldKey) => ReactNode
  translateLocalesPanel?: ReactNode
  renderTranslationTabPanel: (locale: Locale) => ReactNode
  locales: Locale[]
  activeLocale: Locale
  removeLanguageLabel: (localeLabel: string) => string
  tabsAriaLabel: string
  onSelectLocale: (locale: Locale) => void
  onRemoveLocale: (locale: Locale) => void
  getLocaleContentDraft: (locale: Locale) => LocaleQuestionDraft
  onLocaleContentUpdate: (locale: Locale, patch: Partial<LocaleQuestionDraft>) => void
  questionTextError?: string
}

export function EditorContentSection({
  editorPhase,
  value,
  metadataText,
  submitting,
  primaryLocale,
  primaryLocaleDisabled,
  localeLabel,
  onPrimaryLocaleChange,
  onMetadataUpdate,
  onMetadataTextChange,
  metadataError,
  renderAiSuggestion,
  translateLocalesPanel,
  renderTranslationTabPanel,
  locales,
  activeLocale,
  removeLanguageLabel,
  tabsAriaLabel,
  onSelectLocale,
  onRemoveLocale,
  getLocaleContentDraft,
  onLocaleContentUpdate,
  questionTextError,
}: EditorContentSectionProps) {
  function applyContentPatch(
    locale: Locale,
    patch: Partial<QuestionInput>,
  ) {
    const contentPatch: Partial<LocaleQuestionDraft> = {}
    for (const key of CONTENT_FIELD_KEYS) {
      if (key in patch) {
        ;(contentPatch as Record<string, unknown>)[key] = patch[key]
      }
    }
    if (Object.keys(contentPatch).length > 0) {
      onLocaleContentUpdate(locale, contentPatch)
    }
  }

  function renderLocaleSections(locale: Locale) {
    const isPrimaryLocale = locale === primaryLocale
    const contentDraft = getLocaleContentDraft(locale)
    const contentValue: QuestionInput = {
      ...value,
      ...contentDraft,
    }
    const showAi = isPrimaryLocale ? renderAiSuggestion : () => null
    const showQuestionTextError =
      questionTextError && (editorPhase === 1 || locale === activeLocale)
        ? questionTextError
        : undefined

    return (
      <Stack gap={6}>
        <EditorPromptSection
          editorPhase={editorPhase}
          locale={locale}
          primaryLocale={primaryLocale}
          localeLabel={localeLabel}
          contentDraft={contentDraft}
          submitting={submitting}
          onContentUpdate={(patch) => onLocaleContentUpdate(locale, patch)}
          renderAiSuggestion={showAi}
          questionTextError={showQuestionTextError}
          translateLocalesPanel={isPrimaryLocale ? translateLocalesPanel : undefined}
          translationTabPanel={
            editorPhase === 2 && !isPrimaryLocale
              ? renderTranslationTabPanel(locale)
              : undefined
          }
        />
        <EditorMetadataSection
          value={value}
          submitting={submitting}
          primaryLocale={primaryLocale}
          primaryLocaleDisabled={primaryLocaleDisabled}
          localeLabel={localeLabel}
          onPrimaryLocaleChange={onPrimaryLocaleChange}
          onUpdate={onMetadataUpdate}
          renderAiSuggestion={showAi}
        />
        <EditorRubricSection
          locale={locale}
          value={contentValue}
          submitting={submitting}
          onUpdate={(patch) => applyContentPatch(locale, patch)}
          renderAiSuggestion={showAi}
        />
        <EditorReferenceSection
          locale={locale}
          primaryLocale={primaryLocale}
          contentDraft={contentDraft}
          value={value}
          metadataText={metadataText}
          submitting={submitting}
          onContentUpdate={(patch) => onLocaleContentUpdate(locale, patch)}
          onUpdate={onMetadataUpdate}
          onMetadataTextChange={onMetadataTextChange}
          renderAiSuggestion={showAi}
          metadataError={metadataError}
        />
      </Stack>
    )
  }

  if (editorPhase === 1) {
    return renderLocaleSections(primaryLocale)
  }

  return (
    <Stack gap={6}>
      <QuestionLocaleTabs
        locales={locales}
        activeLocale={activeLocale}
        primaryLocale={primaryLocale}
        localeLabel={localeLabel}
        removeLanguageLabel={removeLanguageLabel}
        tabsAriaLabel={tabsAriaLabel}
        onSelectLocale={onSelectLocale}
        onRemoveLocale={onRemoveLocale}
        disabled={submitting}
        renderLocaleBody={renderLocaleSections}
      />
    </Stack>
  )
}
