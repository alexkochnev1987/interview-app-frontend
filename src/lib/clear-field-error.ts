import type { Dispatch, SetStateAction } from 'react'

export type FieldErrors<K extends string> = Partial<Record<K, string>>

export function clearFieldError<K extends string>(
  field: K,
  setFieldErrors: Dispatch<SetStateAction<FieldErrors<K>>>,
): void {
  setFieldErrors((current) => {
    if (!current[field]) return current
    const next = { ...current }
    delete next[field]
    return next
  })
}
