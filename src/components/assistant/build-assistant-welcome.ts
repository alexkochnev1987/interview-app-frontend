import type { useTranslations } from 'next-intl'

import type { AssistantWelcomeRole } from './assistant-i18n'
import { getWelcomeItemKeys } from './assistant-i18n'

type AssistantTranslator = ReturnType<typeof useTranslations<'assistant'>>

export function buildAssistantWelcomeText(
  t: AssistantTranslator,
  role: AssistantWelcomeRole,
): string {
  const intro = t('welcome.intro')
  const lead = t('welcome.lead')
  const bullets = getWelcomeItemKeys(role)
    .map((key) => `• ${t(`welcome.items.${key}` as Parameters<typeof t>[0])}`)
    .join('\n')

  return `${intro}\n\n${lead}\n${bullets}`
}
