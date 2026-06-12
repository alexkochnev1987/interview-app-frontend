import type { ReactNode } from 'react'

import { FormField } from '@/components/ui/form-field'

interface QuestionEditorFieldProps {
  children: ReactNode
  hint?: string
  labelTooltip?: ReactNode
  labelTooltipLabel?: string
  htmlFor: string
  label: string
  error?: string
}

export function QuestionEditorField({
  children,
  hint,
  labelTooltip,
  labelTooltipLabel,
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
      labelTooltipLabel={labelTooltipLabel}
      error={error}
    >
      {children}
    </FormField>
  )
}
