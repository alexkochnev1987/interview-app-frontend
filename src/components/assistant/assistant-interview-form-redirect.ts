import type { RecruiterAssistantRedirect } from '@/lib/api'

import type { AiAssistantChatMessage } from './ai-assistant-chat-types'

const CREATE_OWN_PATTERN = /\b(?:create\s+)?my\s+own\b/i

/** Matches backend `parseTemplateChoice` "own" phrasing. */
export function isCreateOwnChoiceMessage(message: string): boolean {
  const trimmed = message.trim()
  if (!trimmed) return false
  return CREATE_OWN_PATTERN.test(trimmed) || /^own$/i.test(trimmed)
}

export function findRecentInterviewFormRedirect(
  messages: AiAssistantChatMessage[],
): RecruiterAssistantRedirect | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role !== 'assistant') continue
    if (message.result?.redirect?.path === '/interviews/new') {
      return message.result.redirect
    }
  }
  return null
}
