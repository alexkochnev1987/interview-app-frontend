'use client'

import { useEffect, useRef, useState } from 'react'

import { Textarea } from '@/components/ui/textarea'
import {
  type QuestionExpectedConcept,
  type QuestionRedFlag,
} from '@/lib/api'

type ListItem = QuestionExpectedConcept | QuestionRedFlag

export interface RawListTextareaProps<T extends ListItem> {
  id: string
  parsedValue: T[]
  format: (items: T[]) => string
  parse: (text: string) => T[]
  onParsedChange: (next: T[]) => void
  placeholder: string
  disabled: boolean
}

export function RawListTextarea<T extends ListItem>({
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
      size="xs"
      tone="code"
      value={text}
      onChange={(event) => handleChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}
