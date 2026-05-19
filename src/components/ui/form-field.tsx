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

  const nestedChildren = Children.toArray(
    (child.props as { children?: ReactNode }).children,
  )
  const controlIndex = nestedChildren.findIndex(
    (item): item is ReactElement<Record<string, unknown>> =>
      isValidElement<Record<string, unknown>>(item) && isFormControl(item),
  )
  if (controlIndex === -1) return child

  const control = nestedChildren[controlIndex] as ReactElement<Record<string, unknown>>

  return cloneElement(
    child,
    {},
    nestedChildren.map((item, index) =>
      index === controlIndex
        ? cloneElement(control, aria as Record<string, unknown>)
        : item,
    ),
  )
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
