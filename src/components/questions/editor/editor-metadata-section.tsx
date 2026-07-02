'use client'

import { type ReactNode } from 'react'
import { BrainCircuit } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BodyText } from '@/components/ui/text'
import { Input } from '@/components/ui/input'
import { Grid } from '@/components/ui/layout/grid'
import { Spacer } from '@/components/ui/layout/spacer'
import { Stack } from '@/components/ui/layout/stack'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type QuestionDifficulty,
  type QuestionInput,
} from '@/lib/api'
import { LOCALES, type Locale } from '@/i18n/locales'
import { useQuestionEditorLabels } from '@/i18n/use-question-editor-labels'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { EditorSectionCard } from './editor-section-card'
import { QuestionEditorField } from './question-editor-field'

interface EditorMetadataSectionProps {
  value: QuestionInput
  submitting: boolean
  primaryLocale: Locale
  primaryLocaleDisabled: boolean
  localeLabel: (locale: Locale) => string
  onPrimaryLocaleChange: (locale: Locale) => void
  onUpdate: (patch: Partial<QuestionInput>) => void
  renderAiSuggestion?: (field: DraftFieldKey) => ReactNode
}

export function EditorMetadataSection({
  value,
  submitting,
  primaryLocale,
  primaryLocaleDisabled,
  localeLabel,
  onPrimaryLocaleChange,
  onUpdate,
  renderAiSuggestion,
}: EditorMetadataSectionProps) {
  const tFields = useTranslations('questions.fields')
  const tIdentity = useTranslations('questions.sections.identity')
  const tEditor = useTranslations('questions.editor')
  const editorLabels = useQuestionEditorLabels()
  const sharedLabels = useSharedLabels()

  return (
    <EditorSectionCard
      title={tIdentity('title')}
      description={tIdentity('description')}
      icon={<BrainCircuit className="size-4" />}
    >
      <Stack gap={5}>
        <BodyText size="sm" tone="muted">
          {tIdentity('taxonomyEnglishHint')}
        </BodyText>
        <Grid columns="identity-5" gap={5}>
          <Stack gap={2}>
            <QuestionEditorField htmlFor="primaryLocale" label={editorLabels.primaryLocale}>
              <Select
                value={primaryLocale}
                onValueChange={(next) => onPrimaryLocaleChange(next as Locale)}
                disabled={submitting || primaryLocaleDisabled}
              >
                <SelectTrigger variant="surface" size="md" shape="rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((locale) => (
                    <SelectItem key={locale} value={locale}>
                      {localeLabel(locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </QuestionEditorField>
          </Stack>

          <Stack gap={2}>
            <QuestionEditorField
              htmlFor="externalId"
              label={tFields('externalId')}
              labelTooltip={tIdentity('externalIdTooltip')}
              labelTooltipLabel={tEditor('moreInformation')}
            >
              <Input
                id="externalId"
                value={value.externalId ?? ''}
                onChange={(event) => onUpdate({ externalId: event.target.value })}
                placeholder={tIdentity('externalIdPlaceholder')}
                disabled={submitting}
              />
            </QuestionEditorField>
            {renderAiSuggestion?.('externalId')}
          </Stack>

          <Stack gap={2}>
            <QuestionEditorField htmlFor="role" label={tFields('role')}>
              <Input
                id="role"
                value={value.role ?? ''}
                onChange={(event) => onUpdate({ role: event.target.value })}
                placeholder={tIdentity('rolePlaceholder')}
                disabled={submitting}
              />
            </QuestionEditorField>
            {renderAiSuggestion?.('role')}
          </Stack>

          <Stack gap={2}>
            <QuestionEditorField htmlFor="focus" label={tFields('focus')}>
              <Input
                id="focus"
                value={value.focus ?? ''}
                onChange={(event) => onUpdate({ focus: event.target.value })}
                placeholder={tIdentity('focusPlaceholder')}
                disabled={submitting}
              />
            </QuestionEditorField>
            {renderAiSuggestion?.('focus')}
          </Stack>

          <Spacer visibility="xl-only" />

          <Stack gap={2}>
            <QuestionEditorField htmlFor="category" label={tFields('category')}>
              <Input
                id="category"
                value={value.category ?? ''}
                onChange={(event) => onUpdate({ category: event.target.value })}
                placeholder={tIdentity('categoryPlaceholder')}
                disabled={submitting}
              />
            </QuestionEditorField>
            {renderAiSuggestion?.('category')}
          </Stack>

          <Stack gap={2}>
            <QuestionEditorField htmlFor="subcategory" label={tFields('subcategory')}>
              <Input
                id="subcategory"
                value={value.subcategory ?? ''}
                onChange={(event) => onUpdate({ subcategory: event.target.value })}
                placeholder={tIdentity('subcategoryPlaceholder')}
                disabled={submitting}
              />
            </QuestionEditorField>
            {renderAiSuggestion?.('subcategory')}
          </Stack>

          <Stack gap={2}>
            <QuestionEditorField htmlFor="difficulty" label={tFields('difficulty')}>
              <Select
                value={value.difficulty}
                onValueChange={(next) =>
                  onUpdate({ difficulty: next as QuestionDifficulty })
                }
                disabled={submitting}
              >
                <SelectTrigger variant="surface" size="md" shape="rounded">
                  <SelectValue placeholder={tEditor('selectDifficultyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">{sharedLabels.difficulty('easy')}</SelectItem>
                  <SelectItem value="medium">{sharedLabels.difficulty('medium')}</SelectItem>
                  <SelectItem value="hard">{sharedLabels.difficulty('hard')}</SelectItem>
                </SelectContent>
              </Select>
            </QuestionEditorField>
            {renderAiSuggestion?.('difficulty')}
          </Stack>

          <Stack gap={2}>
            <QuestionEditorField htmlFor="weight" label={tFields('weight')}>
              <Input
                id="weight"
                type="number"
                min={0.1}
                max={10}
                step={0.1}
                value={value.weight}
                onChange={(event) =>
                  onUpdate({ weight: Math.max(0.1, Number(event.target.value) || 1) })
                }
                disabled={submitting}
              />
            </QuestionEditorField>
            {renderAiSuggestion?.('weight')}
          </Stack>

          <Stack gap={2}>
            <QuestionEditorField htmlFor="minimumPassScore" label={tFields('minimumPassScore')}>
              <Input
                id="minimumPassScore"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={value.minimumPassScore}
                onChange={(event) =>
                  onUpdate({
                    minimumPassScore: Math.max(
                      0,
                      Math.min(5, Number(event.target.value) || 0),
                    ),
                  })
                }
                disabled={submitting}
              />
            </QuestionEditorField>
            {renderAiSuggestion?.('minimumPassScore')}
          </Stack>
        </Grid>
      </Stack>
    </EditorSectionCard>
  )
}
