'use client'

import { X } from 'lucide-react'
import { type ReactNode } from 'react'

import type { Locale } from '@/i18n/locales'
import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { TabPanel, Tabs } from '@/components/ui/tabs'

type QuestionLocaleTabsProps = {
  locales: Locale[]
  activeLocale: Locale
  primaryLocale: Locale
  localeLabel: (locale: Locale) => string
  removeLanguageLabel: (localeLabel: string) => string
  onSelectLocale: (locale: Locale) => void
  onRemoveLocale: (locale: Locale) => void
  renderLocaleBody: (locale: Locale) => ReactNode
  disabled?: boolean
  tabsAriaLabel: string
}

export function QuestionLocaleTabs({
  locales,
  activeLocale,
  primaryLocale,
  localeLabel,
  removeLanguageLabel,
  onSelectLocale,
  onRemoveLocale,
  renderLocaleBody,
  disabled = false,
  tabsAriaLabel,
}: QuestionLocaleTabsProps) {
  const activeIsPrimary = activeLocale === primaryLocale
  const orderedLocales = [
    primaryLocale,
    ...locales.filter((locale) => locale !== primaryLocale),
  ]

  return (
    <Stack gap={3}>
      <Inline align="center" justify="between" wrap="wrap" gap={2}>
        <Tabs
          items={orderedLocales.map((locale) => ({
            id: locale,
            label: localeLabel(locale),
            disabled,
          }))}
          activeId={activeLocale}
          onChange={(id) => onSelectLocale(id as Locale)}
          ariaLabel={tabsAriaLabel}
          disabled={disabled}
        />

        {!activeIsPrimary ? (
          <Inline align="center" gap={1} wrap="wrap">
            <Button
              type="button"
              variant="ghost"
              size="icon-xxs"
              aria-label={removeLanguageLabel(localeLabel(activeLocale))}
              disabled={disabled}
              onClick={() => onRemoveLocale(activeLocale)}
            >
              <X />
            </Button>
          </Inline>
        ) : null}
      </Inline>

      {orderedLocales.map((locale) => (
        <TabPanel key={locale} id={locale} activeId={activeLocale}>
          {renderLocaleBody(locale)}
        </TabPanel>
      ))}
    </Stack>
  )
}
