'use client'

import { useEffect, useMemo, useState } from 'react'

import { type QuestionInput } from '@/lib/api'
import { EDITABLE_FIELD_KEYS } from '@/lib/question-editor/field-keys'
import {
  areEqual,
  formatMetadata,
  normalizeInitialValue,
} from '@/lib/question-editor/parsers'

interface UseDirtyTrackingOptions {
  value: QuestionInput
  metadataText: string
  initialValue?: QuestionInput
}

interface UseDirtyTrackingResult {
  dirtyFieldKeys: Array<keyof QuestionInput>
  isDirty: boolean
  markSaved: (savedValue: QuestionInput, savedMetadataText: string) => void
}

export function useDirtyTracking({
  value,
  metadataText,
  initialValue,
}: UseDirtyTrackingOptions): UseDirtyTrackingResult {
  const [savedValue, setSavedValue] = useState<QuestionInput>(() =>
    normalizeInitialValue(initialValue),
  )
  const [savedMetadataText, setSavedMetadataText] = useState(() =>
    formatMetadata(initialValue?.metadata ?? {}),
  )

  const dirtyFieldKeys = useMemo(
    () =>
      EDITABLE_FIELD_KEYS.filter((key) => {
        if (key === 'metadata') return metadataText !== savedMetadataText
        return !areEqual(value[key], savedValue[key])
      }),
    [value, savedValue, metadataText, savedMetadataText],
  )
  const isDirty = dirtyFieldKeys.length > 0

  useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  function markSaved(nextValue: QuestionInput, nextMetadataText: string) {
    setSavedValue(nextValue)
    setSavedMetadataText(nextMetadataText)
  }

  return { dirtyFieldKeys, isDirty, markSaved }
}
