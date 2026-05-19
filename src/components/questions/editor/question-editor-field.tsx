import type { ReactNode } from 'react'

import { FormField } from '@/components/ui/form-field'

interface QuestionEditorFieldProps {
  children: ReactNode
  className?: string
  hint?: string
  htmlFor: string
  label: string
  error?: string
}

export function QuestionEditorField({
  children,
  hint,
  htmlFor,
  label,
  error,
}: QuestionEditorFieldProps) {
  return (
    <FormField htmlFor={htmlFor} label={label} hint={hint} error={error}>
      {children}
    </FormField>
  )
}
