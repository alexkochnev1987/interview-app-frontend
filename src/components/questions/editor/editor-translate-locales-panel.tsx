'use client'

import { Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useQuestionEditorLabels } from '@/i18n/use-question-editor-labels'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import type { Locale } from '@/i18n/locales'

type TranslateLocaleStatus = 'idle' | 'loading' | 'error'

interface EditorTranslateLocalesPanelProps {
  availableLocales: Locale[]
  selectedLocales: Locale[]
  localeLabel: (locale: Locale) => string
  disabled: boolean
  translateDisabled: boolean
  isBatchTranslating: boolean
  getLocaleStatus: (locale: Locale) => TranslateLocaleStatus | undefined
  getLocaleError: (locale: Locale) => string | undefined
  onToggleLocale: (locale: Locale, checked: boolean) => void
  onTranslate: () => void
}

export function EditorTranslateLocalesPanel({
  availableLocales,
  selectedLocales,
  localeLabel,
  disabled,
  translateDisabled,
  isBatchTranslating,
  getLocaleStatus,
  getLocaleError,
  onToggleLocale,
  onTranslate,
}: EditorTranslateLocalesPanelProps) {
  const t = useTranslations('questions.translatePanel')
  const labels = useQuestionEditorLabels()

  return (
    <SurfaceTile tone="soft" rounded="xl" padding="md">
      <Stack gap={4}>
        <Stack gap={1}>
          <BodyText size="sm" weight="semibold">
            {labels.translateTo}
          </BodyText>
          <BodyText size="sm" tone="muted">
            {t('description')}
          </BodyText>
        </Stack>

        {availableLocales.length === 0 ? (
          <BodyText size="sm" tone="muted">
            {t('noLocalesAvailable')}
          </BodyText>
        ) : (
          <Stack gap={2}>
            {availableLocales.map((locale) => {
              const status = getLocaleStatus(locale)
              const error = getLocaleError(locale)
              const checkboxId = `translate-locale-${locale}`

              return (
                <Stack key={locale} gap={1}>
                  <Inline gap={2} align="center">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedLocales.includes(locale)}
                      disabled={disabled || isBatchTranslating}
                      onCheckedChange={(checked) =>
                        onToggleLocale(locale, checked === true)
                      }
                    />
                    <Label htmlFor={checkboxId}>{localeLabel(locale)}</Label>
                    {status === 'loading' ? (
                      <BodyText as="span" size="xs" tone="muted">
                        {t('localeLoading')}
                      </BodyText>
                    ) : null}
                  </Inline>
                  {error ? (
                    <BodyText role="alert" size="sm" tone="danger">
                      {error}
                    </BodyText>
                  ) : null}
                </Stack>
              )
            })}
          </Stack>
        )}

        <Inline justify="end">
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            disabled={disabled || translateDisabled || selectedLocales.length === 0}
            loading={isBatchTranslating}
            onClick={onTranslate}
          >
            <Languages className="size-4" />
            {isBatchTranslating ? t('translating') : labels.translate}
          </Button>
        </Inline>
      </Stack>
    </SurfaceTile>
  )
}
