'use client'

import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'

const sideNavItemBase =
  'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

// Shown when the rail expands: on `group` hover, or force-expanded via `data-expanded`.
const revealBase =
  'opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-data-[expanded=true]:opacity-100'

// Wrapping blocks also block interaction while collapsed so hidden controls aren't clickable.
export const sideNavRevealClass = cn(
  revealBase,
  'pointer-events-none group-hover:pointer-events-auto group-data-[expanded=true]:pointer-events-auto',
)

const sideNavLinkVariants = cva(sideNavItemBase, {
  variants: {
    active: {
      true: 'bg-accent text-foreground',
      false:
        'text-muted-foreground hover:bg-surface-low-soft hover:text-foreground',
    },
  },
  defaultVariants: { active: false },
})

const sideNavButtonVariants = cva(sideNavItemBase, {
  variants: {
    tone: {
      default:
        'text-muted-foreground hover:bg-surface-low-soft hover:text-foreground',
      danger: 'text-destructive hover:bg-destructive/10 hover:text-destructive',
    },
  },
  defaultVariants: { tone: 'default' },
})

export function SideNavLabel({ children }: { children: ReactNode }) {
  return (
    <span className={cn('truncate whitespace-nowrap', revealBase)}>
      {children}
    </span>
  )
}

interface SideNavLinkProps extends VariantProps<typeof sideNavLinkVariants> {
  href: ComponentProps<typeof Link>['href']
  label: string
  icon: ReactElement<{ className?: string }>
  dataTour?: string
}

export function SideNavLink({ href, label, icon, active, dataTour }: SideNavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      data-tour={dataTour}
      className={cn(sideNavLinkVariants({ active }))}
    >
      <Icon size="md">{icon}</Icon>
      <SideNavLabel>{label}</SideNavLabel>
    </Link>
  )
}

interface SideNavButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof sideNavButtonVariants> {
  label: string
  icon: ReactElement<{ className?: string }>
}

export function SideNavButton({
  label,
  icon,
  tone,
  className,
  type = 'button',
  ...props
}: SideNavButtonProps) {
  return (
    <button
      type={type}
      className={cn(sideNavButtonVariants({ tone }), className)}
      {...props}
    >
      <Icon size="md">{icon}</Icon>
      <SideNavLabel>{label}</SideNavLabel>
    </button>
  )
}
