'use client'

import { Save } from 'lucide-react'
import { type ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { type QuestionInput } from '@/lib/api'
import {
  joinStringList,
  parseStringList,
  type DraftFieldKey,
} from '@/lib/question-editor/parsers'
import { QuestionEditorField } from './question-editor-field'
import { QuestionEditorSectionIntro } from './question-editor-section-intro'

interface EditorReferenceSectionProps {
  value: QuestionInput
  metadataText: string
  submitting: boolean
  onUpdate: (patch: Partial<QuestionInput>) => void
  onMetadataTextChange: (next: string) => void
  renderAiSuggestion: (field: DraftFieldKey) => ReactNode
}

export function EditorReferenceSection({
  value,
  metadataText,
  submitting,
  onUpdate,
  onMetadataTextChange,
  renderAiSuggestion,
}: EditorReferenceSectionProps) {
  return (
    <Card className="border-white/65 bg-white/88 shadow-soft">
      <CardContent className="space-y-6 px-8 py-8">
        <QuestionEditorSectionIntro
          title="Reference material"
          description="Store extra context for future reviewers, exports, and scoring experiments."
          icon={<Save className="size-4" />}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <QuestionEditorField
            htmlFor="sampleGoodAnswer"
            label="Sample good answer"
            hint="Target depth reference for evaluation."
          >
            <Textarea
              id="sampleGoodAnswer"
              value={value.sampleGoodAnswer ?? ''}
              onChange={(event) => onUpdate({ sampleGoodAnswer: event.target.value })}
              placeholder="Target depth reference for evaluation"
              disabled={submitting}
              className="min-h-[220px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
            />
            {renderAiSuggestion('sampleGoodAnswer')}
          </QuestionEditorField>

          <div className="space-y-6">
            <QuestionEditorField
              htmlFor="tags"
              label="Tags"
              hint="Comma or newline separated tags used for filtering and imports."
            >
              <Textarea
                id="tags"
                value={joinStringList(value.tags)}
                onChange={(event) => onUpdate({ tags: parseStringList(event.target.value) })}
                placeholder="Comma or newline separated"
                disabled={submitting}
                className="min-h-[120px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
              />
              {renderAiSuggestion('tags')}
            </QuestionEditorField>

            <QuestionEditorField
              htmlFor="metadata"
              label="Additional metadata"
              hint="Valid JSON object that can carry rubric or source information."
            >
              <Textarea
                id="metadata"
                value={metadataText}
                onChange={(event) => onMetadataTextChange(event.target.value)}
                placeholder='{"rubricVersion":"v1"}'
                disabled={submitting}
                className="min-h-[180px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 font-mono text-sm leading-7"
              />
            </QuestionEditorField>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
