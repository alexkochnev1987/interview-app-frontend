'use client'

import { useEffect, useRef, useState } from 'react'
import type { ComponentProps } from 'react'

import { Textarea } from '@/components/ui/textarea'

type TextareaVariantProps = ComponentProps<typeof Textarea>

export interface RawListTextareaProps<T> {
  id: string
  parsedValue: T[]
  format: (items: T[]) => string
  parse: (text: string) => T[]
  onParsedChange: (next: T[]) => void
  placeholder: string
  disabled: boolean
  size?: TextareaVariantProps['size']
  tone?: TextareaVariantProps['tone']
}

export function RawListTextarea<T>({
  id,
  parsedValue,
  format,
  parse,
  onParsedChange,
  placeholder,
  disabled,
  size = 'xs',
  tone = 'code',
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
      size={size}
      tone={tone}
      value={text}
      onChange={(event) => handleChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}
