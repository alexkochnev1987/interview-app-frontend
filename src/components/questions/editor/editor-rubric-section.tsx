'use client'

import { WandSparkles } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Grid } from '@/components/ui/layout/grid'
import { Stack } from '@/components/ui/layout/stack'
import { Textarea } from '@/components/ui/textarea'
import {
  type QuestionExpectedConcept,
  type QuestionInput,
  type QuestionRedFlag,
} from '@/lib/api'

function coerceExpectedConcepts(
  items: (string | QuestionExpectedConcept)[] | undefined,
): QuestionExpectedConcept[] {
  return (items ?? []).map((item) =>
    typeof item === 'string'
      ? { id: item, label: item, weight: 0, description: '' }
      : item,
  )
}

function coerceRedFlags(
  items: (string | QuestionRedFlag)[] | undefined,
): QuestionRedFlag[] {
  return (items ?? []).map((item) =>
    typeof item === 'string'
      ? { id: item, label: item, severity: 'medium' }
      : item,
  )
}
import {
  formatExpectedConcepts,
  formatRedFlags,
  parseExpectedConcepts,
  parseRedFlags,
  type DraftFieldKey,
} from '@/lib/question-editor/parsers'
import { EditorSectionCard } from './editor-section-card'
import { QuestionEditorField } from './question-editor-field'

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
    <EditorSectionCard
      title="Evaluation rubric"
      description="Define what a good answer must cover and which signals should reduce confidence."
      icon={<WandSparkles className="size-4" />}
    >
      <Grid columns="editor-2" gap={6}>
        <Stack gap={2}>
          <QuestionEditorField
            htmlFor="expectedConcepts"
            label="Expected concepts"
            hint="Format: id | label | weight | description"
          >
            <RawListTextarea
              id="expectedConcepts"
              parsedValue={coerceExpectedConcepts(value.expectedConcepts)}
              format={formatExpectedConcepts}
              parse={parseExpectedConcepts}
              onParsedChange={(next) => onUpdate({ expectedConcepts: next })}
              placeholder="id | label | weight | description"
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('expectedConcepts')}
        </Stack>

        <Stack gap={2}>
          <QuestionEditorField
            htmlFor="redFlags"
            label="Red flags"
            hint="Format: id | label | severity"
          >
            <RawListTextarea
              id="redFlags"
              parsedValue={coerceRedFlags(value.redFlags)}
              format={formatRedFlags}
              parse={parseRedFlags}
              onParsedChange={(next) => onUpdate({ redFlags: next })}
              placeholder="id | label | severity"
              disabled={submitting}
            />
          </QuestionEditorField>
          {renderAiSuggestion('redFlags')}
        </Stack>
      </Grid>
    </EditorSectionCard>
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
      size="xl"
      tone="code"
      value={text}
      onChange={(event) => handleChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}
