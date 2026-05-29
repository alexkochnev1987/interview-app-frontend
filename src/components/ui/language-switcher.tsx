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
  'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-low-soft',
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

interface LanguageSwitcherProps {
  ariaLabel: string
  currentLocale: Locale
  href: string
  options: LanguageOption[]
}

export function LanguageSwitcher({
  ariaLabel,
  currentLocale,
  href,
  options,
}: LanguageSwitcherProps) {
  const activeLocaleCode = currentLocale.toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={ariaLabel}
        className={cn(languageSwitcherTriggerVariants())}
      >
        {activeLocaleCode}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max !min-w-0">
        {options.map(({ locale, label }) => {
          const active = locale === currentLocale

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
