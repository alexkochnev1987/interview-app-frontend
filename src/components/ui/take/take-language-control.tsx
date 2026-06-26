'use client'

import { cva } from 'class-variance-authority'
import { Check, Languages } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Locale } from '@/i18n/locales'
import { cn } from '@/lib/utils'

const takeLanguageMenuItemVariants = cva(
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

export type TakeLanguageControlProps = {
  ariaLabel: string
  currentLocale: Locale
  options: LanguageOption[]
  onSelectLocale: (locale: Locale) => void
  disabled?: boolean
}

export function TakeLanguageControl({
  ariaLabel,
  currentLocale,
  options,
  onSelectLocale,
  disabled = false,
}: TakeLanguageControlProps) {
  const activeLocaleCode = currentLocale.toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          shape="rounded"
          aria-label={ariaLabel}
          disabled={disabled}
        >
          <Languages aria-hidden />
          {activeLocaleCode}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-max !min-w-0">
        {options.map(({ locale, label }) => {
          const active = locale === currentLocale

          return (
            <DropdownMenuItem
              key={locale}
              aria-current={active ? 'true' : undefined}
              className={cn(takeLanguageMenuItemVariants({ active }))}
              onClick={() => onSelectLocale(locale)}
            >
              <span>{label}</span>
              <Check
                className={cn(
                  'size-4 text-primary',
                  active ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden
              />
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
