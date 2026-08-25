import type { RecruiterAssistantRedirect } from '@/lib/api'

import type { AiAssistantChatMessage } from './ai-assistant-chat-types'

function normalizeCandidateLookup(value: string): string {
  return value.trim().toLowerCase()
}

export function findCandidateEmailInMessages(
  messages: AiAssistantChatMessage[],
  candidateName: string,
): string | null {
  const normalizedName = normalizeCandidateLookup(candidateName)
  if (!normalizedName) return null

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role !== 'assistant') continue

    const candidate = message.result?.candidates?.find(
      (entry) => normalizeCandidateLookup(entry.name) === normalizedName,
    )
    if (candidate?.email) return candidate.email
  }

  return null
}

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
      return enrichInterviewFormRedirect(message.result.redirect, messages)
    }
  }
  return null
}

export function enrichInterviewFormRedirect(
  redirect: RecruiterAssistantRedirect,
  messages: AiAssistantChatMessage[],
): RecruiterAssistantRedirect {
  if (redirect.path !== '/interviews/new') return redirect

  const query = { ...redirect.query }
  const candidateName = query.candidateName?.trim()
  if (candidateName && !query.candidateEmail?.trim()) {
    const candidateEmail = findCandidateEmailInMessages(messages, candidateName)
    if (candidateEmail) {
      query.candidateEmail = candidateEmail
    }
  }

  return { ...redirect, query }
}
