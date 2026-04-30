import type { ReactNode } from 'react'

import { FormField } from '@/components/ui/form-field'

interface QuestionEditorFieldProps {
  children: ReactNode
  className?: string
  hint?: string
  htmlFor: string
  label: string
}

export function QuestionEditorField({
  children,
  hint,
  htmlFor,
  label,
}: QuestionEditorFieldProps) {
  return (
    <FormField htmlFor={htmlFor} label={label} hint={hint}>
      {children}
    </FormField>
  )
}
