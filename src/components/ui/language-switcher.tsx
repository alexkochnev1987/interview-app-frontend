import { cva } from 'class-variance-authority'
import Link from 'next/link'

import type { Locale } from '@/i18n/locales'
import { localizedPath } from '@/i18n/pathname'
import { cn } from '@/lib/utils'

const languageSwitcherLinkVariants = cva(
  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
  {
    variants: {
      active: {
        true: 'bg-primary text-primary-foreground shadow-sm',
        false: 'text-muted-foreground hover:bg-surface-low-soft hover:text-foreground',
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
  return (
    <div
      aria-label={ariaLabel}
      className="flex items-center gap-1 rounded-full border border-border/60 bg-background/70 p-1 shadow-sm"
      role="group"
    >
      {options.map(({ locale, label }) => {
        const active = locale === currentLocale

        return (
          <Link
            key={locale}
            aria-current={active ? 'true' : undefined}
            className={cn(languageSwitcherLinkVariants({ active }))}
            href={localizedPath(href, locale)}
            prefetch={false}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
