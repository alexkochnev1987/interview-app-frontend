'use client'

import * as React from 'react'

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      orientation="vertical"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

interface RadioItemProps
  extends Omit<
    React.ComponentProps<typeof RadioGroupPrimitive.Item>,
    'children'
  > {
  children: React.ReactNode
}

function RadioItem({ children, className, disabled, ...props }: RadioItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      {...props}
      disabled={disabled}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary/5 data-[state=checked]:text-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          'border-muted-foreground/40 group-data-[state=checked]:border-primary',
        )}
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex items-center justify-center"
        >
          <span className="size-2 rounded-full bg-primary" />
        </RadioGroupPrimitive.Indicator>
      </span>
      {children}
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioItem }
