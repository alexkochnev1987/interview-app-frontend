import { cva } from 'class-variance-authority'
import { Check, ChevronDown } from 'lucide-react'

import type { Locale } from '@/i18n/locales'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languageSwitcherTriggerVariants = cva(
  'flex w-full items-center justify-between gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-low-soft',
)

const languageSwitcherItemVariants = cva(
  'grid w-full grid-cols-[1fr_auto] items-center gap-2 whitespace-nowrap text-sm font-semibold',
  {
    variants: {
      active: {
        true: 'text-foreground',
        false: 'text-muted-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

type LanguageOption = {
  locale: Locale
  label: string
}

type LanguageSwitcherProps = {
  ariaLabel: string
  currentLocale: Locale
  options: LanguageOption[]
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  onOpenChange?: (open: boolean) => void
} & (
  | { href: string; onSelectLocale?: never }
  | { href?: never; onSelectLocale: (locale: Locale) => void }
)

export function LanguageSwitcher({
  ariaLabel,
  currentLocale,
  href,
  onSelectLocale,
  options,
  side,
  align = 'end',
  onOpenChange,
}: LanguageSwitcherProps) {
  const activeLabel =
    options.find((option) => option.locale === currentLocale)?.label ??
    currentLocale.toUpperCase()

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        aria-label={ariaLabel}
        className={cn(languageSwitcherTriggerVariants())}
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="w-max !min-w-0">
        {options.map(({ locale, label }) => {
          const active = locale === currentLocale

          if (onSelectLocale) {
            return (
              <DropdownMenuItem
                key={locale}
                aria-current={active ? 'true' : undefined}
                className={cn(languageSwitcherItemVariants({ active }))}
                onClick={() => onSelectLocale(locale)}
              >
                <span>{label}</span>
                <Check
                  className={cn(
                    'size-4 text-primary',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </DropdownMenuItem>
            )
          }

          return (
            <DropdownMenuItem key={locale} asChild>
              <Link
                aria-current={active ? 'true' : undefined}
                className={cn(languageSwitcherItemVariants({ active }))}
                href={href}
                locale={locale}
                prefetch={false}
              >
                <span>{label}</span>
                <Check
                  className={cn(
                    'size-4 text-primary',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
