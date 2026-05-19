import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

interface FormFieldProps {
  htmlFor?: string
  label: ReactNode
  hint?: ReactNode
  error?: string
  children: ReactNode
}

export function FormField({ htmlFor, label, hint, error, children }: FormFieldProps) {
  return (
    <Stack gap={2}>
      <Stack gap={1}>
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <BodyText size="sm">{hint}</BodyText> : null}
      </Stack>
      {children}
      {error ? (
        <BodyText size="sm" tone="danger">
          {error}
        </BodyText>
      ) : null}
    </Stack>
  )
}
