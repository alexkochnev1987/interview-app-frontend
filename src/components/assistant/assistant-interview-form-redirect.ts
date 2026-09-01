import type { RecruiterAssistantRedirect } from '@/lib/api'

import type { AiAssistantChatMessage } from './ai-assistant-chat-types'
import {
  ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE,
  ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE,
} from './assistant-api-contract'
import { ASSISTANT_NEW_CANDIDATE_MESSAGE } from './assistant-candidate-selection'

function normalizeCandidateLookup(value: string): string {
  return value.trim().toLowerCase()
}

function getUserOutboundText(message: AiAssistantChatMessage): string {
  return message.sentMessage ?? message.text
}

/** Backend NLU only treats "create my own" as a template choice while awaiting templateChoice. */
export function shouldInterceptCreateOwnChoice(
  messages: AiAssistantChatMessage[],
  text: string,
): boolean {
  if (!isCreateOwnChoiceMessage(text)) {
    return false
  }

  const latestAssistant = messages.findLast((message) => message.role === 'assistant')
  return latestAssistant?.result?.awaitingInput === 'templateChoice'
}

/**
 * Resolves a registered candidate email only when the user explicitly confirmed or
 * picked that person — never from a declined fuzzy-match or a manual "new candidate" path.
 */
export function findCandidateEmailInMessages(
  messages: AiAssistantChatMessage[],
  candidateName: string,
): string | null {
  const normalizedTarget = normalizeCandidateLookup(candidateName)
  if (!normalizedTarget) return null

  const declinedCandidateIds = new Set<string>()
  let linkedEmail: string | null = null
  let linkedName: string | null = null

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index]
    if (message.role !== 'assistant' || !message.result) continue

    const { awaitingInput, candidates } = message.result
    if (!candidates?.length) continue

    const nextUser = messages[index + 1]
    if (nextUser?.role !== 'user') continue

    const outbound = getUserOutboundText(nextUser).trim().toLowerCase()

    if (awaitingInput === 'confirmRegisteredCandidate') {
      if (outbound === ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE) {
        for (const candidate of candidates) {
          declinedCandidateIds.add(candidate.id)
        }
        linkedEmail = null
        linkedName = null
      } else if (outbound === ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE) {
        const confirmed =
          candidates.find(
            (candidate) => normalizeCandidateLookup(candidate.name) === normalizedTarget,
          ) ?? (candidates.length === 1 ? candidates[0] : undefined)

        if (confirmed?.email && !declinedCandidateIds.has(confirmed.id)) {
          linkedEmail = confirmed.email
          linkedName = normalizeCandidateLookup(confirmed.name)
        }
      }
      continue
    }

    if (awaitingInput === 'candidateChoice') {
      if (outbound === ASSISTANT_NEW_CANDIDATE_MESSAGE) {
        linkedEmail = null
        linkedName = null
        continue
      }

      const selected = candidates.find(
        (candidate) =>
          candidate.id === getUserOutboundText(nextUser) ||
          normalizeCandidateLookup(candidate.name) === outbound,
      )
      if (selected?.email && !declinedCandidateIds.has(selected.id)) {
        linkedEmail = selected.email
        linkedName = normalizeCandidateLookup(selected.name)
      }
    }
  }

  if (linkedName === normalizedTarget && linkedEmail) {
    return linkedEmail
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
