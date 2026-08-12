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
 */
export const ASSISTANT_CONFIRM_MESSAGE = 'confirm' as const

/** Exact backend NLU match to proceed despite similar questions. */
export const ASSISTANT_SIMILARITY_CONTINUE_MESSAGE = 'yes' as const

/** Backend NLU abort phrase: `no` keyword plus trailing words separated by space. */
export const ASSISTANT_SIMILARITY_ABORT_MESSAGE = 'no cancel' as const

export type AssistantSimilarityIntent = 'continue' | 'abort'

export function resolveAssistantSimilarityMessage(intent: AssistantSimilarityIntent): string {
  return intent === 'continue'
    ? ASSISTANT_SIMILARITY_CONTINUE_MESSAGE
    : ASSISTANT_SIMILARITY_ABORT_MESSAGE
}

export const ASSISTANT_CHAT_LAUNCHER_ID = 'assistant-chat-launcher'
export const ASSISTANT_CHAT_COMPOSER_ID = 'assistant-chat-composer'
export const ASSISTANT_CHAT_WIDGET_TITLE_ID = 'assistant-chat-widget-title'
