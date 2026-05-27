'use client'

import { BrainCircuit } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Input } from '@/components/ui/input'
import { Grid } from '@/components/ui/layout/grid'
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
import { useSharedLabels } from '@/i18n/use-shared-labels'
import { type DraftFieldKey } from '@/lib/question-editor/field-keys'
import { EditorSectionCard } from './editor-section-card'
import { QuestionEditorField } from './question-editor-field'

interface EditorIdentitySectionProps {
  value: QuestionInput
  submitting: boolean
  onUpdate: (patch: Partial<QuestionInput>) => void
  renderAiSuggestion: (field: DraftFieldKey) => ReactNode
}

export function EditorIdentitySection({
  value,
  submitting,
  onUpdate,
  renderAiSuggestion,
}: EditorIdentitySectionProps) {
  const tFields = useTranslations('questions.fields')
  const tIdentity = useTranslations('questions.sections.identity')
  const tEditor = useTranslations('questions.editor')
  const sharedLabels = useSharedLabels()

  return (
    <EditorSectionCard
      title={tIdentity('title')}
      description={tIdentity('description')}
      icon={<BrainCircuit className="size-4" />}
    >
      <Grid columns="identity-4" gap={5}>
        <QuestionEditorField
          htmlFor="externalId"
          label={tFields('externalId')}
          hint={tIdentity('externalIdHint')}
        >
          <Input
            id="externalId"
            value={value.externalId ?? ''}
            onChange={(event) => onUpdate({ externalId: event.target.value })}
            placeholder={tIdentity('externalIdPlaceholder')}
            disabled={submitting}
          />
        </QuestionEditorField>

        <QuestionEditorField htmlFor="role" label={tFields('role')}>
          <Input
            id="role"
            value={value.role ?? ''}
            onChange={(event) => onUpdate({ role: event.target.value })}
            placeholder={tIdentity('rolePlaceholder')}
            disabled={submitting}
          />
        </QuestionEditorField>

        <QuestionEditorField htmlFor="focus" label={tFields('focus')}>
          <Input
            id="focus"
            value={value.focus ?? ''}
            onChange={(event) => onUpdate({ focus: event.target.value })}
            placeholder={tIdentity('focusPlaceholder')}
            disabled={submitting}
          />
        </QuestionEditorField>

        <QuestionEditorField htmlFor="outputLanguage" label={tFields('outputLanguage')}>
          <Input
            id="outputLanguage"
            value={value.outputLanguage}
            onChange={(event) => onUpdate({ outputLanguage: event.target.value })}
            placeholder={tIdentity('outputLanguagePlaceholder')}
            disabled={submitting}
          />
        </QuestionEditorField>
      </Grid>

      <Grid columns="identity-5" gap={5}>
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
          {renderAiSuggestion('category')}
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
          {renderAiSuggestion('subcategory')}
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
          {renderAiSuggestion('difficulty')}
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
          {renderAiSuggestion('weight')}
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
          {renderAiSuggestion('minimumPassScore')}
        </Stack>
      </Grid>
    </EditorSectionCard>
  )
}
