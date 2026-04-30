'use client'

import { useEffect, useMemo, useState } from 'react'

import { type QuestionInput } from '@/lib/api'
import {
  EDITABLE_FIELDS,
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
  dirtyFields: typeof EDITABLE_FIELDS
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

  const dirtyFields = useMemo(
    () =>
      EDITABLE_FIELDS.filter(({ key }) => {
        if (key === 'metadata') return metadataText !== savedMetadataText
        return !areEqual(value[key], savedValue[key])
      }),
    [value, savedValue, metadataText, savedMetadataText],
  )
  const isDirty = dirtyFields.length > 0

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

  return { dirtyFields, isDirty, markSaved }
}
