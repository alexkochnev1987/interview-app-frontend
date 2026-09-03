import type { useTranslations } from 'next-intl'

import type { RecruiterAssistantResponse } from '@/lib/api'
import { APP_ROLE } from '@/lib/auth-roles'

import { getAssistantPromptMessageKey } from './assistant-prompts'

export function isShowHrsMessage(
  text: string,
  t: ReturnType<typeof useTranslations<'assistant'>>,
): boolean {
  const normalized = text.trim().toLowerCase()
  const messageKeys = [
    getAssistantPromptMessageKey(APP_ROLE.admin, 'showHrs'),
    getAssistantPromptMessageKey(APP_ROLE.super_admin, 'showHrs'),
    'welcome.items.showHrs' as const,
  ]

  return messageKeys.some((key) => t(key).trim().toLowerCase() === normalized)
}

export function shouldAttachHrList(
  result: RecruiterAssistantResponse,
  userMessage: string,
  t: ReturnType<typeof useTranslations<'assistant'>>,
): boolean {
  if (result.hrs !== undefined) return false
  return result.awaitingInput === 'hr' || isShowHrsMessage(userMessage, t)
}
