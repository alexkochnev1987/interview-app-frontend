'use client'

import { Save } from 'lucide-react'
import { type ReactNode } from 'react'

import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { Textarea } from '@/components/ui/textarea'
import { type QuestionInput } from '@/lib/api'
import {
  joinStringList,
  parseStringList,
  type DraftFieldKey,
} from '@/lib/question-editor/parsers'
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
  return (
    <EditorSectionCard
      title="Reference material"
      description="Store extra context for future reviewers, exports, and scoring experiments."
      icon={<Save className="size-4" />}
    >
      <Grid columns="editor-2" gap={6}>
        <QuestionEditorField
          htmlFor="sampleGoodAnswer"
          label="Sample good answer"
          hint="Target depth reference for evaluation."
        >
          <Textarea
            id="sampleGoodAnswer"
            size="xl"
            value={value.sampleGoodAnswer ?? ''}
            onChange={(event) => onUpdate({ sampleGoodAnswer: event.target.value })}
            placeholder="Target depth reference for evaluation"
            disabled={submitting}
          />
          {renderAiSuggestion('sampleGoodAnswer')}
        </QuestionEditorField>

        <Stack gap={6}>
          <QuestionEditorField
            htmlFor="tags"
            label="Tags"
            hint="Comma or newline separated tags used for filtering and imports."
          >
            <Textarea
              id="tags"
              size="sm"
              value={joinStringList(value.tags || [])}
              onChange={(event) => onUpdate({ tags: parseStringList(event.target.value) })}
              placeholder="Comma or newline separated"
              disabled={submitting}
            />
            {renderAiSuggestion('tags')}
          </QuestionEditorField>

          <QuestionEditorField
            htmlFor="metadata"
            label="Additional metadata"
            hint="Valid JSON object that can carry rubric or source information."
            error={metadataError}
          >
            <Textarea
              id="metadata"
              size="lg"
              tone="code"
              value={metadataText}
              onChange={(event) => onMetadataTextChange(event.target.value)}
              placeholder='{"rubricVersion":"v1"}'
              disabled={submitting}
              aria-invalid={metadataError ? true : undefined}
            />
          </QuestionEditorField>
        </Stack>
      </Grid>
    </EditorSectionCard>
  )
}
