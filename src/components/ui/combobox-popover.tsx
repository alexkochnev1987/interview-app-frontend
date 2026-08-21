'use client'

import { Popover as PopoverPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const ComboboxPopover = PopoverPrimitive.Root
const ComboboxPopoverAnchor = PopoverPrimitive.Anchor

function ComboboxPopoverContent({
  className,
  align = 'start',
  onOpenAutoFocus,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="combobox-popover-content"
        align={align}
        onOpenAutoFocus={(event) => {
          // Keep keyboard focus on the input driving this popover.
          event.preventDefault()
          onOpenAutoFocus?.(event)
        }}
        className={cn(
          'z-50 max-h-72 w-(--radix-popover-trigger-width) min-w-64 overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/10',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function ComboboxPopoverItem({
  active,
  className,
  ...props
}: ComponentProps<'button'> & { active?: boolean }) {
  return (
    <button
      type="button"
      data-slot="combobox-popover-item"
      data-active={active ? '' : undefined}
      className={cn(
        'flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left outline-hidden',
        'hover:bg-accent hover:text-accent-foreground data-active:bg-accent data-active:text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { ComboboxPopover, ComboboxPopoverAnchor, ComboboxPopoverContent, ComboboxPopoverItem }
