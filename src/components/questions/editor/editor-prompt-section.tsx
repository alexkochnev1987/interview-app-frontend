'use client'

import { Sparkles } from 'lucide-react'
import { type ReactNode } from 'react'

import { Textarea } from '@/components/ui/textarea'
import { type QuestionInput } from '@/lib/api'
import {
  joinStringList,
  parseStringList,
  type DraftFieldKey,
} from '@/lib/question-editor/parsers'
import { EditorSectionCard } from './editor-section-card'
import { QuestionEditorField } from './question-editor-field'

interface EditorPromptSectionProps {
  value: QuestionInput
  submitting: boolean
  onUpdate: (patch: Partial<QuestionInput>) => void
  renderAiSuggestion: (field: DraftFieldKey) => ReactNode
}

export function EditorPromptSection({
  value,
  submitting,
  onUpdate,
  renderAiSuggestion,
}: EditorPromptSectionProps) {
  return (
    <EditorSectionCard
      title="Prompt and follow-up"
      description="Write the core question clearly, then capture the follow-up probes that interviewers should keep ready."
      icon={<Sparkles className="size-4" />}
    >
      <QuestionEditorField htmlFor="questionText" label="Question text">
        <Textarea
          id="questionText"
          value={value.questionText}
          onChange={(event) => onUpdate({ questionText: event.target.value })}
          placeholder="e.g. What is a closure in JavaScript?"
          disabled={submitting}
        />
        {renderAiSuggestion('questionText')}
      </QuestionEditorField>

      <QuestionEditorField
        htmlFor="followUpQuestions"
        label="Follow-up questions"
        hint="Use one line per probe so the interviewer can keep cadence during the session."
      >
        <Textarea
          id="followUpQuestions"
          size="sm"
          value={joinStringList(value.followUpQuestions || [])}
          onChange={(event) =>
            onUpdate({ followUpQuestions: parseStringList(event.target.value) })
          }
          placeholder="One question per line"
          disabled={submitting}
        />
        {renderAiSuggestion('followUpQuestions')}
      </QuestionEditorField>
    </EditorSectionCard>
  )
}
