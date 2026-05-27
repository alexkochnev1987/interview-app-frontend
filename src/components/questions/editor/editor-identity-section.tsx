'use client'

import { BrainCircuit } from 'lucide-react'
import { type ReactNode } from 'react'

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
import { type DraftFieldKey } from '@/lib/question-editor/parsers'
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
  return (
    <EditorSectionCard
      title="Question identity"
      description="Anchor the prompt in the role and taxonomy you expect recruiters to search later."
      icon={<BrainCircuit className="size-4" />}
    >
      <Grid columns="identity-5" gap={5}>
        <Stack gap={2}>
          <QuestionEditorField
            htmlFor="externalId"
            label="External ID"
            labelTooltip="Optional stable identifier for imports."
          >
            <Input
              id="externalId"
              value={value.externalId ?? ''}
              onChange={(event) => onUpdate({ externalId: event.target.value })}
              placeholder="frontend_closure_v1"
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('externalId')}
        </Stack>

        <Stack gap={2}>
          <QuestionEditorField htmlFor="role" label="Role">
            <Input
              id="role"
              value={value.role ?? ''}
              onChange={(event) => onUpdate({ role: event.target.value })}
              placeholder="frontend intern"
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('role')}
        </Stack>

        <Stack gap={2}>
          <QuestionEditorField htmlFor="focus" label="Focus">
            <Input
              id="focus"
              value={value.focus ?? ''}
              onChange={(event) => onUpdate({ focus: event.target.value })}
              placeholder="fundamentals"
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('focus')}
        </Stack>

        <Stack gap={2}>
          <QuestionEditorField htmlFor="outputLanguage" label="Output language">
            <Input
              id="outputLanguage"
              value={value.outputLanguage}
              onChange={(event) => onUpdate({ outputLanguage: event.target.value })}
              placeholder="English"
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('outputLanguage')}
        </Stack>

        <Spacer visibility="xl-only" />

        <Stack gap={2}>
          <QuestionEditorField htmlFor="category" label="Category">
            <Input
              id="category"
              value={value.category ?? ''}
              onChange={(event) => onUpdate({ category: event.target.value })}
              placeholder="javascript"
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('category')}
        </Stack>

        <Stack gap={2}>
          <QuestionEditorField htmlFor="subcategory" label="Subcategory">
            <Input
              id="subcategory"
              value={value.subcategory ?? ''}
              onChange={(event) => onUpdate({ subcategory: event.target.value })}
              placeholder="closures"
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('subcategory')}
        </Stack>

        <Stack gap={2}>
          <QuestionEditorField htmlFor="difficulty" label="Difficulty">
            <Select
              value={value.difficulty}
              onValueChange={(next) =>
                onUpdate({ difficulty: next as QuestionDifficulty })
              }
              disabled={submitting}
            >
              <SelectTrigger variant="surface" size="md" shape="rounded">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">easy</SelectItem>
                <SelectItem value="medium">medium</SelectItem>
                <SelectItem value="hard">hard</SelectItem>
              </SelectContent>
            </Select>
          </QuestionEditorField>
          {renderAiSuggestion('difficulty')}
        </Stack>

        <Stack gap={2}>
          <QuestionEditorField htmlFor="weight" label="Weight">
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
          <QuestionEditorField htmlFor="minimumPassScore" label="Minimum pass score">
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
