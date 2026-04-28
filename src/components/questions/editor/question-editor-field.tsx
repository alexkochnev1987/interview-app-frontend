import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface QuestionEditorFieldProps {
  children: ReactNode
  className?: string
  hint?: string
  htmlFor: string
  label: string
}

export function QuestionEditorField({
  children,
  className,
  hint,
  htmlFor,
  label,
}: QuestionEditorFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <p className="text-sm leading-6 text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  )
}
