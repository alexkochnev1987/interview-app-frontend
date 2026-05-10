'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { DropdownMenu as DM } from 'radix-ui'

import { cn } from '@/lib/utils'

function DropdownMenu({
  modal = false,
  ...props
}: React.ComponentProps<typeof DM.Root>) {
  return <DM.Root data-slot="dropdown-menu" modal={modal} {...props} />
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof DM.Trigger>) {
  return <DM.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuPortal(props: React.ComponentProps<typeof DM.Portal>) {
  return <DM.Portal {...props} />
}

const dropdownContentStyles = cn(
  'z-[100] max-h-96 min-w-[12.5rem] overflow-y-auto rounded-xl border border-hairline-strong bg-popover p-1.5 text-popover-foreground shadow-float',
  'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
)

function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = 'end',
  ...props
}: React.ComponentProps<typeof DM.Content>) {
  return (
    <DropdownMenuPortal>
      <DM.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        collisionPadding={8}
        className={cn(dropdownContentStyles, className)}
        {...props}
      />
    </DropdownMenuPortal>
  )
}

const dropdownMenuItemVariants = cva(
  'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold outline-none transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45 data-[highlighted]:bg-muted/75',
  {
    variants: {
      tone: {
        primary: 'text-primary',
        success: 'text-success-soft-foreground',
        danger: 'text-danger-soft-foreground',
      },
    },
    defaultVariants: {
      tone: 'primary',
    },
  },
)

type DropdownMenuItemProps = React.ComponentProps<typeof DM.Item> &
  VariantProps<typeof dropdownMenuItemVariants>

function DropdownMenuItem({ className, tone, ...props }: DropdownMenuItemProps) {
  return (
    <DM.Item
      data-slot="dropdown-menu-item"
      className={cn(dropdownMenuItemVariants({ tone }), className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DM.Separator>) {
  return (
    <DM.Separator
      data-slot="dropdown-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border/50', className)}
      {...props}
    />
  )
}

export type DropdownMenuItemTone = NonNullable<
  VariantProps<typeof dropdownMenuItemVariants>['tone']
>

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  dropdownMenuItemVariants,
}
