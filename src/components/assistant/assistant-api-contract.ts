/**
 * AI assistant chat API contract (current backend).
 *
 * Session: `RecruiterAssistantChatDto` sends `message` plus optional
 * `sessionId` on follow-up turns. No client `history` / `conversationId`; the
 * backend owns multi-turn context via `sessionId`.
 *
 * Confirm: send `message: ASSISTANT_CONFIRM_MESSAGE` with `pendingActionId`
 * (and `sessionId`) from the prior `needs_confirmation` response. Optionally
 * include `pendingAction` when the user removed questions from a create-interview
 * plan. The server re-validates the pending action server-side.
 *
 * Cancel: client-only — `dismissPendingAction` clears local state. No cancel
 * endpoint exists. Sending a new message also clears pending state locally.
 *
 * Similarity gate (`awaitingInput: confirmAddDespiteSimilar`): the backend NLU
 * matcher accepts an exact `yes` to continue, or `no` followed by a space and
 * more text to abort (e.g. `no cancel`). Localized button labels are for display
 * only (`displayText` in the chat).
 *
 * Registered-candidate gate (`awaitingInput: confirmRegisteredCandidate`): the
 * backend NLU matcher accepts an exact `yes` to link the registered candidate,
 * or `no` to enter a different name. Localized button labels are for display only.
 *
 * Candidate picker (`awaitingInput: candidateChoice`): send a registered
 * candidate UUID when the user picks from the list, or `new candidate` to enter
 * a name manually.
 */
export const ASSISTANT_CONFIRM_MESSAGE = 'confirm' as const

/** Exact backend NLU match to proceed despite similar questions. */
export const ASSISTANT_SIMILARITY_CONTINUE_MESSAGE = 'yes' as const

/** Backend NLU abort phrase: `no` keyword plus trailing words separated by space. */
export const ASSISTANT_SIMILARITY_ABORT_MESSAGE = 'no cancel' as const

/** Exact backend NLU match to use a matched registered candidate. */
export const ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE = 'yes' as const

/** Exact backend NLU match to decline a matched registered candidate. */
export const ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE = 'no' as const

/** Backend NLU phrase to start a free-text candidate name instead of picking from the list. */
export const ASSISTANT_NEW_CANDIDATE_MESSAGE = 'new candidate' as const

export type AssistantSimilarityIntent = 'continue' | 'abort'

export function resolveAssistantSimilarityMessage(intent: AssistantSimilarityIntent): string {
  return intent === 'continue'
    ? ASSISTANT_SIMILARITY_CONTINUE_MESSAGE
    : ASSISTANT_SIMILARITY_ABORT_MESSAGE
}

export type AssistantRegisteredCandidateIntent = 'use' | 'decline'

export function resolveAssistantRegisteredCandidateMessage(
  intent: AssistantRegisteredCandidateIntent,
): string {
  return intent === 'use'
    ? ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE
    : ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE
}

export const ASSISTANT_CHAT_LAUNCHER_ID = 'assistant-chat-launcher'
export const ASSISTANT_CHAT_COMPOSER_ID = 'assistant-chat-composer'
export const ASSISTANT_CHAT_WIDGET_TITLE_ID = 'assistant-chat-widget-title'

/** Backend NLU phrase to skip templates and open the interview form manually. */
export const ASSISTANT_CREATE_OWN_MESSAGE = 'create my own' as const

/** Exact English wire phrases the backend NLU matches; never localize these payloads. */
export const ASSISTANT_MACHINE_PROTOCOL_MESSAGES = [
  ASSISTANT_CONFIRM_MESSAGE,
  ASSISTANT_SIMILARITY_CONTINUE_MESSAGE,
  ASSISTANT_SIMILARITY_ABORT_MESSAGE,
  ASSISTANT_USE_REGISTERED_CANDIDATE_MESSAGE,
  ASSISTANT_DECLINE_REGISTERED_CANDIDATE_MESSAGE,
  ASSISTANT_NEW_CANDIDATE_MESSAGE,
  ASSISTANT_CREATE_OWN_MESSAGE,
] as const

export function buildAssistantUserMessage(
  wireMessage: string,
  displayText?: string,
): { text: string; sentMessage?: string } {
  const normalizedDisplay = displayText?.trim()
  if (normalizedDisplay && normalizedDisplay !== wireMessage) {
    return { text: normalizedDisplay, sentMessage: wireMessage }
  }
  return { text: wireMessage }
}
