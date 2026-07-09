import type { ReactNode } from 'react'

import { FormField } from '@/components/ui/form-field'

interface QuestionEditorFieldProps {
  children: ReactNode
  hint?: string
  labelTooltip?: ReactNode
  labelTooltipLabel?: string
  dataTour?: string
  htmlFor: string
  label: string
  error?: string
}

export function QuestionEditorField({
  children,
  hint,
  labelTooltip,
  labelTooltipLabel,
  dataTour,
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
      dataTour={dataTour}
      error={error}
    >
      {children}
    </FormField>
  )
}
