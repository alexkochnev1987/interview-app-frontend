import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react'

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

type ControlAriaProps = {
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

function isFormControl(element: ReactElement<Record<string, unknown>>) {
  const slot = element.props['data-slot']
  return slot === 'input' || slot === 'textarea'
}

function withControlAria(child: ReactNode, aria: ControlAriaProps): ReactNode {
  if (!isValidElement<Record<string, unknown>>(child)) return child

  if (isFormControl(child)) {
    return cloneElement(child, aria as Record<string, unknown>)
  }

  const wrapperChildren = (child.props as { children?: ReactNode }).children
  let patched = false

  const nextChildren = Children.map(wrapperChildren, (item) => {
    if (!patched && isValidElement<Record<string, unknown>>(item) && isFormControl(item)) {
      patched = true
      return cloneElement(item, aria as Record<string, unknown>)
    }
    return item
  })

  return patched ? cloneElement(child, {}, nextChildren) : child
}

export function FormField({ htmlFor, label, hint, error, children }: FormFieldProps) {
  const baseId = useId()
  const errorId = `${baseId}-error`
  const controlAria = error
    ? { 'aria-describedby': errorId, 'aria-invalid': true as const }
    : undefined

  const singleChild =
    Children.count(children) === 1 ? (Children.only(children) as ReactNode) : null

  return (
    <Stack gap={2}>
      <Stack gap={1}>
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <BodyText size="sm">{hint}</BodyText> : null}
      </Stack>
      {controlAria && singleChild
        ? withControlAria(singleChild, controlAria)
        : children}
      {error ? (
        <BodyText id={errorId} size="sm" tone="danger">
          {error}
        </BodyText>
      ) : null}
    </Stack>
  )
}
