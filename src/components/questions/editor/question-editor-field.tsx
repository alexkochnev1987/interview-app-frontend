import type { ReactNode } from 'react'

import { FormField } from '@/components/ui/form-field'

interface QuestionEditorFieldProps {
  children: ReactNode
  hint?: string
  labelTooltip?: ReactNode
  htmlFor: string
  label: string
  error?: string
}

export function QuestionEditorField({
  children,
  hint,
  labelTooltip,
  htmlFor,
  label,
  error,
}: QuestionEditorFieldProps) {
  return (
    <FormField
      htmlFor={htmlFor}
      label={label}
      hint={hint}
      labelTooltip={labelTooltip}
      error={error}
    >
      {children}
    </FormField>
  )
}
