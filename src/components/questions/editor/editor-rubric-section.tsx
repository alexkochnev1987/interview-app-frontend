'use client'

import { WandSparkles } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  type QuestionExpectedConcept,
  type QuestionInput,
  type QuestionRedFlag,
} from '@/lib/api'
import {
  formatExpectedConcepts,
  formatRedFlags,
  parseExpectedConcepts,
  parseRedFlags,
  type DraftFieldKey,
} from '@/lib/question-editor/parsers'
import { QuestionEditorField } from './question-editor-field'
import { QuestionEditorSectionIntro } from './question-editor-section-intro'

interface EditorRubricSectionProps {
  value: QuestionInput
  submitting: boolean
  onUpdate: (patch: Partial<QuestionInput>) => void
  renderAiSuggestion: (field: DraftFieldKey) => ReactNode
}

export function EditorRubricSection({
  value,
  submitting,
  onUpdate,
  renderAiSuggestion,
}: EditorRubricSectionProps) {
  return (
    <Card className="border-white/65 bg-white/88 shadow-soft">
      <CardContent className="space-y-6 px-8 py-8">
        <QuestionEditorSectionIntro
          title="Evaluation rubric"
          description="Define what a good answer must cover and which signals should reduce confidence."
          icon={<WandSparkles className="size-4" />}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <QuestionEditorField
            htmlFor="expectedConcepts"
            label="Expected concepts"
            hint="Format: id | label | weight | description"
          >
            <RawListTextarea
              id="expectedConcepts"
              parsedValue={value.expectedConcepts}
              format={formatExpectedConcepts}
              parse={parseExpectedConcepts}
              onParsedChange={(next) => onUpdate({ expectedConcepts: next })}
              placeholder="id | label | weight | description"
              disabled={submitting}
            />
            {renderAiSuggestion('expectedConcepts')}
          </QuestionEditorField>

          <QuestionEditorField
            htmlFor="redFlags"
            label="Red flags"
            hint="Format: id | label | severity"
          >
            <RawListTextarea
              id="redFlags"
              parsedValue={value.redFlags}
              format={formatRedFlags}
              parse={parseRedFlags}
              onParsedChange={(next) => onUpdate({ redFlags: next })}
              placeholder="id | label | severity"
              disabled={submitting}
            />
            {renderAiSuggestion('redFlags')}
          </QuestionEditorField>
        </div>
      </CardContent>
    </Card>
  )
}

type ListItem = QuestionExpectedConcept | QuestionRedFlag

interface RawListTextareaProps<T extends ListItem> {
  id: string
  parsedValue: T[]
  format: (items: T[]) => string
  parse: (text: string) => T[]
  onParsedChange: (next: T[]) => void
  placeholder: string
  disabled: boolean
}

function RawListTextarea<T extends ListItem>({
  id,
  parsedValue,
  format,
  parse,
  onParsedChange,
  placeholder,
  disabled,
}: RawListTextareaProps<T>) {
  const [text, setText] = useState(() => format(parsedValue))
  const lastSyncedRef = useRef(parsedValue)

  useEffect(() => {
    if (parsedValue === lastSyncedRef.current) return
    lastSyncedRef.current = parsedValue
    setText(format(parsedValue))
  }, [parsedValue, format])

  function handleChange(nextText: string) {
    setText(nextText)
    const parsed = parse(nextText)
    lastSyncedRef.current = parsed
    onParsedChange(parsed)
  }

  return (
    <Textarea
      id={id}
      value={text}
      onChange={(event) => handleChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="min-h-[220px] rounded-[1.5rem] border-white/70 bg-[hsl(var(--surface-low)/0.8)] px-4 py-3 font-mono text-sm leading-7"
    />
  )
}
