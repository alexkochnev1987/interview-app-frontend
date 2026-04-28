'use client'

import { Sparkles } from 'lucide-react'
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
    <Card className="border-white/65 bg-white/88 shadow-soft">
      <CardContent className="space-y-6 px-8 py-8">
        <QuestionEditorSectionIntro
          title="Prompt and follow-up"
          description="Write the core question clearly, then capture the follow-up probes that interviewers should keep ready."
          icon={<Sparkles className="size-4" />}
        />

        <QuestionEditorField htmlFor="questionText" label="Question text">
          <Textarea
            id="questionText"
            value={value.questionText}
            onChange={(event) => onUpdate({ questionText: event.target.value })}
            placeholder="e.g. What is a closure in JavaScript?"
            disabled={submitting}
            className="min-h-[150px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 text-base leading-7"
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
            value={joinStringList(value.followUpQuestions)}
            onChange={(event) =>
              onUpdate({ followUpQuestions: parseStringList(event.target.value) })
            }
            placeholder="One question per line"
            disabled={submitting}
            className="min-h-[140px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 leading-7"
          />
          {renderAiSuggestion('followUpQuestions')}
        </QuestionEditorField>
      </CardContent>
    </Card>
  )
}
