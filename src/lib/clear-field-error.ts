import type { Dispatch, SetStateAction } from 'react'

export function clearFieldError<K extends string>(
  field: K,
  setFieldErrors: Dispatch<SetStateAction<Partial<Record<K, string>>>>,
): void {
  setFieldErrors((current) => {
    if (!current[field]) return current
    const next = { ...current }
    delete next[field]
    return next
  })
}
