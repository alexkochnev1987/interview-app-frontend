'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface RadioGroupContextValue {
  value: string
  onValueChange: (value: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

function useRadioGroup() {
  const ctx = useContext(RadioGroupContext)
  if (!ctx) throw new Error('RadioItem must be used inside RadioGroup')
  return ctx
}

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
  className?: string
}

function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div role="radiogroup" className={cn('flex flex-col gap-2', className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

interface RadioItemProps {
  value: string
  children: ReactNode
  disabled?: boolean
  className?: string
}

function RadioItem({ value, children, disabled, className }: RadioItemProps) {
  const { value: groupValue, onValueChange } = useRadioGroup()
  const checked = groupValue === value

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
        checked
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          checked ? 'border-primary' : 'border-muted-foreground/40',
        )}
      >
        {checked && <span className="size-2 rounded-full bg-primary" />}
      </span>
      {children}
    </button>
  )
}

export { RadioGroup, RadioItem }
